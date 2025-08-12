// Global variables
let currentNotes = '';
let currentFlashcards = [];
let currentQuiz = [];

// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Initialize when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    // Initialize old system (for backward compatibility)
    if (document.querySelector('.tab-btn')) {
        initializeTabs();
        initializeEventListeners();
    }
    
    // Always initialize view toggle for output section
    initializeViewToggle();
    
    // Initialize new unified system
    console.log('NexLearn AI Notes initialized with new UI system');
    
    // Initialize unified note generation
    initializeUnifiedNoteGeneration();
    
    // Dispatch note generation events for flashcard integration
    window.dispatchNoteGenerated = function(noteData) {
        const event = new CustomEvent('noteGenerated', {
            detail: { noteData: noteData }
        });
        document.dispatchEvent(event);
    };
});

// Initialize tabs
function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

// Initialize event listeners
function initializeEventListeners() {
    // YouTube submit
    document.getElementById('youtube-submit').addEventListener('click', handleYouTubeSubmit);
    
    // PDF upload
    const pdfInput = document.getElementById('pdf-file');
    pdfInput.addEventListener('change', handleFileSelect);
    document.getElementById('pdf-submit').addEventListener('click', handlePDFSubmit);
    
    // Text submit
    document.getElementById('text-submit').addEventListener('click', handleTextSubmit);
    
    // Action buttons
    document.getElementById('download-btn').addEventListener('click', handleDownload);
    document.getElementById('copy-btn').addEventListener('click', handleCopy);
    document.getElementById('save-btn').addEventListener('click', handleSave);
    
    // Enter key for YouTube URL
    document.getElementById('youtube-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleYouTubeSubmit();
    });
}

// Initialize view toggle
function initializeViewToggle() {
    const viewBtns = document.querySelectorAll('.view-btn');
    const viewContents = document.querySelectorAll('.view-content');
    
    viewBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active class from all
            viewBtns.forEach(b => b.classList.remove('active'));
            viewContents.forEach(c => c.classList.remove('active'));
            
            // Add active class to clicked
            btn.classList.add('active');
            const viewId = btn.dataset.view + '-view';
            document.getElementById(viewId).classList.add('active');
            
            // Load content for specific views
            if (btn.dataset.view === 'mindmap' && window.currentNotes) {
                renderMindmap(window.currentNotes);
            } else if (btn.dataset.view === 'flashcards' && window.currentNotes && (!window.currentFlashcards || window.currentFlashcards.length === 0)) {
                generateFlashcards();
            } else if (btn.dataset.view === 'quiz' && window.currentNotes && (!window.currentQuiz || window.currentQuiz.length === 0)) {
                generateQuiz();
            }
        });
    });
}

// Handle YouTube submit
async function handleYouTubeSubmit() {
    const url = document.getElementById('youtube-url').value.trim();
    
    if (!url) {
        alert('請輸入YouTube網址');
        return;
    }
    
    const detailLevel = document.querySelector('input[name="detail"]:checked').value;
    const language = document.querySelector('input[name="language"]:checked').value;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/youtube-to-notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                youtube_url: url,
                detail_level: detailLevel,
                language: language
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayNotes(data.notes);
        currentNotes = data.notes;
        
    } catch (error) {
        alert('錯誤：' + error.message);
    } finally {
        hideLoading();
    }
}

