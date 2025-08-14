<?php

/**
 * NexLearn LearnDash 集成類 / NexLearn LearnDash Integration Class
 * 
 * 處理與 LearnDash LMS 的所有集成功能
 * Handles all integration functionality with LearnDash LMS
 */
class NexLearn_LearnDash_Integration {
    
    public function __construct() {
        // LearnDash 事件鉤子 / LearnDash event hooks
        add_action('learndash_course_completed', array($this, 'on_course_completed'), 10, 1);
        add_action('learndash_lesson_completed', array($this, 'on_lesson_completed'), 10, 1);
        add_action('learndash_quiz_completed', array($this, 'on_quiz_completed'), 10, 2);
        add_action('learndash_assignment_uploaded', array($this, 'on_assignment_uploaded'), 10, 2);
        
        // 自定義鉤子用於擴展 / Custom hooks for extension
        add_action('nexlearn_course_progress_updated', array($this, 'update_ai_insights'), 10, 2);
        add_action('nexlearn_learning_pattern_detected', array($this, 'generate_recommendations'), 10, 2);
    }
    
    /**
     * 獲取用戶課程 / Get user courses
     * 
     * @param int $user_id 用戶ID / User ID
     * @return array 課程數據數組 / Array of course data
     */
    public function get_user_courses($user_id) {
        if (!function_exists('learndash_user_get_enrolled_courses')) {
            return array();
        }
        
        // 獲取已註冊課程 / Get enrolled courses
        $enrolled_courses = learndash_user_get_enrolled_courses($user_id);
        $courses_data = array();
        
        foreach ($enrolled_courses as $course_id) {
            $course_data = $this->get_course_details($user_id, $course_id);
            if ($course_data) {
                $courses_data[] = $course_data;
            }
        }
        
        // 按進度排序 / Sort by progress
        usort($courses_data, function($a, $b) {
            if ($a['progress']['status'] === 'in_progress' && $b['progress']['status'] !== 'in_progress') {
                return -1;
            }
            if ($b['progress']['status'] === 'in_progress' && $a['progress']['status'] !== 'in_progress') {
                return 1;
            }
            return $b['progress']['percentage'] - $a['progress']['percentage'];
        });
        
        return $courses_data;
    }
    
    /**
     * 獲取課程詳細信息 / Get course details
     * 
     * @param int $user_id 用戶ID / User ID
     * @param int $course_id 課程ID / Course ID
     * @return array|null 課程詳細信息 / Course details
     */
    public function get_course_details($user_id, $course_id) {
        $course = get_post($course_id);
        if (!$course) {
            return null;
        }
        
        // 獲取課程進度 / Get course progress
        $progress = learndash_user_get_course_progress($user_id, $course_id);
        $lessons = learndash_get_course_lessons_list($course_id);
        $quizzes = learndash_get_course_quiz_list($course_id);
        
        // 計算詳細進度 / Calculate detailed progress
        $total_steps = learndash_get_course_steps_count($course_id);
        $completed_steps = learndash_course_get_completed_steps($user_id, $course_id);
        
        // 獲取課程訪問信息 / Get course access information
        $course_price = learndash_get_course_meta_setting($course_id, 'course_price');
        $course_materials = learndash_get_course_meta_setting($course_id, 'course_materials');
        
        // 獲取課程統計 / Get course statistics
        $course_stats = $this->get_course_statistics($user_id, $course_id);
        
        return array(
            'id' => $course_id,
            'title' => $course->post_title,
            'description' => $course->post_excerpt,
            'content' => wp_trim_words($course->post_content, 30),
            'permalink' => get_permalink($course_id),
            'featured_image' => get_the_post_thumbnail_url($course_id, 'medium'),
            'progress' => array(
                'percentage' => isset($progress['percentage']) ? $progress['percentage'] : 0,
                'completed_steps' => $completed_steps,
                'total_steps' => $total_steps,
                'status' => learndash_course_status($course_id, $user_id),
                'last_activity' => $this->get_last_course_activity($user_id, $course_id) // 最後活動 / Last activity
            ),
            'lessons' => $this->format_lessons_data($lessons, $user_id),
            'quizzes' => $this->format_quizzes_data($quizzes, $user_id),
            'certificates' => $this->get_course_certificates($user_id, $course_id),
            'instructor' => $this->get_course_instructor($course_id),
            'enrollment_date' => $this->get_enrollment_date($user_id, $course_id), // 註冊日期 / Enrollment date
            'estimated_completion' => $this->estimate_completion_time($user_id, $course_id), // 預計完成時間 / Estimated completion
            'difficulty_level' => get_post_meta($course_id, '_course_difficulty', true),
            'categories' => wp_get_post_terms($course_id, 'ld_course_category'),
            'tags' => wp_get_post_terms($course_id, 'ld_course_tag'),
            'statistics' => $course_stats, // 課程統計 / Course statistics
            'ai_insights' => $this->get_course_ai_insights($user_id, $course_id), // AI 洞察 / AI insights
            'study_time' => $this->get_course_study_time($user_id, $course_id), // 學習時間 / Study time
            'next_lesson' => $this->get_next_lesson($user_id, $course_id) // 下一課 / Next lesson
        );
    }
    
