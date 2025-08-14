<?php
// 在主題的 functions.php 中添加

function nexlearn_dashboard_integration() {
    // 檢查是否為學習者頁面
    if (is_page('dashboard') || is_page('learning-dashboard')) {
        // 載入 React 組件
        wp_enqueue_script(
            'nexlearn-dashboard',
            get_template_directory_uri() . '/assets/js/dashboard.js',
            array('wp-element', 'wp-api-fetch'),
            '1.0.0',
            true
        );
        
        // 傳遞 LearnDash 數據
        $user_id = get_current_user_id();
        $dashboard_data = array(
            'courses' => learndash_user_get_enrolled_courses($user_id),
            'progress' => get_user_learning_progress($user_id),
            'achievements' => get_user_achievements($user_id)
        );
        
        wp_localize_script('nexlearn-dashboard', 'learndashData', $dashboard_data);
    }
}
add_action('wp_enqueue_scripts', 'nexlearn_dashboard_integration');

// 創建自定義 REST API 端點
function register_nexlearn_api_routes() {
    register_rest_route('nexlearn/v1', '/learndash-sync', array(
        'methods' => 'GET',
        'callback' => 'sync_learndash_data',
        'permission_callback' => function() {
            return is_user_logged_in();
        }
    ));
}
add_action('rest_api_init', 'register_nexlearn_api_routes');

function sync_learndash_data($request) {
    $user_id = get_current_user_id();
    
    // 同步 LearnDash 數據到我們的系統
    $courses = learndash_user_get_enrolled_courses($user_id);
    $synced_data = array();
    
    foreach ($courses as $course_id) {
        $course_data = array(
            'id' => $course_id,
            'title' => get_the_title($course_id),
            'progress' => learndash_user_get_course_progress($user_id, $course_id),
            'lessons' => learndash_get_course_lessons_list($course_id),
            'quizzes' => learndash_get_course_quiz_list($course_id)
        );
        
        $synced_data[] = $course_data;
    }
    
    return rest_ensure_response($synced_data);
}
