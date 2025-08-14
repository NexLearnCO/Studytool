<?php
/**
 * Plugin Name: NexLearn AI Dashboard / NexLearn AI 儀表板
 * Plugin URI: https://nexlearn.ai
 * Description: AI-powered learning dashboard that integrates seamlessly with LearnDash LMS / AI 驅動的學習儀表板，與 LearnDash LMS 無縫集成
 * Version: 1.0.0
 * Author: NexLearn Team / NexLearn 團隊
 * License: GPL v2 or later
 * Text Domain: nexlearn-dashboard
 * Domain Path: /languages
 */

// 防止直接訪問 / Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// 定義插件常量 / Define plugin constants
define('NEXLEARN_PLUGIN_URL', plugin_dir_url(__FILE__));
define('NEXLEARN_PLUGIN_PATH', plugin_dir_path(__FILE__));
define('NEXLEARN_VERSION', '1.0.0');

class NexLearnDashboardPlugin {
    
    private static $instance = null;
    
    // 獲取單例實例 / Get singleton instance
    public static function get_instance() {
        if (null === self::$instance) {
            self::$instance = new self();
        }
        return self::$instance;
    }
    
    private function __construct() {
        add_action('plugins_loaded', array($this, 'init'));
        register_activation_hook(__FILE__, array($this, 'activate'));
        register_deactivation_hook(__FILE__, array($this, 'deactivate'));
    }
    
    // 初始化插件 / Initialize plugin
    public function init() {
        // 檢查 LearnDash 是否激活 / Check if LearnDash is active
        if (!$this->is_learndash_active()) {
            add_action('admin_notices', array($this, 'learndash_required_notice'));
            return;
        }
        
        // 加載插件組件 / Load plugin components
        $this->load_dependencies();
        $this->init_hooks();
        $this->init_rest_api();
        
        // 加載文本域用於國際化 / Load text domain for internationalization
        load_plugin_textdomain('nexlearn-dashboard', false, dirname(plugin_basename(__FILE__)) . '/languages');
    }
    
    // 加載依賴項 / Load dependencies
    private function load_dependencies() {
        require_once NEXLEARN_PLUGIN_PATH . 'includes/class-nexlearn-api.php';
        require_once NEXLEARN_PLUGIN_PATH . 'includes/class-nexlearn-learndash-integration.php';
        require_once NEXLEARN_PLUGIN_PATH . 'includes/class-nexlearn-ai-engine.php';
        require_once NEXLEARN_PLUGIN_PATH . 'includes/class-nexlearn-flashcards.php';
        require_once NEXLEARN_PLUGIN_PATH . 'includes/class-nexlearn-analytics.php';
        require_once NEXLEARN_PLUGIN_PATH . 'includes/class-nexlearn-shortcodes.php';
    }
    
    // 初始化鉤子 / Initialize hooks
    private function init_hooks() {
        add_action('wp_enqueue_scripts', array($this, 'enqueue_frontend_assets'));
        add_action('admin_enqueue_scripts', array($this, 'enqueue_admin_assets'));
        add_action('wp_ajax_nexlearn_dashboard_action', array($this, 'handle_ajax_requests'));
        add_action('wp_ajax_nopriv_nexlearn_dashboard_action', array($this, 'handle_ajax_requests'));
        
        // 添加菜單頁面 / Add menu pages
        add_action('admin_menu', array($this, 'add_admin_menu'));
        
        // 為閃卡和分析註冊自定義文章類型 / Custom post types for flashcards and analytics
        add_action('init', array($this, 'register_custom_post_types'));
    }
    
    // 初始化 REST API / Initialize REST API
    private function init_rest_api() {
        add_action('rest_api_init', array($this, 'register_rest_routes'));
    }
    