    /**
     * 獲取學習進度 / Get learning progress
     * 
     * @param int $user_id 用戶ID / User ID
     * @return array 學習進度數據 / Learning progress data
     */
    public function get_learning_progress($user_id) {
        $courses = $this->get_user_courses($user_id);
        $overall_progress = array(
            'total_courses' => count($courses),
            'completed_courses' => 0,
            'in_progress_courses' => 0,
            'not_started_courses' => 0,
            'total_lessons' => 0,
            'completed_lessons' => 0,
            'total_quizzes' => 0,
            'completed_quizzes' => 0,
            'average_score' => 0,
            'total_study_time' => 0,
            'certificates_earned' => 0,
            'learning_streak' => $this->calculate_learning_streak($user_id), // 學習連續天數 / Learning streak
            'weekly_progress' => $this->get_weekly_progress($user_id), // 週進度 / Weekly progress
            'monthly_progress' => $this->get_monthly_progress($user_id), // 月進度 / Monthly progress
            'skill_levels' => $this->calculate_skill_levels($user_id), // 技能等級 / Skill levels
            'learning_velocity' => $this->calculate_learning_velocity($user_id) // 學習速度 / Learning velocity
        );
        
        $total_score = 0;
        $quiz_count = 0;
        
        foreach ($courses as $course) {
            // 課程完成狀態 / Course completion status
            if ($course['progress']['status'] === 'completed') {
                $overall_progress['completed_courses']++;
            } elseif ($course['progress']['percentage'] > 0) {
                $overall_progress['in_progress_courses']++;
            } else {
                $overall_progress['not_started_courses']++;
            }
            
            // 課程和測驗 / Lessons and quizzes
            $overall_progress['total_lessons'] += count($course['lessons']);
            $overall_progress['total_quizzes'] += count($course['quizzes']);
            
            foreach ($course['lessons'] as $lesson) {
                if ($lesson['completed']) {
                    $overall_progress['completed_lessons']++;
                }
            }
            
            foreach ($course['quizzes'] as $quiz) {
                if ($quiz['completed']) {
                    $overall_progress['completed_quizzes']++;
                    if (isset($quiz['score'])) {
                        $total_score += $quiz['score'];
                        $quiz_count++;
                    }
                }
            }
            
            // 證書 / Certificates
            $overall_progress['certificates_earned'] += count($course['certificates']);
            
            // 學習時間 / Study time
            $overall_progress['total_study_time'] += $course['study_time'];
        }
        
        // 計算平均分數 / Calculate average score
        if ($quiz_count > 0) {
            $overall_progress['average_score'] = round($total_score / $quiz_count, 2);
        }
        
        return $overall_progress;
    }
    
