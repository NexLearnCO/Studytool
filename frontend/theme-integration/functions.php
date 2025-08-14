<?php
/**
 * NexLearn Dashboard 主題集成 / NexLearn Dashboard Theme Integration
 * 將此代碼添加到您的活動主題的 functions.php 文件中
 * Add this to your active theme's functions.php file
 */

class NexLearn_Theme_Integration {
    
    public function __construct() {
        add_action('after_setup_theme', array($this, 'theme_setup'));
        add_action('wp_enqueue_scripts', array($this, 'enqueue_dashboard_assets'));
        add_action('init', array($this, 'add_dashboard_rewrite_rules'));
        add_filter('template_include', array($this, 'dashboard_template_redirect'));
        add_action('rest_api_init', array($this, 'register_dashboard_endpoints'));
        
        // 添加儀表板到用戶菜單 / Add dashboard to user menu
        add_filter('wp_nav_menu_items', array($this, 'add_dashboard_menu_item'), 10, 2);
        
        // 自定義用戶儀表板頁面 / Custom user dashboard page
        add_action('init', array($this, 'create_dashboard_page'));
        
        // 添加自定義用戶字段 / Add custom user fields
        add_action('show_user_profile', array($this, 'add_user_dashboard_fields'));
        add_action('edit_user_profile', array($this, 'add_user_dashboard_fields'));
        add_action('personal_options_update', array($this, 'save_user_dashboard_fields'));
        add_action('edit_user_profile_update', array($this, 'save_user_dashboard_fields'));
        
        // 添加主題自定義器支持 / Add theme customizer support
        add_action('customize_register', array($this, 'add_customizer_settings'));
        
        // 添加小工具支持 / Add widget support
        add_action('widgets_init', array($this, 'register_dashboard_widgets'));
    }
    
    /**
     * 主題設置 / Theme setup
     */
    public function theme_setup() {
        // 添加 NexLearn 功能的主題支持 / Add theme support for NexLearn features
        add_theme_support('nexlearn-dashboard');
        add_theme_support('nexlearn-ai-features');
        add_theme_support('nexlearn-flashcards');
        add_theme_support('nexlearn-analytics');
        add_theme_support('nexlearn-multilingual');
        
        // 註冊儀表板菜單位置 / Register dashboard menu location
        register_nav_menus(array(
            'dashboard-menu' => __('Dashboard Menu', 'textdomain') . ' / ' . __('儀表板菜單', 'textdomain'),
            'dashboard-footer' => __('Dashboard Footer', 'textdomain') . ' / ' . __('儀表板頁腳', 'textdomain'),
        ));
        
        // 添加圖像尺寸 / Add image sizes
        add_image_size('dashboard-course-thumb', 300, 200, true);
        add_image_size('dashboard-avatar', 96, 96, true);
        add_image_size('dashboard-instructor', 150, 150, true);
        
        // 添加後台編輯器樣式 / Add editor styles
        add_editor_style('assets/css/dashboard-editor.css');
    }
    
