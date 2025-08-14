<?php
/**
 * Template Name: NexLearn Dashboard
 * Description: Custom template for the learning dashboard
 */

// Prevent direct access
if (!defined('ABSPATH')) {
    exit;
}

// Check if user is logged in
if (!is_user_logged_in()) {
    wp_redirect(wp_login_url(get_permalink()));
    exit;
}

get_header('dashboard'); ?>

<div class="nexlearn-dashboard-wrapper">
    <?php if (get_theme_mod('show_dashboard_breadcrumbs', true)): ?>
    <nav class="dashboard-breadcrumbs" aria-label="Breadcrumb">
        <ol class="breadcrumb-list">
            <li><a href="<?php echo home_url(); ?>">Home</a></li>
            <li><span aria-current="page">Dashboard</span></li>
        </ol>
    </nav>
    <?php endif; ?>
    
    <div class="dashboard-container <?php echo esc_attr(get_theme_mod('dashboard_layout', 'sidebar')); ?>">
        <?php if (get_theme_mod('dashboard_layout', 'sidebar') === 'sidebar'): ?>
        <aside class="dashboard-sidebar <?php echo esc_attr(get_theme_mod('dashboard_sidebar_position', 'left')); ?>">
            <?php
            // Dashboard navigation menu
            wp_nav_menu(array(
                'theme_location' => 'dashboard-menu',
                'menu_class' => 'dashboard-nav-menu',
                'container' => 'nav',
                'container_class' => 'dashboard-navigation',
                'fallback_cb' => 'nexlearn_default_dashboard_menu'
            ));
            ?>
            
            <div class="dashboard-user-info">
                <?php
                $current_user = wp_get_current_user();
                echo get_avatar($current_user->ID, 64, '', '', array('class' => 'user-avatar'));
                ?>
                <div class="user-details">
                    <h3 class="user-name"><?php echo esc_html($current_user->display_name); ?></h3>
                    <p class="user-role"><?php echo esc_html(ucfirst($current_user->roles[0])); ?></p>
                </div>
            </div>
            
            <?php if (class_exists('SFWD_LMS')): ?>
            <div class="dashboard-quick-stats">
                <h4>Quick Stats</h4>
                <?php
                $user_id = get_current_user_id();
                $enrolled_courses = learndash_user_get_enrolled_courses($user_id);
                $completed_courses = learndash_user_get_completed_courses($user_id);
                ?>
                <div class="stat-item">
                    <span class="stat-number"><?php echo count($enrolled_courses); ?></span>
                    <span class="stat-label">Enrolled Courses</span>
                </div>
                <div class="stat-item">
                    <span class="stat-number"><?php echo count($completed_courses); ?></span>
                    <span class="stat-label">Completed</span>
                </div>
            </div>
            <?php endif; ?>
        </aside>
        <?php endif; ?>
        
        <main class="dashboard-main-content">
            <header class="dashboard-header">
                <h1 class="dashboard-title">
                    <?php
                    $dashboard_view = get_query_var('nexlearn_dashboard', 'overview');
                    echo esc_html(ucfirst(str_replace('-', ' ', $dashboard_view)));
                    ?>
                </h1>
                
                <div class="dashboard-actions">
                    <?php if (get_theme_mod('enable_dark_mode', true)): ?>
                    <button id="theme-toggle" class="theme-toggle-btn" aria-label="Toggle dark mode">
                        <span class="theme-icon light-icon">☀️</span>
                        <span class="theme-icon dark-icon">🌙</span>
                    </button>
                    <?php endif; ?>
                    
                    <button id="dashboard-settings" class="settings-btn" aria-label="Dashboard settings">
                        ⚙️
                    </button>
                </div>
            </header>
            
            <div class="dashboard-content">
                <?php
                // Load the React dashboard component
                echo do_shortcode('[nexlearn_dashboard view="' . esc_attr($dashboard_view) . '"]');
                ?>
            </div>
        </main>
    </div>
</div>

<style>
:root {
    --dashboard-primary: <?php echo esc_attr(get_theme_mod('primary_color', '#3b82f6')); ?>;
    --dashboard-secondary: <?php echo esc_attr(get_theme_mod('secondary_color', '#64748b')); ?>;
    --dashboard-accent: <?php echo esc_attr(get_theme_mod('accent_color', '#10b981')); ?>;
    --dashboard-background: <?php echo esc_attr(get_theme_mod('background_color', '#ffffff')); ?>;
    --dashboard-font-family: <?php echo esc_attr(get_theme_mod('dashboard_font_family', 'Inter')); ?>;
    --dashboard-font-size: <?php echo esc_attr(get_theme_mod('dashboard_font_size', '14px')); ?>;
    --dashboard-line-height: <?php echo esc_attr(get_theme_mod('dashboard_line_height', '1.5')); ?>;
}

.nexlearn-dashboard-wrapper {
    font-family: var(--dashboard-font-family);
    font-size: var(--dashboard-font-size);
    line-height: var(--dashboard-line-height);
    background-color: var(--dashboard-background);
    min-height: 100vh;
}

.dashboard-container {
    display: flex;
    max-width: 1200px;
    margin: 0 auto;
    padding: 20px;
    gap: 30px;
}

.dashboard-container.full-width {
    max-width: 100%;
}

.dashboard-container.boxed {
    max-width: 1000px;
    background: white;
    border-radius: 12px;
    box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
}

.dashboard-sidebar {
    width: 280px;
    background: white;
    border-radius: 12px;
    padding: 24px;
    height: fit-content;
    box-shadow: 0 1px 3px 0 rgba(0, 0, 0, 0.1);
}