    /**
     * 獲取即將到來的截止日期 / Get upcoming deadlines
     * 
     * @param int $user_id 用戶ID / User ID
     * @return array 截止日期數組 / Array of deadlines
     */
    public function get_upcoming_deadlines($user_id) {
        $deadlines = array();
        $courses = learndash_user_get_enrolled_courses($user_id);
        
        foreach ($courses as $course_id) {
            // 檢查課程截止日期 / Check for course deadline
            $course_deadline = get_post_meta($course_id, '_course_deadline', true);
            if ($course_deadline && strtotime($course_deadline) > time()) {
                $deadlines[] = array(
                    'type' => 'course', // 類型：課程 / Type: course
                    'id' => $course_id,
                    'title' => get_the_title($course_id),
                    'deadline' => $course_deadline,
                    'days_remaining' => ceil((strtotime($course_deadline) - time()) / (60 * 60 * 24)),
                    'priority' => $this->calculate_deadline_priority($course_deadline), // 優先級 / Priority
                    'completion_percentage' => learndash_course_progress($course_id, $user_id)['percentage'] ?? 0
                );
            }
            
            // 檢查作業截止日期 / Check for assignment deadlines
            $assignments = learndash_get_course_assignments($course_id);
            foreach ($assignments as $assignment) {
                $assignment_deadline = get_post_meta($assignment->ID, '_assignment_deadline', true);
                if ($assignment_deadline && strtotime($assignment_deadline) > time()) {
                    $deadlines[] = array(
                        'type' => 'assignment', // 類型：作業 / Type: assignment
                        'id' => $assignment->ID,
                        'title' => $assignment->post_title,
                        'course_title' => get_the_title($course_id),
                        'course_id' => $course_id,
                        'deadline' => $assignment_deadline,
                        'days_remaining' => ceil((strtotime($assignment_deadline) - time()) / (60 * 60 * 24)),
                        'priority' => $this->calculate_deadline_priority($assignment_deadline),
                        'status' => get_post_meta($assignment->ID, '_assignment_status_' . $user_id, true) ?: 'not_started'
                    );
                }
            }
            
            // 檢查測驗截止日期 / Check for quiz deadlines
            $quizzes = learndash_get_course_quiz_list($course_id);
            foreach ($quizzes as $quiz) {
                $quiz_deadline = get_post_meta($quiz['id'], '_quiz_deadline', true);
                if ($quiz_deadline && strtotime($quiz_deadline) > time()) {
                    $quiz_attempts = learndash_get_user_quiz_attempts($user_id, $quiz['id']);
                    $completed = !empty($quiz_attempts);
                    
                    if (!$completed) {
                        $deadlines[] = array(
                            'type' => 'quiz', // 類型：測驗 / Type: quiz
                            'id' => $quiz['id'],
                            'title' => $quiz['post']->post_title,
                            'course_title' => get_the_title($course_id),
                            'course_id' => $course_id,
                            'deadline' => $quiz_deadline,
                            'days_remaining' => ceil((strtotime($quiz_deadline) - time()) / (60 * 60 * 24)),
                            'priority' => $this->calculate_deadline_priority($quiz_deadline),
                            'attempts_allowed' => learndash_get_setting($quiz['id'], 'repeats'),
                            'time_limit' => learndash_get_setting($quiz['id'], 'timeLimit')
                        );
                    }
                }
            }
        }
        
        // 按截止日期排序 / Sort by deadline
        usort($deadlines, function($a, $b) {
            $time_diff = strtotime($a['deadline']) - strtotime($b['deadline']);
            if ($time_diff === 0) {
                return $b['priority'] - $a['priority']; // 相同時間按優先級排序 / Same time, sort by priority
            }
            return $time_diff;
        });
        
        return array_slice($deadlines, 0, 10); // 返回接下來的10個截止日期 / Return next 10 deadlines
    }
    
    /**
     * 計算截止日期優先級 / Calculate deadline priority
     * 
     * @param string $deadline 截止日期 / Deadline
     * @return int 優先級分數 / Priority score
     */
    private function calculate_deadline_priority($deadline) {
        $days_remaining = ceil((strtotime($deadline) - time()) / (60 * 60 * 24));
        
        if ($days_remaining <= 1) return 5; // 緊急 / Urgent
        if ($days_remaining <= 3) return 4; // 高 / High
        if ($days_remaining <= 7) return 3; // 中等 / Medium
        if ($days_remaining <= 14) return 2; // 低 / Low
        return 1; // 很低 / Very low
    }
    
    /**
     * 格式化課程數據 / Format lessons data
     * 
     * @param array $lessons 課程數組 / Lessons array
     * @param int $user_id 用戶ID / User ID
     * @return array 格式化的課程數據 / Formatted lessons data
     */
    private function format_lessons_data($lessons, $user_id) {
        $formatted_lessons = array();
        
        foreach ($lessons as $lesson) {
            $lesson_id = $lesson->ID;
            $completed = learndash_is_lesson_complete($user_id, $lesson_id);
            
            $formatted_lessons[] = array(
                'id' => $lesson_id,
                'title' => $lesson->post_title,
                'permalink' => get_permalink($lesson_id),
                'completed' => $completed,
                'completion_date' => $completed ? $this->get_completion_date($user_id, $lesson_id) : null,
                'estimated_duration' => get_post_meta($lesson_id, '_lesson_duration', true), // 預計時長 / Estimated duration
                'actual_duration' => $this->get_actual_lesson_duration($user_id, $lesson_id), // 實際時長 / Actual duration
                'lesson_type' => get_post_meta($lesson_id, '_lesson_type', true),
                'has_video' => $this->lesson_has_video($lesson_id), // 是否有視頻 / Has video
                'has_materials' => $this->lesson_has_materials($lesson_id), // 是否有材料 / Has materials
                'difficulty_rating' => get_post_meta($lesson_id, '_lesson_difficulty', true), // 難度評級 / Difficulty rating
                'prerequisites' => $this->get_lesson_prerequisites($lesson_id), // 先決條件 / Prerequisites
                'learning_objectives' => get_post_meta($lesson_id, '_learning_objectives', true), // 學習目標 / Learning objectives
                'notes_count' => $this->get_lesson_notes_count($user_id, $lesson_id), // 筆記數量 / Notes count
                'bookmarked' => $this->is_lesson_bookmarked($user_id, $lesson_id) // 是否收藏 / Bookmarked
            );
        }
        
        return $formatted_lessons;
    }
    
