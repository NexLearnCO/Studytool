// Modal Management System

class ModalManager {
    constructor() {
        this.currentModal = null;
        this.initializeEventListeners();
        this.moveUnifiedInputToModal();
    }

    initializeEventListeners() {
        // Close modal when clicking outside
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('modal')) {
                this.closeCurrentModal();
            }
        });

        // Close modal with Escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.currentModal) {
                this.closeCurrentModal();
            }
        });

        // Setup modal close buttons
        const closeButtons = document.querySelectorAll('.modal-close');
        closeButtons.forEach(btn => {
            btn.addEventListener('click', () => this.closeCurrentModal());
        });

        // Setup creation mode toggles
        this.setupCreationModeToggles();
        
        // Setup form interactions
        this.setupFormInteractions();
    }

    moveUnifiedInputToModal() {
        // Move the unified input section from main container to modal
        const unifiedSection = document.querySelector('.unified-input-section');
        const modalUnifiedInput = document.getElementById('modal-unified-input');
        
        if (unifiedSection && modalUnifiedInput) {
            modalUnifiedInput.appendChild(unifiedSection);
            unifiedSection.style.display = 'block';
        }
    }

    setupCreationModeToggles() {
        // Flashcard creation mode toggles
        const optionCards = document.querySelectorAll('.option-card');
        optionCards.forEach(card => {
            card.addEventListener('click', () => {
                // Remove active from all cards
                optionCards.forEach(c => c.classList.remove('active'));
                // Add active to clicked card
                card.classList.add('active');
                
                // Show corresponding mode
                const mode = card.dataset.mode;
                this.switchCreationMode(mode);
            });
        });

        // Quiz type selection
        const quizTypeCards = document.querySelectorAll('.quiz-type-card');
        quizTypeCards.forEach(card => {
            card.addEventListener('click', () => {
                quizTypeCards.forEach(c => c.classList.remove('active'));
                card.classList.add('active');
            });
        });
    }

    setupFormInteractions() {
        // Detail level buttons
        const detailBtns = document.querySelectorAll('.detail-btn');
        detailBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                detailBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Language buttons
        const langBtns = document.querySelectorAll('.lang-btn');
        langBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                langBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Difficulty buttons
        const difficultyBtns = document.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        // Add source buttons
        const addSourceBtns = document.querySelectorAll('.add-source-btn');
        addSourceBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                const type = btn.dataset.type;
                this.addNewSource(type);
            });
        });

        // Remove source buttons (event delegation)
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('remove-source-btn')) {
                this.removeSource(e.target);
            }
        });

        // Setup unified generate button
        const generateBtn = document.getElementById('generate-unified-notes');
        if (generateBtn) {
            generateBtn.addEventListener('click', () => this.generateUnifiedNotes());
        }
    }

    // Modal opening functions
    openNewNoteModal() {
        this.showModal('new-note-modal');
    }

    openFlashcardSetModal() {
        this.showModal('flashcard-set-modal');
        this.populateNoteSources();
    }

    openQuizSetModal() {
        this.showModal('quiz-set-modal');
        this.populateNoteSources();
    }

    openCanvasModal() {
        this.showModal('canvas-modal');
        this.initializeCanvas();
    }

    showModal(modalId) {
        // Close current modal if any
        this.closeCurrentModal();
        
        const modal = document.getElementById(modalId);
        if (modal) {
            modal.style.display = 'flex';
            this.currentModal = modal;
            document.body.style.overflow = 'hidden'; // Prevent background scrolling
        }
    }

    closeCurrentModal() {
        if (this.currentModal) {
            this.currentModal.style.display = 'none';
            this.currentModal = null;
            document.body.style.overflow = 'auto'; // Restore scrolling
        }
    }

    // Creation mode switching
    switchCreationMode(mode) {
        const modes = document.querySelectorAll('.creation-mode');
        modes.forEach(m => m.classList.remove('active'));
        
        const targetMode = document.getElementById(`${mode}-mode`);
        if (targetMode) {
            targetMode.classList.add('active');
        }
    }

    // Source management
    addNewSource(type) {
        const container = document.getElementById(`${type}-sources`);
        if (!container) return;

        let sourceHTML = '';
        switch (type) {
            case 'youtube':
                sourceHTML = `
                    <div class="source-item">
                        <input type="text" class="youtube-url-input" placeholder="貼上 YouTube 影片網址...">
                        <button class="remove-source-btn">×</button>
                    </div>
                `;
                break;
            case 'text':
                sourceHTML = `
                    <div class="source-item">
                        <textarea class="text-content-input" placeholder="貼上或輸入文字內容..." rows="4"></textarea>
                        <button class="remove-source-btn">×</button>
                    </div>
                `;
                break;
            case 'webpage':
                sourceHTML = `
                    <div class="source-item">
                        <input type="text" class="webpage-url-input" placeholder="貼上網頁連結...">
                        <button class="remove-source-btn">×</button>
                    </div>
                `;
                break;
        }

        if (sourceHTML) {
            container.insertAdjacentHTML('beforeend', sourceHTML);
        }
    }

    removeSource(button) {
        const sourceItem = button.closest('.source-item');
        if (sourceItem) {
            sourceItem.classList.add('removing');
            setTimeout(() => sourceItem.remove(), 300);
        }
    }

    // Unified notes generation
    async generateUnifiedNotes() {
        const generateBtn = document.getElementById('generate-unified-notes');
        if (!generateBtn) return;

        // Show loading state
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';

        try {
            // Collect all input data
            const inputData = this.collectInputData();
            
            if (!this.validateInputData(inputData)) {
                throw new Error('請至少提供一個學習資源');
            }

            // Call unified notes API
            const result = await this.callUnifiedNotesAPI(inputData);
            
            // Save the note
            this.saveNote(result);
            
            // Trigger flashcard generation suggestion
            if (window.dispatchNoteGenerated) {
                window.dispatchNoteGenerated(result);
            }
            
            // Show success and close modal
            alert('筆記生成成功！');
            this.closeCurrentModal();
            
            // Switch to notes view
            window.sidebarManager?.switchView('all-notes');

        } catch (error) {
            console.error('Notes generation error:', error);
            alert('生成筆記時發生錯誤：' + error.message);
        } finally {
            // Restore button state
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i><span>🚀 生成統一學習筆記</span><small>整合所有資源生成完整筆記</small>';
        }
    }

    collectInputData() {
        const data = {
            title: document.getElementById('note-title-input')?.value || '',
            examSystem: document.getElementById('exam-system-select')?.value || '',
            subject: document.getElementById('subject-select')?.value || '',
            topic: document.getElementById('topic-select')?.value || '',
            customTopic: document.getElementById('custom-topic-input')?.value || '',
            detailLevel: document.querySelector('.detail-btn.active')?.dataset.level || 'medium',
            language: document.querySelector('.lang-btn.active')?.dataset.lang || 'zh-tw',
            sources: {
                youtube: [],
                files: [],
                text: [],
                webpages: []
            }
        };

        // Collect YouTube URLs
        const youtubeInputs = document.querySelectorAll('.youtube-url-input');
        youtubeInputs.forEach(input => {
            if (input.value.trim()) {
                data.sources.youtube.push(input.value.trim());
            }
        });

        // Collect text content
        const textInputs = document.querySelectorAll('.text-content-input');
        textInputs.forEach(input => {
            if (input.value.trim()) {
                data.sources.text.push(input.value.trim());
            }
        });

        // Collect webpage URLs
        const webpageInputs = document.querySelectorAll('.webpage-url-input');
        webpageInputs.forEach(input => {
            if (input.value.trim()) {
                data.sources.webpages.push(input.value.trim());
            }
        });

        // Collect files
        const fileInput = document.getElementById('file-input');
        if (fileInput && fileInput.files.length > 0) {
            data.sources.files = Array.from(fileInput.files);
        }

        return data;
    }

    validateInputData(data) {
        return data.sources.youtube.length > 0 || 
               data.sources.files.length > 0 || 
               data.sources.text.length > 0 || 
               data.sources.webpages.length > 0;
    }

    async callUnifiedNotesAPI(inputData) {
        try {
            const response = await fetch('/api/unified-notes', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(inputData)
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'API 調用失敗');
            }

            const data = await response.json();
            
            if (data.success) {
                return {
                    id: Date.now().toString(),
                    title: data.title,
                    examSystem: data.exam_system,
                    subject: data.subject,
                    topic: data.topic,
                    customTopic: data.custom_topic,
                    content: data.notes,
                    sources: data.sources,
                    detailLevel: inputData.detailLevel,
                    language: inputData.language,
                    createdAt: new Date().toISOString(),
                    lastModified: new Date().toISOString(),
                    wordCount: data.word_count
                };
            } else {
                throw new Error('API 返回失敗狀態');
            }

        } catch (error) {
            console.error('Unified notes API error:', error);
            throw error;
        }
    }

    async processUnifiedInputOld(inputData) {
        let allContent = [];
        let allNotes = '';
        
        // Process YouTube videos
        for (const url of inputData.sources.youtube) {
            try {
                const response = await fetch('/api/youtube-to-notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        youtube_url: url,
                        detail_level: inputData.detailLevel,
                        language: inputData.language
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    allContent.push({
                        type: 'youtube',
                        url: url,
                        content: result.transcript,
                        notes: result.notes
                    });
                    allNotes += result.notes + '\n\n';
                }
            } catch (error) {
                console.error('YouTube processing error:', error);
            }
        }

        // Process text content
        for (const text of inputData.sources.text) {
            try {
                const response = await fetch('/api/text-to-notes', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({
                        text_content: text,
                        detail_level: inputData.detailLevel,
                        language: inputData.language
                    })
                });
                
                const result = await response.json();
                if (result.success) {
                    allContent.push({
                        type: 'text',
                        content: text,
                        notes: result.notes
                    });
                    allNotes += result.notes + '\n\n';
                }
            } catch (error) {
                console.error('Text processing error:', error);
            }
        }

        // Process PDF files
        for (const file of inputData.sources.files) {
            if (file.type === 'application/pdf') {
                try {
                    const formData = new FormData();
                    formData.append('pdf_file', file);
                    formData.append('detail_level', inputData.detailLevel);
                    formData.append('language', inputData.language);
                    
                    const response = await fetch('/api/pdf-to-notes', {
                        method: 'POST',
                        body: formData
                    });
                    
                    const result = await response.json();
                    if (result.success) {
                        allContent.push({
                            type: 'pdf',
                            filename: file.name,
                            content: result.text_content,
                            notes: result.notes
                        });
                        allNotes += result.notes + '\n\n';
                    }
                } catch (error) {
                    console.error('PDF processing error:', error);
                }
            }
        }

        return {
            id: Date.now().toString(),
            title: inputData.title || '未命名筆記',
            examSystem: inputData.examSystem,
            subject: inputData.subject,
            topic: inputData.topic,
            customTopic: inputData.customTopic,
            content: allNotes,
            sources: allContent,
            detailLevel: inputData.detailLevel,
            language: inputData.language,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };
    }

    saveNote(noteData) {
        const notes = JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
        notes.unshift(noteData); // Add to beginning
        localStorage.setItem('nexlearn_notes', JSON.stringify(notes));
    }

    // Populate note sources for flashcard/quiz creation
    populateNoteSources() {
        const notes = JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
        const selects = document.querySelectorAll('#note-source-select, #quiz-source-select');
        
        selects.forEach(select => {
            select.innerHTML = '<option value="">選擇現有筆記...</option>';
            notes.forEach(note => {
                const option = document.createElement('option');
                option.value = note.id;
                option.textContent = note.title;
                select.appendChild(option);
            });
        });
    }

    // Canvas initialization
    initializeCanvas() {
        // TODO: Initialize canvas functionality
        console.log('Initializing canvas...');
    }
}

// Global modal functions
function closeNewNoteModal() {
    window.modalManager?.closeCurrentModal();
}

function closeFlashcardSetModal() {
    window.modalManager?.closeCurrentModal();
}

function closeQuizSetModal() {
    window.modalManager?.closeCurrentModal();
}

function closeCanvasModal() {
    window.modalManager?.closeCurrentModal();
}

function createFlashcardSet() {
    // TODO: Implement flashcard set creation
    alert('記憶卡集創建功能即將推出！');
}

function createQuizSet() {
    // TODO: Implement quiz set creation
    alert('測驗集創建功能即將推出！');
}

function clearCanvas() {
    // TODO: Implement canvas clearing
    alert('清除畫板功能即將推出！');
}

function saveCanvas() {
    // TODO: Implement canvas saving
    alert('保存畫板功能即將推出！');
}

// Initialize modal manager when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    window.modalManager = new ModalManager();
});