.dashboard-sidebar.right {
    order: 2;
}

.dashboard-main-content {
    flex: 1;
    min-width: 0;
}

.dashboard-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 30px;
    padding-bottom: 20px;
    border-bottom: 1px solid #e5e7eb;
}

.dashboard-title {
    font-size: 28px;
    font-weight: 700;
    color: var(--dashboard-primary);
    margin: 0;
}

.dashboard-actions {
    display: flex;
    gap: 12px;
}

.theme-toggle-btn,
.settings-btn {
    background: white;
    border: 1px solid #d1d5db;
    border-radius: 8px;
    padding: 8px 12px;
    cursor: pointer;
    transition: all 0.2s ease;
}

.theme-toggle-btn:hover,
.settings-btn:hover {
    background: #f9fafb;
    border-color: var(--dashboard-primary);
}

.dashboard-user-info {
    display: flex;
    align-items: center;
    gap: 12px;
    margin-bottom: 24px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.user-avatar {
    border-radius: 50%;
}

.user-name {
    font-size: 16px;
    font-weight: 600;
    margin: 0 0 4px 0;
    color: #1f2937;
}

.user-role {
    font-size: 14px;
    color: #6b7280;
    margin: 0;
}

.dashboard-quick-stats h4 {
    font-size: 14px;
    font-weight: 600;
    color: #374151;
    margin: 0 0 12px 0;
    text-transform: uppercase;
    letter-spacing: 0.05em;
}

.stat-item {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
    border-bottom: 1px solid #f3f4f6;
}

.stat-item:last-child {
    border-bottom: none;
}

.stat-number {
    font-size: 18px;
    font-weight: 700;
    color: var(--dashboard-primary);
}

.stat-label {
    font-size: 14px;
    color: #6b7280;
}

.dashboard-breadcrumbs {
    background: white;
    padding: 12px 20px;
    border-bottom: 1px solid #e5e7eb;
}

.breadcrumb-list {
    display: flex;
    list-style: none;
    margin: 0;
    padding: 0;
    font-size: 14px;
}

.breadcrumb-list li:not(:last-child)::after {
    content: '›';
    margin: 0 8px;
    color: #9ca3af;
}

.breadcrumb-list a {
    color: var(--dashboard-primary);
    text-decoration: none;
}

.breadcrumb-list a:hover {
    text-decoration: underline;
}

/* Dark mode styles */
@media (prefers-color-scheme: dark) {
    .nexlearn-dashboard-wrapper {
        --dashboard-background: #111827;
        color: #f9fafb;
    }
    
    .dashboard-sidebar,
    .dashboard-container.boxed {
        background: #1f2937;
    }
    
    .dashboard-user-info {
        background: #374151;
    }
    
    .user-name {
        color: #f9fafb;
    }
    
    .dashboard-breadcrumbs {
        background: #1f2937;
        border-color: #374151;
    }
}

/* Responsive design */
@media (max-width: 768px) {
    .dashboard-container {
        flex-direction: column;
        padding: 15px;
    }
    
    .dashboard-sidebar {
        width: 100%;
        order: 2;
    }
    
    .dashboard-header {
        flex-direction: column;
        gap: 15px;
        align-items: flex-start;
    }
    
    .dashboard-title {
        font-size: 24px;
    }
}

<?php if (get_theme_mod('enable_dashboard_animations', true)): ?>
/* Animations */
.dashboard-container {
    animation: fadeInUp 0.6s ease-out;
}

@keyframes fadeInUp {
    from {
        opacity: 0;
        transform: translateY(30px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

.stat-item {
    transition: background-color 0.2s ease;
}

.stat-item:hover {
    background-color: rgba(59, 130, 246, 0.05);
}
<?php endif; ?>
</style>

<script>
document.addEventListener('DOMContentLoaded', function() {
    // Theme toggle functionality
    const themeToggle = document.getElementById('theme-toggle');
    if (themeToggle) {
        themeToggle.addEventListener('click', function() {
            document.body.classList.toggle('dark-mode');
            localStorage.setItem('nexlearn-theme', document.body.classList.contains('dark-mode') ? 'dark' : 'light');
        });
        
        // Load saved theme preference
        const savedTheme = localStorage.getItem('nexlearn-theme');
        if (savedTheme === 'dark') {
            document.body.classList.add('dark-mode');
        }
    }
    
    // Dashboard settings
    const settingsBtn = document.getElementById('dashboard-settings');
    if (settingsBtn) {
        settingsBtn.addEventListener('click', function() {
            // Open settings modal or redirect to settings page
            if (typeof nexlearnOpenSettings === 'function') {
                nexlearnOpenSettings();
            } else {
                window.location.href = '<?php echo admin_url('customize.php?autofocus[section]=nexlearn_dashboard'); ?>';
            }
        });
    }
});
</script>

<?php
// Default dashboard menu fallback
function nexlearn_default_dashboard_menu() {
    echo '<nav class="dashboard-navigation">';
    echo '<ul class="dashboard-nav-menu">';
    echo '<li><a href="' . home_url('/dashboard/') . '">Overview</a></li>';
    if (class_exists('SFWD_LMS')) {
        echo '<li><a href="' . home_url('/dashboard/courses/') . '">My Courses</a></li>';
        echo '<li><a href="' . home_url('/dashboard/progress/') . '">Progress</a></li>';
        echo '<li><a href="' . home_url('/dashboard/certificates/') . '">Certificates</a></li>';
    }
    echo '<li><a href="' . home_url('/dashboard/settings/') . '">Settings</a></li>';
    echo '</ul>';
    echo '</nav>';
}

get_footer('dashboard'); ?>