    /**
     * 格式化測驗數據 / Format quizzes data
     * 
     * @param array $quizzes 測驗數組 / Quizzes array
     * @param int $user_id 用戶ID / User ID
     * @return array 格式化的測驗數據 / Formatted quizzes data
     */
    private function format_quizzes_data($quizzes, $user_id) {
        $formatted_quizzes = array();
        
        foreach ($quizzes as $quiz) {
            $quiz_id = $quiz->ID;
            $quiz_attempts = learndash_get_user_quiz_attempts($user_id, $quiz_id);
            $completed = !empty($quiz_attempts);
            $best_score = 0;
            $latest_attempt = null;
            
            if ($completed) {
                foreach ($quiz_attempts as $attempt) {
                    if ($attempt['percentage'] > $best_score) {
                        $best_score = $attempt['percentage'];
                    }
                    if (!$latest_attempt || $attempt['time'] > $latest_attempt['time']) {
                        $latest_attempt = $attempt;
                    }
                }
            }
            
            $formatted_quizzes[] = array(
                'id' => $quiz_id,
                'title' => $quiz->post_title,
                'permalink' => get_permalink($quiz_id),
                'completed' => $completed,
                'attempts' => count($quiz_attempts), // 嘗試次數 / Attempts count
                'max_attempts' => learndash_get_setting($quiz_id, 'repeats'), // 最大嘗試次數 / Max attempts
                'best_score' => $best_score, // 最佳分數 / Best score
                'latest_score' => $latest_attempt ? $latest_attempt['percentage'] : 0, // 最新分數 / Latest score
                'passing_score' => learndash_get_setting($quiz_id, 'passingpercentage'), // 及格分數 / Passing score
                'time_limit' => learndash_get_setting($quiz_id, 'timeLimit'), // 時間限制 / Time limit
                'question_count' => $this->get_quiz_question_count($quiz_id), // 問題數量 / Question count
                'difficulty_level' => get_post_meta($quiz_id, '_quiz_difficulty', true), // 難度等級 / Difficulty level
                'quiz_type' => get_post_meta($quiz_id, '_quiz_type', true), // 測驗類型 / Quiz type
                'feedback_enabled' => learndash_get_setting($quiz_id, 'showReviewQuestion'), // 反饋啟用 / Feedback enabled
                'randomize_questions' => learndash_get_setting($quiz_id, 'sortAnswers'), // 隨機問題 / Randomize questions
                'certificate_threshold' => learndash_get_setting($quiz_id, 'certificate'), // 證書閾值 / Certificate threshold
                'retake_allowed' => $this->can_retake_quiz($user_id, $quiz_id), // 允許重考 / Retake allowed
                'next_attempt_available' => $this->get_next_attempt_time($user_id, $quiz_id) // 下次嘗試時間 / Next attempt time
            );
        }
        
        return $formatted_quizzes;
    }
    
