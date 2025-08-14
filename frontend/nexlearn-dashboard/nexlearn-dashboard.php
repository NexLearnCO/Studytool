<?php
/**
 * Plugin Name: NexLearn AI Dashboard
 * Description: AI-powered learning dashboard for LearnDash
 * Version: 1.0.0
 * Author: Your Name
 */

// 防止直接訪問
if (!defined('ABSPATH')) {
    exit;
}

class NexLearnDashboard {
    
    public function __construct() {
        add_action('init', array($this, 'init'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_scripts'));
        add_action('rest_api_init', array($this, 'register_rest_routes'));
        add_shortcode('nexlearn_dashboard', array($this, 'render_dashboard'));
    }
    
    public function init() {
        // 檢查 LearnDash 是否啟用
        if (!class_exists('SFWD_LMS')) {
            add_action('admin_notices', array($this, 'learndash_required_notice'));
            return;
        }
    }
    
    public function enqueue_scripts() {
        // 載入 React 和我們的組件
        wp_enqueue_script(
            'nexlearn-dashboard',
            plugin_dir_url(__FILE__) . 'build/static/js/main.js',
            array('wp-element', 'wp-api-fetch'),
            '1.0.0',
            true
        );
        
        wp_enqueue_style(
            'nexlearn-dashboard-style',
            plugin_dir_url(__FILE__) . 'build/static/css/main.css',
            array(),
            '1.0.0'
        );
        
        // 傳遞數據到前端
        wp_localize_script('nexlearn-dashboard', 'nexlearnData', array(
            'apiUrl' => rest_url('nexlearn/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'userId' => get_current_user_id(),
            'userCourses' => $this->get_user_courses(),
            'learningProgress' => $this->get_learning_progress()
        ));
    }
    
    public function register_rest_routes() {
        register_rest_route('nexlearn/v1', '/dashboard-data', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_dashboard_data'),
            'permission_callback' => array($this, 'check_permissions')
        ));
        
        register_rest_route('nexlearn/v1', '/ai-insights', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_ai_insights'),
            'permission_callback' => array($this, 'check_permissions')
        ));
        
        register_rest_route('nexlearn/v1', '/flashcards', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'handle_flashcards'),
            'permission_callback' => array($this, 'check_permissions')
        ));
    }
    
    public function get_dashboard_data($request) {
        $user_id = get_current_user_id();
        
        // 獲取 LearnDash 數據
        $enrolled_courses = learndash_user_get_enrolled_courses($user_id);
        $course_progress = array();
        
        foreach ($enrolled_courses as $course_id) {
            $progress = learndash_user_get_course_progress($user_id, $course_id);
            $course_progress[] = array(
                'course_id' => $course_id,
                'title' => get_the_title($course_id),
                'progress' => $progress,
                'completed' => learndash_course_completed($user_id, $course_id),
                'lessons_completed' => learndash_course_get_completed_steps($user_id, $course_id),
                'total_lessons' => learndash_get_course_steps_count($course_id)
            );
        }
        
        // 獲取學習統計
        $learning_stats = array(
            'total_courses' => count($enrolled_courses),
            'completed_courses' => count(learndash_user_get_completed_courses($user_id)),
            'study_time' => $this->calculate_study_time($user_id),
            'streak_days' => $this->get_study_streak($user_id),
            'ai_score' => $this->calculate_ai_score($user_id)
        );
        
        return rest_ensure_response(array(
            'courses' => $course_progress,
            'stats' => $learning_stats,
            'recent_activity' => $this->get_recent_activity($user_id),
            'upcoming_deadlines' => $this->get_upcoming_deadlines($user_id)
        ));
    }
    
    public function get_ai_insights($request) {
        $user_id = get_current_user_id();
        
        // AI 分析邏輯
        $learning_patterns = $this->analyze_learning_patterns($user_id);
        $recommendations = $this->generate_ai_recommendations($user_id);
        $knowledge_graph = $this->build_knowledge_graph($user_id);
        
        return rest_ensure_response(array(
            'patterns' => $learning_patterns,
            'recommendations' => $recommendations,
            'knowledge_graph' => $knowledge_graph,
            'performance_trends' => $this->get_performance_trends($user_id)
        ));
    }
    
    public function handle_flashcards($request) {
        $user_id = get_current_user_id();
        
        if ($request->get_method() === 'GET') {
            // 獲取用戶的記憶卡片
            return $this->get_user_flashcards($user_id);
        } else {
            // 創建新的記憶卡片
            $content = $request->get_param('content');
            $course_id = $request->get_param('course_id');
            return $this->create_flashcard($user_id, $content, $course_id);
        }
    }
    
    public function render_dashboard($atts) {
        $atts = shortcode_atts(array(
            'view' => 'full',
            'height' => '800px'
        ), $atts);
        
        return '<div id="nexlearn-dashboard-root" style="height: ' . esc_attr($atts['height']) . ';"></div>';
    }
    
    private function get_user_courses() {
        $user_id = get_current_user_id();
        return learndash_user_get_enrolled_courses($user_id);
    }
    
    private function get_learning_progress() {
        $user_id = get_current_user_id();
        $courses = $this->get_user_courses();
        $progress_data = array();
        
        foreach ($courses as $course_id) {
            $progress_data[$course_id] = learndash_user_get_course_progress($user_id, $course_id);
        }
        
        return $progress_data;
    }
    
    private function calculate_study_time($user_id) {
        // 從 LearnDash 活動日誌計算學習時間
        global $wpdb;
        
        $activity_table = LDLMS_DB::get_table_name('user_activity');
        $total_time = $wpdb->get_var($wpdb->prepare(
            "SELECT SUM(activity_meta) FROM {$activity_table} 
             WHERE user_id = %d AND activity_type = 'lesson' 
             AND activity_meta_key = 'time_spent'",
            $user_id
        ));
        
        return intval($total_time);
    }
    
    private function get_study_streak($user_id) {
        // 計算連續學習天數
        global $wpdb;
        
        $activity_table = LDLMS_DB::get_table_name('user_activity');
        $recent_activities = $wpdb->get_results($wpdb->prepare(
            "SELECT DISTINCT DATE(activity_updated) as study_date 
             FROM {$activity_table} 
             WHERE user_id = %d 
             ORDER BY study_date DESC 
             LIMIT 30",
            $user_id
        ));
        
        $streak = 0;
        $current_date = new DateTime();
        
        foreach ($recent_activities as $activity) {
            $study_date = new DateTime($activity->study_date);
            $diff = $current_date->diff($study_date)->days;
            
            if ($diff === $streak) {
                $streak++;
                $current_date->sub(new DateInterval('P1D'));
            } else {
                break;
            }
        }
        
        return $streak;
    }
    
    private function calculate_ai_score($user_id) {
        // AI 評分算法
        $courses = learndash_user_get_enrolled_courses($user_id);
        $total_score = 0;
        $course_count = 0;
        
        foreach ($courses as $course_id) {
            $progress = learndash_user_get_course_progress($user_id, $course_id);
            if (isset($progress['percentage'])) {
                $total_score += $progress['percentage'];
                $course_count++;
            }
        }
        
        return $course_count > 0 ? round($total_score / $course_count) : 0;
    }
    
    public function check_permissions($request) {
        return is_user_logged_in();
    }
    
    public function learndash_required_notice() {
        echo '<div class="notice notice-error"><p>NexLearn Dashboard 需要 LearnDash 插件才能運行。</p></div>';
    }
}

// 初始化插件
new NexLearnDashboard();
