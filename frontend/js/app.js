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
        initializeViewToggle();
    }
    
    // Initialize new unified system
    console.log('NexLearn AI Notes initialized with new UI system');
    
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
            if (btn.dataset.view === 'mindmap' && currentNotes) {
                renderMindmap(currentNotes);
            } else if (btn.dataset.view === 'flashcards' && currentNotes && currentFlashcards.length === 0) {
                generateFlashcards();
            } else if (btn.dataset.view === 'quiz' && currentNotes && currentQuiz.length === 0) {
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
    if (!currentNotes) return;
    
    showLoading();
    
    try {
        const selectedLanguage = document.querySelector('input[name="language"]:checked')?.value || 'zh-tw';
        
        const response = await fetch(`${API_BASE_URL}/generate-flashcards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notes: currentNotes,
                language: selectedLanguage
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        currentFlashcards = data.flashcards;
        displayFlashcards();
        
    } catch (error) {
        alert('無法生成記憶卡片：' + error.message);
    } finally {
        hideLoading();
    }
}

// Display flashcards
function displayFlashcards() {
    const container = document.getElementById('flashcards-container');
    container.innerHTML = '';
    
    currentFlashcards.forEach((card, index) => {
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
    if (!currentNotes) return;
    
    showLoading();
    
    try {
        const selectedLanguage = document.querySelector('input[name="language"]:checked')?.value || 'zh-tw';
        
        const response = await fetch(`${API_BASE_URL}/generate-quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                notes: currentNotes,
                language: selectedLanguage
            })
        });
        
        const data = await response.json();
        
        if (data.error) {
            throw new Error(data.error);
        }
        
        currentQuiz = data.quiz;
        displayQuiz();
        
    } catch (error) {
        alert('無法生成測驗：' + error.message);
    } finally {
        hideLoading();
    }
}

// Display quiz
function displayQuiz() {
    const container = document.getElementById('quiz-container');
    container.innerHTML = '';
    
    currentQuiz.forEach((question, qIndex) => {
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
    
    currentQuiz.forEach((question, qIndex) => {
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
    
    alert(`測驗結果：${correct}/${currentQuiz.length} 題正確`);
}

// Handle download
function handleDownload() {
    if (!currentNotes) return;
    
    const blob = new Blob([currentNotes], { type: 'text/markdown' });
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