    /**
     * 獲取課程證書 / Get course certificates
     * 
     * @param int $user_id 用戶ID / User ID
     * @param int $course_id 課程ID / Course ID
     * @return array 證書數組 / Certificates array
     */
    private function get_course_certificates($user_id, $course_id) {
        $certificates = array();
        
        if (learndash_course_completed($user_id, $course_id)) {
            $certificate_link = learndash_get_course_certificate_link($course_id, $user_id);
            if ($certificate_link) {
                $certificates[] = array(
                    'type' => 'course_completion', // 類型：課程完成 / Type: course completion
                    'title' => __('Course Completion Certificate', 'nexlearn-dashboard') . ' / ' . __('課程完成證書', 'nexlearn-dashboard'),
                    'link' => $certificate_link,
                    'earned_date' => $this->get_course_completion_date($user_id, $course_id), // 獲得日期 / Earned date
                    'certificate_id' => $this->get_certificate_id($user_id, $course_id), // 證書ID / Certificate ID
                    'verification_code' => $this->generate_verification_code($user_id, $course_id), // 驗證碼 / Verification code
                    'downloadable' => true, // 可下載 / Downloadable
                    'shareable' => true, // 可分享 / Shareable
                    'blockchain_verified' => false // 區塊鏈驗證 / Blockchain verified
                );
            }
        }
        
        // 檢查測驗證書 / Check for quiz certificates
        $quizzes = learndash_get_course_quiz_list($course_id);
        foreach ($quizzes as $quiz) {
            $quiz_certificate = learndash_get_setting($quiz['id'], 'certificate');
            if ($quiz_certificate) {
                $quiz_attempts = learndash_get_user_quiz_attempts($user_id, $quiz['id']);
                foreach ($quiz_attempts as $attempt) {
                    if ($attempt['percentage'] >= learndash_get_setting($quiz['id'], 'passingpercentage')) {
                        $certificates[] = array(
                            'type' => 'quiz_completion', //   {
                        $certificates[] = array(
                            'type' => 'quiz_completion', // 類型：測驗完成 / Type: quiz completion
                            'title' => sprintf(__('Quiz Certificate: %s', 'nexlearn-dashboard') . ' / ' . __('測驗證書：%s', 'nexlearn-dashboard'), $quiz['post']->post_title),
                            'quiz_title' => $quiz['post']->post_title,
                            'link' => learndash_get_quiz_certificate_link($quiz['id'], $user_id),
                            'earned_date' => date('Y-m-d H:i:s', $attempt['time']), // 獲得日期 / Earned date
                            'score' => $attempt['percentage'], // 分數 / Score
                            'certificate_id' => $this->get_quiz_certificate_id($user_id, $quiz['id']), // 證書ID / Certificate ID
                            'verification_code' => $this->generate_quiz_verification_code($user_id, $quiz['id']), // 驗證碼 / Verification code
                            'downloadable' => true,
                            'shareable' => true,
                            'blockchain_verified' => false
                        );
                        break; // 只需要一個證書 / Only need one certificate
                    }
                }
            }
        }
        
        return $certificates;
    }
    
    /**
     * 獲取課程講師信息 / Get course instructor
     * 
     * @param int $course_id 課程ID / Course ID
     * @return array|null 講師信息 / Instructor information
     */
    private function get_course_instructor($course_id) {
        $author_id = get_post_field('post_author', $course_id);
        $author = get_userdata($author_id);
        
        if ($author) {
            return array(
                'id' => $author_id,
                'name' => $author->display_name,
                'email' => $author->user_email,
                'avatar' => get_avatar_url($author_id, array('size' => 96)),
                'bio' => get_user_meta($author_id, 'description', true), // 個人簡介 / Bio
                'website' => get_user_meta($author_id, 'user_url', true), // 網站 / Website
                'social_links' => array( // 社交鏈接 / Social links
                    'linkedin' => get_user_meta($author_id, 'linkedin', true),
                    'twitter' => get_user_meta($author_id, 'twitter', true),
                    'facebook' => get_user_meta($author_id, 'facebook', true)
                ),
                'expertise' => get_user_meta($author_id, 'instructor_expertise', true), // 專業領域 / Expertise
                'experience_years' => get_user_meta($author_id, 'teaching_experience', true), // 教學經驗年數 / Teaching experience years
                'rating' => $this->get_instructor_rating($author_id), // 評分 / Rating
                'total_students' => $this->get_instructor_student_count($author_id), // 學生總數 / Total students
                'total_courses' => $this->get_instructor_course_count($author_id), // 課程總數 / Total courses
                'languages' => get_user_meta($author_id, 'instructor_languages', true) // 語言 / Languages
            );
        }
        
        return null;
    }
    
    /**
     * 計算總學習時間 / Calculate total study time
     * 
     * @param int $user_id 用戶ID / User ID
     * @return int 總學習時間（分鐘）/ Total study time in minutes
     */
    private function calculate_total_study_time($user_id) {
        global $wpdb;
        
        // 從 LearnDash 活動獲取學習時間 / Get study time from LearnDash activity
        $activity_table = LDLMS_DB::get_table_name('user_activity');
        $total_time = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(activity_meta_value) 
             FROM {$activity_table} 
             WHERE user_id = %d 
             AND activity_meta_key = 'time_spent'",
            $user_id
        ));
        