    // 加載前端資源 / Enqueue frontend assets
    public function enqueue_frontend_assets() {
        // 只在需要儀表板的頁面加載 / Only load on pages that need the dashboard
        if (!$this->should_load_dashboard()) {
            return;
        }
        
        // 加載 React 構建文件 / Enqueue React build files
        wp_enqueue_script(
            'nexlearn-dashboard-js',
            NEXLEARN_PLUGIN_URL . 'build/static/js/main.js',
            array('wp-element', 'wp-api-fetch', 'wp-i18n'),
            NEXLEARN_VERSION,
            true
        );
        
        wp_enqueue_style(
            'nexlearn-dashboard-css',
            NEXLEARN_PLUGIN_URL . 'build/static/css/main.css',
            array(),
            NEXLEARN_VERSION
        );
        
        // 本地化腳本與數據 / Localize script with data
        wp_localize_script('nexlearn-dashboard-js', 'nexlearnConfig', array(
            'apiUrl' => rest_url('nexlearn/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'userId' => get_current_user_id(),
            'pluginUrl' => NEXLEARN_PLUGIN_URL,
            'learndashData' => $this->get_learndash_data(), // LearnDash 數據 / LearnDash data
            'userCapabilities' => $this->get_user_capabilities(), // 用戶權限 / User capabilities
            'settings' => $this->get_plugin_settings(), // 插件設置 / Plugin settings
            'translations' => array( // 翻譯 / Translations
                'loading' => __('Loading...', 'nexlearn-dashboard') . ' / ' . __('加載中...', 'nexlearn-dashboard'),
                'dashboard' => __('Dashboard', 'nexlearn-dashboard') . ' / ' . __('儀表板', 'nexlearn-dashboard'),
                'courses' => __('Courses', 'nexlearn-dashboard') . ' / ' . __('課程', 'nexlearn-dashboard'),
                'progress' => __('Progress', 'nexlearn-dashboard') . ' / ' . __('進度', 'nexlearn-dashboard'),
                'analytics' => __('Analytics', 'nexlearn-dashboard') . ' / ' . __('分析', 'nexlearn-dashboard'),
                'flashcards' => __('Flashcards', 'nexlearn-dashboard') . ' / ' . __('閃卡', 'nexlearn-dashboard'),
                'ai_insights' => __('AI Insights', 'nexlearn-dashboard') . ' / ' . __('AI 洞察', 'nexlearn-dashboard')
            )
        ));
    }
    
    // 註冊 REST 路由 / Register REST routes
    public function register_rest_routes() {
        // 儀表板數據端點 / Dashboard data endpoint
        register_rest_route('nexlearn/v1', '/dashboard', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_dashboard_data'),
            'permission_callback' => array($this, 'check_user_permissions'),
            'args' => array(
                'lang' => array( // 語言參數 / Language parameter
                    'description' => __('Language preference', 'nexlearn-dashboard') . ' / ' . __('語言偏好', 'nexlearn-dashboard'),
                    'type' => 'string',
                    'default' => 'en',
                    'enum' => array('en', 'zh', 'zh-TW', 'zh-CN')
                )
            )
        ));
        
        // AI 洞察端點 / AI insights endpoint
        register_rest_route('nexlearn/v1', '/ai-insights', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_ai_insights'),
            'permission_callback' => array($this, 'check_user_permissions')
        ));
        
        // 閃卡端點 / Flashcards endpoints
        register_rest_route('nexlearn/v1', '/flashcards', array(
            'methods' => array('GET', 'POST', 'PUT', 'DELETE'),
            'callback' => array($this, 'handle_flashcards'),
            'permission_callback' => array($this, 'check_user_permissions')
        ));
        
