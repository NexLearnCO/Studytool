// Sidebar Navigation Functionality

class SidebarManager {
    constructor() {
        this.sidebar = document.querySelector('.sidebar');
        this.mainContainer = document.querySelector('.main-container');
        this.currentView = 'welcome';
        this.initializeEventListeners();
        this.initializeNavigation();
    }

    initializeEventListeners() {
        // Collapse/Expand sidebar
        const collapseBtn = document.getElementById('collapse-sidebar');
        if (collapseBtn) {
            collapseBtn.addEventListener('click', () => this.toggleSidebar());
        }

        // Quick action buttons
        this.setupQuickActions();
        
        // Navigation sections
        this.setupNavigationSections();
        
        // Category toggles
        this.setupCategoryToggles();
        
        // Navigation links
        this.setupNavigationLinks();
    }

    setupQuickActions() {
        // New note button
        const newNoteBtn = document.getElementById('new-note-btn');
        if (newNoteBtn) {
            newNoteBtn.addEventListener('click', () => this.openNewNoteModal());
        }

        // New flashcard set button
        const newFlashcardBtn = document.getElementById('new-flashcard-set-btn');
        if (newFlashcardBtn) {
            newFlashcardBtn.addEventListener('click', () => this.openNewFlashcardSetModal());
        }

        // New quiz set button
        const newQuizBtn = document.getElementById('new-quiz-set-btn');
        if (newQuizBtn) {
            newQuizBtn.addEventListener('click', () => this.openNewQuizSetModal());
        }

        // Open canvas button
        const openCanvasBtn = document.getElementById('open-canvas-btn');
        if (openCanvasBtn) {
            openCanvasBtn.addEventListener('click', () => this.openCanvasModal());
        }
    }

    setupNavigationSections() {
        const sectionHeaders = document.querySelectorAll('.nav-section-header');
        sectionHeaders.forEach(header => {
            header.addEventListener('click', () => {
                const section = header.parentElement;
                section.classList.toggle('expanded');
            });
        });

        // Initially expand first section
        const firstSection = document.querySelector('.nav-section');
        if (firstSection) {
            firstSection.classList.add('expanded');
        }
    }

    setupCategoryToggles() {
        // Category parent toggles
        const categoryToggles = document.querySelectorAll('.category-toggle, .exam-toggle');
        categoryToggles.forEach(toggle => {
            toggle.addEventListener('click', (e) => {
                e.preventDefault();
                const parent = toggle.parentElement;
                parent.classList.toggle('expanded');
            });
        });
    }

    setupNavigationLinks() {
        const navLinks = document.querySelectorAll('.nav-list a[data-view], .nav-list a[data-category], .nav-list a[data-exam]');
        navLinks.forEach(link => {
            link.addEventListener('click', (e) => {
                e.preventDefault();
                
                // Remove active class from all links
                navLinks.forEach(l => l.classList.remove('active'));
                // Add active class to clicked link
                link.classList.add('active');

                const view = link.dataset.view;
                const category = link.dataset.category;
                const exam = link.dataset.exam;

                if (view) {
                    this.switchView(view);
                } else if (category) {
                    this.filterByCategory(category);
                } else if (exam) {
                    this.filterByExam(exam);
                }
            });
        });
    }

    toggleSidebar() {
        this.sidebar.classList.toggle('collapsed');
    }

    switchView(viewName) {
        // Hide all content views
        const contentViews = document.querySelectorAll('.content-view, .welcome-screen');
        contentViews.forEach(view => {
            view.style.display = 'none';
        });

        // Show selected view
        let targetView;
        switch (viewName) {
            case 'all-notes':
                targetView = document.getElementById('notes-list-view');
                this.loadAllNotes();
                break;
            case 'recent-notes':
                targetView = document.getElementById('notes-list-view');
                this.loadRecentNotes();
                break;
            case 'favorites':
                targetView = document.getElementById('notes-list-view');
                this.loadFavoriteNotes();
                break;
            case 'trash':
                targetView = document.getElementById('notes-list-view');
                this.loadTrashedNotes();
                break;
            case 'flashcard-sets':
                targetView = document.getElementById('flashcard-sets-view');
                this.loadFlashcardSets();
                break;
            case 'quiz-sets':
                targetView = document.getElementById('quiz-sets-view');
                this.loadQuizSets();
                break;
            case 'mindmaps':
                targetView = document.getElementById('notes-list-view');
                this.loadMindmaps();
                break;
            case 'canvases':
                targetView = document.getElementById('canvas-view');
                this.loadCanvases();
                break;
            default:
                targetView = document.getElementById('welcome-screen');
        }

        if (targetView) {
            targetView.style.display = 'block';
            this.currentView = viewName;
        }
    }

