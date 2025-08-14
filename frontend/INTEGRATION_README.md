# NexLearn.ai Dashboard WordPress Integration Guide
# NexLearn.ai 儀表板 WordPress 集成指南

## Table of Contents / 目錄

1. [Overview / 概述](#overview--概述)
2. [Prerequisites / 先決條件](#prerequisites--先決條件)
3. [Plugin Integration Method / 插件集成方法](#plugin-integration-method--插件集成方法)
4. [Theme Integration Method / 主題集成方法](#theme-integration-method--主題集成方法)
5. [LearnDash Integration / LearnDash 集成](#learndash-integration--learndash-集成)
6. [API Documentation / API 文檔](#api-documentation--api-文檔)
7. [Database Schema / 數據庫架構](#database-schema--數據庫架構)
8. [Customization Guide / 自定義指南](#customization-guide--自定義指南)
9. [Troubleshooting / 故障排除](#troubleshooting--故障排除)
10. [Performance Optimization / 性能優化](#performance-optimization--性能優化)
11. [Security Considerations / 安全考慮](#security-considerations--安全考慮)
12. [Deployment / 部署](#deployment--部署)

---

## Overview / 概述

The NexLearn.ai Dashboard provides two primary integration methods for WordPress sites with LearnDash LMS:

NexLearn.ai 儀表板為使用 LearnDash LMS 的 WordPress 網站提供兩種主要集成方法：

### 🔌 Plugin Integration / 插件集成
- **Portable and independent** / **便攜且獨立**
- **Easy installation and updates** / **易於安裝和更新**
- **Works with any theme** / **適用於任何主題**
- **Commercial distribution ready** / **商業分發就緒**

### 🎨 Theme Integration / 主題集成
- **Seamless native experience** / **無縫原生體驗**
- **Deep customization options** / **深度自定義選項**
- **Perfect theme matching** / **完美主題匹配**
- **WordPress Customizer support** / **WordPress 自定義器支持**

---

## Prerequisites / 先決條件

### Required Software / 必需軟件

\`\`\`bash
# WordPress Requirements / WordPress 要求
WordPress >= 5.8
PHP >= 7.4 (Recommended: PHP 8.0+)
MySQL >= 5.7 or MariaDB >= 10.3

# LearnDash LMS / LearnDash LMS
LearnDash >= 4.0

# Node.js for React Development / React 開發的 Node.js
Node.js >= 16.0
npm >= 8.0 or yarn >= 1.22
\`\`\`

### WordPress Capabilities / WordPress 權限

\`\`\`php
// Required user capabilities / 必需的用戶權限
'read'                    // Basic dashboard access / 基本儀表板訪問
'edit_posts'             // Create flashcards / 創建閃卡
'manage_options'         // Admin settings / 管理員設置
'export'                 // Data export / 數據導出
'list_users'             // View all users (admin) / 查看所有用戶（管理員）
\`\`\`

### Database Permissions / 數據庫權限

\`\`\`sql
-- Required MySQL privileges / 必需的 MySQL 權限
CREATE, ALTER, DROP      -- Table management / 表管理
SELECT, INSERT, UPDATE, DELETE  -- Data operations / 數據操作
INDEX                    -- Performance optimization / 性能優化
\`\`\`

---

## Plugin Integration Method / 插件集成方法

### 📁 Directory Structure / 目錄結構

\`\`\`
nexlearn-dashboard-plugin/
├── nexlearn-dashboard.php          # Main plugin file / 主插件文件
├── README.txt                      # WordPress plugin readme / WordPress 插件說明
├── languages/                      # Translation files / 翻譯文件
│   ├── nexlearn-dashboard.pot
│   ├── nexlearn-dashboard-zh_CN.po
│   └── nexlearn-dashboard-zh_TW.po
├── includes/                       # PHP classes / PHP 類
│   ├── class-nexlearn-api.php
│   ├── class-nexlearn-learndash-integration.php
│   ├── class-nexlearn-ai-engine.php
│   ├── class-nexlearn-flashcards.php
│   ├── class-nexlearn-analytics.php
│   └── class-nexlearn-shortcodes.php
├── admin/                          # Admin interface / 管理界面
│   ├── css/
│   ├── js/
│   └── partials/
├── public/                         # Frontend assets / 前端資源
│   ├── css/
│   ├── js/
│   └── images/
├── src/                           # React source code / React 源代碼
│   ├── components/
│   ├── hooks/
│   ├── utils/
│   └── styles/
├── build/                         # Compiled React app / 編譯的 React 應用
│   └── static/
├── tests/                         # Unit tests / 單元測試
└── vendor/                        # Composer dependencies / Composer 依賴
\`\`\`

### 🚀 Installation Steps / 安裝步驟

#### Method 1: WordPress Admin / 方法1：WordPress 管理後台

\`\`\`bash
# 1. Download plugin ZIP / 下載插件 ZIP
# 2. Upload via WordPress Admin > Plugins > Add New > Upload
# 2. 通過 WordPress 管理後台 > 插件 > 安裝插件 > 上傳插件

# 3. Activate plugin / 激活插件
# 4. Configure settings in NexLearn menu / 在 NexLearn 菜單中配置設置
\`\`\`

#### Method 2: Manual Installation / 方法2：手動安裝

\`\`\`bash
# 1. Upload to plugins directory / 上傳到插件目錄
cd /path/to/wordpress/wp-content/plugins/
unzip nexlearn-dashboard-plugin.zip

# 2. Set permissions / 設置權限
chmod -R 755 nexlearn-dashboard-plugin/
chown -R www-data:www-data nexlearn-dashboard-plugin/

# 3. Activate via WordPress admin / 通過 WordPress 管理後台激活
\`\`\`

#### Method 3: WP-CLI Installation / 方法3：WP-CLI 安裝

\`\`\`bash
# Install via WP-CLI / 通過 WP-CLI 安裝
wp plugin install nexlearn-dashboard-plugin.zip --activate

# Configure basic settings / 配置基本設置
wp option update nexlearn_ai_enabled true
wp option update nexlearn_flashcards_enabled true
wp option update nexlearn_analytics_enabled true
\`\`\`

### ⚙️ Configuration / 配置

#### Basic Plugin Configuration / 基本插件配置

\`\`\`php
// wp-config.php additions / wp-config.php 添加項
define('NEXLEARN_DEBUG', false);                    // Debug mode / 調試模式
define('NEXLEARN_CACHE_DURATION', 3600);           // Cache duration (seconds) / 緩存持續時間（秒）
define('NEXLEARN_MAX_FLASHCARDS', 1000);           // Max flashcards per user / 每用戶最大閃卡數
define('NEXLEARN_AI_API_TIMEOUT', 30);             // AI API timeout / AI API 超時
define('NEXLEARN_ENABLE_LOGGING', true);           // Enable error logging / 啟用錯誤日誌
\`\`\`

#### Plugin Settings / 插件設置

\`\`\`php
// Available options / 可用選項
$plugin_options = array(
    'nexlearn_ai_enabled' => true,                  // Enable AI features / 啟用 AI 功能
    'nexlearn_flashcards_enabled' => true,         // Enable flashcards / 啟用閃卡
    'nexlearn_analytics_enabled' => true,          // Enable analytics / 啟用分析
    'nexlearn_default_language' => 'en',           // Default language / 默認語言
    'nexlearn_multilingual_support' => true,       // Multilingual support / 多語言支持
    'nexlearn_cache_enabled' => true,              // Enable caching / 啟用緩存
    'nexlearn_real_time_updates' => false,         // Real-time updates / 實時更新
    'nexlearn_max_recent_activities' => 20,        // Max recent activities / 最大近期活動數
    'nexlearn_auto_generate_flashcards' => true,   // Auto-generate flashcards / 自動生成閃卡
    'nexlearn_gamification_enabled' => true        // Enable gamification / 啟用遊戲化
);

// Set options programmatically / 程序化設置選項
foreach ($plugin_options as $option => $value) {
    update_option($option, $value);
}
\`\`\`

### 📝 Usage Examples / 使用示例

#### Shortcode Usage / 短代碼使用

\`\`\`php
// Basic dashboard / 基本儀表板
[nexlearn_dashboard]

// Full dashboard with specific language / 指定語言的完整儀表板
[nexlearn_dashboard view="full" language="zh" theme="modern"]

// Compact view for sidebar / 側邊欄緊湊視圖
[nexlearn_dashboard view="compact" height="400px" widgets="progress,recent"]

// Course-specific dashboard / 課程特定儀表板
[nexlearn_dashboard view="course" course_id="123" language="auto"]
\`\`\`

#### PHP Integration / PHP 集成

\`\`\`php
// Get dashboard data programmatically / 程序化獲取儀表板數據
$dashboard = NexLearnDashboardPlugin::get_instance();
$user_data = $dashboard->get_dashboard_data(new WP_REST_Request());

// Check if user can access dashboard / 檢查用戶是否可以訪問儀表板
if ($dashboard->check_user_permissions(new WP_REST_Request())) {
    // Display dashboard / 顯示儀表板
    echo do_shortcode('[nexlearn_dashboard]');
}

// Custom integration example / 自定義集成示例
function my_custom_dashboard_page() {
    if (!is_user_logged_in()) {
        wp_redirect(wp_login_url());
        exit;
    }
    
    get_header();
    ?>
    <div class="my-custom-dashboard">
        <h1><?php _e('My Learning Dashboard', 'textdomain'); ?> / <?php _e('我的學習儀表板', 'textdomain'); ?></h1>
        <?php echo do_shortcode('[nexlearn_dashboard view="full" language="auto"]'); ?>
    </div>
    <?php
    get_footer();
}
\`\`\`

---

## Theme Integration Method / 主題集成方法

### 📁 Theme Structure / 主題結構

\`\`\`
your-theme/
├── functions.php                   # Main integration file / 主集成文件
├── templates/                      # Dashboard templates / 儀表板模板
│   ├── nexlearn-dashboard.php
│   ├── nexlearn-dashboard-overview.php
│   ├── nexlearn-dashboard-courses.php
│   └── nexlearn-dashboard-analytics.php
├── assets/                         # Theme assets / 主題資源
│   ├── css/
│   │   ├── nexlearn-dashboard.css
│   │   └── nexlearn-dashboard-rtl.css
│   ├── js/
│   │   ├── nexlearn-dashboard.js
│   │   └── nexlearn-dashboard.min.js
│   └── images/
├── inc/                           # Theme includes / 主題包含文件
│   ├── nexlearn-customizer.php
│   ├── nexlearn-widgets.php
│   └── nexlearn-ajax-handlers.php
└── languages/                     # Theme translations / 主題翻譯
    ├── textdomain-zh_CN.po
    └── textdomain-zh_TW.po
\`\`\`

### 🎨 Theme Integration Steps / 主題集成步驟

#### Step 1: Add to functions.php / 步驟1：添加到 functions.php

\`\`\`php
// functions.php
require_once get_template_directory() . '/inc/nexlearn-integration.php';

// Initialize theme integration / 初始化主題集成
if (class_exists('NexLearn_Theme_Integration')) {
    new NexLearn_Theme_Integration();
}

// Add theme support / 添加主題支持
function my_theme_nexlearn_support() {
    add_theme_support('nexlearn-dashboard');
    add_theme_support('nexlearn-ai-features');
    add_theme_support('nexlearn-flashcards');
    add_theme_support('nexlearn-analytics');
    add_theme_support('nexlearn-multilingual');
}
add_action('after_setup_theme', 'my_theme_nexlearn_support');
\`\`\`

#### Step 2: Create Dashboard Template / 步驟2：創建儀表板模板

\`\`\`php
// templates/nexlearn-dashboard.php
<?php
/**
 * Template Name: NexLearn Dashboard / NexLearn 儀表板
 * Description: Learning dashboard template / 學習儀表板模板
 */

// Security check / 安全檢查
if (!defined('ABSPATH')) {
    exit;
}

// Login check / 登錄檢查
if (!is_user_logged_in()) {
    wp_redirect(wp_login_url(get_permalink()));
    exit;
}

get_header('dashboard'); ?>

<div class="nexlearn-dashboard-page">
    <?php
    // Breadcrumbs / 面包屑導航
    if (function_exists('nexlearn_breadcrumbs')) {
        nexlearn_breadcrumbs();
    }
    ?>
    
    <div class="dashboard-container">
        <?php if (get_theme_mod('nexlearn_show_sidebar', true)): ?>
        <aside class="dashboard-sidebar">
            <?php
            // Dashboard navigation / 儀表板導航
            wp_nav_menu(array(
                'theme_location' => 'dashboard-menu',
                'menu_class' => 'dashboard-nav',
                'container' => 'nav',
                'fallback_cb' => 'nexlearn_default_dashboard_menu'
            ));
            
            // User info widget / 用戶信息小工具
            nexlearn_render_user_info_widget();
            
            // Quick stats widget / 快速統計小工具
            if (class_exists('SFWD_LMS')) {
                nexlearn_render_quick_stats_widget();
            }
            ?>
        </aside>
        <?php endif; ?>
        
        <main class="dashboard-main">
            <header class="dashboard-header">
                <h1 class="dashboard-title">
                    <?php
                    $page = get_query_var('nexlearn_dashboard', 'overview');
                    echo esc_html(nexlearn_get_page_title($page));
                    ?>
                </h1>
                
                <div class="dashboard-actions">
                    <?php nexlearn_render_dashboard_actions(); ?>
                </div>
            </header>
            
            <div class="dashboard-content">
                <?php
                // Main dashboard content / 主儀表板內容
                $dashboard_page = get_query_var('nexlearn_dashboard', 'overview');
                echo do_shortcode('[nexlearn_dashboard view="' . esc_attr($dashboard_page) . '" language="auto"]');
                ?>
            </div>
        </main>
    </div>
</div>

<?php get_footer('dashboard'); ?>
\`\`\`

#### Step 3: Add Customizer Support / 步驟3：添加自定義器支持

\`\`\`php
// inc/nexlearn-customizer.php
function nexlearn_dashboard_customizer($wp_customize) {
    // Dashboard section / 儀表板部分
    $wp_customize->add_section('nexlearn_dashboard', array(
        'title' => __('NexLearn Dashboard', 'textdomain') . ' / ' . __('NexLearn 儀表板', 'textdomain'),
        'priority' => 30,
        'description' => __('Customize the learning dashboard appearance and functionality.', 'textdomain') . ' / ' . __('自定義學習儀表板的外觀和功能。', 'textdomain')
    ));
    
    // Layout options / 佈局選項
    $wp_customize->add_setting('nexlearn_dashboard_layout', array(
        'default' => 'sidebar',
        'sanitize_callback' => 'sanitize_text_field',
        'transport' => 'refresh'
    ));
    
    $wp_customize->add_control('nexlearn_dashboard_layout', array(
        'label' => __('Dashboard Layout', 'textdomain') . ' / ' . __('儀表板佈局', 'textdomain'),
        'section' => 'nexlearn_dashboard',
        'type' => 'select',
        'choices' => array(
            'sidebar' => __('Sidebar Layout', 'textdomain') . ' / ' . __('側邊欄佈局', 'textdomain'),
            'full-width' => __('Full Width', 'textdomain') . ' / ' . __('全寬', 'textdomain'),
            'boxed' => __('Boxed Layout', 'textdomain') . ' / ' . __('盒式佈局', 'textdomain'),
            'grid' => __('Grid Layout', 'textdomain') . ' / ' . __('網格佈局', 'textdomain')
        )
    ));
    
    // Color scheme / 顏色方案
    $colors = array(
        'primary' => array(
            'label' => __('Primary Color', 'textdomain') . ' / ' . __('主色', 'textdomain'),
            'default' => '#3b82f6'
        ),
        'secondary' => array(
            'label' => __('Secondary Color', 'textdomain') . ' / ' . __('輔助色', 'textdomain'),
            'default' => '#64748b'
        ),
        'accent' => array(
            'label' => __('Accent Color', 'textdomain') . ' / ' . __('強調色', 'textdomain'),
            'default' => '#10b981'
        ),
        'background' => array(
            'label' => __('Background Color', 'textdomain') . ' / ' . __('背景色', 'textdomain'),
            'default' => '#ffffff'
        )
    );
    
    foreach ($colors as $color_key => $color_data) {
        $wp_customize->add_setting("nexlearn_{$color_key}_color", array(
            'default' => $color_data['default'],
            'sanitize_callback' => 'sanitize_hex_color',
            'transport' => 'postMessage'
        ));
        
        $wp_customize->add_control(new WP_Customize_Color_Control($wp_customize, "nexlearn_{$color_key}_color", array(
            'label' => $color_data['label'],
            'section' => 'nexlearn_dashboard'
        )));
    }
    
    // Typography settings / 排版設置
    $wp_customize->add_setting('nexlearn_font_family', array(
        'default' => 'Inter',
        'sanitize_callback' => 'sanitize_text_field'
    ));
    
    $wp_customize->add_control('nexlearn_font_family', array(
        'label' => __('Font Family', 'textdomain') . ' / ' . __('字體系列', 'textdomain'),
        'section' => 'nexlearn_dashboard',
        'type' => 'select',
        'choices' => array(
            'Inter' => 'Inter',
            'Roboto' => 'Roboto',
            'Open Sans' => 'Open Sans',
            'Lato' => 'Lato',
            'Poppins' => 'Poppins',
            'Noto Sans SC' => 'Noto Sans SC (中文)',
            'Source Han Sans' => 'Source Han Sans (中文)'
        )
    ));
    
    // Feature toggles / 功能開關
    $features = array(
        'ai_enabled' => __('Enable AI Features', 'textdomain') . ' / ' . __('啟用 AI 功能', 'textdomain'),
        'dark_mode' => __('Enable Dark Mode Toggle', 'textdomain') . ' / ' . __('啟用深色模式切換', 'textdomain'),
        'animations' => __('Enable Animations', 'textdomain') . ' / ' . __('啟用動畫', 'textdomain'),
        'progress_rings' => __('Show Progress Rings', 'textdomain') . ' / ' . __('顯示進度環', 'textdomain'),
        'breadcrumbs' => __('Show Breadcrumbs', 'textdomain') . ' / ' . __('顯示面包屑導航', 'textdomain')
    );
    
    foreach ($features as $feature_key => $feature_label) {
        $wp_customize->add_setting("nexlearn_{$feature_key}", array(
            'default' => true,
            'sanitize_callback' => 'wp_validate_boolean'
        ));
        
        $wp_customize->add_control("nexlearn_{$feature_key}", array(
            'label' => $feature_label,
            'section' => 'nexlearn_dashboard',
            'type' => 'checkbox'
        ));
    }
}
add_action('customize_register', 'nexlearn_dashboard_customizer');
\`\`\`

---

## LearnDash Integration / LearnDash 集成

### 🔗 Data Synchronization / 數據同步

#### Course Progress Tracking / 課程進度跟踪

\`\`\`php
// Automatic progress sync / 自動進度同步
class NexLearn_LearnDash_Sync {
    
    public function __construct() {
        // Hook into LearnDash events / 掛鉤到 LearnDash 事件
        add_action('learndash_course_completed', array($this, 'sync_course_completion'), 10, 1);
        add_action('learndash_lesson_completed', array($this, 'sync_lesson_completion'), 10, 1);
        add_action('learndash_quiz_completed', array($this, 'sync_quiz_completion'), 10, 2);
        add_action('learndash_assignment_uploaded', array($this, 'sync_assignment_upload'), 10, 2);
        
        // Custom sync actions / 自定義同步操作
        add_action('wp_ajax_nexlearn_manual_sync', array($this, 'manual_sync'));
        add_action('wp_ajax_nexlearn_bulk_sync', array($this, 'bulk_sync'));
    }
    
    /**
     * Sync course completion / 同步課程完成
     */
    public function sync_course_completion($data) {
        $user_id = $data['user']->ID;
        $course_id = $data['course']->ID;
        
        // Update NexLearn analytics / 更新 NexLearn 分析
        $this->log_completion_event($user_id, 'course', $course_id, array(
            'completion_date' => current_time('mysql'),
            'total_lessons' => count(learndash_get_course_lessons_list($course_id)),
            'total_quizzes' => count(learndash_get_course_quiz_list($course_id)),
            'study_time' => $this->calculate_study_time($user_id, $course_id),
            'certificate_earned' => learndash_course_completed($user_id, $course_id)
        ));
        
        // Trigger AI analysis / 觸發 AI 分析
        do_action('nexlearn_analyze_completion', $user_id, $course_id, 'course');
        
        // Generate recommendations / 生成推薦
        $this->generate_next_course_recommendations($user_id, $course_id);
    }
    
    /**
     * Manual sync trigger / 手動同步觸發
     */
    public function manual_sync() {
        check_ajax_referer('nexlearn_sync_nonce', 'nonce');
        
        if (!current_user_can('manage_options')) {
            wp_die(__('Insufficient permissions', 'textdomain') . ' / ' . __('權限不足', 'textdomain'));
        }
        
        $user_id = intval($_POST['user_id']);
        $sync_type = sanitize_text_field($_POST['sync_type']);
        
        $result = $this->perform_sync($user_id, $sync_type);
        
        wp_send_json_success(array(
            'message' => __('Sync completed successfully', 'textdomain') . ' / ' . __('同步成功完成', 'textdomain'),
            'synced_items' => $result['count'],
            'sync_time' => $result['duration']
        ));
    }
}

// Initialize sync / 初始化同步
new NexLearn_LearnDash_Sync();
\`\`\`

#### Custom Fields Mapping / 自定義字段映射

\`\`\`php
// Map LearnDash custom fields to NexLearn / 將 LearnDash 自定義字段映射到 NexLearn
$field_mapping = array(
    // Course fields / 課程字段
    'course_difficulty' => '_course_difficulty',
    'course_duration' => '_course_duration',
    'course_prerequisites' => '_course_prerequisites',
    'course_objectives' => '_course_objectives',
    'course_materials' => '_course_materials',
    
    // Lesson fields / 課程字段
    'lesson_duration' => '_lesson_duration',
    'lesson_type' => '_lesson_type',
    'lesson_video_url' => '_lesson_video_url',
    'lesson_materials' => '_lesson_materials',
    
    // Quiz fields / 測驗字段
    'quiz_difficulty' => '_quiz_difficulty',
    'quiz_type' => '_quiz_type',
    'quiz_time_limit' => '_quiz_time_limit',
    'quiz_passing_score' => '_quiz_passing_score',
    
    // User progress fields / 用戶進度字段
    'last_activity' => '_nexlearn_last_activity',
    'study_streak' => '_nexlearn_study_streak',
    'preferred_language' => '_nexlearn_language',
    'learning_style' => '_nexlearn_learning_style'
);

// Apply field mapping / 應用字段映射
function nexlearn_map_learndash_fields($post_id, $post_type) {
    global $field_mapping;
    
    if (!in_array($post_type, array('sfwd-courses', 'sfwd-lessons', 'sfwd-quiz'))) {
        return;
    }
    
    foreach ($field_mapping as $nexlearn_field => $learndash_field) {
        $value = get_post_meta($post_id, $learndash_field, true);
        if (!empty($value)) {
            update_post_meta($post_id, $nexlearn_field, $value);
        }
    }
}
add_action('save_post', 'nexlearn_map_learndash_fields', 10, 2);
\`\`\`

---

## API Documentation / API 文檔

### 🔌 REST API Endpoints / REST API 端點

#### Plugin API Endpoints / 插件 API 端點

\`\`\`php
// Base URL: /wp-json/nexlearn/v1/
// 基礎 URL: /wp-json/nexlearn/v1/

/**
 * GET /dashboard
 * Get dashboard data / 獲取儀表板數據
 */
$response = wp_remote_get(rest_url('nexlearn/v1/dashboard'), array(
    'headers' => array(
        'X-WP-Nonce' => wp_create_nonce('wp_rest'),
        'Content-Type' => 'application/json'
    ),
    'body' => json_encode(array(
        'lang' => 'zh',           // Language preference / 語言偏好
        'include' => array(       // Data to include / 包含的數據
            'courses',
            'progress', 
            'analytics',
            'certificates'
        )
    ))
));

/**
 * POST /flashcards
 * Create flashcard / 創建閃卡
 */
$flashcard_data = array(
    'front_content' => 'What is machine learning?',
    'back_content' => 'A subset of AI that enables computers to learn without explicit programming',
    'front_content_zh' => '什麼是機器學習？',
    'back_content_zh' => '人工智能的一個子集，使計算機能夠在沒有明確編程的情況下學習',
    'difficulty_level' => 2,
    'tags' => array('AI', 'machine-learning', 'technology'),
    'course_id' => 123
);

$response = wp_remote_post(rest_url('nexlearn/v1/flashcards'), array(
    'headers' => array(
        'X-WP-Nonce' => wp_create_nonce('wp_rest'),
        'Content-Type' => 'application/json'
    ),
    'body' => json_encode($flashcard_data)
));

/**
 * GET /analytics
 * Get analytics data / 獲取分析數據
 */
$analytics_params = array(
    'period' => '30days',        // Time period / 時間段
    'metrics' => array(          // Metrics to include / 包含的指標
        'study_time',
        'completion_rate',
        'quiz_scores',
        'learning_streak'
    ),
    'group_by' => 'week',        // Group data by / 數據分組方式
    'format' => 'json'           // Response format / 響應格式
);

$response = wp_remote_get(
    rest_url('nexlearn/v1/analytics') . '?' . http_build_query($analytics_params),
    array(
        'headers' => array(
            'X-WP-Nonce' => wp_create_nonce('wp_rest')
        )
    )
);

/**
 * POST /ai-insights
 * Generate AI insights / 生成 AI 洞察
 */
$ai_request = array(
    'analysis_type' => 'learning_patterns',  // Analysis type / 分析類型
    'data_range' => '90days',               // Data range / 數據範圍
    'include_predictions' => true,          // Include predictions / 包含預測
    'language' => 'zh'                      // Response language / 響應語言
);

$response = wp_remote_post(rest_url('nexlearn/v1/ai-insights'), array(
    'headers' => array(
        'X-WP-Nonce' => wp_create_nonce('wp_rest'),
        'Content-Type' => 'application/json'
    ),
    'body' => json_encode($ai_request),
    'timeout' => 60  // AI requests may take longer / AI 請求可能需要更長時間
));
\`\`\`

#### Theme API Endpoints / 主題 API 端點

\`\`\`php
// Base URL: /wp-json/nexlearn-theme/v1/
// 基礎 URL: /wp-json/nexlearn-theme/v1/

/**
 * GET /dashboard-data
 * Get theme-integrated dashboard data / 獲取主題集成的儀表板數據
 */
$theme_params = array(
    'lang' => 'zh',
    'page' => 'overview',
    'layout' => 'sidebar',
    'include_theme_data' => true
);

$response = wp_remote_get(
    rest_url('nexlearn-theme/v1/dashboard-data') . '?' . http_build_query($theme_params),
    array(
        'headers' => array(
            'X-WP-Nonce' => wp_create_nonce('wp_rest')
        )
    )
);

/**
 * POST /update-preferences
 * Update user dashboard preferences / 更新用戶儀表板偏好
 */
$preferences = array(
    'language' => 'zh-TW',
    'theme_mode' => 'dark',
    'dashboard_layout' => 'full-width',
    'notifications' => true,
    'auto_refresh' => false
);

$response = wp_remote_post(rest_url('nexlearn-theme/v1/update-preferences'), array(
    'headers' => array(
        'X-WP-Nonce' => wp_create_nonce('wp_rest'),
        'Content-Type' => 'application/json'
    ),
    'body' => json_encode($preferences)
));

/**
 * GET /export
 * Export dashboard data / 導出儀表板數據
 */
$export_params = array(
    'format' => 'json',          // Export format: json, csv, pdf / 導出格式
    'data_types' => array(       // Data types to export / 導出的數據類型
        'courses',
        'progress',
        'analytics',
        'certificates'
    ),
    'date_range' => array(       // Date range / 日期範圍
        'start' => '2024-01-01',
        'end' => '2024-12-31'
    ),
    'include_personal_data' => false  // GDPR compliance / GDPR 合規
);

$response = wp_remote_post(rest_url('nexlearn-theme/v1/export'), array(
    'headers' => array(
        'X-WP-Nonce' => wp_create_nonce('wp_rest'),
        'Content-Type' => 'application/json'
    ),
    'body' => json_encode($export_params),
    'timeout' => 120  // Export may take longer / 導出可能需要更長時間
));
\`\`\`

### 📊 Response Formats / 響應格式

#### Standard Response Structure / 標準響應結構

\`\`\`json
{
  "success": true,
  "data": {
    "user": {
      "id": 123,
      "name": "John Doe / 張三",
      "email": "john@example.com",
      "avatar": "https://example.com/avatar.jpg",
      "role": "student / 學生",
      "preferences": {
        "language": "zh",
        "theme_mode": "auto",
        "notifications": true
      }
    },
    "courses": [
      {
        "id": 456,
        "title": "Introduction to AI / AI 入門",
        "progress": {
          "percentage": 75,
          "completed_lessons": 15,
          "total_lessons": 20,
          "status": "in_progress / 進行中"
        },
        "next_lesson": {
          "id": 789,
          "title": "Neural Networks / 神經網絡",
          "estimated_duration": "45 minutes / 45 分鐘"
        }
      }
    ],
    "analytics": {
      "study_time": {
        "total": 3600,
        "this_week": 480,
        "average_daily": 68
      },
      "learning_streak": 7,
      "completion_rate": 0.85,
      "quiz_average": 87.5
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "language": "zh",
    "cache_duration": 300,
    "api_version": "1.0"
  }
}
\`\`\`

#### Error Response Structure / 錯誤響應結構

\`\`\`json
{
  "success": false,
  "error": {
    "code": "insufficient_permissions",
    "message": "You do not have permission to access this resource / 您沒有訪問此資源的權限",
    "details": {
      "required_capability": "read",
      "user_capabilities": ["subscriber"],
      "suggested_action": "Please contact your administrator / 請聯繫您的管理員"
    }
  },
  "meta": {
    "timestamp": "2024-01-15T10:30:00Z",
    "request_id": "req_123456789",
    "api_version": "1.0"
  }
}
\`\`\`

---

## Database Schema / 數據庫架構

### 📊 Table Structures / 表結構

#### Flashcards Table / 閃卡表

\`\`\`sql
CREATE TABLE `wp_nexlearn_flashcards` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用戶ID / User ID',
  `course_id` bigint(20) DEFAULT NULL COMMENT '課程ID / Course ID',
  `front_content` text NOT NULL COMMENT '正面內容 / Front content',
  `back_content` text NOT NULL COMMENT '背面內容 / Back content',
  `front_content_zh` text DEFAULT NULL COMMENT '正面內容（中文） / Front content (Chinese)',
  `back_content_zh` text DEFAULT NULL COMMENT '背面內容（中文） / Back content (Chinese)',
  `difficulty_level` tinyint(1) DEFAULT 1 COMMENT '難度等級 (1-5) / Difficulty level (1-5)',
  `review_count` int(11) DEFAULT 0 COMMENT '複習次數 / Review count',
  `success_rate` decimal(5,2) DEFAULT 0.00 COMMENT '成功率 / Success rate',
  `next_review` datetime DEFAULT NULL COMMENT '下次複習時間 / Next review time',
  `language` varchar(10) DEFAULT 'en' COMMENT '語言 / Language',
  `tags` text DEFAULT NULL COMMENT '標籤 (JSON) / Tags (JSON)',
  `auto_generated` tinyint(1) DEFAULT 0 COMMENT '自動生成 / Auto generated',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `course_id` (`course_id`),
  KEY `next_review` (`next_review`),
  KEY `language` (`language`),
  KEY `difficulty_level` (`difficulty_level`),
  FULLTEXT KEY `content_search` (`front_content`, `back_content`, `front_content_zh`, `back_content_zh`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='閃卡表 / Flashcards table';
\`\`\`

#### Analytics Table / 分析表

\`\`\`sql
CREATE TABLE `wp_nexlearn_analytics` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用戶ID / User ID',
  `event_type` varchar(50) NOT NULL COMMENT '事件類型 / Event type',
  `event_data` longtext COMMENT '事件數據 (JSON) / Event data (JSON)',
  `course_id` bigint(20) DEFAULT NULL COMMENT '課程ID / Course ID',
  `lesson_id` bigint(20) DEFAULT NULL COMMENT '課程ID / Lesson ID',
  `quiz_id` bigint(20) DEFAULT NULL COMMENT '測驗ID / Quiz ID',
  `session_id` varchar(100) DEFAULT NULL COMMENT '會話ID / Session ID',
  `user_agent` text DEFAULT NULL COMMENT '用戶代理 / User agent',
  `ip_address` varchar(45) DEFAULT NULL COMMENT 'IP地址 / IP address',
  `language` varchar(10) DEFAULT 'en' COMMENT '語言 / Language',
  `device_type` varchar(20) DEFAULT NULL COMMENT '設備類型 / Device type',
  `timestamp` datetime DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `user_id` (`user_id`),
  KEY `event_type` (`event_type`),
  KEY `course_id` (`course_id`),
  KEY `lesson_id` (`lesson_id`),
  KEY `timestamp` (`timestamp`),
  KEY `session_id` (`session_id`),
  KEY `language` (`language`),
  KEY `composite_user_event` (`user_id`, `event_type`, `timestamp`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='分析表 / Analytics table';
\`\`\`

#### User Preferences Table / 用戶偏好表

\`\`\`sql
CREATE TABLE `wp_nexlearn_user_preferences` (
  `id` mediumint(9) NOT NULL AUTO_INCREMENT,
  `user_id` bigint(20) NOT NULL COMMENT '用戶ID / User ID',
  `preference_key` varchar(100) NOT NULL COMMENT '偏好鍵 / Preference key',
  `preference_value` longtext COMMENT '偏好值 (JSON) / Preference value (JSON)',
  `language` varchar(10) DEFAULT 'en' COMMENT '語言 / Language',
  `is_global` tinyint(1) DEFAULT 0 COMMENT '全局設置 / Global setting',
  `created_at` datetime DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `user_pref_lang` (`user_id`, `preference_key`, `language`),
  KEY `user_id` (`user_id`),
  KEY `preference_key` (`preference_key`),
  KEY `language` (`language`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci COMMENT='用戶偏好表 / User preferences table';
\`\`\`

### 🔄 Database Migrations / 數據庫遷移

\`\`\`php
// Database migration system / 數據庫遷移系統
class NexLearn_DB_Migrator {
    
    private $migrations = array(
        '1.0.0' => 'create_initial_tables',
        '1.1.0' => 'add_multilingual_support',
        '1.2.0' => 'add_analytics_indexes',
        '1.3.0' => 'add_user_preferences_table'
    );
    
    public function run_migrations() {
        $current_version = get_option('nexlearn_db_version', '0.0.0');
        
        foreach ($this->migrations as $version => $method) {
            if (version_compare($current_version, $version, '<')) {
                $this->$method();
                update_option('nexlearn_db_version', $version);
                
                error_log("NexLearn: Migrated to version {$version} / NexLearn：已遷移到版本 {$version}");
            }
        }
    }
    
    private function create_initial_tables() {
        global $wpdb;
        
        require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
        
        // Create flashcards table / 創建閃卡表
        $flashcards_sql = "/* SQL from above */";
        dbDelta($flashcards_sql);
        
        // Create analytics table / 創建分析表
        $analytics_sql = "/* SQL from above */";
        dbDelta($analytics_sql);
    }
    
    private function add_multilingual_support() {
        global $wpdb;
        
        // Add multilingual columns / 添加多語言列
        $wpdb->query("ALTER TABLE {$wpdb->prefix}nexlearn_flashcards 
                     ADD COLUMN front_content_zh TEXT DEFAULT NULL COMMENT '正面內容（中文）',
                     ADD COLUMN back_content_zh TEXT DEFAULT NULL COMMENT '背面內容（中文）'");
        
        // Add language index / 添加語言索引
        $wpdb->query("ALTER TABLE {$wpdb->prefix}nexlearn_flashcards 
                     ADD INDEX language (language)");
    }
}

// Run migrations on plugin activation / 插件激活時運行遷移
register_activation_hook(__FILE__, function() {
    $migrator = new NexLearn_DB_Migrator();
    $migrator->run_migrations();
});
\`\`\`

---

## Customization Guide / 自定義指南

### 🎨 Styling Customization / 樣式自定義

#### CSS Custom Properties / CSS 自定義屬性

\`\`\`css
/* Custom CSS variables for easy theming / 用於簡化主題化的自定義 CSS 變量 */
:root {
  /* Colors / 顏色 */
  --nexlearn-primary: #3b82f6;
  --nexlearn-secondary: #64748b;
  --nexlearn-accent: #10b981;
  --nexlearn-success: #22c55e;
  --nexlearn-warning: #f59e0b;
  --nexlearn-error: #ef4444;
  --nexlearn-background: #ffffff;
  --nexlearn-surface: #f8fafc;
  --nexlearn-text-primary: #1f2937;
  --nexlearn-text-secondary: #6b7280;
  --nexlearn-border: #e5e7eb;
  
  /* Typography / 排版 */
  --nexlearn-font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  --nexlearn-font-size-xs: 0.75rem;
  --nexlearn-font-size-sm: 0.875rem;
  --nexlearn-font-size-base: 1rem;
  --nexlearn-font-size-lg: 1.125rem;
  --nexlearn-font-size-xl: 1.25rem;
  --nexlearn-font-size-2xl: 1.5rem;
  --nexlearn-font-size-3xl: 1.875rem;
  --nexlearn-line-height-tight: 1.25;
  --nexlearn-line-height-normal: 1.5;
  --nexlearn-line-height-relaxed: 1.75;
  
  /* Spacing / 間距 */
  --nexlearn-spacing-xs: 0.25rem;
  --nexlearn-spacing-sm: 0.5rem;
  --nexlearn-spacing-md: 1rem;
  --nexlearn-spacing-lg: 1.5rem;
  --nexlearn-spacing-xl: 2rem;
  --nexlearn-spacing-2xl: 3rem;
  
  /* Border radius / 邊框圓角 */
  --nexlearn-radius-sm: 0.25rem;
  --nexlearn-radius-md: 0.5rem;
  --nexlearn-radius-lg: 0.75rem;
  --nexlearn-radius-xl: 1rem;
  
  /* Shadows / 陰影 */
  --nexlearn-shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --nexlearn-shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --nexlearn-shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --nexlearn-shadow-xl: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
  
  /* Transitions / 過渡 */
  --nexlearn-transition-fast: 150ms ease-in-out;
  --nexlearn-transition-normal: 300ms ease-in-out;
  --nexlearn-transition-slow: 500ms ease-in-out;
}

/* Dark mode variables / 深色模式變量 */
[data-theme="dark"], .nexlearn-dark-mode {
  --nexlearn-background: #111827;
  --nexlearn-surface: #1f2937;
  --nexlearn-text-primary: #f9fafb;
  --nexlearn-text-secondary: #d1d5db;
  --nexlearn-border: #374151;
}

/* Chinese font optimization / 中文字體優化 */
[lang="zh"], [lang="zh-CN"], [lang="zh-TW"] {
  --nexlearn-font-family: 'Noto Sans SC', 'Source Han Sans', 'PingFang SC', 'Microsoft YaHei', sans-serif;
}

/* Component styles / 組件樣式 */
.nexlearn-dashboard-container {
  font-family: var(--nexlearn-font-family);
  font-size: var(--nexlearn-font-size-base);
  line-height: var(--nexlearn-line-height-normal);
  color: var(--nexlearn-text-primary);
  background-color: var(--nexlearn-background);
}

.nexlearn-card {
  background: var(--nexlearn-surface);
  border: 1px solid var(--nexlearn-border);
  border-radius: var(--nexlearn-radius-lg);
  box-shadow: var(--nexlearn-shadow-sm);
  padding: var(--nexlearn-spacing-lg);
  transition: box-shadow var(--nexlearn-transition-fast);
}

.nexlearn-card:hover {
  box-shadow: var(--nexlearn-shadow-md);
}

.nexlearn-button {
  background: var(--nexlearn-primary);
  color: white;
  border: none;
  border-radius: var(--nexlearn-radius-md);
  padding: var(--nexlearn-spacing-sm) var(--nexlearn-spacing-lg);
  font-size: var(--nexlearn-font-size-sm);
  font-weight: 500;
  cursor: pointer;
  transition: all var(--nexlearn-transition-fast);
}

.nexlearn-button:hover {
  background: color-mix(in srgb, var(--nexlearn-primary) 90%, black);
  transform: translateY(-1px);
}

/* Responsive design / 響應式設計 */
@media (max-width: 768px) {
  .nexlearn-dashboard-container {
    font-size: var(--nexlearn-font-size-sm);
  }
  
  .nexlearn-card {
    padding: var(--nexlearn-spacing-md);
  }
}

/* RTL support / RTL 支持 */
[dir="rtl"] .nexlearn-dashboard-container {
  text-align: right;
}

[dir="rtl"] .nexlearn-card {
  margin-left: 0;
  margin-right: var(--nexlearn-spacing-md);
}
\`\`\`

#### Custom Theme Example / 自定義主題示例

\`\`\`php
// Custom theme integration / 自定義主題集成
function my_theme_nexlearn_customization() {
    // Add custom CSS / 添加自定義 CSS
    wp_add_inline_style('nexlearn-dashboard-theme-style', '
        .nexlearn-dashboard-container {
            --nexlearn-primary: ' . get_theme_mod('primary_color', '#3b82f6') . ';
            --nexlearn-secondary: ' . get_theme_mod('secondary_color', '#64748b') . ';
            --nexlearn-font-family: "' . get_theme_mod('body_font', 'Inter') . '", sans-serif;
        }
        
        /* Custom branding / 自定義品牌 */
        .nexlearn-dashboard-header::before {
            content: "' . get_bloginfo('name') . ' Learning Portal / ' . get_bloginfo('name') . ' 學習門戶";
            display: block;
            font-size: 0.875rem;
            color: var(--nexlearn-text-secondary);
            margin-bottom: 0.5rem;
        }
        
        /* Custom progress colors / 自定義進度顏色 */
        .nexlearn-progress-bar {
            background: linear-gradient(90deg, 
                var(--nexlearn-primary) 0%, 
                var(--nexlearn-accent) 100%);
        }
    ');
}
add_action('wp_enqueue_scripts', 'my_theme_nexlearn_customization');
\`\`\`

### 🔧 Functional Customization / 功能自定義

#### Custom Dashboard Widgets / 自定義儀表板小工具

\`\`\`php
// Register custom dashboard widget / 註冊自定義儀表板小工具
function register_custom_nexlearn_widgets() {
    register_sidebar(array(
        'name' => __('NexLearn Dashboard Sidebar', 'textdomain') . ' / ' . __('NexLearn 儀表板側邊欄', 'textdomain'),
        'id' => 'nexlearn-dashboard-sidebar',
        'description' => __('Widgets for the learning dashboard sidebar', 'textdomain') . ' / ' . __('學習儀表板側邊欄的小工具', 'textdomain'),
        'before_widget' => '<div class="nexlearn-widget %2$s">',
        'after_widget' => '</div>',
        'before_title' => '<h3 class="nexlearn-widget-title">',
        'after_title' => '</h3>'
    ));
}
add_action('widgets_init', 'register_custom_nexlearn_widgets');

// Custom learning goals widget / 自定義學習目標小工具
class NexLearn_Goals_Widget extends WP_Widget {
    
    public function __construct() {
        parent::__construct(
            'nexlearn_goals',
            __('Learning Goals', 'textdomain') . ' / ' . __('學習目標', 'textdomain'),
            array(
                'description' => __('Display user learning goals and progress', 'textdomain') . ' / ' . __('顯示用戶學習目標和進度', 'textdomain')
            )
        );
    }
    
    public function widget($args, $instance) {
        echo $args['before_widget'];
        
        if (!empty($instance['title'])) {
            echo $args['before_title'] . apply_filters('widget_title', $instance['title']) . $args['after_title'];
        }
        
        $user_id = get_current_user_id();
        $goals = get_user_meta($user_id, 'nexlearn_learning_goals', true) ?: array();
        
        if (!empty($goals)) {
            echo '<div class="nexlearn-goals-list">';
            foreach ($goals as $goal) {
                $progress = $this->calculate_goal_progress($user_id, $goal);
                ?>
                <div class="nexlearn-goal-item">
                    <div class="goal-title"><?php echo esc_html($goal['title']); ?></div>
                    <div class="goal-progress">
                        <div class="progress-bar">
                            <div class="progress-fill" style="width: <?php echo $progress; ?>%"></div>
                        </div>
                        <span class="progress-text"><?php echo $progress; ?>%</span>
                    </div>
                    <div class="goal-deadline">
                        <?php 
                        echo __('Target:', 'textdomain') . ' / ' . __('目標：', 'textdomain') . ' ';
                        echo date('M j, Y', strtotime($goal['deadline']));
                        ?>
                    </div>
                </div>
                <?php
            }
            echo '</div>';
        } else {
            echo '<p>' . __('No learning goals set yet.', 'textdomain') . ' / ' . __('尚未設置學習目標。', 'textdomain') . '</p>';
            echo '<a href="#" class="nexlearn-button nexlearn-button-sm" onclick="nexlearnOpenGoalsModal()">';
            echo __('Set Goals', 'textdomain') . ' / ' . __('設置目標', 'textdomain');
            echo '</a>';
        }
        
        echo $args['after_widget'];
    }
    
    public function form($instance) {
        $title = !empty($instance['title']) ? $instance['title'] : __('My Learning Goals', 'textdomain') . ' / ' . __('我的學習目標', 'textdomain');
        ?>
        <p>
            <label for="<?php echo $this->get_field_id('title'); ?>">
                <?php echo __('Title:', 'textdomain') . ' / ' . __('標題：', 'textdomain'); ?>
            </label>
            <input class="widefat" id="<?php echo $this->get_field_id('title'); ?>" 
                   name="<?php echo $this->get_field_name('title'); ?>" type="text" 
                   value="<?php echo esc_attr($title); ?>">
        </p>
        <?php
    }
    
    public function update($new_instance, $old_instance) {
        $instance = array();
        $instance['title'] = (!empty($new_instance['title'])) ? sanitize_text_field($new_instance['title']) : '';
        return $instance;
    }
    
    private function calculate_goal_progress($user_id, $goal) {
        // Calculate progress based on goal type / 根據目標類型計算進度
        switch ($goal['type']) {
            case 'course_completion':
                return $this->get_course_completion_progress($user_id, $goal['course_id']);
            case 'study_time':
                return $this->get_study_time_progress($user_id, $goal['target_hours']);
            case 'quiz_score':
                return $this->get_quiz_score_progress($user_id, $goal['target_score']);
            default:
                return 0;
        }
    }
}

// Register the widget / 註冊小工具
function register_nexlearn_goals_widget() {
    register_widget('NexLearn_Goals_Widget');
}
add_action('widgets_init', 'register_nexlearn_goals_widget');
\`\`\`

#### Custom Hooks and Filters / 自定義鉤子和過濾器

\`\`\`php
// Custom action hooks / 自定義動作鉤子
do_action('nexlearn_before_dashboard_render', $user_id, $dashboard_data);
do_action('nexlearn_after_course_completion', $user_id, $course_id, $completion_data);
do_action('nexlearn_flashcard_reviewed', $user_id, $flashcard_id, $review_result);
do_action('nexlearn_ai_insight_generated', $user_id, $insight_type, $insight_data);

// Custom filter hooks / 自定義過濾器鉤子
$dashboard_data = apply_filters('nexlearn_dashboard_data', $dashboard_data, $user_id);
$course_progress = apply_filters('nexlearn_course_progress', $progress, $user_id, $course_id);
$ai_recommendations = apply_filters('nexlearn_ai_recommendations', $recommendations, $user_id);
$flashcard_difficulty = apply_filters('nexlearn_flashcard_difficulty', $difficulty, $flashcard_id, $user_id);

// Example custom hook usage / 自定義鉤子使用示例
function my_custom_dashboard_enhancement($dashboard_data, $user_id) {
    // Add custom data to dashboard / 向儀表板添加自定義數據
    $dashboard_data['custom_metrics'] = array(
        'learning_efficiency' => calculate_learning_efficiency($user_id),
        'knowledge_retention' => calculate_knowledge_retention($user_id),
        'social_learning_score' => calculate_social_learning_score($user_id)
    );
    
    // Add custom translations / 添加自定義翻譯
    $dashboard_data['custom_translations'] = array(
        'en' => array(
            'learning_efficiency' => 'Learning Efficiency',
            'knowledge_retention' => 'Knowledge Retention',
            'social_learning_score' => 'Social Learning Score'
        ),
        'zh' => array(
            'learning_efficiency' => '學習效率',
            'knowledge_retention' => '知識保持',
            'social_learning_score' => '社交學習分數'
        )
    );
    
    return $dashboard_data;
}
add_filter('nexlearn_dashboard_data', 'my_custom_dashboard_enhancement', 10, 2);

// Custom course completion handler / 自定義課程完成處理器
function my_custom_course_completion_handler($user_id, $course_id, $completion_data) {
    // Send custom notification / 發送自定義通知
    $user = get_userdata($user_id);
    $course = get_post($course_id);
    
    $message = sprintf(
        __('Congratulations %s! You have completed the course "%s"', 'textdomain') . ' / ' . 
        __('恭喜 %s！您已完成課程「%s」', 'textdomain'),
        $user->display_name,
        $course->post_title
    );
    
    // Send email notification / 發送郵件通知
    wp_mail($user->user_email, 
        __('Course Completion', 'textdomain') . ' / ' . __('課程完成', 'textdomain'), 
        $message
    );
    
    // Award custom points / 獎勵自定義積分
    $current_points = get_user_meta($user_id, 'learning_points', true) ?: 0;
    $bonus_points = apply_filters('nexlearn_course_completion_points', 100, $course_id);
    update_user_meta($user_id, 'learning_points', $current_points + $bonus_points);
    
    // Log custom analytics / 記錄自定義分析
    do_action('nexlearn_log_custom_event', $user_id, 'course_completion_bonus', array(
        'course_id' => $course_id,
        'points_awarded' => $bonus_points,
        'total_points' => $current_points + $bonus_points
    ));
}
add_action('nexlearn_after_course_completion', 'my_custom_course_completion_handler', 10, 3);
\`\`\`

---

## Troubleshooting / 故障排除

### 🐛 Common Issues / 常見問題

#### Plugin Installation Issues / 插件安裝問題

\`\`\`bash
# Issue: Plugin activation fails / 問題：插件激活失敗
# Solution: Check PHP version and memory limits / 解決方案：檢查 PHP 版本和內存限制

# Check PHP version / 檢查 PHP 版本
php -v
# Required: PHP >= 7.4 / 要求：PHP >= 7.4

# Check memory limit / 檢查內存限制
php -i | grep memory_limit
# Recommended: 256M or higher / 建議：256M 或更高

# Increase memory limit in wp-config.php / 在 wp-config.php 中增加內存限制
ini_set('memory_limit', '512M');
define('WP_MEMORY_LIMIT', '512M');
\`\`\`

#### Database Connection Issues / 數據庫連接問題

\`\`\`php
// Debug database issues / 調試數據庫問題
function nexlearn_debug_database() {
    global $wpdb;
    
    // Check if tables exist / 檢查表是否存在
    $tables = array(
        $wpdb->prefix . 'nexlearn_flashcards',
        $wpdb->prefix . 'nexlearn_analytics',
        $wpdb->prefix . 'nexlearn_user_preferences'
    );
    
    foreach ($tables as $table) {
        $exists = $wpdb->get_var("SHOW TABLES LIKE '{$table}'");
        if (!$exists) {
            error_log("NexLearn: Missing table {$table} / NexLearn：缺少表 {$table}");
            
            // Recreate table / 重新創建表
            $migrator = new NexLearn_DB_Migrator();
            $migrator->run_migrations();
        }
    }
    
    // Check database permissions / 檢查數據庫權限
    $test_query = $wpdb->query("SELECT 1");
    if ($test_query === false) {
        error_log("NexLearn: Database connection failed / NexLearn：數據庫連接失敗");
        error_log("MySQL Error: " . $wpdb->last_error);
    }
}

// Run database check on admin init / 在管理員初始化時運行數據庫檢查
add_action('admin_init', 'nexlearn_debug_database');
\`\`\`

#### LearnDash Integration Issues / LearnDash 集成問題

\`\`\`php
// Check LearnDash compatibility / 檢查 LearnDash 兼容性
function nexlearn_check_learndash_compatibility() {
    if (!class_exists('SFWD_LMS')) {
        add_action('admin_notices', function() {
            echo '<div class="notice notice-error"><p>';
            echo __('NexLearn Dashboard requires LearnDash LMS plugin.', 'textdomain');
            echo ' / ';
            echo __('NexLearn 儀表板需要 LearnDash LMS 插件。', 'textdomain');
            echo '</p></div>';
        });
        return false;
    }
    
    // Check LearnDash version / 檢查 LearnDash 版本
    if (defined('LEARNDASH_VERSION')) {
        if (version_compare(LEARNDASH_VERSION, '4.0', '<')) {
            add_action('admin_notices', function() {
                echo '<div class="notice notice-warning"><p>';
                echo __('NexLearn Dashboard requires LearnDash 4.0 or higher.', 'textdomain');
                echo ' / ';
                echo __('NexLearn 儀表板需要 LearnDash 4.0 或更高版本。', 'textdomain');
                echo '</p></div>';
            });
        }
    }
    
    return true;
}
add_action('plugins_loaded', 'nexlearn_check_learndash_compatibility');
\`\`\`

#### React Component Loading Issues / React 組件加載問題

\`\`\`javascript
// Debug React loading issues / 調試 React 加載問題
window.nexlearnDebug = {
    checkDependencies: function() {
        const required = ['wp', 'wp.element', 'wp.apiFetch', 'wp.i18n'];
        const missing = [];
        
        required.forEach(dep => {
            if (typeof window[dep] === 'undefined') {
                missing.push(dep);
            }
        });
        
        if (missing.length > 0) {
            console.error('NexLearn: Missing dependencies / NexLearn：缺少依賴項:', missing);
            return false;
        }
        
        console.log('NexLearn: All dependencies loaded / NexLearn：所有依賴項已加載');
        return true;
    },
    
    checkConfig: function() {
        if (typeof window.nexlearnConfig === 'undefined') {
            console.error('NexLearn: Configuration not loaded / NexLearn：配置未加載');
            return false;
        }
        
        const required = ['apiUrl', 'nonce', 'userId'];
        const missing = required.filter(key => !window.nexlearnConfig[key]);
        
        if (missing.length > 0) {
            console.error('NexLearn: Missing config keys / NexLearn：缺少配置鍵:', missing);
            return false;
        }
        
        console.log('NexLearn: Configuration loaded successfully / NexLearn：配置加載成功');
        return true;
    },
    
    testAPI: async function() {
        try {
            const response = await fetch(window.nexlearnConfig.apiUrl + 'dashboard', {
                headers: {
                    'X-WP-Nonce': window.nexlearnConfig.nonce
                }
            });
            
            if (response.ok) {
                console.log('NexLearn: API connection successful / NexLearn：API 連接成功');
                return true;
            } else {
                console.error('NexLearn: API connection failed / NexLearn：API 連接失敗', response.status);
                return false;
            }
        } catch (error) {
            console.error('NexLearn: API test error / NexLearn：API 測試錯誤', error);
            return false;
        }
    }
};

// Auto-run diagnostics in debug mode / 在調試模式下自動運行診斷
if (window.nexlearnConfig && window.nexlearnConfig.debug) {
    document.addEventListener('DOMContentLoaded', function() {
        setTimeout(() => {
            console.log('Running NexLearn diagnostics / 運行 NexLearn 診斷...');
            window.nexlearnDebug.checkDependencies();
            window.nexlearnDebug.checkConfig();
            window.nexlearnDebug.testAPI();
        }, 1000);
    });
}
\`\`\`

#### Performance Issues / 性能問題

\`\`\`php
// Performance optimization / 性能優化
class NexLearn_Performance_Monitor {
    
    private $start_time;
    private $queries_before;
    
    public function __construct() {
        add_action('nexlearn_before_dashboard_render', array($this, 'start_monitoring'));
        add_action('nexlearn_after_dashboard_render', array($this, 'end_monitoring'));
    }
    
    public function start_monitoring() {
        $this->start_time = microtime(true);
        $this->queries_before = get_num_queries();
    }
    
    public function end_monitoring() {
        $execution_time = microtime(true) - $this->start_time;
        $queries_count = get_num_queries() - $this->queries_before;
        
        // Log performance metrics / 記錄性能指標
        if ($execution_time > 2.0) { // Slow page load / 頁面加載緩慢
            error_log("NexLearn: Slow dashboard load: {$execution_time}s, {$queries_count} queries / NexLearn：儀表板加載緩慢：{$execution_time}秒，{$queries_count} 個查詢");
        }
        
        // Store metrics for analysis / 存儲指標用於分析
        $this->store_performance_metrics($execution_time, $queries_count);
    }
    
    private function store_performance_metrics($execution_time, $queries_count) {
        global $wpdb;
        
        $wpdb->insert(
            $wpdb->prefix . 'nexlearn_analytics',
            array(
                'user_id' => get_current_user_id(),
                'event_type' => 'performance_metric',
                'event_data' => json_encode(array(
                    'execution_time' => $execution_time,
                    'queries_count' => $queries_count,
                    'memory_usage' => memory_get_peak_usage(true),
                    'timestamp' => current_time('mysql')
                )),
                'timestamp' => current_time('mysql')
            ),
            array('%d', '%s', '%s', '%s')
        );
    }
}

// Initialize performance monitoring / 初始化性能監控
if (defined('NEXLEARN_DEBUG') && NEXLEARN_DEBUG) {
    new NexLearn_Performance_Monitor();
}
\`\`\`

### 🔧 Debug Tools / 調試工具

#### Debug Mode Configuration / 調試模式配置

\`\`\`php
// wp-config.php debug settings / wp-config.php 調試設置
define('NEXLEARN_DEBUG', true);                    // Enable NexLearn debug mode / 啟用 NexLearn 調試模式
define('NEXLEARN_DEBUG_LOG', true);               // Enable debug logging / 啟用調試日誌
define('NEXLEARN_DEBUG_QUERIES', true);           // Log database queries / 記錄數據庫查詢
define('NEXLEARN_DEBUG_API', true);               // Debug API requests / 調試 API 請求
define('NEXLEARN_DEBUG_CACHE', false);            // Disable caching in debug mode / 在調試模式下禁用緩存

// WordPress debug settings / WordPress 調試設置
define('WP_DEBUG', true);
define('WP_DEBUG_LOG', true);
define('WP_DEBUG_DISPLAY', false);
define('SCRIPT_DEBUG', true);
\`\`\`

#### Debug Information Panel / 調試信息面板

\`\`\`php
// Add debug information to dashboard / 向儀表板添加調試信息
function nexlearn_add_debug_info() {
    if (!defined('NEXLEARN_DEBUG') || !NEXLEARN_DEBUG) {
        return;
    }
    
    if (!current_user_can('manage_options')) {
        return;
    }
    
    ?>
    <div id="nexlearn-debug-panel" style="position: fixed; bottom: 0; right: 0; background: #000; color: #fff; padding: 10px; font-size: 12px; z-index: 9999; max-width: 400px;">
        <h4>NexLearn Debug Info / NexLearn 調試信息</h4>
        <div>
            <strong>Plugin Version / 插件版本:</strong> <?php echo NEXLEARN_VERSION; ?><br>
            <strong>WordPress Version:</strong> <?php echo get_bloginfo('version'); ?><br>
            <strong>PHP Version:</strong> <?php echo PHP_VERSION; ?><br>
            <strong>LearnDash Version:</strong> <?php echo defined('LEARNDASH_VERSION') ? LEARNDASH_VERSION : 'Not installed / 未安裝'; ?><br>
            <strong>Memory Usage / 內存使用:</strong> <?php echo size_format(memory_get_peak_usage(true)); ?><br>
            <strong>Database Queries / 數據庫查詢:</strong> <?php echo get_num_queries(); ?><br>
            <strong>Page Load Time / 頁面加載時間:</strong> <span id="nexlearn-load-time">Calculating... / 計算中...</span><br>
        </div>
        <button onclick="nexlearnToggleDebugDetails()" style="margin-top: 5px;">
            Toggle Details / 切換詳情
        </button>
        <div id="nexlearn-debug-details" style="display: none; margin-top: 10px; max-height: 200px; overflow-y: auto;">
            <strong>Active Plugins / 活動插件:</strong><br>
            <?php
            $active_plugins = get_option('active_plugins');
            foreach ($active_plugins as $plugin) {
                echo '- ' . $plugin . '<br>';
            }
            ?>
        </div>
    </div>
    
    <script>
    function nexlearnToggleDebugDetails() {
        const details = document.getElementById('nexlearn-debug-details');
        details.style.display = details.style.display === 'none' ? 'block' : 'none';
    }
    
    // Calculate page load time / 計算頁面加載時間
    window.addEventListener('load', function() {
        const loadTime = (performance.now() / 1000).toFixed(2);
        document.getElementById('nexlearn-load-time').textContent = loadTime + 's';
    });
    </script>
    <?php
}
add_action('wp_footer', 'nexlearn_add_debug_info');
\`\`\`

---

## Performance Optimization / 性能優化

### ⚡ Caching Strategies / 緩存策略

#### Object Caching / 對象緩存

\`\`\`php
// Implement intelligent caching / 實現智能緩存
class NexLearn_Cache_Manager {
    
    private $cache_group = 'nexlearn';
    private $default_expiration = 3600; // 1 hour / 1小時
    
    /**
     * Get cached data with fallback / 獲取緩存數據並提供回退
     */
    public function get_or_set($key, $callback, $expiration = null) {
        $expiration = $expiration ?: $this->default_expiration;
        $cache_key = $this->get_cache_key($key);
        
        // Try to get from cache / 嘗試從緩存獲取
        $cached_data = wp_cache_get($cache_key, $this->cache_group);
        
        if ($cached_data !== false) {
            return $cached_data;
        }
        
        // Generate fresh data / 生成新數據
        $fresh_data = call_user_func($callback);
        
        // Store in cache / 存儲到緩存
        wp_cache_set($cache_key, $fresh_data, $this->cache_group, $expiration);
        
        return $fresh_data;
    }
    
    /**
     * Cache dashboard data / 緩存儀表板數據
     */
    public function cache_dashboard_data($user_id, $data) {
        $cache_key = "dashboard_data_{$user_id}";
        
        // Use shorter cache for frequently changing data / 對頻繁變化的數據使用較短的緩存
        $expiration = 300; // 5 minutes / 5分鐘
        
        wp_cache_set($cache_key, $data, $this->cache_group, $expiration);
    }
    
    /**
     * Cache course progress / 緩存課程進度
     */
    public function cache_course_progress($user_id, $course_id, $progress_data) {
        $cache_key = "course_progress_{$user_id}_{$course_id}";
        
        // Longer cache for stable data / 對穩定數據使用較長的緩存
        $expiration = 1800; // 30 minutes / 30分鐘
        
        wp_cache_set($cache_key, $progress_data, $this->cache_group, $expiration);
    }
    
    /**
     * Invalidate user cache / 使用戶緩存失效
     */
    public function invalidate_user_cache($user_id) {
        $patterns = array(
            "dashboard_data_{$user_id}",
            "user_courses_{$user_id}",
            "user_progress_{$user_id}",
            "user_analytics_{$user_id}"
        );
        
        foreach ($patterns as $pattern) {
            wp_cache_delete($pattern, $this->cache_group);
        }
    }
    
    /**
     * Generate cache key / 生成緩存鍵
     */
    private function get_cache_key($key) {
        return md5($key . get_current_user_id() . get_locale());
    }
}

// Initialize cache manager / 初始化緩存管理器
$nexlearn_cache = new NexLearn_Cache_Manager();

// Example usage / 使用示例
function get_user_dashboard_data($user_id) {
    global $nexlearn_cache;
    
    return $nexlearn_cache->get_or_set(
        "dashboard_data_{$user_id}",
        function() use ($user_id) {
            // Expensive database operations / 昂貴的數據庫操作
            return generate_dashboard_data($user_id);
        },
        300 // 5 minutes cache / 5分鐘緩存
    );
}
\`\`\`

#### Database Query Optimization / 數據庫查詢優化

\`\`\`sql
-- Add indexes for better performance / 添加索引以提高性能
-- Analytics table indexes / 分析表索引
ALTER TABLE wp_nexlearn_analytics 
ADD INDEX idx_user_event_time (user_id, event_type, timestamp),
ADD INDEX idx_course_analytics (course_id, timestamp),
ADD INDEX idx_session_analytics (session_id, timestamp);

-- Flashcards table indexes / 閃卡表索引
ALTER TABLE wp_nexlearn_flashcards 
ADD INDEX idx_user_review (user_id, next_review),
ADD INDEX idx_course_flashcards (course_id, user_id),
ADD INDEX idx_difficulty_language (difficulty_level, language);

-- User preferences indexes / 用戶偏好索引
ALTER TABLE wp_nexlearn_user_preferences 
ADD INDEX idx_user_pref_lookup (user_id, preference_key, language);
\`\`\`

\`\`\`php
// Optimized database queries / 優化的數據庫查詢
class NexLearn_Query_Optimizer {
    
    /**
     * Get user courses with optimized query / 使用優化查詢獲取用戶課程
     */
    public function get_user_courses_optimized($user_id, $limit = 10) {
        global $wpdb;
        
        // Single optimized query instead of multiple queries / 單個優化查詢而不是多個查詢
        $query = $wpdb->prepare("
            SELECT 
                c.ID as course_id,
                c.post_title as course_title,
                c.post_excerpt as course_description,
                ua.activity_completed as completion_date,
                ua.activity_status as status,
                COUNT(l.ID) as total_lessons,
                COUNT(CASE WHEN ul.activity_completed IS NOT NULL THEN 1 END) as completed_lessons,
                COUNT(q.ID) as total_quizzes,
                COUNT(CASE WHEN uq.activity_completed IS NOT NULL THEN 1 END) as completed_quizzes
            FROM {$wpdb->posts} c
            LEFT JOIN {$wpdb->prefix}learndash_user_activity ua ON (
                ua.post_id = c.ID 
                AND ua.user_id = %d 
                AND ua.activity_type = 'course'
            )
            LEFT JOIN {$wpdb->posts} l ON (
                l.post_parent = c.ID 
                AND l.post_type = 'sfwd-lessons'
                AND l.post_status = 'publish'
            )
            LEFT JOIN {$wpdb->prefix}learndash_user_activity ul ON (
                ul.post_id = l.ID 
                AND ul.user_id = %d 
                AND ul.activity_type = 'lesson'
            )
            LEFT JOIN {$wpdb->posts} q ON (
                q.post_parent = c.ID 
                AND q.post_type = 'sfwd-quiz'
                AND q.post_status = 'publish'
            )
            LEFT JOIN {$wpdb->prefix}learndash_user_activity uq ON (
                uq.post_id = q.ID 
                AND uq.user_id = %d 
                AND uq.activity_type = 'quiz'
            )
            WHERE c.post_type = 'sfwd-courses'
            AND c.post_status = 'publish'
            AND ua.user_id IS NOT NULL
            GROUP BY c.ID
            ORDER BY ua.activity_updated DESC
            LIMIT %d
        ", $user_id, $user_id, $user_id, $limit);
        
        return $wpdb->get_results($query);
    }
    
    /**
     * Batch update analytics / 批量更新分析
     */
    public function batch_insert_analytics($analytics_data) {
        global $wpdb;
        
        if (empty($analytics_data)) {
            return false;
        }
        
        $table = $wpdb->prefix . 'nexlearn_analytics';
        $values = array();
        $placeholders = array();
        
        foreach ($analytics_data as $data) {
            $placeholders[] = "(%d, %s, %s, %d, %d, %s, %s, %s, %s, %s)";
            $values = array_merge($values, array(
                $data['user_id'],
                $data['event_type'],
                $data['event_data'],
                $data['course_id'],
                $data['lesson_id'],
                $data['session_id'],
                $data['user_agent'],
                $data['ip_address'],
                $data['language'],
                $data['timestamp']
            ));
        }
        
        $query = "INSERT INTO {$table} 
                  (user_id, event_type, event_data, course_id, lesson_id, session_id, user_agent, ip_address, language, timestamp) 
                  VALUES " . implode(', ', $placeholders);
        
        return $wpdb->query($wpdb->prepare($query, $values));
    }
}
\`\`\`

### 🚀 Asset Optimization / 資源優化

#### JavaScript and CSS Minification / JavaScript 和 CSS 壓縮

\`\`\`php
// Conditional asset loading / 條件資源加載
function nexlearn_optimize_assets() {
    // Only load on dashboard pages / 只在儀表板頁面加載
    if (!nexlearn_is_dashboard_page()) {
        return;
    }
    
    // Load minified versions in production / 在生產環境中加載壓縮版本
    $suffix = (defined('SCRIPT_DEBUG') && SCRIPT_DEBUG) ? '' : '.min';
    
    // Dequeue unnecessary scripts / 取消不必要的腳本
    wp_dequeue_script('jquery-ui-core');
    wp_dequeue_script('jquery-ui-widget');
    
    // Load optimized dashboard bundle / 加載優化的儀表板包
    wp_enqueue_script(
        'nexlearn-dashboard-optimized',
        NEXLEARN_PLUGIN_URL . "assets/js/dashboard{$suffix}.js",
        array('wp-element', 'wp-api-fetch'),
        NEXLEARN_VERSION,
        true
    );
    
    // Load critical CSS inline / 內聯加載關鍵 CSS
    $critical_css = nexlearn_get_critical_css();
    if ($critical_css) {
        wp_add_inline_style('nexlearn-dashboard-style', $critical_css);
    }
    
    // Preload important resources / 預加載重要資源
    echo '<link rel="preload" href="' . NEXLEARN_PLUGIN_URL . 'assets/fonts/inter-var.woff2" as="font" type="font/woff2" crossorigin>';
    echo '<link rel="preload" href="' . rest_url('nexlearn/v1/dashboard') . '" as="fetch" crossorigin>';
}
add_action('wp_enqueue_scripts', 'nexlearn_optimize_assets', 5);

// Get critical CSS / 獲取關鍵 CSS
function nexlearn_get_critical_css() {
    $critical_css = get_transient('nexlearn_critical_css');
    
    if ($critical_css === false) {
        $critical_css = '
        .nexlearn-dashboard-container{font-family:Inter,sans-serif;line-height:1.5}
        .nexlearn-loading{display:flex;align-items:center;justify-content:center;min-height:200px}
        .loading-spinner{width:40px;height:40px;border:4px solid #f3f4f6;border-top:4px solid #3b82f6;border-radius:50%;animation:spin 1s linear infinite}
        @keyframes spin{0%{transform:rotate(0deg)}100%{transform:rotate(360deg)}}
        ';
        
        set_transient('nexlearn_critical_css', $critical_css, DAY_IN_SECONDS);
    }
    
    return $critical_css;
}
\`\`\`

#### Image Optimization / 圖像優化

\`\`\`php
// Optimize dashboard images / 優化儀表板圖像
function nexlearn_optimize_images() {
    // Add WebP support / 添加 WebP 支持
    add_filter('wp_generate_attachment_metadata', 'nexlearn_generate_webp_images', 10, 2);
    
    // Lazy load images / 懶加載圖像
    add_filter('wp_get_attachment_image_attributes', 'nexlearn_add_lazy_loading', 10, 3);
    
    // Responsive images / 響應式圖像
    add_filter('wp_calculate_image_srcset', 'nexlearn_optimize_srcset', 10, 5);
}
add_action('init', 'nexlearn_optimize_images');

// Generate WebP versions / 生成 WebP 版本
function nexlearn_generate_webp_images($metadata, $attachment_id) {
    if (!function_exists('imagewebp')) {
        return $metadata;
    }
    
    $upload_dir = wp_upload_dir();
    $file_path = $upload_dir['basedir'] . '/' . $metadata['file'];
    
    if (file_exists($file_path)) {
        $webp_path = preg_replace('/\.(jpg|jpeg|png)$/i', '.webp', $file_path);
        
        $image = wp_get_image_editor($file_path);
        if (!is_wp_error($image)) {
            $image->save($webp_path, 'image/webp');
        }
    }
    
    return $metadata;
}
\`\`\`

---

## Security Considerations / 安全考慮

### 🔒 Data Protection / 數據保護

#### Input Sanitization / 輸入清理

\`\`\`php
// Comprehensive input sanitization / 全面的輸入清理
class NexLearn_Security {
    
    /**
     * Sanitize dashboard data / 清理儀表板數據
     */
    public static function sanitize_dashboard_input($input) {
        if (is_array($input)) {
            return array_map(array(self::class, 'sanitize_dashboard_input'), $input);
        }
        
        if (is_string($input)) {
            // Remove potentially dangerous content / 移除潛在危險內容
            $input = wp_kses($input, array(
                'p' => array(),
                'br' => array(),
                'strong' => array(),
                'em' => array(),
                'span' => array('class' => array())
            ));
            
            // Sanitize for database / 為數據庫清理
            $input = sanitize_text_field($input);
        }
        
        return $input;
    }
    
    /**
     * Validate flashcard data / 驗證閃卡數據
     */
    public static function validate_flashcard_data($data) {
        $errors = array();
        
        // Required fields / 必需字段
        if (empty($data['front_content'])) {
            $errors[] = __('Front content is required', 'nexlearn') . ' / ' . __('正面內容是必需的', 'nexlearn');
        }
        
        if (empty($data['back_content'])) {
            $errors[] = __('Back content is required', 'nexlearn') . ' / ' . __('背面內容是必需的', 'nexlearn');
        }
        
        // Content length limits / 內容長度限制
        if (strlen($data['front_content']) > 1000) {
            $errors[] = __('Front content too long (max 1000 characters)', 'nexlearn') . ' / ' . __('正面內容過長（最多1000字符）', 'nexlearn');
        }
        
        if (strlen($data['back_content']) > 2000) {
            $errors[] = __('Back content too long (max 2000 characters)', 'nexlearn') . ' / ' . __('背面內容過長（最多2000字符）', 'nexlearn');
        }
        
        // Difficulty level validation / 難度等級驗證
        if (isset($data['difficulty_level'])) {
            $difficulty = intval($data['difficulty_level']);
            if ($difficulty < 1 || $difficulty > 5) {
                $errors[] = __('Invalid difficulty level (1-5)', 'nexlearn') . ' / ' . __('無效的難度等級（1-5）', 'nexlearn');
            }
        }
        
        // Tags validation / 標籤驗證
        if (isset($data['tags']) && is_array($data['tags'])) {
            if (count($data['tags']) > 10) {
                $errors[] = __('Too many tags (max 10)', 'nexlearn') . ' / ' . __('標籤過多（最多10個）', 'nexlearn');
            }
            
            foreach ($data['tags'] as $tag) {
                if (strlen($tag) > 50) {
                    $errors[] = __('Tag too long (max 50 characters)', 'nexlearn') . ' / ' . __('標籤過長（最多50字符）', 'nexlearn');
                    break;
                }
            }
        }
        
        return $errors;
    }
    
    /**
     * Check rate limits / 檢查速率限制
     */
    public static function check_rate_limit($user_id, $action, $limit = 100, $period = 3600) {
        $transient_key = "nexlearn_rate_limit_{$user_id}_{$action}";
        $current_count = get_transient($transient_key) ?: 0;
        
        if ($current_count >= $limit) {
            return new WP_Error(
                'rate_limit_exceeded',
                __('Rate limit exceeded. Please try again later.', 'nexlearn') . ' / ' . 
                __('超出速率限制。請稍後再試。', 'nexlearn')
            );
        }
        
        set_transient($transient_key, $current_count + 1, $period);
        return true;
    }
    
    /**
     * Log security events / 記錄安全事件
     */
    public static function log_security_event($event_type, $details = array()) {
        $log_entry = array(
            'timestamp' => current_time('mysql'),
            'event_type' => $event_type,
            'user_id' => get_current_user_id(),
            'ip_address' => self::get_client_ip(),
            'user_agent' => $_SERVER['HTTP_USER_AGENT'] ?? '',
            'details' => $details
        );
        
        // Log to WordPress error log / 記錄到 WordPress 錯誤日誌
        error_log('NexLearn Security Event: ' . json_encode($log_entry));
        
        // Store in database for analysis / 存儲到數據庫用於分析
        global $wpdb;
        $wpdb->insert(
            $wpdb->prefix . 'nexlearn_analytics',
            array(
                'user_id' => $log_entry['user_id'],
                'event_type' => 'security_' . $event_type,
                'event_data' => json_encode($log_entry),
                'ip_address' => $log_entry['ip_address'],
                'timestamp' => $log_entry['timestamp']
            ),
            array('%d', '%s', '%s', '%s', '%s')
        );
    }
    
    /**
     * Get client IP address / 獲取客戶端 IP 地址
     */
    private static function get_client_ip() {
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
}
\`\`\`

#### GDPR Compliance / GDPR 合規

\`\`\`php
// GDPR compliance features / GDPR 合規功能
class NexLearn_GDPR_Compliance {
    
    public function __construct() {
        // Add privacy policy content / 添加隱私政策內容
        add_action('admin_init', array($this, 'add_privacy_policy_content'));
        
        // Handle data export requests / 處理數據導出請求
        add_filter('wp_privacy_personal_data_exporters', array($this, 'register_data_exporters'));
        
        // Handle data erasure requests / 處理數據刪除請求
        add_filter('wp_privacy_personal_data_erasers', array($this, 'register_data_erasers'));
        
        // Add consent management / 添加同意管理
        add_action('wp_enqueue_scripts', array($this, 'enqueue_consent_scripts'));
    }
    
    /**
     * Add privacy policy content / 添加隱私政策內容
     */
    public function add_privacy_policy_content() {
        if (!function_exists('wp_add_privacy_policy_content')) {
            return;
        }
        
        $content = '
        <h2>' . __('NexLearn Dashboard Data Collection', 'nexlearn') . ' / ' . __('NexLearn 儀表板數據收集', 'nexlearn') . '</h2>
        
        <p>' . __('The NexLearn Dashboard collects and processes the following personal data:', 'nexlearn') . ' / ' . __('NexLearn 儀表板收集和處理以下個人數據：', 'nexlearn') . '</p>
        
        <ul>
            <li>' . __('Learning progress and course completion data', 'nexlearn') . ' / ' . __('學習進度和課程完成數據', 'nexlearn') . '</li>
            <li>' . __('Quiz scores and assessment results', 'nexlearn') . ' / ' . __('測驗分數和評估結果', 'nexlearn') . '</li>
            <li>' . __('Study time and learning analytics', 'nexlearn') . ' / ' . __('學習時間和學習分析', 'nexlearn') . '</li>
            <li>' . __('Flashcard creation and review data', 'nexlearn') . ' / ' . __('閃卡創建和復習數據', 'nexlearn') . '</li>
            <li>' . __('User preferences and dashboard settings', 'nexlearn') . ' / ' . __('用戶偏好和儀表板設置', 'nexlearn') . '</li>
        </ul>
        
        <h3>' . __('Data Usage', 'nexlearn') . ' / ' . __('數據使用', 'nexlearn') . '</h3>
        <p>' . __('This data is used to provide personalized learning experiences, generate AI-powered insights, and improve the learning platform.', 'nexlearn') . ' / ' . __('此數據用於提供個性化學習體驗、生成 AI 驅動的洞察並改進學習平台。', 'nexlearn') . '</p>
        
        <h3>' . __('Data Retention', 'nexlearn') . ' / ' . __('數據保留', 'nexlearn') . '</h3>
        <p>' . __('Learning data is retained for the duration of your account and may be anonymized for research purposes after account deletion.', 'nexlearn') . ' / ' . __('學習數據在您的帳戶期間保留，帳戶刪除後可能會匿名化用於研究目的。', 'nexlearn') . '</p>
        ';
        
        wp_add_privacy_policy_content('NexLearn Dashboard', $content);
    }
    
    /**
     * Register data exporters / 註冊數據導出器
     */
    public function register_data_exporters($exporters) {
        $exporters['nexlearn-dashboard'] = array(
            'exporter_friendly_name' => __('NexLearn Dashboard Data', 'nexlearn') . ' / ' . __('NexLearn 儀表板數據', 'nexlearn'),
            'callback' => array($this, 'export_user_data')
        );
        
        return $exporters;
    }
    
    /**
     * Export user data / 導出用戶數據
     */
    public function export_user_data($email_address, $page = 1) {
        $user = get_user_by('email', $email_address);
        if (!$user) {
            return array(
                'data' => array(),
                'done' => true
            );
        }
        
        global $wpdb;
        $user_id = $user->ID;
        
        // Export flashcards / 導出閃卡
        $flashcards = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}nexlearn_flashcards WHERE user_id = %d",
            $user_id
        ));
        
        // Export analytics / 導出分析
        $analytics = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}nexlearn_analytics WHERE user_id = %d ORDER BY timestamp DESC LIMIT 1000",
            $user_id
        ));
        
        // Export preferences / 導出偏好
        $preferences = $wpdb->get_results($wpdb->prepare(
            "SELECT * FROM {$wpdb->prefix}nexlearn_user_preferences WHERE user_id = %d",
            $user_id
        ));
        
        $data_to_export = array();
        
        // Format flashcards data / 格式化閃卡數據
        if (!empty($flashcards)) {
            $flashcard_data = array();
            foreach ($flashcards as $flashcard) {
                $flashcard_data[] = array(
                    'name' => __('Flashcard', 'nexlearn') . ' / ' . __('閃卡', 'nexlearn'),
                    'value' => json_encode(array(
                        'front_content' => $flashcard->front_content,
                        'back_content' => $flashcard->back_content,
                        'difficulty_level' => $flashcard->difficulty_level,
                        'created_at' => $flashcard->created_at
                    ))
                );
            }
            
            $data_to_export[] = array(
                'group_id' => 'nexlearn-flashcards',
                'group_label' => __('NexLearn Flashcards', 'nexlearn') . ' / ' . __('NexLearn 閃卡', 'nexlearn'),
                'item_id' => 'flashcards-' . $user_id,
                'data' => $flashcard_data
            );
        }
        
        // Format analytics data / 格式化分析數據
        if (!empty($analytics)) {
            $analytics_data = array();
            foreach ($analytics as $event) {
                $analytics_data[] = array(
                    'name' => __('Learning Event', 'nexlearn') . ' / ' . __('學習事件', 'nexlearn'),
                    'value' => json_encode(array(
                        'event_type' => $event->event_type,
                        'timestamp' => $event->timestamp,
                        'event_data' => $event->event_data
                    ))
                );
            }
            
            $data_to_export[] = array(
                'group_id' => 'nexlearn-analytics',
                'group_label' => __('NexLearn Learning Analytics', 'nexlearn') . ' / ' . __('NexLearn 學習分析', 'nexlearn'),
                'item_id' => 'analytics-' . $user_id,
                'data' => $analytics_data
            );
        }
        
        return array(
            'data' => $data_to_export,
            'done' => true
        );
    }
    
    /**
     * Register data erasers / 註冊數據刪除器
     */
    public function register_data_erasers($erasers) {
        $erasers['nexlearn-dashboard'] = array(
            'eraser_friendly_name' => __('NexLearn Dashboard Data', 'nexlearn') . ' / ' . __('NexLearn 儀表板數據', 'nexlearn'),
            'callback' => array($this, 'erase_user_data')
        );
        
        return $erasers;
    }
    
    /**
     * Erase user data / 刪除用戶數據
     */
    public function erase_user_data($email_address, $page = 1) {
        $user = get_user_by('email', $email_address);
        if (!$user) {
            return array(
                'items_removed' => 0,
                'items_retained' => 0,
                'messages' => array(),
                'done' => true
            );
        }
        
        global $wpdb;
        $user_id = $user->ID;
        $items_removed = 0;
        $items_retained = 0;
        
        // Delete flashcards / 刪除閃卡
        $flashcards_deleted = $wpdb->delete(
            $wpdb->prefix . 'nexlearn_flashcards',
            array('user_id' => $user_id),
            array('%d')
        );
        $items_removed += $flashcards_deleted;
        
        // Anonymize analytics data / 匿名化分析數據
        $analytics_anonymized = $wpdb->update(
            $wpdb->prefix . 'nexlearn_analytics',
            array(
                'user_id' => 0,
                'ip_address' => '0.0.0.0',
                'user_agent' => 'anonymized'
            ),
            array('user_id' => $user_id),
            array('%d', '%s', '%s'),
            array('%d')
        );
        $items_retained += $analytics_anonymized;
        
        // Delete preferences / 刪除偏好
        $preferences_deleted = $wpdb->delete(
            $wpdb->prefix . 'nexlearn_user_preferences',
            array('user_id' => $user_id),
            array('%d')
        );
        $items_removed += $preferences_deleted;
        
        // Delete user meta / 刪除用戶元數據
        $meta_keys = array(
            'nexlearn_language',
            'nexlearn_dashboard_layout',
            'nexlearn_theme_mode',
            'nexlearn_notifications',
            'nexlearn_learning_goals'
        );
        
        foreach ($meta_keys as $meta_key) {
            if (delete_user_meta($user_id, $meta_key)) {
                $items_removed++;
            }
        }
        
        return array(
            'items_removed' => $items_removed,
            'items_retained' => $items_retained,
            'messages' => array(
                __('NexLearn flashcards and preferences deleted.', 'nexlearn') . ' / ' . __('NexLearn 閃卡和偏好已刪除。', 'nexlearn'),
                __('Learning analytics anonymized for research purposes.', 'nexlearn') . ' / ' . __('學習分析已匿名化用於研究目的。', 'nexlearn')
            ),
            'done' => true
        );
    }
}

// Initialize GDPR compliance / 初始化 GDPR 合規
new NexLearn_GDPR_Compliance();
\`\`\`

---

## Deployment / 部署

### 🚀 Production Deployment / 生產部署

#### Pre-deployment Checklist / 部署前檢查清單

\`\`\`bash
# Production deployment checklist / 生產部署檢查清單

# 1. Environment Configuration / 環境配置
echo "Checking environment configuration... / 檢查環境配置..."

# Check PHP version / 檢查 PHP 版本
php -v | grep "PHP 7\|PHP 8" || echo "❌ PHP 7.4+ required / 需要 PHP 7.4+"

# Check WordPress version / 檢查 WordPress 版本
wp core version --allow-root | grep -E "5\.[8-9]|[6-9]\." || echo "❌ WordPress 5.8+ required / 需要 WordPress 5.8+"

# Check LearnDash version / 檢查 LearnDash 版本
wp plugin get learndash-lms --field=version --allow-root | grep -E "^[4-9]\." || echo "❌ LearnDash 4.0+ required / 需要 LearnDash 4.0+"

# 2. Database Optimization / 數據庫優化
echo "Optimizing database... / 優化數據庫..."
wp db optimize --allow-root

# 3. Security Hardening / 安全加固
echo "Checking security settings... / 檢查安全設置..."

# Verify file permissions / 驗證文件權限
find wp-content/plugins/nexlearn-dashboard-plugin -type f -exec chmod 644 {} \;
find wp-content/plugins/nexlearn-dashboard-plugin -type d -exec chmod 755 {} \;

# Check for debug mode / 檢查調試模式
grep -q "define('WP_DEBUG', false)" wp-config.php || echo "⚠️  Disable debug mode in production / 在生產環境中禁用調試模式"

# 4. Performance Optimization / 性能優化
echo "Setting up caching... / 設置緩存..."

# Enable object caching / 啟用對象緩存
wp config set WP_CACHE true --allow-root

# Set up Redis if available / 如果可用則設置 Redis
if command -v redis-cli &> /dev/null; then
    echo "Redis detected, configuring object cache... / 檢測到 Redis，配置對象緩存..."
    wp plugin install redis-cache --activate --allow-root
    wp redis enable --allow-root
fi

# 5. SSL Configuration / SSL 配置
echo "Checking SSL configuration... / 檢查 SSL 配置..."
wp option get siteurl | grep -q "https://" || echo "⚠️  Configure SSL for production / 為生產環境配置 SSL"

# 6. Backup Verification / 備份驗證
echo "Verifying backup system... / 驗證備份系統..."
wp plugin is-installed updraftplus || echo "⚠️  Install backup plugin / 安裝備份插件"

echo "✅ Pre-deployment checks completed / 部署前檢查完成"
\`\`\`

#### Production Configuration / 生產配置

\`\`\`php
// wp-config.php production settings / wp-config.php 生產設置

// Security settings / 安全設置
define('DISALLOW_FILE_EDIT', true);                    // Disable file editing / 禁用文件編輯
define('DISALLOW_FILE_MODS', true);                    // Disable plugin/theme installation / 禁用插件/主題安裝
define('FORCE_SSL_ADMIN', true);                       // Force SSL for admin / 強制管理員使用 SSL
define('WP_AUTO_UPDATE_CORE', 'minor');               // Auto-update minor versions / 自動更新次要版本

// Performance settings / 性能設置
define('WP_CACHE', true);                              // Enable caching / 啟用緩存
define('COMPRESS_CSS', true);                          // Compress CSS / 壓縮 CSS
define('COMPRESS_SCRIPTS', true);                      // Compress JavaScript / 壓縮 JavaScript
define('CONCATENATE_SCRIPTS', true);                   // Concatenate scripts / 連接腳本
define('ENFORCE_GZIP', true);                          // Enforce GZIP compression / 強制 GZIP 壓縮

// Database optimization / 數據庫優化
define('WP_POST_REVISIONS', 3);                        // Limit post revisions / 限制文章修訂
define('AUTOSAVE_INTERVAL', 300);                      // Autosave every 5 minutes / 每5分鐘自動保存
define('WP_CRON_LOCK_TIMEOUT', 60);                    // Cron lock timeout / Cron 鎖定超時
define('EMPTY_TRASH_DAYS', 7);                         // Empty trash after 7 days / 7天後清空垃圾箱

// NexLearn production settings / NexLearn 生產設置
define('NEXLEARN_DEBUG', false);                       // Disable debug mode / 禁用調試模式
define('NEXLEARN_CACHE_DURATION', 3600);              // 1 hour cache / 1小時緩存
define('NEXLEARN_MAX_FLASHCARDS', 5000);              // Increase flashcard limit / 增加閃卡限制
define('NEXLEARN_AI_API_TIMEOUT', 60);                // Increase AI timeout / 增加 AI 超時
define('NEXLEARN_ENABLE_LOGGING', true);              // Enable production logging / 啟用生產日誌
define('NEXLEARN_LOG_LEVEL', 'ERROR');                // Log only errors / 僅記錄錯誤
define('NEXLEARN_RATE_LIMIT_ENABLED', true);          // Enable rate limiting / 啟用速率限制
define('NEXLEARN_SECURITY_HEADERS', true);            // Enable security headers / 啟用安全標頭

// Memory and execution limits / 內存和執行限制
ini_set('memory_limit', '512M');                       // Increase memory limit / 增加內存限制
ini_set('max_execution_time', 300);                    // 5 minutes max execution / 最大執行5分鐘
ini_set('max_input_vars', 3000);                       // Increase input variables / 增加輸入變量
\`\`\`

#### Deployment Script / 部署腳本

\`\`\`bash
#!/bin/bash
# NexLearn Dashboard Deployment Script / NexLearn 儀表板部署腳本

set -e  # Exit on any error / 遇到錯誤時退出

# Configuration / 配置
SITE_URL="https://your-site.com"
WP_PATH="/var/www/html"
BACKUP_PATH="/var/backups/wordpress"
PLUGIN_PATH="$WP_PATH/wp-content/plugins/nexlearn-dashboard-plugin"

echo "🚀 Starting NexLearn Dashboard deployment... / 開始 NexLearn 儀表板部署..."

# 1. Create backup / 創建備份
echo "📦 Creating backup... / 創建備份..."
mkdir -p "$BACKUP_PATH/$(date +%Y%m%d_%H%M%S)"
BACKUP_DIR="$BACKUP_PATH/$(date +%Y%m%d_%H%M%S)"

# Backup database / 備份數據庫
wp db export "$BACKUP_DIR/database.sql" --path="$WP_PATH" --allow-root

# Backup files / 備份文件
tar -czf "$BACKUP_DIR/files.tar.gz" -C "$WP_PATH" wp-content/plugins/nexlearn-dashboard-plugin

echo "✅ Backup created at $BACKUP_DIR / 備份已創建於 $BACKUP_DIR"

# 2. Put site in maintenance mode / 將網站置於維護模式
echo "🔧 Enabling maintenance mode... / 啟用維護模式..."
wp maintenance-mode activate --path="$WP_PATH" --allow-root

# 3. Update plugin files / 更新插件文件
echo "📁 Updating plugin files... / 更新插件文件..."

# Remove old plugin files (keep user data) / 刪除舊插件文件（保留用戶數據）
rm -rf "$PLUGIN_PATH/assets"
rm -rf "$PLUGIN_PATH/includes"
rm -rf "$PLUGIN_PATH/admin"
rm -rf "$PLUGIN_PATH/src"
rm -rf "$PLUGIN_PATH/build"

# Extract new plugin files / 提取新插件文件
unzip -q nexlearn-dashboard-plugin.zip -d "$WP_PATH/wp-content/plugins/"

# Set correct permissions / 設置正確權限
chown -R www-data:www-data "$PLUGIN_PATH"
find "$PLUGIN_PATH" -type f -exec chmod 644 {} \;
find "$PLUGIN_PATH" -type d -exec chmod 755 {} \;

# 4. Run database migrations / 運行數據庫遷移
echo "🗄️  Running database migrations... / 運行數據庫遷移..."
wp eval "
if (class_exists('NexLearn_DB_Migrator')) {
    \$migrator = new NexLearn_DB_Migrator();
    \$migrator->run_migrations();
    echo 'Database migrations completed / 數據庫遷移完成\n';
}
" --path="$WP_PATH" --allow-root

# 5. Clear caches / 清除緩存
echo "🧹 Clearing caches... / 清除緩存..."

# WordPress object cache / WordPress 對象緩存
wp cache flush --path="$WP_PATH" --allow-root

# Redis cache if available / Redis 緩存（如果可用）
if wp plugin is-active redis-cache --path="$WP_PATH" --allow-root; then
    wp redis flush --path="$WP_PATH" --allow-root
fi

# Opcache / Opcache
if command -v php &> /dev/null; then
    php -r "if (function_exists('opcache_reset')) opcache_reset();"
fi

# CDN cache (example for Cloudflare) / CDN 緩存（Cloudflare 示例）
if [ ! -z "$CLOUDFLARE_API_TOKEN" ]; then
    echo "🌐 Purging CDN cache... / 清除 CDN 緩存..."
    curl -X POST "https://api.cloudflare.com/client/v4/zones/$CLOUDFLARE_ZONE_ID/purge_cache" \
         -H "Authorization: Bearer $CLOUDFLARE_API_TOKEN" \
         -H "Content-Type: application/json" \
         --data '{"purge_everything":true}'
fi

# 6. Run health checks / 運行健康檢查
echo "🏥 Running health checks... / 運行健康檢查..."

# Check if site is accessible / 檢查網站是否可訪問
if curl -f -s "$SITE_URL" > /dev/null; then
    echo "✅ Site is accessible / 網站可訪問"
else
    echo "❌ Site is not accessible / 網站不可訪問"
    exit 1
fi

# Check plugin activation / 檢查插件激活
if wp plugin is-active nexlearn-dashboard-plugin --path="$WP_PATH" --allow-root; then
    echo "✅ Plugin is active / 插件已激活"
else
    echo "❌ Plugin is not active / 插件未激活"
    exit 1
fi

# Check database connectivity / 檢查數據庫連接
if wp db check --path="$WP_PATH" --allow-root; then
    echo "✅ Database is accessible / 數據庫可訪問"
else
    echo "❌ Database connection failed / 數據庫連接失敗"
    exit 1
fi

# Test API endpoints / 測試 API 端點
API_TEST=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL/wp-json/nexlearn/v1/dashboard" \
           -H "X-WP-Nonce: $(wp eval 'echo wp_create_nonce("wp_rest");' --path="$WP_PATH" --allow-root)")

if [ "$API_TEST" = "401" ] || [ "$API_TEST" = "200" ]; then
    echo "✅ API endpoints are responding / API 端點正在響應"
else
    echo "❌ API endpoints are not responding (HTTP $API_TEST) / API 端點未響應 (HTTP $API_TEST)"
    exit 1
fi

# 7. Disable maintenance mode / 禁用維護模式
echo "🔓 Disabling maintenance mode... / 禁用維護模式..."
wp maintenance-mode deactivate --path="$WP_PATH" --allow-root

# 8. Send deployment notification / 發送部署通知
echo "📧 Sending deployment notification... / 發送部署通知..."

# Slack notification (if configured) / Slack 通知（如果已配置）
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
         --data "{\"text\":\"✅ NexLearn Dashboard deployed successfully to $SITE_URL / NexLearn 儀表板已成功部署到 $SITE_URL\"}" \
         "$SLACK_WEBHOOK_URL"
fi

# Email notification / 郵件通知
if [ ! -z "$NOTIFICATION_EMAIL" ]; then
    echo "NexLearn Dashboard deployment completed successfully at $(date) / NexLearn 儀表板部署於 $(date) 成功完成" | \
    mail -s "Deployment Success / 部署成功" "$NOTIFICATION_EMAIL"
fi

echo "🎉 Deployment completed successfully! / 部署成功完成！"
echo "📊 Dashboard URL: $SITE_URL/dashboard / 儀表板 URL: $SITE_URL/dashboard"
echo "⚙️  Admin URL: $SITE_URL/wp-admin/admin.php?page=nexlearn-dashboard / 管理 URL: $SITE_URL/wp-admin/admin.php?page=nexlearn-dashboard"

# 9. Post-deployment tasks / 部署後任務
echo "🔄 Running post-deployment tasks... / 運行部署後任務..."

# Warm up cache / 預熱緩存
curl -s "$SITE_URL/dashboard" > /dev/null
curl -s "$SITE_URL/wp-json/nexlearn/v1/dashboard" > /dev/null

# Update search index if using search plugin / 如果使用搜索插件則更新搜索索引
if wp plugin is-active elasticsearch --path="$WP_PATH" --allow-root; then
    wp elasticsearch index --path="$WP_PATH" --allow-root
fi

# Generate sitemap / 生成站點地圖
if wp plugin is-active wordpress-seo --path="$WP_PATH" --allow-root; then
    wp yoast index --path="$WP_PATH" --allow-root
fi

echo "✨ All deployment tasks completed! / 所有部署任務已完成！"
\`\`\`

#### Monitoring and Maintenance / 監控和維護

\`\`\`bash
#!/bin/bash
# NexLearn Dashboard Monitoring Script / NexLearn 儀表板監控腳本

# Configuration / 配置
SITE_URL="https://your-site.com"
WP_PATH="/var/www/html"
LOG_FILE="/var/log/nexlearn-monitor.log"
ALERT_EMAIL="admin@your-site.com"

# Function to log messages / 記錄消息的函數
log_message() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" >> "$LOG_FILE"
}

# Function to send alert / 發送警報的函數
send_alert() {
    local subject="$1"
    local message="$2"
    
    echo "$message" | mail -s "$subject" "$ALERT_EMAIL"
    log_message "ALERT: $subject - $message"
}

# Check site availability / 檢查網站可用性
check_site_availability() {
    local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL")
    
    if [ "$response_code" != "200" ]; then
        send_alert "Site Down / 網站宕機" "Site returned HTTP $response_code / 網站返回 HTTP $response_code"
        return 1
    fi
    
    log_message "Site availability check passed / 網站可用性檢查通過"
    return 0
}

# Check database connectivity / 檢查數據庫連接
check_database() {
    if ! wp db check --path="$WP_PATH" --allow-root --quiet; then
        send_alert "Database Error / 數據庫錯誤" "Database connectivity check failed / 數據庫連接檢查失敗"
        return 1
    fi
    
    log_message "Database check passed / 數據庫檢查通過"
    return 0
}

# Check API endpoints / 檢查 API 端點
check_api_endpoints() {
    local endpoints=(
        "/wp-json/nexlearn/v1/dashboard"
        "/wp-json/nexlearn/v1/flashcards"
        "/wp-json/nexlearn/v1/analytics"
    )
    
    for endpoint in "${endpoints[@]}"; do
        local response_code=$(curl -s -o /dev/null -w "%{http_code}" "$SITE_URL$endpoint")
        
        if [ "$response_code" != "401" ] && [ "$response_code" != "200" ]; then
            send_alert "API Endpoint Error / API 端點錯誤" "Endpoint $endpoint returned HTTP $response_code / 端點 $endpoint 返回 HTTP $response_code"
            return 1
        fi
    done
    
    log_message "API endpoints check passed / API 端點檢查通過"
    return 0
}

# Check disk space / 檢查磁盤空間
check_disk_space() {
    local usage=$(df "$WP_PATH" | awk 'NR==2 {print $5}' | sed 's/%//')
    
    if [ "$usage" -gt 85 ]; then
        send_alert "Disk Space Warning / 磁盤空間警告" "Disk usage is at ${usage}% / 磁盤使用率為 ${usage}%"
        return 1
    fi
    
    log_message "Disk space check passed (${usage}% used) / 磁盤空間檢查通過（已使用 ${usage}%）"
    return 0
}

# Check memory usage / 檢查內存使用
check_memory_usage() {
    local memory_usage=$(free | awk 'NR==2{printf "%.0f", $3*100/$2}')
    
    if [ "$memory_usage" -gt 90 ]; then
        send_alert "Memory Usage Warning / 內存使用警告" "Memory usage is at ${memory_usage}% / 內存使用率為 ${memory_usage}%"
        return 1
    fi
    
    log_message "Memory usage check passed (${memory_usage}% used) / 內存使用檢查通過（已使用 ${memory_usage}%）"
    return 0
}

# Check plugin status / 檢查插件狀態
check_plugin_status() {
    if ! wp plugin is-active nexlearn-dashboard-plugin --path="$WP_PATH" --allow-root --quiet; then
        send_alert "Plugin Inactive / 插件未激活" "NexLearn Dashboard plugin is not active / NexLearn 儀表板插件未激活"
        return 1
    fi
    
    log_message "Plugin status check passed / 插件狀態檢查通過"
    return 0
}

# Check error logs / 檢查錯誤日誌
check_error_logs() {
    local error_log="$WP_PATH/wp-content/debug.log"
    local temp_file="/tmp/nexlearn_errors.tmp"
    
    if [ -f "$error_log" ]; then
        # Check for recent errors (last 10 minutes) / 檢查最近的錯誤（最近10分鐘）
        find "$error_log" -mmin -10 -exec grep -i "nexlearn\|fatal\|error" {} \; > "$temp_file"
        
        if [ -s "$temp_file" ]; then
            local error_count=$(wc -l < "$temp_file")
            send_alert "Error Log Alert / 錯誤日誌警報" "Found $error_count recent errors in log / 在日誌中發現 $error_count 個最近錯誤"
            return 1
        fi
        
        rm -f "$temp_file"
    fi
    
    log_message "Error log check passed / 錯誤日誌檢查通過"
    return 0
}

# Performance monitoring / 性能監控
check_performance() {
    local response_time=$(curl -o /dev/null -s -w "%{time_total}" "$SITE_URL/dashboard")
    local response_time_ms=$(echo "$response_time * 1000" | bc)
    
    if (( $(echo "$response_time > 5.0" | bc -l) )); then
        send_alert "Performance Warning / 性能警告" "Dashboard response time is ${response_time_ms}ms / 儀表板響應時間為 ${response_time_ms}毫秒"
        return 1
    fi
    
    log_message "Performance check passed (${response_time_ms}ms response time) / 性能檢查通過（響應時間 ${response_time_ms}毫秒）"
    return 0
}

# Database maintenance / 數據庫維護
database_maintenance() {
    log_message "Starting database maintenance / 開始數據庫維護"
    
    # Optimize database tables / 優化數據庫表
    wp db optimize --path="$WP_PATH" --allow-root --quiet
    
    # Clean up old analytics data (older than 1 year) / 清理舊分析數據（超過1年）
    wp db query "DELETE FROM wp_nexlearn_analytics WHERE timestamp < DATE_SUB(NOW(), INTERVAL 1 YEAR)" --path="$WP_PATH" --allow-root
    
    # Clean up orphaned flashcards / 清理孤立的閃卡
    wp db query "DELETE f FROM wp_nexlearn_flashcards f LEFT JOIN wp_users u ON f.user_id = u.ID WHERE u.ID IS NULL" --path="$WP_PATH" --allow-root
    
    log_message "Database maintenance completed / 數據庫維護完成"
}

# Cache warming / 緩存預熱
warm_cache() {
    log_message "Starting cache warming / 開始緩存預熱"
    
    # Warm up main pages / 預熱主要頁面
    local pages=(
        "/dashboard"
        "/dashboard/courses"
        "/dashboard/analytics"
        "/wp-json/nexlearn/v1/dashboard"
    )
    
    for page in "${pages[@]}"; do
        curl -s "$SITE_URL$page" > /dev/null
        sleep 1
    done
    
    log_message "Cache warming completed / 緩存預熱完成"
}

# Main monitoring function / 主監控函數
run_monitoring() {
    log_message "Starting monitoring cycle / 開始監控循環"
    
    local checks=(
        "check_site_availability"
        "check_database"
        "check_api_endpoints"
        "check_disk_space"
        "check_memory_usage"
        "check_plugin_status"
        "check_error_logs"
        "check_performance"
    )
    
    local failed_checks=0
    
    for check in "${checks[@]}"; do
        if ! $check; then
            ((failed_checks++))
        fi
        sleep 2
    done
    
    if [ $failed_checks -eq 0 ]; then
        log_message "All monitoring checks passed / 所有監控檢查通過"
    else
        log_message "Monitoring completed with $failed_checks failed checks / 監控完成，$failed_checks 項檢查失敗"
    fi
    
    # Run maintenance tasks (daily) / 運行維護任務（每日）
    local current_hour=$(date +%H)
    if [ "$current_hour" = "02" ]; then  # Run at 2 AM / 凌晨2點運行
        database_maintenance
        warm_cache
    fi
}

# Run monitoring / 運行監控
run_monitoring

# Generate daily report / 生成每日報告
if [ "$(date +%H:%M)" = "23:59" ]; then
    log_message "Generating daily report / 生成每日報告"
    
    # Count today's events / 統計今日事件
    local today=$(date +%Y-%m-%d)
    local alerts_today=$(grep "$today" "$LOG_FILE" | grep -c "ALERT" || echo "0")
    local checks_today=$(grep "$today" "$LOG_FILE" | grep -c "check passed" || echo "0")
    
    # Generate report / 生成報告
    local report="Daily NexLearn Dashboard Report / NexLearn 儀表板每日報告 - $today

Monitoring Summary / 監控摘要:
- Successful checks / 成功檢查: $checks_today
- Alerts generated / 生成警報: $alerts_today
- System status / 系統狀態: $([ $alerts_today -eq 0 ] && echo "Healthy / 健康" || echo "Needs attention / 需要關注")

Recent log entries / 最近日誌條目:
$(tail -20 "$LOG_FILE")
"
    
    echo "$report" | mail -s "Daily NexLearn Report / NexLearn 每日報告" "$ALERT_EMAIL"
    log_message "Daily report sent / 每日報告已發送"
fi
\`\`\`

#### Automated Backup System / 自動備份系統

\`\`\`bash
#!/bin/bash
# NexLearn Dashboard Backup Script / NexLearn 儀表板備份腳本

# Configuration / 配置
WP_PATH="/var/www/html"
BACKUP_BASE_PATH="/var/backups/nexlearn"
REMOTE_BACKUP_PATH="s3://your-backup-bucket/nexlearn"
RETENTION_DAYS=30
MYSQL_USER="backup_user"
MYSQL_PASSWORD="backup_password"
MYSQL_DATABASE="wordpress"

# Create backup directory / 創建備份目錄
BACKUP_DATE=$(date +%Y%m%d_%H%M%S)
BACKUP_PATH="$BACKUP_BASE_PATH/$BACKUP_DATE"
mkdir -p "$BACKUP_PATH"

echo "🗄️  Starting NexLearn Dashboard backup... / 開始 NexLearn 儀表板備份..."

# 1. Database backup / 數據庫備份
echo "📊 Backing up database... / 備份數據庫..."

# Full database backup / 完整數據庫備份
mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" > "$BACKUP_PATH/full_database.sql"

# NexLearn specific tables / NexLearn 特定表
mysqldump -u"$MYSQL_USER" -p"$MYSQL_PASSWORD" "$MYSQL_DATABASE" \
    wp_nexlearn_flashcards \
    wp_nexlearn_analytics \
    wp_nexlearn_user_preferences > "$BACKUP_PATH/nexlearn_tables.sql"

# Compress database backups / 壓縮數據庫備份
gzip "$BACKUP_PATH/full_database.sql"
gzip "$BACKUP_PATH/nexlearn_tables.sql"

echo "✅ Database backup completed / 數據庫備份完成"

# 2. Plugin files backup / 插件文件備份
echo "📁 Backing up plugin files... / 備份插件文件..."

tar -czf "$BACKUP_PATH/nexlearn_plugin.tar.gz" \
    -C "$WP_PATH/wp-content/plugins" \
    nexlearn-dashboard-plugin

echo "✅ Plugin files backup completed / 插件文件備份完成"

# 3. User uploads backup (if contains learning materials) / 用戶上傳備份（如果包含學習材料）
echo "📎 Backing up user uploads... / 備份用戶上傳..."

if [ -d "$WP_PATH/wp-content/uploads/nexlearn" ]; then
    tar -czf "$BACKUP_PATH/nexlearn_uploads.tar.gz" \
        -C "$WP_PATH/wp-content/uploads" \
        nexlearn
fi

echo "✅ User uploads backup completed / 用戶上傳備份完成"

# 4. Configuration backup / 配置備份
echo "⚙️  Backing up configuration... / 備份配置..."

# WordPress configuration / WordPress 配置
cp "$WP_PATH/wp-config.php" "$BACKUP_PATH/"

# Server configuration (if accessible) / 服務器配置（如果可訪問）
if [ -f "/etc/nginx/sites-available/default" ]; then
    cp "/etc/nginx/sites-available/default" "$BACKUP_PATH/nginx_config"
fi

if [ -f "/etc/apache2/sites-available/000-default.conf" ]; then
    cp "/etc/apache2/sites-available/000-default.conf" "$BACKUP_PATH/apache_config"
fi

echo "✅ Configuration backup completed / 配置備份完成"

# 5. Create backup manifest / 創建備份清單
echo "📋 Creating backup manifest... / 創建備份清單..."

cat > "$BACKUP_PATH/manifest.txt" << EOF
NexLearn Dashboard Backup Manifest / NexLearn 儀表板備份清單
Backup Date / 備份日期: $BACKUP_DATE
WordPress Path / WordPress 路徑: $WP_PATH
Database / 數據庫: $MYSQL_DATABASE

Files included / 包含文件:
- full_database.sql.gz (Complete WordPress database / 完整 WordPress 數據庫)
- nexlearn_tables.sql.gz (NexLearn specific tables / NexLearn 特定表)
- nexlearn_plugin.tar.gz (Plugin files / 插件文件)
- nexlearn_uploads.tar.gz (User uploads / 用戶上傳)
- wp-config.php (WordPress configuration / WordPress 配置)
- nginx_config or apache_config (Server configuration / 服務器配置)

Backup size / 備份大小: $(du -sh "$BACKUP_PATH" | cut -f1)
EOF

echo "✅ Backup manifest created / 備份清單已創建"

# 6. Upload to remote storage / 上傳到遠程存儲
if command -v aws &> /dev/null && [ ! -z "$REMOTE_BACKUP_PATH" ]; then
    echo "☁️  Uploading to remote storage... / 上傳到遠程存儲..."
    
    # Create archive of entire backup / 創建整個備份的存檔
    tar -czf "$BACKUP_BASE_PATH/nexlearn_backup_$BACKUP_DATE.tar.gz" -C "$BACKUP_BASE_PATH" "$BACKUP_DATE"
    
    # Upload to S3 / 上傳到 S3
    aws s3 cp "$BACKUP_BASE_PATH/nexlearn_backup_$BACKUP_DATE.tar.gz" "$REMOTE_BACKUP_PATH/"
    
    # Remove local archive / 刪除本地存檔
    rm "$BACKUP_BASE_PATH/nexlearn_backup_$BACKUP_DATE.tar.gz"
    
    echo "✅ Remote backup completed / 遠程備份完成"
fi

# 7. Cleanup old backups / 清理舊備份
echo "🧹 Cleaning up old backups... / 清理舊備份..."

# Remove local backups older than retention period / 刪除超過保留期的本地備份
find "$BACKUP_BASE_PATH" -type d -name "20*" -mtime +$RETENTION_DAYS -exec rm -rf {} \;

# Remove remote backups older than retention period / 刪除超過保留期的遠程備份
if command -v aws &> /dev/null && [ ! -z "$REMOTE_BACKUP_PATH" ]; then
    aws s3 ls "$REMOTE_BACKUP_PATH/" | while read -r line; do
        backup_date=$(echo "$line" | awk '{print $4}' | grep -o '[0-9]\{8\}_[0-9]\{6\}')
        if [ ! -z "$backup_date" ]; then
            backup_timestamp=$(date -d "${backup_date:0:8} ${backup_date:9:2}:${backup_date:11:2}:${backup_date:13:2}" +%s)
            current_timestamp=$(date +%s)
            age_days=$(( (current_timestamp - backup_timestamp) / 86400 ))
            
            if [ $age_days -gt $RETENTION_DAYS ]; then
                aws s3 rm "$REMOTE_BACKUP_PATH/$(echo "$line" | awk '{print $4}')"
                echo "Removed old remote backup: $(echo "$line" | awk '{print $4}') / 已刪除舊遠程備份：$(echo "$line" | awk '{print $4}')"
            fi
        fi
    done
fi

echo "✅ Cleanup completed / 清理完成"

# 8. Verify backup integrity / 驗證備份完整性
echo "🔍 Verifying backup integrity... / 驗證備份完整性..."

# Test database backup / 測試數據庫備份
if gunzip -t "$BACKUP_PATH/full_database.sql.gz" 2>/dev/null; then
    echo "✅ Database backup integrity verified / 數據庫備份完整性已驗證"
else
    echo "❌ Database backup integrity check failed / 數據庫備份完整性檢查失敗"
    exit 1
fi

# Test plugin backup / 測試插件備份
if tar -tzf "$BACKUP_PATH/nexlearn_plugin.tar.gz" >/dev/null 2>&1; then
    echo "✅ Plugin backup integrity verified / 插件備份完整性已驗證"
else
    echo "❌ Plugin backup integrity check failed / 插件備份完整性檢查失敗"
    exit 1
fi

# 9. Send backup notification / 發送備份通知
echo "📧 Sending backup notification... / 發送備份通知..."

BACKUP_SIZE=$(du -sh "$BACKUP_PATH" | cut -f1)
BACKUP_FILES=$(find "$BACKUP_PATH" -type f | wc -l)

# Email notification / 郵件通知
if [ ! -z "$NOTIFICATION_EMAIL" ]; then
    cat << EOF | mail -s "NexLearn Backup Completed / NexLearn 備份完成" "$NOTIFICATION_EMAIL"
NexLearn Dashboard Backup Report / NexLearn 儀表板備份報告

Backup Details / 備份詳情:
- Date/Time / 日期時間: $BACKUP_DATE
- Location / 位置: $BACKUP_PATH
- Size / 大小: $BACKUP_SIZE
- Files / 文件數: $BACKUP_FILES
- Remote backup / 遠程備份: $([ ! -z "$REMOTE_BACKUP_PATH" ] && echo "Yes / 是" || echo "No / 否")

Status / 狀態: ✅ Completed successfully / 成功完成

Next backup scheduled / 下次備份計劃: $(date -d "+1 day" "+%Y-%m-%d %H:%M")
EOF
fi

# Slack notification (if configured) / Slack 通知（如果已配置）
if [ ! -z "$SLACK_WEBHOOK_URL" ]; then
    curl -X POST -H 'Content-type: application/json' \
         --data "{\"text\":\"✅ NexLearn Dashboard backup completed successfully. Size: $BACKUP_SIZE, Files: $BACKUP_FILES / NexLearn 儀表板備份成功完成。大小：$BACKUP_SIZE，文件：$BACKUP_FILES\"}" \
         "$SLACK_WEBHOOK_URL"
fi

echo "🎉 Backup process completed successfully! / 備份過程成功完成！"
echo "📊 Backup location / 備份位置: $BACKUP_PATH"
echo "💾 Backup size / 備份大小: $BACKUP_SIZE"
echo "📁 Files backed up / 已備份文件: $BACKUP_FILES"

# Log backup completion / 記錄備份完成
echo "$(date '+%Y-%m-%d %H:%M:%S') - Backup completed successfully: $BACKUP_PATH ($BACKUP_SIZE) / 備份成功完成：$BACKUP_PATH ($BACKUP_SIZE)" >> /var/log/nexlearn-backup.log
\`\`\`

---

## Support and Resources / 支持和資源

### 📚 Documentation Links / 文檔鏈接

- **WordPress Codex**: https://codex.wordpress.org/
- **LearnDash Documentation**: https://www.learndash.com/support/docs/
- **React Documentation**: https://reactjs.org/docs/
- **WordPress REST API**: https://developer.wordpress.org/rest-api/
- **PHP Documentation**: https://www.php.net/docs.php

### 🆘 Getting Help / 獲取幫助

#### Community Support / 社區支持

- **WordPress Support Forums**: https://wordpress.org/support/
- **LearnDash Community**: https://www.learndash.com/support/
- **GitHub Issues**: https://github.com/your-repo/nexlearn-dashboard/issues

#### Professional Support / 專業支持

For professional support and custom development services:
如需專業支持和自定義開發服務：

- **Email**: support@nexlearn.ai
- **Documentation**: https://docs.nexlearn.ai
- **Support Portal**: https://support.nexlearn.ai

---

## Conclusion / 結論

This comprehensive integration guide provides everything needed to successfully implement the NexLearn.ai Dashboard with WordPress and LearnDash. Whether you choose the plugin approach for portability or theme integration for deep customization, both methods offer robust, scalable solutions for modern learning management systems.

本綜合集成指南提供了成功實施 NexLearn.ai 儀表板與 WordPress 和 LearnDash 所需的一切。無論您選擇插件方式的便攜性還是主題集成的深度自定義，兩種方法都為現代學習管理系統提供了強大、可擴展的解決方案。

Remember to always test in a staging environment before deploying to production, maintain regular backups, and monitor system performance to ensure optimal user experience.

請記住，在部署到生產環境之前始終在暫存環境中測試，保持定期備份，並監控系統性能以確保最佳用戶體驗。

---

**Last Updated / 最後更新**: January 2024
**Version / 版本**: 1.0.0
**Compatibility / 兼容性**: WordPress 5.8+, LearnDash 4.0+, PHP 7.4+