        // 分析端點 / Analytics endpoint
        register_rest_route('nexlearn/v1', '/analytics', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_analytics_data'),
            'permission_callback' => array($this, 'check_user_permissions')
        ));
        
        // LearnDash 同步端點 / LearnDash sync endpoint
        register_rest_route('nexlearn/v1', '/sync-learndash', array(
            'methods' => 'POST',
            'callback' => array($this, 'sync_learndash_data'),
            'permission_callback' => array($this, 'check_admin_permissions')
        ));
    }
    
    // 獲取儀表板數據 / Get dashboard data
    public function get_dashboard_data($request) {
        $user_id = get_current_user_id();
        $lang = $request->get_param('lang') ?: 'en';
        $learndash_integration = new NexLearn_LearnDash_Integration();
        
        $dashboard_data = array(
            'user_profile' => $this->get_user_profile($user_id, $lang), // 用戶資料 / User profile
            'courses' => $learndash_integration->get_user_courses($user_id), // 用戶課程 / User courses
            'progress' => $learndash_integration->get_learning_progress($user_id), // 學習進度 / Learning progress
            'statistics' => $this->get_learning_statistics($user_id), // 學習統計 / Learning statistics
            'recent_activity' => $this->get_recent_activity($user_id, $lang), // 最近活動 / Recent activity
            'upcoming_deadlines' => $learndash_integration->get_upcoming_deadlines($user_id), // 即將到來的截止日期 / Upcoming deadlines
            'ai_recommendations' => $this->get_ai_recommendations($user_id, $lang), // AI 推薦 / AI recommendations
            'language' => $lang, // 當前語言 / Current language
            'translations' => $this->get_translations($lang) // 翻譯 / Translations
        );
        
        return rest_ensure_response($dashboard_data);
    }
    
    // 獲取用戶資料 / Get user profile
    private function get_user_profile($user_id, $lang = 'en') {
        $user = get_userdata($user_id);
        $profile_data = array(
            'id' => $user_id,
            'name' => $user->display_name,
            'email' => $user->user_email,
            'avatar' => get_avatar_url($user_id, array('size' => 96)),
            'role' => $this->get_user_role_display($user, $lang), // 角色顯示 / Role display
            'registration_date' => $user->user_registered,
            'last_login' => get_user_meta($user_id, 'last_login', true),
            'preferences' => array(
                'language' => get_user_meta($user_id, 'nexlearn_language', true) ?: $lang,
                'timezone' => get_user_meta($user_id, 'nexlearn_timezone', true) ?: 'UTC',
                'notifications' => get_user_meta($user_id, 'nexlearn_notifications', true) ?: true
            )
        );
        
        return $profile_data;
    }
    
    // 獲取用戶角色顯示 / Get user role display
    private function get_user_role_display($user, $lang = 'en') {
        $role = !empty($user->roles) ? $user->roles[0] : 'subscriber';
        
        $role_translations = array(
            'administrator' => array(
                'en' => 'Administrator',
                'zh' => '管理員'
            ),
            'instructor' => array(
                'en' => 'Instructor', 
                'zh' => '講師'
            ),
            'student' => array(
                'en' => 'Student',
                'zh' => '學生'
            ),
            'subscriber' => array(
                'en' => 'Subscriber',
                'zh' => '訂閱者'
            )
        );
        
        return isset($role_translations[$role][$lang]) ? $role_translations[$role][$lang] : ucfirst($role);
    }
    
    // 獲取翻譯 / Get translations
    private function get_translations($lang = 'en') {
        $translations = array(
            'en' => array(
                'welcome_back' => 'Welcome back',
                'dashboard' => 'Dashboard',
                'my_courses' => 'My Courses',
                'progress' => 'Progress',
                'analytics' => 'Analytics',
                'flashcards' => 'Flashcards',
                'ai_insights' => 'AI Insights',
                'recent_activity' => 'Recent Activity',
                'upcoming_deadlines' => 'Upcoming Deadlines',
                'study_time' => 'Study Time',
                'completed_courses' => 'Completed Courses',
                'certificates_earned' => 'Certificates Earned',
                'learning_streak' => 'Learning Streak',
                'generate_flashcards' => 'Generate Flashcards',
                'view_course' => 'View Course',
                'continue_learning' => 'Continue Learning',
                'no_courses' => 'No courses enrolled yet',
                'loading' => 'Loading...',
                'error_loading' => 'Error loading data'
            ),
            'zh' => array(
                'welcome_back' => '歡迎回來',
                'dashboard' => '儀表板',
                'my_courses' => '我的課程',
                'progress' => '進度',
                'analytics' => '分析',
                'flashcards' => '閃卡',
                'ai_insights' => 'AI 洞察',
                'recent_activity' => '最近活動',
                'upcoming_deadlines' => '即將到來的截止日期',
                'study_time' => '學習時間',
                'completed_courses' => '已完成課程',
                'certificates_earned' => '獲得證書',
                'learning_streak' => '學習連續天數',
                'generate_flashcards' => '生成閃卡',
                'view_course' => '查看課程',
                'continue_learning' => '繼續學習',
                'no_courses' => '尚未註冊任何課程',
                'loading' => '加載中...',
                'error_loading' => '加載數據時出錯'
            )
        );
        
        return isset($translations[$lang]) ? $translations[$lang] : $translations['en'];
    }
    
    // 添加管理菜單 / Add admin menu
    public function add_admin_menu() {
        add_menu_page(
            __('NexLearn Dashboard', 'nexlearn-dashboard') . ' / ' . __('NexLearn 儀表板', 'nexlearn-dashboard'),
            __('NexLearn', 'nexlearn-dashboard'),
            'manage_options',
            'nexlearn-dashboard',
            array($this, 'admin_dashboard_page'),
            'dashicons-chart-area',
            30
        );
        
        add_submenu_page(
            'nexlearn-dashboard',
            __('Settings', 'nexlearn-dashboard') . ' / ' . __('設置', 'nexlearn-dashboard'),
            __('Settings', 'nexlearn-dashboard') . ' / ' . __('設置', 'nexlearn-dashboard'),
            'manage_options',
            'nexlearn-settings',
            array($this, 'admin_settings_page')
        );
        
        add_submenu_page(
            'nexlearn-dashboard',
            __('Analytics', 'nexlearn-dashboard') . ' / ' . __('分析', 'nexlearn-dashboard'),
            __('Analytics', 'nexlearn-dashboard') . ' / ' . __('分析', 'nexlearn-dashboard'),
            'manage_options',
            'nexlearn-analytics',
            array($this, 'admin_analytics_page')
        );
        
        add_submenu_page(
            'nexlearn-dashboard',
            __('LearnDash Integration', 'nexlearn-dashboard') . ' / ' . __('LearnDash 集成', 'nexlearn-dashboard'),
            __('LearnDash Sync', 'nexlearn-dashboard') . ' / ' . __('LearnDash 同步', 'nexlearn-dashboard'),
            'manage_options',
            'nexlearn-learndash-sync',
            array($this, 'admin_learndash_sync_page')
        );
    }
    
    // 管理儀表板頁面 / Admin dashboard page
    public function admin_dashboard_page() {
        ?>
        <div class="wrap">
            <h1><?php echo __('NexLearn Dashboard Settings', 'nexlearn-dashboard') . ' / ' . __('NexLearn 儀表板設置', 'nexlearn-dashboard'); ?></h1>
            
            <div class="nexlearn-admin-container">
                <div class="nexlearn-admin-header">
                    <h2><?php echo __('Dashboard Overview', 'nexlearn-dashboard') . ' / ' . __('儀表板概覽', 'nexlearn-dashboard'); ?></h2>
                    <p><?php echo __('Manage your NexLearn AI Dashboard settings and monitor system status.', 'nexlearn-dashboard') . ' / ' . __('管理您的 NexLearn AI 儀表板設置並監控系統狀態。', 'nexlearn-dashboard'); ?></p>
                </div>
                
                <div class="nexlearn-admin-stats">
                    <div class="stat-card">
                        <h3><?php echo __('Active Users', 'nexlearn-dashboard') . ' / ' . __('活躍用戶', 'nexlearn-dashboard'); ?></h3>
                        <span class="stat-number"><?php echo $this->get_active_users_count(); ?></span>
                    </div>
                    
                    <div class="stat-card">
                        <h3><?php echo __('Total Courses', 'nexlearn-dashboard') . ' / ' . __('總課程數', 'nexlearn-dashboard'); ?></h3>
                        <span class="stat-number"><?php echo $this->get_total_courses_count(); ?></span>
                    </div>
                    
                    <div class="stat-card">
                        <h3><?php echo __('Flashcards Created', 'nexlearn-dashboard') . ' / ' . __('已創建閃卡', 'nexlearn-dashboard'); ?></h3>
                        <span class="stat-number"><?php echo $this->get_flashcards_count(); ?></span>
                    </div>
                    
                    <div class="stat-card">
                        <h3><?php echo __('AI Insights Generated', 'nexlearn-dashboard') . ' / ' . __('生成的 AI 洞察', 'nexlearn-dashboard'); ?></h3>
                        <span class="stat-number"><?php echo $this->get_ai_insights_count(); ?></span>
                    </div>
                </div>
                
                <div class="nexlearn-admin-actions">
                    <button id="sync-learndash" class="button button-primary">
                        <?php echo __('Sync LearnDash Data', 'nexlearn-dashboard') . ' / ' . __('同步 LearnDash 數據', 'nexlearn-dashboard'); ?>
                    </button>
                    
                    <button id="clear-cache" class="button">
                        <?php echo __('Clear Cache', 'nexlearn-dashboard') . ' / ' . __('清除緩存', 'nexlearn-dashboard'); ?>
                    </button>
                    
                    <button id="export-data" class="button">
                        <?php echo __('Export Data', 'nexlearn-dashboard') . ' / ' . __('導出數據', 'nexlearn-dashboard'); ?>
                    </button>
                </div>
            </div>
        </div>
        
        <style>
        .nexlearn-admin-container {
            max-width: 1200px;
            margin: 20px 0;
        }
        
        .nexlearn-admin-header {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            margin-bottom: 20px;
        }
        
        .nexlearn-admin-stats {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
            gap: 20px;
            margin-bottom: 30px;
        }
        
        .stat-card {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
            text-align: center;
        }
        
        .stat-card h3 {
            margin: 0 0 10px 0;
            color: #666;
            font-size: 14px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .stat-number {
            font-size: 32px;
            font-weight: bold;
            color: #3b82f6;
        }
        
        .nexlearn-admin-actions {
            background: white;
            padding: 20px;
            border-radius: 8px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
        }
        
        .nexlearn-admin-actions button {
            margin-right: 10px;
        }
        </style>
        
        <script>
        jQuery(document).ready(function($) {
            // 同步 LearnDash 數據 / Sync LearnDash data
            $('#sync-learndash').on('click', function() {
                var button = $(this);
                button.prop('disabled', true).text('<?php echo __('Syncing...', 'nexlearn-dashboard') . ' / ' . __('同步中...', 'nexlearn-dashboard'); ?>');
                
                $.post(ajaxurl, {
                    action: 'nexlearn_sync_learndash',
                    nonce: '<?php echo wp_create_nonce('nexlearn_admin'); ?>'
                }, function(response) {
                    if (response.success) {
                        alert('<?php echo __('LearnDash data synced successfully!', 'nexlearn-dashboard') . ' / ' . __('LearnDash 數據同步成功！', 'nexlearn-dashboard'); ?>');
                    } else {
                        alert('<?php echo __('Sync failed. Please try again.', 'nexlearn-dashboard') . ' / ' . __('同步失敗。請重試。', 'nexlearn-dashboard'); ?>');
                    }
                    button.prop('disabled', false).text('<?php echo __('Sync LearnDash Data', 'nexlearn-dashboard') . ' / ' . __('同步 LearnDash 數據', 'nexlearn-dashboard'); ?>');
                });
            });
            
            // 清除緩存 / Clear cache
            $('#clear-cache').on('click', function() {
                if (confirm('<?php echo __('Are you sure you want to clear all cache?', 'nexlearn-dashboard') . ' / ' . __('您確定要清除所有緩存嗎？', 'nexlearn-dashboard'); ?>')) {
                    var button = $(this);
                    button.prop('disabled', true).text('<?php echo __('Clearing...', 'nexlearn-dashboard') . ' / ' . __('清除中...', 'nexlearn-dashboard'); ?>');
                    
                    $.post(ajaxurl, {
                        action: 'nexlearn_clear_cache',
                        nonce: '<?php echo wp_create_nonce('nexlearn_admin'); ?>'
                    }, function(response) {
                        alert('<?php echo __('Cache cleared successfully!', 'nexlearn-dashboard') . ' / ' . __('緩存清除成功！', 'nexlearn-dashboard'); ?>');
                        button.prop('disabled', false).text('<?php echo __('Clear Cache', 'nexlearn-dashboard') . ' / ' . __('清除緩存', 'nexlearn-dashboard'); ?>');
                    });
                }
            });
        });
        </script>
        <?php
    }
    
    // 檢查 LearnDash 是否激活 / Check if LearnDash is active
    private function is_learndash_active() {
        return class_exists('SFWD_LMS');
    }
    
    // 獲取活躍用戶數 / Get active users count
    private function get_active_users_count() {
        global $wpdb;
        return $wpdb->get_var("SELECT COUNT(DISTINCT user_id) FROM {$wpdb->prefix}nexlearn_analytics WHERE timestamp >= DATE_SUB(NOW(), INTERVAL 30 DAY)");
    }
    
    // 獲取總課程數 / Get total courses count
    private function get_total_courses_count() {
        if (!$this->is_learndash_active()) {
            return 0;
        }
        return wp_count_posts('sfwd-courses')->publish;
    }
    
    // 獲取閃卡數量 / Get flashcards count
    private function get_flashcards_count() {
        global $wpdb;
        return $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}nexlearn_flashcards");
    }
    
    // 獲取 AI 洞察數量 / Get AI insights count
    private function get_ai_insights_count() {
        global $wpdb;
        return $wpdb->get_var("SELECT COUNT(*) FROM {$wpdb->prefix}nexlearn_analytics WHERE event_type = 'ai_insight_generated'");
    }
    
    // 插件激活 / Plugin activation
    public function activate() {
        // 創建數據庫表 / Create database tables
        $this->create_database_tables();
        
        // 設置默認選項 / Set default options
        add_option('nexlearn_ai_enabled', true);
        add_option('nexlearn_flashcards_enabled', true);
        add_option('nexlearn_analytics_enabled', true);
        add_option('nexlearn_default_language', 'en');
        add_option('nexlearn_multilingual_support', true);
        
        // 刷新重寫規則 / Flush rewrite rules
        flush_rewrite_rules();
        
        // 記錄激活事件 / Log activation event
        error_log('NexLearn Dashboard Plugin activated / NexLearn 儀表板插件已激活');
    }
    
    // 創建數據庫表 / Create database tables
    private function create_database_tables() {
        global $wpdb;
        
        $charset_collate = $wpdb->get_charset_collate();
        
        // 閃卡表 / Flashcards table
        $flashcards_table = $wpdb->prefix . 'nexlearn_flashcards';
        $flashcards_sql = "CREATE TABLE $flashcards_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            course_id bigint(20) DEFAULT NULL,
            front_content text NOT NULL COMMENT '正面內容 / Front content',
            back_content text NOT NULL COMMENT '背面內容 / Back content',
            front_content_zh text DEFAULT NULL COMMENT '正面內容（中文） / Front content (Chinese)',
            back_content_zh text DEFAULT NULL COMMENT '背面內容（中文） / Back content (Chinese)',
            difficulty_level tinyint(1) DEFAULT 1 COMMENT '難度等級 / Difficulty level',
            review_count int(11) DEFAULT 0 COMMENT '複習次數 / Review count',
            success_rate decimal(5,2) DEFAULT 0.00 COMMENT '成功率 / Success rate',
            next_review datetime DEFAULT NULL COMMENT '下次複習時間 / Next review time',
            language varchar(10) DEFAULT 'en' COMMENT '語言 / Language',
            tags text DEFAULT NULL COMMENT '標籤 / Tags',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY course_id (course_id),
            KEY next_review (next_review),
            KEY language (language)
        ) $charset_collate COMMENT='閃卡表 / Flashcards table';";
        
        // 分析表 / Analytics table
        $analytics_table = $wpdb->prefix . 'nexlearn_analytics';
        $analytics_sql = "CREATE TABLE $analytics_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            event_type varchar(50) NOT NULL COMMENT '事件類型 / Event type',
            event_data longtext COMMENT '事件數據 / Event data',
            course_id bigint(20) DEFAULT NULL,
            lesson_id bigint(20) DEFAULT NULL,
            session_id varchar(100) DEFAULT NULL COMMENT '會話ID / Session ID',
            user_agent text DEFAULT NULL COMMENT '用戶代理 / User agent',
            ip_address varchar(45) DEFAULT NULL COMMENT 'IP地址 / IP address',
            language varchar(10) DEFAULT 'en' COMMENT '語言 / Language',
            timestamp datetime DEFAULT CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            KEY user_id (user_id),
            KEY event_type (event_type),
            KEY course_id (course_id),
            KEY timestamp (timestamp),
            KEY session_id (session_id),
            KEY language (language)
        ) $charset_collate COMMENT='分析表 / Analytics table';";
        
        // 用戶偏好表 / User preferences table
        $preferences_table = $wpdb->prefix . 'nexlearn_user_preferences';
        $preferences_sql = "CREATE TABLE $preferences_table (
            id mediumint(9) NOT NULL AUTO_INCREMENT,
            user_id bigint(20) NOT NULL,
            preference_key varchar(100) NOT NULL COMMENT '偏好鍵 / Preference key',
            preference_value longtext COMMENT '偏好值 / Preference value',
            language varchar(10) DEFAULT 'en' COMMENT '語言 / Language',
            created_at datetime DEFAULT CURRENT_TIMESTAMP,
            updated_at datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
            PRIMARY KEY (id),
            UNIQUE KEY user_pref (user_id, preference_key, language),
            KEY user_id (user_id),
            KEY preference_key (preference_key)
        ) $charset_collate COMMENT='用戶偏好表 / User preferences table';";
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        dbDelta($flashcards_sql);
        dbDelta($analytics_sql);
        dbDelta($preferences_sql);
    }
    
    // LearnDash 必需通知 / LearnDash required notice
    public function learndash_required_notice() {
        echo '<div class="notice notice-error"><p>';
        echo __('NexLearn Dashboard requires LearnDash LMS plugin to be installed and activated.', 'nexlearn-dashboard');
        echo ' / ';
        echo __('NexLearn 儀表板需要安裝並激活 LearnDash LMS 插件。', 'nexlearn-dashboard');
        echo '</p></div>';
    }
    
    // 檢查用戶權限 / Check user permissions
    public function check_user_permissions($request) {
        return is_user_logged_in();
    }
    
    // 檢查管理員權限 / Check admin permissions
    public function check_admin_permissions($request) {
        return current_user_can('manage_options');
    }
    
    // 判斷是否應該加載儀表板 / Check if should load dashboard
    private function should_load_dashboard() {
        global $post;
        
        if (is_admin()) {
            return false;
        }
        
        // 檢查短代碼 / Check for shortcode
        if (isset($post->post_content) && has_shortcode($post->post_content, 'nexlearn_dashboard')) {
            return true;
        }
        
        // 檢查特定頁面 / Check for specific pages
        if (is_page(array('dashboard', 'learning-dashboard', 'my-learning', '儀表板', '學習儀表板'))) {
            return true;
        }
        
        // 檢查 LearnDash 頁面 / Check for LearnDash pages
        if (function_exists('learndash_is_learndash_page') && learndash_is_learndash_page()) {
            return true;
        }
        
        return false;
    }
}