    filterByCategory(category) {
        this.switchView('all-notes');
        // TODO: Filter notes by category
        console.log('Filtering by category:', category);
    }

    filterByExam(exam) {
        this.switchView('all-notes');
        // TODO: Filter notes by exam type
        console.log('Filtering by exam:', exam);
    }

    // Modal opening functions
    openNewNoteModal() {
        // Instead of opening modal, scroll to input section
        const inputSection = document.querySelector('.unified-input-section');
        if (inputSection) {
            inputSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
            // Focus on title input if available
            const titleInput = document.getElementById('note-title-input');
            if (titleInput) {
                setTimeout(() => titleInput.focus(), 500);
            }
        }
    }

    openNewFlashcardSetModal() {
        window.modalManager?.openFlashcardSetModal();
    }

    openNewQuizSetModal() {
        window.modalManager?.openQuizSetModal();
    }

    openCanvasModal() {
        window.modalManager?.openCanvasModal();
    }

    // Data loading functions
    loadAllNotes() {
        const notesGrid = document.getElementById('notes-grid');
        if (notesGrid) {
            notesGrid.innerHTML = this.generateNotesHTML(this.getAllNotes());
        }
    }

    loadRecentNotes() {
        const notesGrid = document.getElementById('notes-grid');
        if (notesGrid) {
            notesGrid.innerHTML = this.generateNotesHTML(this.getRecentNotes());
        }
    }

    loadFavoriteNotes() {
        const notesGrid = document.getElementById('notes-grid');
        if (notesGrid) {
            notesGrid.innerHTML = this.generateNotesHTML(this.getFavoriteNotes());
        }
    }

    loadTrashedNotes() {
        const notesGrid = document.getElementById('notes-grid');
        if (notesGrid) {
            notesGrid.innerHTML = this.generateNotesHTML(this.getTrashedNotes());
        }
    }

    loadFlashcardSets() {
        const flashcardGrid = document.getElementById('flashcard-sets-grid');
        if (flashcardGrid) {
            flashcardGrid.innerHTML = this.generateFlashcardSetsHTML(this.getFlashcardSets());
        }
    }

    loadQuizSets() {
        const quizGrid = document.getElementById('quiz-sets-grid');
        if (quizGrid) {
            quizGrid.innerHTML = this.generateQuizSetsHTML(this.getQuizSets());
        }
    }

    loadMindmaps() {
        // TODO: Load mindmaps
        console.log('Loading mindmaps...');
    }

    loadCanvases() {
        // TODO: Load canvases
        console.log('Loading canvases...');
    }

    // Data retrieval functions (mock data for now)
    getAllNotes() {
        return JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
    }

    getRecentNotes() {
        const notes = this.getAllNotes();
        return notes.sort((a, b) => new Date(b.lastModified) - new Date(a.lastModified)).slice(0, 10);
    }

    getFavoriteNotes() {
        const notes = this.getAllNotes();
        return notes.filter(note => note.isFavorite);
    }

    getTrashedNotes() {
        return JSON.parse(localStorage.getItem('nexlearn_trashed_notes') || '[]');
    }

    getFlashcardSets() {
        return JSON.parse(localStorage.getItem('nexlearn_flashcard_sets') || '[]');
    }

    getQuizSets() {
        return JSON.parse(localStorage.getItem('nexlearn_quiz_sets') || '[]');
    }