        // 從我們的分析表獲取額外時間 / Get additional time from our analytics table
        $analytics_table = $wpdb->prefix . 'nexlearn_analytics';
        $additional_time = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(JSON_EXTRACT(event_data, '$.duration')) 
             FROM {$analytics_table} 
             WHERE user_id = %d 
             AND event_type IN ('lesson_viewed', 'video_watched', 'content_read')",
            $user_id
        ));
        
        return intval($total_time) + intval($additional_time);
    }
    
    /**
     * 計算學習連續天數 / Calculate learning streak
     * 
     * @param int $user_id 用戶ID / User ID
     * @return int 連續天數 / Streak days
     */
    private function calculate_learning_streak($user_id) {
        global $wpdb;
        
        $analytics_table = $wpdb->prefix . 'nexlearn_analytics';
        
        // 獲取最近的學習活動日期 / Get recent learning activity dates
        $activity_dates = $wpdb->get_col($wpdb->prepare(
            "SELECT DISTINCT DATE(timestamp) as activity_date 
             FROM {$analytics_table} 
             WHERE user_id = %d 
             AND event_type IN ('lesson_completed', 'quiz_completed', 'course_progress_updated')
             ORDER BY activity_date DESC 
             LIMIT 365",
            $user_id
        ));
        
        if (empty($activity_dates)) {
            return 0;
        }
        
        $streak = 0;
        $current_date = date('Y-m-d');
        
        // 檢查今天是否有活動 / Check if there's activity today
        if ($activity_dates[0] !== $current_date) {
            // 檢查昨天 / Check yesterday
            $yesterday = date('Y-m-d', strtotime('-1 day'));
            if ($activity_dates[0] !== $yesterday) {
                return 0; // 連續記錄中斷 / Streak broken
            }
            $current_date = $yesterday;
        }
        
        // 計算連續天數 / Calculate consecutive days
        foreach ($activity_dates as $date) {
            if ($date === $current_date) {
                $streak++;
                $current_date = date('Y-m-d', strtotime($current_date . ' -1 day'));
            } else {
                break;
            }
        }
        
        return $streak;
    }
    
    /**
     * 獲取週進度 / Get weekly progress
     * 
     * @param int $user_id 用戶ID / User ID
     * @return array 週進度數據 / Weekly progress data
     */
    private function get_weekly_progress($user_id) {
        global $wpdb;
        
        $analytics_table = $wpdb->prefix . 'nexlearn_analytics';
        
        // 獲取過去7天的活動 / Get activities from past 7 days
        $weekly_data = $wpdb->get_results($wpdb->prepare(
            "SELECT 
                DATE(timestamp) as date,
                COUNT(*) as activities,
                SUM(CASE WHEN event_type = 'lesson_completed' THEN 1 ELSE 0 END) as lessons_completed,
                SUM(CASE WHEN event_type = 'quiz_completed' THEN 1 ELSE 0 END) as quizzes_completed,
                SUM(JSON_EXTRACT(event_data, '$.duration')) as study_time
             FROM {$analytics_table} 
             WHERE user_id = %d 
             AND timestamp >= DATE_SUB(NOW(), INTERVAL 7 DAY)
             GROUP BY DATE(timestamp)
             ORDER BY date DESC",
            $user_id
        ));
        
        // 填充缺失的日期 / Fill missing dates
        $week_progress = array();
        for ($i = 6; $i >= 0; $i--) {
            $date = date('Y-m-d', strtotime("-{$i} days"));
            $day_data = null;
            
            foreach ($weekly_data as $data) {
                if ($data->date === $date) {
                    $day_data = $data;
                    break;
                }
            }
            
            $week_progress[] = array(
                'date' => $date,
                'day_name' => date('l', strtotime($date)), // 星期名稱 / Day name
                'activities' => $day_data ? intval($day_data->activities) : 0,
                'lessons_completed' => $day_data ? intval($day_data->lessons_completed) : 0,
                'quizzes_completed' => $day_data ? intval($day_data->quizzes_completed) : 0,
                'study_time' => $day_data ? intval($day_data->study_time) : 0
            );
        }
        
        return $week_progress;
    }
    
    /**
     * 獲取月進度 / Get monthly progress
     * 
     * @param int $user_id 用戶ID / User ID
     * @return array 月進度數據 / Monthly progress data
     */
    private function get_monthly_progress($user_id) {
        global $wpdb;
        
        $analytics_table = $wpdb->prefix . 'nexlearn_analytics';
        
        // 獲取過去30天的活動 / Get activities from past 30 days
        $monthly_stats = $wpdb->get_row($wpdb->prepare(
            "SELECT 
                COUNT(*) as total_activities,
                COUNT(DISTINCT DATE(timestamp)) as active_days,
                SUM(CASE WHEN event_type = 'lesson_completed' THEN 1 ELSE 0 END) as lessons_completed,
                SUM(CASE WHEN event_type = 'quiz_completed' THEN 1 ELSE 0 END) as quizzes_completed,
                SUM(CASE WHEN event_type = 'course_completed' THEN 1 ELSE 0 END) as courses_completed,
                SUM(JSON_EXTRACT(event_data, '$.duration')) as total_study_time,
                AVG(JSON_EXTRACT(event_data, '$.score')) as average_score
             FROM {$analytics_table} 
             WHERE user_id = %d 
             AND timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)",
            $user_id
        ));
        
        return array(
            'total_activities' => intval($monthly_stats->total_activities ?? 0),
            'active_days' => intval($monthly_stats->active_days ?? 0),
            'lessons_completed' => intval($monthly_stats->lessons_completed ?? 0),
            'quizzes_completed' => intval($monthly_stats->quizzes_completed ?? 0),
            'courses_completed' => intval($monthly_stats->courses_completed ?? 0),
            'total_study_time' => intval($monthly_stats->total_study_time ?? 0),
            'average_score' => round(floatval($monthly_stats->average_score ?? 0), 2),
            'consistency_rate' => round((intval($monthly_stats->active_days ?? 0) / 30) * 100, 2) // 一致性率 / Consistency rate
        );
    }
    
    // LearnDash 事件處理器 / LearnDash event handlers
    
    /**
     * 課程完成事件處理 / Course completion event handler
     * 
     * @param array $data 事件數據 / Event data
     */
    public function on_course_completed($data) {
        $user_id = $data['user']->ID;
        $course_id = $data['course']->ID;
        
        // 記錄完成事件 / Log completion event
        $this->log_learning_event($user_id, 'course_completed', array(
            'course_id' => $course_id,
            'course_title' => get_the_title($course_id),
            'completion_date' => current_time('mysql'),
            'total_lessons' => count(learndash_get_course_lessons_list($course_id)),
            'total_quizzes' => count(learndash_get_course_quiz_list($course_id)),
            'study_time' => $this->get_course_study_time($user_id, $course_id)
        ));
        
        // 觸發 AI 分析更新 / Trigger AI analysis update
        do_action('nexlearn_course_completed', $user_id, $course_id);
        
        // 生成完成證書 / Generate completion certificate
        $this->generate_course_certificate($user_id, $course_id);
        
        // 發送完成通知 / Send completion notification
        $this->send_completion_notification($user_id, $course_id);
        
        // 更新用戶統計 / Update user statistics
        $this->update_user_statistics($user_id);
    }
    
    /**
     * 課程完成事件處理 / Lesson completion event handler
     * 
     * @param array $data 事件數據 / Event data
     */
    public function on_lesson_completed($data) {
        $user_id = $data['user']->ID;
        $lesson_id = $data['lesson']->ID;
        $course_id = $data['course']->ID;
        
        // 記錄課程完成 / Log lesson completion
        $this->log_learning_event($user_id, 'lesson_completed', array(
            'lesson_id' => $lesson_id,
            'lesson_title' => get_the_title($lesson_id),
            'course_id' => $course_id,
            'course_title' => get_the_title($course_id),
            'completion_date' => current_time('mysql'),
            'lesson_duration' => $this->get_actual_lesson_duration($user_id, $lesson_id),
            'lesson_type' => get_post_meta($lesson_id, '_lesson_type', true)
        ));
        
        // 更新學習分析 / Update learning analytics
        do_action('nexlearn_lesson_completed', $user_id, $lesson_id, $course_id);
        
        // 檢查是否解鎖新內容 / Check if new content is unlocked
        $this->check_content_unlock($user_id, $course_id);
        
        // 更新學習路徑 / Update learning path
        $this->update_learning_path($user_id, $course_id);
    }
    
    /**
     * 測驗完成事件處理 / Quiz completion event handler
     * 
     * @param array $data 事件數據 / Event data
     * @param WP_User $user 用戶對象 / User object
     */
    public function on_quiz_completed($data, $user) {
        $user_id = $user->ID;
        $quiz_id = $data['quiz'];
        $score = $data['percentage'];
        $course_id = learndash_get_course_id($quiz_id);
        
        // 記錄測驗完成 / Log quiz completion
        $this->log_learning_event($user_id, 'quiz_completed', array(
            'quiz_id' => $quiz_id,
            'quiz_title' => get_the_title($quiz_id),
            'course_id' => $course_id,
            'course_title' => get_the_title($course_id),
            'score' => $score,
            'passing_score' => learndash_get_setting($quiz_id, 'passingpercentage'),
            'passed' => $score >= learndash_get_setting($quiz_id, 'passingpercentage'),
            'attempt_number' => count(learndash_get_user_quiz_attempts($user_id, $quiz_id)),
            'time_taken' => $data['time'] ?? 0,
            'completion_date' => current_time('mysql')
        ));
        
        // 更新 AI 洞察 / Update AI insights
        do_action('nexlearn_quiz_completed', $user_id, $quiz_id, $score);
        
        // 檢查是否需要生成閃卡 / Check if flashcards should be generated
        if ($score < 80) { // 分數低於80%時生成復習閃卡 / Generate review flashcards if score below 80%
            $this->auto_generate_review_flashcards($user_id, $quiz_id);
        }
        
        // 更新知識圖譜 / Update knowledge graph
        $this->update_knowledge_graph($user_id, $quiz_id, $score);
    }
    
    /**
     * 作業上傳事件處理 / Assignment upload event handler
     * 
     * @param int $assignment_id 作業ID / Assignment ID
     * @param int $user_id 用戶ID / User ID
     */
    public function on_assignment_uploaded($assignment_id, $user_id) {
        $course_id = learndash_get_course_id($assignment_id);
        
        // 記錄作業上傳 / Log assignment upload
        $this->log_learning_event($user_id, 'assignment_uploaded', array(
            'assignment_id' => $assignment_id,
            'assignment_title' => get_the_title($assignment_id),
            'course_id' => $course_id,
            'course_title' => get_the_title($course_id),
            'upload_date' => current_time('mysql'),
            'file_size' => $this->get_assignment_file_size($assignment_id, $user_id),
            'file_type' => $this->get_assignment_file_type($assignment_id, $user_id)
        ));
        
        // 觸發作業分析 / Trigger assignment analysis
        do_action('nexlearn_assignment_uploaded', $user_id, $assignment_id, $course_id);
        
        // 發送提交確認 / Send submission confirmation
        $this->send_assignment_confirmation($user_id, $assignment_id);
    }
    
    /**
     * 記錄學習事件 / Log learning event
     * 
     * @param int $user_id 用戶ID / User ID
     * @param string $event_type 事件類型 / Event type
     * @param array $event_data 事件數據 / Event data
     */
    private function log_learning_event($user_id, $event_type, $event_data) {
        global $wpdb;
        
        $analytics_table = $wpdb->prefix . 'nexlearn_analytics';
        
        // 添加額外的元數據 / Add additional metadata
        $event_data['user_agent'] = $_SERVER['HTTP_USER_AGENT'] ?? '';
        $event_data['ip_address'] = $this->get_user_ip();
        $event_data['session_id'] = session_id() ?: wp_generate_uuid4();
        $event_data['language'] = get_user_locale($user_id);
        $event_data['timezone'] = wp_timezone_string();
        
        $wpdb->insert(
            $analytics_table,
            array(
                'user_id' => $user_id,
                'event_type' => $event_type,
                'event_data' => json_encode($event_data),
                'course_id' => isset($event_data['course_id']) ? $event_data['course_id'] : null,
                'lesson_id' => isset($event_data['lesson_id']) ? $event_data['lesson_id'] : null,
                'session_id' => $event_data['session_id'],
                'user_agent' => substr($event_data['user_agent'], 0, 500), // 限制長度 / Limit length
                'ip_address' => $event_data['ip_address'],
                'language' => $event_data['language'],
                'timestamp' => current_time('mysql')
            ),
            array('%d', '%s', '%s', '%d', '%d', '%s', '%s', '%s', '%s', '%s')
        );
        
        // 清理舊數據（保留1年）/ Clean old data (keep 1 year)
        if (rand(1, 100) === 1) { // 1%的機會執行清理 / 1% chance to run cleanup
            $wpdb->query($wpdb->prepare(
                "DELETE FROM {$analytics_table} WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR)"
            ));
        }
    }
    
    /**
     * 獲取用戶IP地址 / Get user IP address
     * 
     * @return string IP地址 / IP address
     */
    private function get_user_ip() {
        $ip_keys = array('HTTP_X_FORWARDED_FOR', 'HTTP_X_REAL_IP', 'HTTP_CLIENT_IP', 'REMOTE_ADDR');
        
        foreach ($ip_keys as $key) {
            if (!empty($_SERVER[$key])) {
                $ip = $_SERVER[$key];
                if (strpos($ip, ',') !== false) {
                    $ip = trim(explode(',', $ip)[0]);
                }
                if (filter_var($ip, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE)) {
                    return $ip;
                }
            }
        }
        
        return $_SERVER['REMOTE_ADDR'] ?? '0.0.0.0';
    }
    
    /**
     * 自動生成復習閃卡 / Auto-generate review flashcards
     * 
     * @param int $user_id 用戶ID / User ID
     * @param int $quiz_id 測驗ID / Quiz ID
     */
    private function auto_generate_review_flashcards($user_id, $quiz_id) {
        // 獲取測驗問題 / Get quiz questions
        $questions = learndash_get_quiz_questions($quiz_id);
        $flashcard_manager = new NexLearn_Flashcards();
        
        foreach ($questions as $question) {
            // 為每個問題創建閃卡 / Create flashcard for each question
            $flashcard_data = array(
                'front_content' => strip_tags($question['question']),
                'back_content' => strip_tags($question['correct_answer']),
                'difficulty_level' => 2, // 中等難度 / Medium difficulty
                'tags' => array('review', 'quiz-' . $quiz_id),
                'auto_generated' => true
            );
            
            $flashcard_manager->create_flashcard($user_id, $flashcard_data);
        }
        
        // 記錄自動生成事件 / Log auto-generation event
        $this->log_learning_event($user_id, 'flashcards_auto_generated', array(
            'quiz_id' => $quiz_id,
            'flashcard_count' => count($questions),
            'trigger' => 'low_quiz_score'
        ));
    }
}