// Handle PDF submit
async function handlePDFSubmit() {
    const fileInput = document.getElementById('pdf-file');
    const file = fileInput.files[0];
    
    if (!file) {
        alert('請選擇PDF文件');
        return;
    }
    
    const detailLevel = document.querySelector('input[name="detail"]:checked').value;
    const language = document.querySelector('input[name="language"]:checked').value;
    
    showLoading();
    
    try {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('detail_level', detailLevel);
        formData.append('language', language);
        
        const response = await fetch(`${API_BASE_URL}/pdf-to-notes`, {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayNotes(data.notes);
        currentNotes = data.notes;
        
    } catch (error) {
        alert('錯誤：' + error.message);
    } finally {
        hideLoading();
    }
}

// Handle text submit
async function handleTextSubmit() {
    const text = document.getElementById('text-input').value.trim();
    
    if (!text) {
        alert('請輸入文字內容');
        return;
    }
    
    const detailLevel = document.querySelector('input[name="detail"]:checked').value;
    const language = document.querySelector('input[name="language"]:checked').value;
    
    showLoading();
    
    try {
        const response = await fetch(`${API_BASE_URL}/text-to-notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                text: text,
                detail_level: detailLevel,
                language: language
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        displayNotes(data.notes);
        currentNotes = data.notes;
        
    } catch (error) {
        alert('錯誤：' + error.message);
    } finally {
        hideLoading();
    }
}

// Handle file select
function handleFileSelect(e) {
    const file = e.target.files[0];
    if (file) {
        document.getElementById('file-name').textContent = `已選擇：${file.name}`;
        document.getElementById('pdf-submit').style.display = 'block';
    }
}

// Display notes
function displayNotes(notes) {
    // Convert markdown to HTML
    const html = marked.parse(notes);
    document.getElementById('notes-content').innerHTML = html;
    
    // Show output section
    document.getElementById('output-section').style.display = 'block';
    
    // Reset other views
    currentFlashcards = [];
    currentQuiz = [];
    document.getElementById('flashcards-container').innerHTML = '';
    document.getElementById('quiz-container').innerHTML = '';
}

// Generate flashcards
async function generateFlashcards() {
    if (!window.currentNotes) return;
    
    // Show loading in flashcards container
    const container = document.getElementById('flashcards-container');
    if (container) {
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> 生成記憶卡中...</div>';
    }
    
    try {
        const selectedLanguage = document.querySelector('input[name="language"]:checked')?.value || 'zh-tw';
        
        const response = await fetch(`${API_BASE_URL}/generate-flashcards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                note_content: window.currentNotes,
                count: 15,
                difficulty: 'medium',
                types: ['definition', 'example'],
                language: selectedLanguage
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        window.currentFlashcards = data.flashcards;
        displayFlashcards();
        
    } catch (error) {
        const container = document.getElementById('flashcards-container');
        if (container) {
            container.innerHTML = '<div class="error-state">生成記憶卡失敗：' + error.message + '</div>';
        }
    }
}

// Display flashcards
function displayFlashcards() {
    const container = document.getElementById('flashcards-container');
    container.innerHTML = '';
    
    if (!window.currentFlashcards || window.currentFlashcards.length === 0) {
        container.innerHTML = '<div class="empty-state">沒有記憶卡</div>';
        return;
    }
    
    window.currentFlashcards.forEach((card, index) => {
        const cardDiv = document.createElement('div');
        cardDiv.className = 'flashcard';
        cardDiv.innerHTML = `
            <div class="flashcard-question">Q: ${card.question}</div>
            <div class="flashcard-answer">A: ${card.answer}</div>
        `;
        
        cardDiv.addEventListener('click', () => {
            cardDiv.classList.toggle('flipped');
        });
        
        container.appendChild(cardDiv);
    });
}

// Generate quiz
async function generateQuiz() {
    if (!window.currentNotes) return;
    
    // Show loading in quiz container
    const container = document.getElementById('quiz-container');
    if (container) {
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i> 生成測驗中...</div>';
    }
    
    try {
        const selectedLanguage = document.querySelector('input[name="language"]:checked')?.value || 'zh-tw';
        
        const response = await fetch(`${API_BASE_URL}/generate-quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notes: window.currentNotes,
                language: selectedLanguage
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        window.currentQuiz = data.quiz;
        displayQuiz();
        
    } catch (error) {
        const container = document.getElementById('quiz-container');
        if (container) {
            container.innerHTML = '<div class="error-state">生成測驗失敗：' + error.message + '</div>';
        }
    }
}

// Display quiz
function displayQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    
    if (!window.currentQuiz || window.currentQuiz.length === 0) {
        container.innerHTML = '<div class="empty-state">沒有測驗</div>';
        return;
    }
    
    window.currentQuiz.forEach((question, qIndex) => {
        const questionDiv = document.createElement('div');
        questionDiv.className = 'quiz-question';
        
        let optionsHtml = '';
        question.options.forEach((option, oIndex) => {
            optionsHtml += `
                <div class="quiz-option" data-question="${qIndex}" data-option="${oIndex}">
                    ${option}
                </div>
            `;
        });
        
        questionDiv.innerHTML = `
            <h3>問題 ${qIndex + 1}: ${question.question}</h3>
            <div class="quiz-options">
                ${optionsHtml}
            </div>
        `;
        
        container.appendChild(questionDiv);
    });
    
    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'quiz-submit';
    submitBtn.textContent = '提交答案';
    submitBtn.addEventListener('click', checkQuizAnswers);
    container.appendChild(submitBtn);
    
    // Add click handlers to options
    document.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            const qIndex = this.dataset.question;
            
            // Remove selected from other options in same question
            document.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            
            this.classList.add('selected');
        });
    });
}

// Check quiz answers
function checkQuizAnswers() {
    let correct = 0;
    
    window.currentQuiz.forEach((question, qIndex) => {
        const selected = document.querySelector(`.quiz-option[data-question="${qIndex}"].selected`);
        
        if (selected) {
            const selectedOption = parseInt(selected.dataset.option);
            
            // Find correct option index - try multiple matching methods
            let correctOption = -1;
            
            // Method 1: Match by letter (A, B, C, D)
            const correctLetter = question.correct.toUpperCase().trim();
            const letters = ['A', 'B', 'C', 'D'];
            correctOption = letters.indexOf(correctLetter);
            
            // Method 2: If not found, try matching option text that starts with the letter
            if (correctOption === -1) {
                correctOption = question.options.findIndex(opt => 
                    opt.trim().toUpperCase().startsWith(correctLetter + '.')
                );
            }
            
            // Method 3: If still not found, try direct text match
            if (correctOption === -1) {
                correctOption = question.options.findIndex(opt => 
                    opt.trim().toUpperCase().includes(correctLetter)
                );
            }
            
            // Fallback: default to first option if nothing found
            if (correctOption === -1) {
                correctOption = 0;
            }
            
            console.log(`Question ${qIndex}: Selected=${selectedOption}, Correct=${correctOption}, Letter=${correctLetter}`);
            
            if (selectedOption === correctOption) {
                selected.classList.add('correct');
                correct++;
            } else {
                selected.classList.add('incorrect');
                // Show correct answer
                const correctElement = document.querySelector(`.quiz-option[data-question="${qIndex}"][data-option="${correctOption}"]`);
                if (correctElement) {
                    correctElement.classList.add('correct');
                }
            }
        }
    });
    
    alert(`測驗結果：${correct}/${window.currentQuiz.length} 題正確`);
}

// Handle download
function handleDownload() {
    if (!window.currentNotes) return;
    
    const blob = new Blob([window.currentNotes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'notes.md';
    a.click();
    URL.revokeObjectURL(url);
}

// Handle copy
function handleCopy() {
    if (!currentNotes) return;
    
    navigator.clipboard.writeText(currentNotes).then(() => {
        alert('筆記已複製到剪貼簿');
    });
}

// Handle save
function handleSave() {
    if (!currentNotes) return;
    
    // Save to localStorage
    const savedNotes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
    savedNotes.push({
        notes: currentNotes,
        date: new Date().toISOString(),
        title: currentNotes.split('\n')[0].replace('#', '').trim()
    });
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
    
    alert('筆記已儲存');
}

// Show loading
function showLoading() {
    document.getElementById('loading').style.display = 'block';
}

// Hide loading
function hideLoading() {
    document.getElementById('loading').style.display = 'none';
}

// Initialize unified note generation
function initializeUnifiedNoteGeneration() {
    const generateBtn = document.getElementById('generate-unified-notes');
    if (generateBtn) {
        generateBtn.addEventListener('click', async function() {
            // Show loading state
            this.disabled = true;
            this.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';

            try {
                // Collect all input data
                const inputData = collectInputData();
                
                if (!validateInputData(inputData)) {
                    throw new Error('請至少提供一個學習資源');
                }

                // Call unified notes API
                const result = await callUnifiedNotesAPI(inputData);
                
                // Save the note
                saveNote(result);
                
                // Trigger flashcard generation suggestion
                if (window.dispatchNoteGenerated) {
                    window.dispatchNoteGenerated(result);
                }
                
                // Display the generated notes
                displayNotesInOutputSection(result);
                
                // Show success
                alert('筆記生成成功！');

            } catch (error) {
                console.error('Notes generation error:', error);
                alert('生成筆記時發生錯誤：' + error.message);
            } finally {
                // Restore button state
                this.disabled = false;
                this.innerHTML = '<i class="fas fa-magic"></i><span>🚀 生成統一學習筆記</span><small>整合所有資源生成完整筆記</small>';
            }
        });
    }
}

function collectInputData() {
    const data = {
        title: document.getElementById('note-title-input')?.value || '',
        examSystem: document.getElementById('exam-system-select')?.value || '',
        subject: document.getElementById('subject-select')?.value || '',
        topic: document.getElementById('topic-select')?.value || '',
        customTopic: document.getElementById('custom-topic-input')?.value || '',
        detailLevel: document.querySelector('.detail-btn.active')?.dataset.level || 'medium',
        language: document.querySelector('.lang-btn.active')?.dataset.lang || 'zh-tw',
        sources: {
            youtube: collectSourceValues('youtube'),
            files: collectSourceValues('files'),
            text: collectSourceValues('text'),
            webpages: collectSourceValues('webpages')
        }
    };
    return data;
}

function collectSourceValues(type) {
    const container = document.querySelector(`#${type}-sources-container`);
    if (!container) return [];
    
    const inputs = container.querySelectorAll('.source-input');
    return Array.from(inputs).map(input => input.value.trim()).filter(value => value !== '');
}

function validateInputData(data) {
    const hasYoutube = data.sources.youtube.length > 0;
    const hasFiles = data.sources.files.length > 0;
    const hasText = data.sources.text.length > 0;
    const hasWebpages = data.sources.webpages.length > 0;
    
    return hasYoutube || hasFiles || hasText || hasWebpages;
}

async function callUnifiedNotesAPI(inputData) {
    try {
        const response = await fetch('http://localhost:5000/api/unified-notes', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (!data.success) {
            throw new Error(data.error || '生成失敗');
        }
        
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
    } catch (error) {
        console.error('Unified notes API error:', error);
        throw error;
    }
}

function saveNote(noteData) {
    // Save to localStorage
    const savedNotes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
    savedNotes.push(noteData);
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
}

function displayNotesInOutputSection(noteData) {
    // Store current notes globally (both old and new format for compatibility)
    window.currentNotes = noteData.content;
    window.currentNoteData = noteData;
    
    // Also store in old format for compatibility
    window.currentFlashcards = [];
    window.currentQuiz = [];
    
    // Convert markdown to HTML
    const html = marked.parse(noteData.content);
    
    // Display in notes content area
    const notesContent = document.getElementById('notes-content');
    if (notesContent) {
        notesContent.innerHTML = html;
    }
    
    // Show output section
    const outputSection = document.getElementById('output-section');
    if (outputSection) {
        outputSection.style.display = 'block';
    }
    
    // Switch to notes view
    const notesView = document.getElementById('notes-view');
    if (notesView) {
        // Hide all view contents
        document.querySelectorAll('.view-content').forEach(view => {
            view.classList.remove('active');
        });
        
        // Show notes view
        notesView.classList.add('active');
        
        // Activate notes button
        document.querySelectorAll('.view-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        const notesBtn = document.querySelector('.view-btn[data-view="notes"]');
        if (notesBtn) {
            notesBtn.classList.add('active');
        }
    }
    
    // Reset other views
    window.currentFlashcards = [];
    window.currentQuiz = [];
    
    // Clear other containers
    const flashcardsContainer = document.getElementById('flashcards-container');
    if (flashcardsContainer) {
        flashcardsContainer.innerHTML = '';
    }
    
    const quizContainer = document.getElementById('quiz-container');
    if (quizContainer) {
        quizContainer.innerHTML = '';
    }
    
    // Scroll to output section
    outputSection?.scrollIntoView({ behavior: 'smooth' });
}