    /**
     * 加載儀表板資源 / Enqueue dashboard assets
     */
    public function enqueue_dashboard_assets() {
        // 只在儀表板頁面加載 / Only load on dashboard pages
        if (!$this->is_dashboard_page()) {
            return;
        }
        
        // 加載 React 儀表板 / Enqueue React dashboard
        wp_enqueue_script(
            'nexlearn-dashboard-theme',
            get_template_directory_uri() . '/assets/js/nexlearn-dashboard.js',
            array('wp-element', 'wp-api-fetch', 'wp-i18n'),
            wp_get_theme()->get('Version'),
            true
        );
        
        wp_enqueue_style(
            'nexlearn-dashboard-theme-style',
            get_template_directory_uri() . '/assets/css/nexlearn-dashboard.css',
            array(),
            wp_get_theme()->get('Version')
        );
        
        // 加載圖表庫 / Load chart library
        wp_enqueue_script(
            'chart-js',
            'https://cdn.jsdelivr.net/npm/chart.js',
            array(),
            '3.9.1',
            true
        );
        
        // 本地化儀表板數據 / Localize dashboard data
        wp_localize_script('nexlearn-dashboard-theme', 'nexlearnThemeConfig', array(
            'apiUrl' => rest_url('nexlearn-theme/v1/'),
            'nonce' => wp_create_nonce('wp_rest'),
            'userId' => get_current_user_id(),
            'themeUrl' => get_template_directory_uri(),
            'siteName' => get_bloginfo('name'),
            'siteDescription' => get_bloginfo('description'),
            'userRole' => $this->get_user_role(),
            'learndashActive' => class_exists('SFWD_LMS'),
            'dashboardSettings' => $this->get_dashboard_settings(),
            'themeCustomization' => array(
                'primary_color' => get_theme_mod('nexlearn_primary_color', '#3b82f6'),
                'secondary_color' => get_theme_mod('nexlearn_secondary_color', '#64748b'),
                'accent_color' => get_theme_mod('nexlearn_accent_color', '#10b981'),
                'dashboard_layout' => get_theme_mod('nexlearn_dashboard_layout', 'sidebar'),
                'show_progress_rings' => get_theme_mod('nexlearn_show_progress_rings', true),
                'enable_dark_mode' => get_theme_mod('nexlearn_enable_dark_mode', true),
                'animation_speed' => get_theme_mod('nexlearn_animation_speed', 'normal'),
                'card_style' => get_theme_mod('nexlearn_card_style', 'elevated'),
                'typography' => array(
                    'font_family' => get_theme_mod('nexlearn_font_family', 'Inter'),
                    'font_size' => get_theme_mod('nexlearn_font_size', '14px'),
                    'line_height' => get_theme_mod('nexlearn_line_height', '1.5')
                )
            ),
            'translations' => array(
                'en' => array(
                    'dashboard' => 'Dashboard',
                    'my_courses' => 'My Courses',
                    'progress' => 'Progress',
                    'analytics' => 'Analytics',
                    'settings' => 'Settings',
                    'loading' => 'Loading...',
                    'error' => 'Error',
                    'save' => 'Save',
                    'cancel' => 'Cancel',
                    'welcome_back' => 'Welcome back',
                    'continue_learning' => 'Continue Learning',
                    'view_all' => 'View All',
                    'no_data' => 'No data available'
                ),
                'zh' => array(
                    'dashboard' => '儀表板',
                    'my_courses' => '我的課程',
                    'progress' => '進度',
                    'analytics' => '分析',
                    'settings' => '設置',
                    'loading' => '加載中...',
                    'error' => '錯誤',
                    'save' => '保存',
                    'cancel' => '取消',
                    'welcome_back' => '歡迎回來',
                    'continue_learning' => '繼續學習',
                    'view_all' => '查看全部',
                    'no_data' => '暫無數據'
                )
            ),
            'features' => array(
                'ai_enabled' => get_option('nexlearn_theme_ai_enabled', true),
                'flashcards_enabled' => get_option('nexlearn_theme_flashcards_enabled', true),
                'analytics_enabled' => get_option('nexlearn_theme_analytics_enabled', true),
                'social_sharing' => get_option('nexlearn_theme_social_sharing', true),
                'progress_gamification' => get_option('nexlearn_theme_gamification', true),
                'collaborative_learning' => get_option('nexlearn_theme_collaborative', false)
            )
        ));
        
        // 添加內聯樣式用於自定義 / Add inline styles for customization
        $custom_css = $this->generate_custom_css();
        wp_add_inline_style('nexlearn-dashboard-theme-style', $custom_css);
    }
    
    /**
     * 生成自定義 CSS / Generate custom CSS
     */
    private function generate_custom_css() {
        $primary_color = get_theme_mod('nexlearn_primary_color', '#3b82f6');
        $secondary_color = get_theme_mod('nexlearn_secondary_color', '#64748b');
        $accent_color = get_theme_mod('nexlearn_accent_color', '#10b981');
        $font_family = get_theme_mod('nexlearn_font_family', 'Inter');
        $font_size = get_theme_mod('nexlearn_font_size', '14px');
        $line_height = get_theme_mod('nexlearn_line_height', '1.5');
        
        $css = "
        :root {
            --nexlearn-primary: {$primary_color};
            --nexlearn-secondary: {$secondary_color};
            --nexlearn-accent: {$accent_color};
            --nexlearn-font-family: '{$font_family}', sans-serif;
            --nexlearn-font-size: {$font_size};
            --nexlearn-line-height: {$line_height};
        }
        
        .nexlearn-dashboard-container {
            font-family: var(--nexlearn-font-family);
            font-size: var(--nexlearn-font-size);
            line-height: var(--nexlearn-line-height);
        }
        
        .nexlearn-primary-color {
            color: var(--nexlearn-primary);
        }
        
        .nexlearn-primary-bg {
            background-color: var(--nexlearn-primary);
        }
        
        .nexlearn-secondary-color {
            color: var(--nexlearn-secondary);
        }
        
        .nexlearn-accent-color {
            color: var(--nexlearn-accent);
        }
        
        .nexlearn-button-primary {
            background-color: var(--nexlearn-primary);
            border-color: var(--nexlearn-primary);
        }
        
        .nexlearn-button-primary:hover {
            background-color: color-mix(in srgb, var(--nexlearn-primary) 90%, black);
            border-color: color-mix(in srgb, var(--nexlearn-primary) 90%, black);
        }
        ";
        
        // 添加響應式樣式 / Add responsive styles
        $css .= "
        @media (max-width: 768px) {
            .nexlearn-dashboard-container {
                font-size: calc(var(--nexlearn-font-size) * 0.9);
            }
        }
        
        @media (max-width: 480px) {
            .nexlearn-dashboard-container {
                font-size: calc(var(--nexlearn-font-size) * 0.8);
            }
        }
        ";
        
        // 添加深色模式支持 / Add dark mode support
        if (get_theme_mod('nexlearn_enable_dark_mode', true)) {
            $css .= "
            @media (prefers-color-scheme: dark) {
                .nexlearn-dashboard-container {
                    --nexlearn-bg: #1f2937;
                    --nexlearn-text: #f9fafb;
                    --nexlearn-border: #374151;
                }
            }
            
            .nexlearn-dark-mode {
                --nexlearn-bg: #1f2937;
                --nexlearn-text: #f9fafb;
                --nexlearn-border: #374151;
            }
            ";
        }
        
        return $css;
    }
    