    // HTML generation functions
    generateNotesHTML(notes) {
        if (notes.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-sticky-note empty-icon"></i>
                    <h3>還沒有筆記</h3>
                    <p>點擊「新增筆記」開始您的學習之旅</p>
                    <button class="btn-primary" onclick="sidebarManager.openNewNoteModal()">
                        <i class="fas fa-plus"></i> 建立第一個筆記
                    </button>
                </div>
            `;
        }

        return notes.map(note => `
            <div class="note-card" data-note-id="${note.id}">
                <div class="note-header">
                    <h3 class="note-title">${note.title || '未命名筆記'}</h3>
                    <div class="note-actions">
                        <button class="note-action-btn" onclick="this.editNote('${note.id}')">
                            <i class="fas fa-edit"></i>
                        </button>
                        <button class="note-action-btn" onclick="this.deleteNote('${note.id}')">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="note-content-preview">
                    ${note.content ? note.content.substring(0, 150) + '...' : '無內容'}
                </div>
                <div class="note-metadata">
                    <span class="note-course">${note.course || '未分類'}</span>
                    <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
                </div>
            </div>
        `).join('');
    }

    generateFlashcardSetsHTML(sets) {
        if (sets.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-layer-group empty-icon"></i>
                    <h3>還沒有記憶卡集</h3>
                    <p>從筆記生成記憶卡或手動建立</p>
                    <button class="btn-primary" onclick="sidebarManager.openNewFlashcardSetModal()">
                        <i class="fas fa-plus"></i> 建立記憶卡集
                    </button>
                </div>
            `;
        }

        return sets.map(set => `
            <div class="flashcard-set-card" data-set-id="${set.id}">
                <div class="set-header">
                    <h3 class="set-title">${set.title}</h3>
                    <span class="card-count">${set.cards?.length || 0} 張卡片</span>
                </div>
                <div class="set-actions">
                    <button class="btn-secondary" onclick="this.studyFlashcards('${set.id}')">
                        <i class="fas fa-play"></i> 開始學習
                    </button>
                    <button class="btn-secondary" onclick="this.editFlashcardSet('${set.id}')">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                </div>
            </div>
        `).join('');
    }

    generateQuizSetsHTML(sets) {
        if (sets.length === 0) {
            return `
                <div class="empty-state">
                    <i class="fas fa-question-circle empty-icon"></i>
                    <h3>還沒有測驗集</h3>
                    <p>從筆記生成測驗或手動建立</p>
                    <button class="btn-primary" onclick="sidebarManager.openNewQuizSetModal()">
                        <i class="fas fa-plus"></i> 建立測驗集
                    </button>
                </div>
            `;
        }

        return sets.map(set => `
            <div class="quiz-set-card" data-set-id="${set.id}">
                <div class="set-header">
                    <h3 class="set-title">${set.title}</h3>
                    <span class="question-count">${set.questions?.length || 0} 道題目</span>
                </div>
                <div class="set-actions">
                    <button class="btn-secondary" onclick="this.startQuiz('${set.id}')">
                        <i class="fas fa-play"></i> 開始測驗
                    </button>
                    <button class="btn-secondary" onclick="this.editQuizSet('${set.id}')">
                        <i class="fas fa-edit"></i> 編輯
                    </button>
                </div>
            </div>
        `).join('');
    }

    // Note actions
    editNote(noteId) {
        // TODO: Implement note editing
        console.log('Editing note:', noteId);
    }

    deleteNote(noteId) {
        if (confirm('確定要刪除這個筆記嗎？')) {
            const notes = this.getAllNotes();
            const updatedNotes = notes.filter(note => note.id !== noteId);
            localStorage.setItem('nexlearn_notes', JSON.stringify(updatedNotes));
            this.loadAllNotes();
        }
    }

    // Flashcard actions
    studyFlashcards(setId) {
        // TODO: Implement flashcard study mode
        console.log('Starting flashcard study:', setId);
    }

    editFlashcardSet(setId) {
        // TODO: Implement flashcard set editing
        console.log('Editing flashcard set:', setId);
    }

    // Quiz actions
    startQuiz(setId) {
        // TODO: Implement quiz mode
        console.log('Starting quiz:', setId);
    }

    editQuizSet(setId) {
        // TODO: Implement quiz set editing
        console.log('Editing quiz set:', setId);
    }
}

// Global functions for modal opening
function openNewNoteModal() {
    window.modalManager?.openNewNoteModal();
}

function openNewFlashcardSetModal() {
    window.modalManager?.openFlashcardSetModal();
}

function openNewQuizSetModal() {
    window.modalManager?.openQuizSetModal();
}

function showTutorial() {
    // TODO: Implement tutorial
    alert('教學功能即將推出！');
}

// Initialize sidebar when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.sidebarManager = new SidebarManager();
});