// 初始化插件 / Initialize the plugin
NexLearnDashboardPlugin::get_instance();

// 短代碼支持 / Shortcode support
function nexlearn_dashboard_shortcode($atts) {
    $atts = shortcode_atts(array(
        'view' => 'full', // 視圖類型 / View type
        'language' => 'auto', // 語言 / Language
        'theme' => 'default', // 主題 / Theme
        'height' => 'auto' // 高度 / Height
    ), $atts);
    
    if (!is_user_logged_in()) {
        return '<div class="nexlearn-login-required">
            <p>' . __('Please log in to view your dashboard.', 'nexlearn-dashboard') . ' / ' . __('請登錄以查看您的儀表板。', 'nexlearn-dashboard') . '</p>
            <a href="' . wp_login_url(get_permalink()) . '" class="button">' . __('Log In', 'nexlearn-dashboard') . ' / ' . __('登錄', 'nexlearn-dashboard') . '</a>
        </div>';
    }
    
    // 自動檢測語言 / Auto-detect language
    if ($atts['language'] === 'auto') {
        $locale = get_locale();
        if (strpos($locale, 'zh') === 0) {
            $atts['language'] = 'zh';
        } else {
            $atts['language'] = 'en';
        }
    }
    
    ob_start();
    ?>
    <div id="nexlearn-dashboard-root" 
         class="nexlearn-dashboard-container theme-<?php echo esc_attr($atts['theme']); ?>"
         data-view="<?php echo esc_attr($atts['view']); ?>"
         data-language="<?php echo esc_attr($atts['language']); ?>"
         style="height: <?php echo esc_attr($atts['height']); ?>;">
        <div class="nexlearn-loading">
            <div class="loading-spinner"></div>
            <p><?php echo __('Loading your dashboard...', 'nexlearn-dashboard') . ' / ' . __('正在加載您的儀表板...', 'nexlearn-dashboard'); ?></p>
        </div>
    </div>
    
    <style>
    .nexlearn-loading {
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        min-height: 200px;
        text-align: center;
    }
    
    .loading-spinner {
        width: 40px;
        height: 40px;
        border: 4px solid #f3f4f6;
        border-top: 4px solid #3b82f6;
        border-radius: 50%;
        animation: spin 1s linear infinite;
        margin-bottom: 16px;
    }
    
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .nexlearn-login-required {
        text-align: center;
        padding: 40px 20px;
        background: #f8fafc;
        border-radius: 8px;
        border: 1px solid #e2e8f0;
    }
    
    .nexlearn-login-required p {
        margin-bottom: 20px;
        color: #64748b;
    }
    
    .nexlearn-login-required .button {
        background: #3b82f6;
        color: white;
        padding: 10px 20px;
        text-decoration: none;
        border-radius: 6px;
        display: inline-block;
        transition: background-color 0.2s;
    }
    
    .nexlearn-login-required .button:hover {
        background: #2563eb;
        color: white;
    }
    </style>
    <?php
    return ob_get_clean();
}
add_shortcode('nexlearn_dashboard', 'nexlearn_dashboard_shortcode');