    /**
     * 添加儀表板重寫規則 / Add dashboard rewrite rules
     */
    public function add_dashboard_rewrite_rules() {
        // 主儀表板路由 / Main dashboard route
        add_rewrite_rule(
            '^dashboard/?$',
            'index.php?nexlearn_dashboard=overview',
            'top'
        );
        
        // 儀表板子頁面 / Dashboard sub-pages
        add_rewrite_rule(
            '^dashboard/([^/]+)/?$',
            'index.php?nexlearn_dashboard=$matches[1]',
            'top'
        );
        
        // 課程特定儀表板 / Course-specific dashboard
        add_rewrite_rule(
            '^dashboard/course/([0-9]+)/?$',
            'index.php?nexlearn_dashboard=course&course_id=$matches[1]',
            'top'
        );
        
        // 用戶特定儀表板（管理員）/ User-specific dashboard (admin)
        add_rewrite_rule(
            '^dashboard/user/([0-9]+)/?$',
            'index.php?nexlearn_dashboard=user&user_id=$matches[1]',
            'top'
        );
        
        // API 端點 / API endpoints
        add_rewrite_rule(
            '^dashboard-api/([^/]+)/?$',
            'index.php?nexlearn_api=$matches[1]',
            'top'
        );
        
        add_rewrite_tag('%nexlearn_dashboard%', '([^&]+)');
        add_rewrite_tag('%nexlearn_api%', '([^&]+)');
        add_rewrite_tag('%course_id%', '([0-9]+)');
        add_rewrite_tag('%user_id%', '([0-9]+)');
    }
    
    /**
     * 儀表板模板重定向 / Dashboard template redirect
     */
    public function dashboard_template_redirect($template) {
        $dashboard_page = get_query_var('nexlearn_dashboard');
        $api_endpoint = get_query_var('nexlearn_api');
        
        // 處理 API 請求 / Handle API requests
        if ($api_endpoint) {
            $this->handle_api_request($api_endpoint);
            exit;
        }
        
        if ($dashboard_page) {
            // 檢查用戶是否已登錄 / Check if user is logged in
            if (!is_user_logged_in()) {
                wp_redirect(wp_login_url(home_url('/dashboard/')));
                exit;
            }
            
            // 檢查用戶權限 / Check user permissions
            if (!$this->user_can_access_dashboard()) {
                wp_die(__('You do not have permission to access this dashboard.', 'textdomain') . ' / ' . __('您沒有訪問此儀表板的權限。', 'textdomain'));
            }
            
            // 加載儀表板模板 / Load dashboard template
            $dashboard_template = $this->locate_dashboard_template($dashboard_page);
            if ($dashboard_template) {
                return $dashboard_template;
            } else {
                // 回退到默認儀表板模板 / Fallback to default dashboard template
                return $this->create_fallback_template($dashboard_page);
            }
        }
        
        return $template;
    }
    
    /**
     * 定位儀表板模板 / Locate dashboard template
     */
    private function locate_dashboard_template($dashboard_page) {
        $template_hierarchy = array(
            "templates/nexlearn-dashboard-{$dashboard_page}.php",
            "templates/nexlearn-dashboard.php",
            "nexlearn-dashboard-{$dashboard_page}.php",
            "nexlearn-dashboard.php",
            "dashboard-{$dashboard_page}.php",
            "dashboard.php"
        );
        
        foreach ($template_hierarchy as $template) {
            $located = locate_template($template);
            if ($located) {
                return $located;
            }
        }
        
        return null;
    }
    
    /**
     * 創建回退模板 / Create fallback template
     */
    private function create_fallback_template($dashboard_page) {
        $template_content = $this->get_fallback_template_content($dashboard_page);
        $temp_file = get_temp_dir() . 'nexlearn-dashboard-fallback.php';
        file_put_contents($temp_file, $template_content);
        return $temp_file;
    }
    
    /**
     * 獲取回退模板內容 / Get fallback template content
     */
    private function get_fallback_template_content($dashboard_page) {
        ob_start();
        ?>
        <?php get_header(); ?>
        
        <div class="nexlearn-dashboard-fallback">
            <div class="container">
                <h1><?php echo esc_html(ucfirst(str_replace('-', ' ', $dashboard_page))); ?></h1>
                <div id="nexlearn-dashboard-root" 
                     data-page="<?php echo esc_attr($dashboard_page); ?>"
                     data-user-id="<?php echo get_current_user_id(); ?>">
                    <div class="loading-placeholder">
                        <div class="spinner"></div>
                        <p><?php _e('Loading dashboard...', 'textdomain'); ?> / <?php _e('正在加載儀表板...', 'textdomain'); ?></p>
                    </div>
                </div>
            </div>
        </div>
        
        <style>
        .nexlearn-dashboard-fallback {
            min-height: 60vh;
            padding: 2rem 0;
        }
        .loading-placeholder {
            text-align: center;
            padding: 3rem;
        }
        .spinner {
            width: 40px;
            height: 40px;
            border: 4px solid #f3f4f6;
            border-top: 4px solid #3b82f6;
            border-radius: 50%;
            animation: spin 1s linear infinite;
            margin: 0 auto 1rem;
        }
        @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
        }
        </style>
        
        <?php get_footer(); ?>
        <?php
        return ob_get_clean();
    }
    
    /**
     * 註冊儀表板端點 / Register dashboard endpoints
     */
    public function register_dashboard_endpoints() {
        // 主儀表板數據 / Main dashboard data
        register_rest_route('nexlearn-theme/v1', '/dashboard-data', array(
            'methods' => 'GET',
            'callback' => array($this, 'get_theme_dashboard_data'),
            'permission_callback' => array($this, 'check_dashboard_permissions'),
            'args' => array(
                'lang' => array(
                    'description' => __('Language preference', 'textdomain') . ' / ' . __('語言偏好', 'textdomain'),
                    'type' => 'string',
                    'default' => 'en',
                    'enum' => array('en', 'zh', 'zh-TW', 'zh-CN')
                ),
                'page' => array(
                    'description' => __('Dashboard page', 'textdomain') . ' / ' . __('儀表板頁面', 'textdomain'),
                    'type' => 'string',
                    'default' => 'overview'
                )
            )
        ));
        
        // 更新用戶偏好 / Update user preferences
        register_rest_route('nexlearn-theme/v1', '/update-preferences', array(
            'methods' => 'POST',
            'callback' => array($this, 'update_user_preferences'),
            'permission_callback' => array($this, 'check_dashboard_permissions'),
            'args' => array(
                'language' => array(
                    'type' => 'string',
                    'enum' => array('en', 'zh', 'zh-TW', 'zh-CN')
                ),
                'theme_mode' => array(
                    'type' => 'string',
                    'enum' => array('light', 'dark', 'auto')
                ),
                'dashboard_layout' => array(
                    'type' => 'string',
                    'enum' => array('sidebar', 'full-width', 'boxed')
                ),
                'notifications' => array(
                    'type' => 'boolean'
                )
            )
        ));
        
        // 主題自定義 / Theme customization
        register_rest_route('nexlearn-theme/v1', '/theme-customization', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'handle_theme_customization'),
            'permission_callback' => array($this, 'check_customization_permissions')
        ));
        
        // 儀表板小工具 / Dashboard widgets
        register_rest_route('nexlearn-theme/v1', '/widgets', array(
            'methods' => array('GET', 'POST'),
            'callback' => array($this, 'handle_dashboard_widgets'),
            'permission_callback' => array($this, 'check_dashboard_permissions')
        ));
        
        // 導出數據 / Export data
        register_rest_route('nexlearn-theme/v1', '/export', array(
            'methods' => 'POST',
            'callback' => array($this, 'export_dashboard_data'),
            'permission_callback' => array($this, 'check_export_permissions'),
            'args' => array(
                'format' => array(
                    'type' => 'string',
                    'enum' => array('json', 'csv', 'pdf'),
                    'default' => 'json'
                ),
                'data_types' => array(
                    'type' => 'array',
                    'items' => array(
                        'type' => 'string',
                        'enum' => array('courses', 'progress', 'analytics', 'certificates')
                    )
                )
            )
        ));
    }
    
    /**
     * 獲取主題儀表板數據 / Get theme dashboard data
     */
    public function get_theme_dashboard_data($request) {
        $user_id = get_current_user_id();
        $lang = $request->get_param('lang') ?: 'en';
        $page = $request->get_param('page') ?: 'overview';
        
        // 獲取 LearnDash 數據（如果可用）/ Get LearnDash data if available
        $learndash_data = array();
        if (class_exists('SFWD_LMS')) {
            $learndash_data = $this->get_learndash_integration_data($user_id);
        }
        
        // 獲取 WordPress 用戶數據 / Get WordPress user data
        $user_data = $this->get_wordpress_user_data($user_id, $lang);
        
        // 獲取主題特定自定義 / Get theme-specific customizations
        $theme_data = $this->get_theme_dashboard_customizations($user_id);
        
        // 獲取頁面特定數據 / Get page-specific data
        $page_data = $this->get_page_specific_data($user_id, $page, $lang);
        
        return rest_ensure_response(array(
            'user' => $user_data,
            'learndash' => $learndash_data,
            'theme' => $theme_data,
            'page_data' => $page_data,
            'site_info' => array(
                'name' => get_bloginfo('name'),
                'description' => get_bloginfo('description'),
                'url' => home_url(),
                'admin_email' => get_option('admin_email'),
                'language' => get_locale(),
                'timezone' => wp_timezone_string(),
                'date_format' => get_option('date_format'),
                'time_format' => get_option('time_format')
            ),
            'capabilities' => array(
                'can_customize_dashboard' => current_user_can('edit_theme_options'),
                'can_manage_courses' => current_user_can('manage_options'),
                'can_view_all_users' => current_user_can('list_users'),
                'can_export_data' => current_user_can('export'),
                'can_import_data' => current_user_can('import')
            ),
            'features' => array(
                'ai_enabled' => get_option('nexlearn_theme_ai_enabled', true),
                'flashcards_enabled' => get_option('nexlearn_theme_flashcards_enabled', true),
                'analytics_enabled' => get_option('nexlearn_theme_analytics_enabled', true),
                'social_sharing' => get_option('nexlearn_theme_social_sharing', true),
                'gamification' => get_option('nexlearn_theme_gamification', true),
                'collaborative_learning' => get_option('nexlearn_theme_collaborative', false),
                'mobile_app_integration' => get_option('nexlearn_theme_mobile_app', false),
                'offline_mode' => get_option('nexlearn_theme_offline_mode', false)
            ),
            'translations' => $this->get_translations($lang),
            'current_language' => $lang,
            'rtl' => is_rtl()
        ));
    }
    
    /**
     * 添加儀表板菜單項 / Add dashboard menu item
     */
    public function add_dashboard_menu_item($items, $args) {
        // 只添加到主菜單 / Only add to primary menu
        if ($args->theme_location !== 'primary') {
            return $items;
        }
        
        // 只為已登錄用戶 / Only for logged-in users
        if (!is_user_logged_in()) {
            return $items;
        }
        
        $current_user = wp_get_current_user();
        $dashboard_link = '<li class="menu-item menu-item-dashboard menu-item-has-children">';
        $dashboard_link .= '<a href="' . home_url('/dashboard/') . '" class="dashboard-link">';
        $dashboard_link .= '<span class="dashboard-icon">📊</span> ';
        $dashboard_link .= __('My Dashboard', 'textdomain') . ' / ' . __('我的儀表板', 'textdomain');
        $dashboard_link .= '</a>';
        
        // 添加子菜單 / Add submenu
        $dashboard_link .= '<ul class="sub-menu dashboard-submenu">';
        $dashboard_link .= '<li><a href="' . home_url('/dashboard/') . '">' . __('Overview', 'textdomain') . ' / ' . __('概覽', 'textdomain') . '</a></li>';
        
        if (class_exists('SFWD_LMS')) {
            $dashboard_link .= '<li><a href="' . home_url('/dashboard/courses/') . '">' . __('My Courses', 'textdomain') . ' / ' . __('我的課程', 'textdomain') . '</a></li>';
            $dashboard_link .= '<li><a href="' . home_url('/dashboard/progress/') . '">' . __('Progress', 'textdomain') . ' / ' . __('進度', 'textdomain') . '</a></li>';
            $dashboard_link .= '<li><a href="' . home_url('/dashboard/certificates/') . '">' . __('Certificates', 'textdomain') . ' / ' . __('證書', 'textdomain') . '</a></li>';
        }
        
        $dashboard_link .= '<li><a href="' . home_url('/dashboard/analytics/') . '">' . __('Analytics', 'textdomain') . ' / ' . __('分析', 'textdomain') . '</a></li>';
        $dashboard_link .= '<li><a href="' . home_url('/dashboard/settings/') . '">' . __('Settings', 'textdomain') . ' / ' . __('設置', 'textdomain') . '</a></li>';
        $dashboard_link .= '</ul>';
        $dashboard_link .= '</li>';
        
        return $items . $dashboard_link;
    }
    
    /**
     * 創建儀表板頁面 / Create dashboard page
     */
    public function create_dashboard_page() {
        // 檢查儀表板頁面是否存在 / Check if dashboard page exists
        $dashboard_page = get_page_by_path('dashboard');
        
        if (!$dashboard_page) {
            // 程序化創建儀表板頁面 / Create dashboard page programmatically
            $page_data = array(
                'post_title' => __('Learning Dashboard', 'textdomain') . ' / ' . __('學習儀表板', 'textdomain'),
                'post_content' => '[nexlearn_dashboard view="full" language="auto"]',
                'post_status' => 'publish',
                'post_type' => 'page',
                'post_slug' => 'dashboard',
                'post_author' => 1,
                'meta_input' => array(
                    '_nexlearn_dashboard_page' => true,
                    '_wp_page_template' => 'templates/nexlearn-dashboard.php',
                    '_nexlearn_dashboard_config' => json_encode(array(
                        'layout' => 'sidebar',
                        'widgets' => array('overview', 'courses', 'progress', 'analytics'),
                        'theme' => 'default',
                        'multilingual' => true
                    ))
                )
            );
            
            $page_id = wp_insert_post($page_data);
            
            if ($page_id && !is_wp_error($page_id)) {
                // 設置頁面權限 / Set page permissions
                update_post_meta($page_id, '_nexlearn_required_capability', 'read');
                update_post_meta($page_id, '_nexlearn_redirect_non_users', wp_login_url());
                
                // 記錄頁面創建 / Log page creation
                error_log('NexLearn Dashboard page created with ID: ' . $page_id);
            }
        }
    }
    
    /**
     * 添加用戶儀表板字段 / Add user dashboard fields
     */
    public function add_user_dashboard_fields($user) {
        ?>
        <h3><?php echo __('NexLearn Dashboard Settings', 'textdomain') . ' / ' . __('NexLearn 儀表板設置', 'textdomain'); ?></h3>
        <table class="form-table">
            <tr>
                <th><label for="nexlearn_language"><?php echo __('Preferred Language', 'textdomain') . ' / ' . __('首選語言', 'textdomain'); ?></label></th>
                <td>
                    <select name="nexlearn_language" id="nexlearn_language">
                        <option value="en" <?php selected(get_user_meta($user->ID, 'nexlearn_language', true), 'en'); ?>>English</option>
                        <option value="zh" <?php selected(get_user_meta($user->ID, 'nexlearn_language', true), 'zh'); ?>>中文</option>
                        <option value="zh-TW" <?php selected(get_user_meta($user->ID, 'nexlearn_language', true), 'zh-TW'); ?>>繁體中文</option>
                        <option value="zh-CN" <?php selected(get_user_meta($user->ID, 'nexlearn_language', true), 'zh-CN'); ?>>简体中文</option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="nexlearn_dashboard_layout"><?php echo __('Dashboard Layout', 'textdomain') . ' / ' . __('儀表板佈局', 'textdomain'); ?></label></th>
                <td>
                    <select name="nexlearn_dashboard_layout" id="nexlearn_dashboard_layout">
                        <option value="sidebar" <?php selected(get_user_meta($user->ID, 'nexlearn_dashboard_layout', true), 'sidebar'); ?>><?php echo __('Sidebar', 'textdomain') . ' / ' . __('側邊欄', 'textdomain'); ?></option>
                        <option value="full-width" <?php selected(get_user_meta($user->ID, 'nexlearn_dashboard_layout', true), 'full-width'); ?>><?php echo __('Full Width', 'textdomain') . ' / ' . __('全寬', 'textdomain'); ?></option>
                        <option value="boxed" <?php selected(get_user_meta($user->ID, 'nexlearn_dashboard_layout', true), 'boxed'); ?>><?php echo __('Boxed', 'textdomain') . ' / ' . __('盒式', 'textdomain'); ?></option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="nexlearn_theme_mode"><?php echo __('Theme Mode', 'textdomain') . ' / ' . __('主題模式', 'textdomain'); ?></label></th>
                <td>
                    <select name="nexlearn_theme_mode" id="nexlearn_theme_mode">
                        <option value="auto" <?php selected(get_user_meta($user->ID, 'nexlearn_theme_mode', true), 'auto'); ?>><?php echo __('Auto', 'textdomain') . ' / ' . __('自動', 'textdomain'); ?></option>
                        <option value="light" <?php selected(get_user_meta($user->ID, 'nexlearn_theme_mode', true), 'light'); ?>><?php echo __('Light', 'textdomain') . ' / ' . __('淺色', 'textdomain'); ?></option>
                        <option value="dark" <?php selected(get_user_meta($user->ID, 'nexlearn_theme_mode', true), 'dark'); ?>><?php echo __('Dark', 'textdomain') . ' / ' . __('深色', 'textdomain'); ?></option>
                    </select>
                </td>
            </tr>
            <tr>
                <th><label for="nexlearn_notifications"><?php echo __('Enable Notifications', 'textdomain') . ' / ' . __('啟用通知', 'textdomain'); ?></label></th>
                <td>
                    <input type="checkbox" name="nexlearn_notifications" id="nexlearn_notifications" value="1" <?php checked(get_user_meta($user->ID, 'nexlearn_notifications', true), '1'); ?> />
                    <label for="nexlearn_notifications"><?php echo __('Receive dashboard notifications', 'textdomain') . ' / ' . __('接收儀表板通知', 'textdomain'); ?></label>
                </td>
            </tr>
        </table>
        <?php
    }
    
    /**
     * 保存用戶儀表板字段 / Save user dashboard fields
     */
    public function save_user_dashboard_fields($user_id) {
        if (!current_user_can('edit_user', $user_id)) {
            return false;
        }
        
        $fields = array(
            'nexlearn_language',
            'nexlearn_dashboard_layout',
            'nexlearn_theme_mode',
            'nexlearn_notifications'
        );
        
        foreach ($fields as $field) {
            if (isset($_POST[$field])) {
                update_user_meta($user_id, $field, sanitize_text_field($_POST[$field]));
            }
        }
    }
    
    /**
     * 檢查用戶是否可以訪問儀表板 / Check if user can access dashboard
     */
    private function user_can_access_dashboard() {
        if (!is_user_logged_in()) {
            return false;
        }
        
        $current_user = wp_get_current_user();
        
        // 管理員總是可以訪問 / Admins can always access
        if (current_user_can('manage_options')) {
            return true;
        }
        
        // 檢查是否有必要的能力 / Check for required capabilities
        $required_capability = get_option('nexlearn_dashboard_required_capability', 'read');
        if (!current_user_can($required_capability)) {
            return false;
        }
        
        // 檢查用戶角色限制 / Check user role restrictions
        $allowed_roles = get_option('nexlearn_dashboard_allowed_roles', array('subscriber', 'student', 'instructor', 'administrator'));
        $user_roles = $current_user->roles;
        
        if (!array_intersect($user_roles, $allowed_roles)) {
            return false;
        }
        
        return true;
    }
    
    /**
     * 判斷是否為儀表板頁面 / Check if is dashboard page
     */
    private function is_dashboard_page() {
        global $post;
        
        if (is_admin()) {
            return false;
        }
        
        // 檢查儀表板查詢變量 / Check for dashboard query var
        if (get_query_var('nexlearn_dashboard')) {
            return true;
        }
        
        // 檢查儀表板頁面 / Check for dashboard page
        if (is_page(array('dashboard', 'learning-dashboard', 'my-dashboard', '儀表板', '學習儀表板'))) {
            return true;
        }
        
        // 檢查儀表板短代碼 / Check for dashboard shortcode
        if (isset($post->post_content) && has_shortcode($post->post_content, 'nexlearn_dashboard')) {
            return true;
        }
        
        // 檢查儀表板模板 / Check for dashboard template
        if (is_page_template(array('templates/nexlearn-dashboard.php', 'nexlearn-dashboard.php', 'dashboard.php'))) {
            return true;
        }
        
        // 檢查 LearnDash 頁面 / Check for LearnDash pages
        if (function_exists('learndash_is_learndash_page') && learndash_is_learndash_page()) {
            return true;
        }
        
        return false;
    }
    
    /**
     * 獲取用戶角色 / Get user role
     */
    private function get_user_role() {
        $current_user = wp_get_current_user();
        return !empty($current_user->roles) ? $current_user->roles[0] : 'subscriber';
    }
    
    /**
     * 獲取儀表板設置 / Get dashboard settings
     */
    private function get_dashboard_settings() {
        return array(
            'items_per_page' => get_option('nexlearn_items_per_page', 10),
            'default_view' => get_option('nexlearn_default_view', 'grid'),
            'show_progress_bars' => get_option('nexlearn_show_progress', true),
            'enable_notifications' => get_option('nexlearn_notifications', true),
            'auto_refresh_interval' => get_option('nexlearn_refresh_interval', 300000), // 5分鐘 / 5 minutes
            'cache_duration' => get_option('nexlearn_cache_duration', 3600), // 1小時 / 1 hour
            'max_recent_activities' => get_option('nexlearn_max_recent_activities', 20),
            'enable_real_time_updates' => get_option('nexlearn_real_time_updates', false),
            'show_learning_streaks' => get_option('nexlearn_show_streaks', true),
            'gamification_enabled' => get_option('nexlearn_gamification', true)
        );
    }
    
    /**
     * 檢查儀表板權限 / Check dashboard permissions
     */
    public function check_dashboard_permissions($request) {
        return is_user_logged_in() && $this->user_can_access_dashboard();
    }
    
    /**
     * 檢查自定義權限 / Check customization permissions
     */
    public function check_customization_permissions($request) {
        return current_user_can('edit_theme_options');
    }
    
    /**
     * 檢查導出權限 / Check export permissions
     */
    public function check_export_permissions($request) {
        return current_user_can('export') || current_user_can('manage_options');
    }
    
    /**
     * 獲取翻譯 / Get translations
     */
    private function get_translations($lang = 'en') {
        $translations = array(
            'en' => array(
                'dashboard' => 'Dashboard',
                'overview' => 'Overview',
                'my_courses' => 'My Courses',
                'progress' => 'Progress',
                'analytics' => 'Analytics',
                'settings' => 'Settings',
                'profile' => 'Profile',
                'certificates' => 'Certificates',
                'achievements' => 'Achievements',
                'notifications' => 'Notifications',
                'help' => 'Help',
                'logout' => 'Logout',
                'welcome_back' => 'Welcome back',
                'continue_learning' => 'Continue Learning',
                'view_all' => 'View All',
                'loading' => 'Loading...',
                'error' => 'Error',
                'success' => 'Success',
                'save' => 'Save',
                'cancel' => 'Cancel',
                'delete' => 'Delete',
                'edit' => 'Edit',
                'add' => 'Add',
                'search' => 'Search',
                'filter' => 'Filter',
                'sort' => 'Sort',
                'export' => 'Export',
                'import' => 'Import',
                'no_data' => 'No data available',
                'coming_soon' => 'Coming Soon',
                'maintenance' => 'Under Maintenance'
            ),
            'zh' => array(
                'dashboard' => '儀表板',
                'overview' => '概覽',
                'my_courses' => '我的課程',
                'progress' => '進度',
                'analytics' => '分析',
                'settings' => '設置',
                'profile' => '個人資料',
                'certificates' => '證書',
                'achievements' => '成就',
                'notifications' => '通知',
                'help' => '幫助',
                'logout' => '登出',
                'welcome_back' => '歡迎回來',
                'continue_learning' => '繼續學習',
                'view_all' => '查看全部',
                'loading' => '加載中...',
                'error' => '錯誤',
                'success' => '成功',
                'save' => '保存',
                'cancel' => '取消',
                'delete' => '刪除',
                'edit' => '編輯',
                'add' => '添加',
                'search' => '搜索',
                'filter' => '篩選',
                'sort' => '排序',
                'export' => '導出',
                'import' => '導入',
                'no_data' => '暫無數據',
                'coming_soon' => '即將推出',
                'maintenance' => '維護中'
            )
        );
        
        return isset($translations[$lang]) ? $translations[$lang] : $translations['en'];
    }
}

// 初始化主題集成 / Initialize theme integration
new NexLearn_Theme_Integration();

/**
 * 儀表板短代碼 / Dashboard shortcode
 */
function nexlearn_dashboard_shortcode($atts) {
    $atts = shortcode_atts(array(
        'view' => 'full', // 視圖類型 / View type
        'language' => 'auto', // 語言 / Language
        'theme' => 'default', // 主題 / Theme
        'height' => 'auto', // 高度 / Height
        'layout' => 'default', // 佈局 / Layout
        'widgets' => '', // 小工具 / Widgets
        'user_id' => 0 // 用戶ID（管理員用）/ User ID (for admins)
    ), $atts);
    
    if (!is_user_logged_in()) {
        return '<div class="nexlearn-login-required">
            <div class="login-prompt">
                <h3>' . __('Login Required', 'textdomain') . ' / ' . __('需要登錄', 'textdomain') . '</h3>
                <p>' . __('Please log in to view your dashboard.', 'textdomain') . ' / ' . __('請登錄以查看您的儀表板。', 'textdomain') . '</p>
                <a href="' . wp_login_url(get_permalink()) . '" class="button nexlearn-login-button">' . __('Log In', 'textdomain') . ' / ' . __('登錄', 'textdomain') . '</a>
            </div>
        </div>';
    }
    
    // 檢查用戶權限 / Check user permissions
    $integration = new NexLearn_Theme_Integration();
    if (!$integration->user_can_access_dashboard()) {
        return '<div class="nexlearn-access-denied">
            <div class="access-denied-prompt">
                <h3>' . __('Access Denied', 'textdomain') . ' / ' . __('訪問被拒絕', 'textdomain') . '</h3>
                <p>' . __('You do not have permission to access this dashboard.', 'textdomain') . ' / ' . __('您沒有訪問此儀表板的權限。', 'textdomain') . '</p>
            </div>
        </div>';
    }
    
    // 自動檢測語言 / Auto-detect language
    if ($atts['language'] === 'auto') {
        $user_lang = get_user_meta(get_current_user_id(), 'nexlearn_language', true);
        if ($user_lang) {
            $atts['language'] = $user_lang;
        } else {
            $locale = get_locale();
            if (strpos($locale, 'zh') === 0) {
                $atts['language'] = 'zh';
            } else {
                $atts['language'] = 'en';
            }
        }
    }
    
    // 處理小工具列表 / Process widgets list
    $widgets = !empty($atts['widgets']) ? explode(',', $atts['widgets']) : array();
    
    ob_start();
    ?>
    <div id="nexlearn-dashboard-root" 
         class="nexlearn-dashboard-container theme-<?php echo esc_attr($atts['theme']); ?> layout-<?php echo esc_attr($atts['layout']); ?>"
         data-view="<?php echo esc_attr($atts['view']); ?>"
         data-language="<?php echo esc_attr($atts['language']); ?>"
         data-layout="<?php echo esc_attr($atts['layout']); ?>"
         data-widgets="<?php echo esc_attr(implode(',', $widgets)); ?>"
         data-user-id="<?php echo esc_attr($atts['user_id'] ?: get_current_user_id()); ?>"
         style="height: <?php echo esc_attr($atts['height']); ?>;">
        
        <div class="nexlearn-loading">
            <div class="loading-content">
                <div class="loading-spinner"></div>
                <h3><?php echo __('Loading your dashboard...', 'textdomain') . ' / ' . __('正在加載您的儀表板...', 'textdomain'); ?></h3>
                <p><?php echo __('Please wait while we prepare your learning experience.', 'textdomain') . ' / ' . __('請稍候，我們正在為您準備學習體驗。', 'textdomain'); ?></p>
            </div>
        </div>
        
        <noscript>
            <div class="nexlearn-no-js">
                <h3><?php echo __('JavaScript Required', 'textdomain') . ' / ' . __('需要 JavaScript', 'textdomain'); ?></h3>
                <p><?php echo __('This dashboard requires JavaScript to function properly. Please enable JavaScript in your browser.', 'textdomain') . ' / ' . __('此儀表板需要 JavaScript 才能正常運行。請在瀏覽器中啟用 JavaScript。', 'textdomain'); ?></p>
            </div>
        </noscript>
    </div>
    
    <style>
    .nexlearn-dashboard-container {
        min-height: 400px;
        position: relative;
        font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
    }
    
    .nexlearn-loading {
        display: flex;
        align-items: center;
        justify-content: center;
        min-height: 400px;
        text-align: center;
        background: linear-gradient(135deg, #f5f7fa 0%, #c3cfe2 100%);
        border-radius: 12px;
    }
    
    .loading-content {
        max-width: 300px;
        padding: 2rem;
    }
    
    .loading-spinner {
        width: 50px;
        height: 50px;
        border: 4px
