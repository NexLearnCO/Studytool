// NexLearn AI Notes - Simple and Clean Frontend
// API Base URL
const API_BASE_URL = 'http://localhost:5000/api';

// Global state
let currentNotes = '';
let currentFlashcards = [];
let currentQuiz = [];

// Initialize app when DOM is loaded
document.addEventListener('DOMContentLoaded', function() {
    console.log('🚀 NexLearn AI Notes initialized');
    
    // Initialize all components
    initializeTabs();
    initializeSourceManagement();
    initializeGeneration();
    initializeViewTabs();
    initializeActions();
    
    console.log('✅ All components initialized');
});

// =====================================================
// TAB MANAGEMENT
// =====================================================

function initializeTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            // Remove active from all
            tabBtns.forEach(b => b.classList.remove('active'));
            tabContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            btn.classList.add('active');
            const tabId = btn.dataset.tab + '-tab';
            document.getElementById(tabId).classList.add('active');
        });
    });
}

function initializeViewTabs() {
    const viewTabs = document.querySelectorAll('.view-tab');
    const viewContents = document.querySelectorAll('.view-content');
    
    viewTabs.forEach(tab => {
        tab.addEventListener('click', () => {
            // Remove active from all
            viewTabs.forEach(t => t.classList.remove('active'));
            viewContents.forEach(c => c.classList.remove('active'));
            
            // Add active to clicked
            tab.classList.add('active');
            const viewId = tab.dataset.view + '-view';
            document.getElementById(viewId).classList.add('active');
            
            // Load content if needed
            if (tab.dataset.view === 'mindmap' && currentNotes) {
                renderMindmap(currentNotes);
            }
        });
    });
}

// =====================================================
// SOURCE MANAGEMENT
// =====================================================

function initializeSourceManagement() {
    // YouTube
    document.getElementById('add-youtube-btn').addEventListener('click', addYouTubeSource);
    document.getElementById('youtube-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addYouTubeSource();
    });
    
    // Text
    document.getElementById('add-text-btn').addEventListener('click', addTextSource);
    
    // File
    document.getElementById('file-input').addEventListener('change', handleFileUpload);
    
    // Webpage
    document.getElementById('add-webpage-btn').addEventListener('click', addWebpageSource);
    document.getElementById('webpage-url').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') addWebpageSource();
    });
}

function addYouTubeSource() {
    const input = document.getElementById('youtube-url');
    const url = input.value.trim();
    
    if (!url) {
        alert('請輸入 YouTube 連結');
        return;
    }
    
    if (!isValidYouTubeUrl(url)) {
        alert('請輸入有效的 YouTube 連結');
        return;
    }
    
    addSourceItem('youtube-list', {
        type: 'youtube',
        url: url,
        title: 'YouTube 影片',
        data: url
    });
    
    input.value = '';
}

function addTextSource() {
    const textarea = document.getElementById('text-content');
    const content = textarea.value.trim();
    
    if (!content) {
        alert('請輸入文字內容');
        return;
    }
    
    addSourceItem('text-list', {
        type: 'text',
        title: '文字內容 (' + content.length + ' 字)',
        preview: content.substring(0, 100) + (content.length > 100 ? '...' : ''),
        data: content
    });
    
    textarea.value = '';
}

function handleFileUpload(e) {
    const files = Array.from(e.target.files);
    
    files.forEach(file => {
        if (isValidFileType(file)) {
            addSourceItem('file-list', {
                type: 'file',
                title: file.name,
                preview: formatFileSize(file.size),
                data: file
            });
        } else {
            alert(`不支援的文件類型: ${file.name}`);
        }
    });
    
    e.target.value = ''; // Reset input
}

function addWebpageSource() {
    const input = document.getElementById('webpage-url');
    const url = input.value.trim();
    
    if (!url) {
        alert('請輸入網頁連結');
        return;
    }
    
    if (!isValidUrl(url)) {
        alert('請輸入有效的網頁連結');
        return;
    }
    
    addSourceItem('webpage-list', {
        type: 'webpage',
        url: url,
        title: '網頁內容',
        data: url
    });
    
    input.value = '';
}

function addSourceItem(containerId, item) {
    const container = document.getElementById(containerId);
    const div = document.createElement('div');
    div.className = 'source-item';
    div.innerHTML = `
        <div class="source-info">
            <div class="source-title">${item.title}</div>
            ${item.url ? `<div class="source-url">${item.url}</div>` : ''}
            ${item.preview ? `<div class="source-url">${item.preview}</div>` : ''}
        </div>
        <button class="remove-btn" onclick="removeSourceItem(this)">
            <i class="fas fa-times"></i>
        </button>
    `;
    
    // Store data
    div._sourceData = item;
    
    container.appendChild(div);
}

function removeSourceItem(button) {
    button.parentElement.remove();
}

// =====================================================
// NOTES GENERATION
// =====================================================

function initializeGeneration() {
    document.getElementById('generate-btn').addEventListener('click', generateNotes);
    
    // Flashcards and Quiz generation
    document.getElementById('generate-flashcards-btn').addEventListener('click', generateFlashcards);
    document.getElementById('generate-quiz-btn').addEventListener('click', generateQuiz);
}

async function generateNotes() {
    const generateBtn = document.getElementById('generate-btn');
    const loading = document.getElementById('loading');
    const outputSection = document.getElementById('output-section');
    
    try {
        // Validate inputs
        const inputData = collectInputData();
        if (!validateInputData(inputData)) {
            alert('請至少添加一個學習資源');
            return;
        }
        
        // Show loading
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> <span>生成中...</span>';
        loading.style.display = 'block';
        outputSection.style.display = 'none';
        
        // Call API
        const response = await fetch(`${API_BASE_URL}/unified-notes`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(inputData)
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status}: ${response.statusText}`);
        }
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || '生成失敗');
        }
        
        // Display result
        currentNotes = result.notes;
        displayNotes(result.notes);
        
        // Show output section
        loading.style.display = 'none';
        outputSection.style.display = 'block';
        
        // Reset other views
        currentFlashcards = [];
        currentQuiz = [];
        clearContainer('flashcards-container');
        clearContainer('quiz-container');
        
        // Scroll to result
        outputSection.scrollIntoView({ behavior: 'smooth' });
        
        console.log('✅ Notes generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating notes:', error);
        alert('生成筆記時發生錯誤：' + error.message);
        
        loading.style.display = 'none';
        
    } finally {
        // Restore button
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> <span>生成筆記</span>';
    }
}

async function generateFlashcards() {
    if (!currentNotes) {
        alert('請先生成筆記');
        return;
    }
    
    const container = document.getElementById('flashcards-container');
    const generateBtn = document.getElementById('generate-flashcards-btn');
    
    try {
        // Show loading
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i>正在生成記憶卡片...</div>';
        
        // Get selected language
        const language = document.querySelector('input[name="language"]:checked').value;
        
        // Call API
        const response = await fetch(`${API_BASE_URL}/generate-flashcards`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                note_content: currentNotes,
                count: 15,
                difficulty: 'medium',
                types: ['definition', 'example'],
                language: language
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || '生成記憶卡片失敗');
        }
        
        currentFlashcards = result.flashcards;
        displayFlashcards(result.flashcards);
        
        console.log('✅ Flashcards generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating flashcards:', error);
        container.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i>生成記憶卡片失敗：${error.message}</div>`;
        
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> 生成記憶卡片';
    }
}

async function generateQuiz() {
    if (!currentNotes) {
        alert('請先生成筆記');
        return;
    }
    
    const container = document.getElementById('quiz-container');
    const generateBtn = document.getElementById('generate-quiz-btn');
    
    try {
        // Show loading
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';
        container.innerHTML = '<div class="loading-state"><i class="fas fa-spinner fa-spin"></i>正在生成測驗...</div>';
        
        // Get selected language
        const language = document.querySelector('input[name="language"]:checked').value;
        
        // Call API
        const response = await fetch(`${API_BASE_URL}/generate-quiz`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                notes: currentNotes,
                language: language
            })
        });
        
        const result = await response.json();
        
        if (!result.success) {
            throw new Error(result.error || '生成測驗失敗');
        }
        
        currentQuiz = result.quiz;
        displayQuiz(result.quiz);
        
        console.log('✅ Quiz generated successfully');
        
    } catch (error) {
        console.error('❌ Error generating quiz:', error);
        container.innerHTML = `<div class="error-state"><i class="fas fa-exclamation-triangle"></i>生成測驗失敗：${error.message}</div>`;
        
    } finally {
        generateBtn.disabled = false;
        generateBtn.innerHTML = '<i class="fas fa-magic"></i> 生成測驗';
    }
}

// =====================================================
// DISPLAY FUNCTIONS
// =====================================================

function displayNotes(notes) {
    const container = document.getElementById('notes-content');
    const html = marked.parse(notes);
    container.innerHTML = html;
}

function displayFlashcards(flashcards) {
    const container = document.getElementById('flashcards-container');
    
    if (!flashcards || flashcards.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-layer-group"></i>沒有記憶卡片</div>';
        return;
    }
    
    container.innerHTML = '';
    
    flashcards.forEach((card, index) => {
        const cardElement = document.createElement('div');
        cardElement.className = 'flashcard';
        cardElement.innerHTML = `
            <div class="flashcard-question">Q${index + 1}: ${card.question}</div>
            <div class="flashcard-answer">${card.answer}</div>
        `;
        container.appendChild(cardElement);
    });
}

function displayQuiz(quiz) {
    const container = document.getElementById('quiz-container');
    
    if (!quiz || quiz.length === 0) {
        container.innerHTML = '<div class="empty-state"><i class="fas fa-question-circle"></i>沒有測驗題目</div>';
        return;
    }
    
    container.innerHTML = '';
    
    quiz.forEach((question, qIndex) => {
        const questionElement = document.createElement('div');
        questionElement.className = 'quiz-question';
        
        let optionsHtml = '';
        question.options.forEach((option, oIndex) => {
            optionsHtml += `
                <div class="quiz-option" data-question="${qIndex}" data-option="${oIndex}">
                    ${option}
                </div>
            `;
        });
        
        questionElement.innerHTML = `
            <h3>問題 ${qIndex + 1}: ${question.question}</h3>
            <div class="quiz-options">
                ${optionsHtml}
            </div>
        `;
        
        container.appendChild(questionElement);
    });
    
    // Add submit button
    const submitBtn = document.createElement('button');
    submitBtn.className = 'quiz-submit';
    submitBtn.textContent = '提交答案';
    submitBtn.addEventListener('click', checkQuizAnswers);
    container.appendChild(submitBtn);
    
    // Add option click handlers
    container.querySelectorAll('.quiz-option').forEach(option => {
        option.addEventListener('click', function() {
            const qIndex = this.dataset.question;
            
            // Remove selected from other options in same question
            container.querySelectorAll(`.quiz-option[data-question="${qIndex}"]`).forEach(opt => {
                opt.classList.remove('selected');
            });
            
            this.classList.add('selected');
        });
    });
}

function renderMindmap(content) {
    try {
        const svg = document.getElementById('mindmap-svg');
        svg.innerHTML = '';
        
        if (typeof markmap === 'undefined') {
            console.error('Markmap library not loaded');
            return;
        }
        
        const transformer = new markmap.Transformer();
        const { root } = transformer.transform(content);
        
        markmap.Markmap.create(svg, {
            duration: 300,
            nodeFont: '16px Inter, sans-serif',
            nodeMinHeight: 30,
            spacingVertical: 10,
            spacingHorizontal: 80,
            autoFit: true,
            fitRatio: 0.95,
            color: (node) => {
                const colors = ['#667eea', '#764ba2', '#f093fb', '#f5576c', '#4facfe'];
                return colors[node.depth % colors.length];
            }
        }, root);
        
        console.log('✅ Mindmap rendered successfully');
        
    } catch (error) {
        console.error('❌ Error rendering mindmap:', error);
        document.getElementById('mindmap-svg').innerHTML = '<text x="50%" y="50%" text-anchor="middle" fill="#718096">思維導圖生成失敗</text>';
    }
}

// =====================================================
// ACTIONS
// =====================================================

function initializeActions() {
    document.getElementById('download-btn').addEventListener('click', downloadNotes);
    document.getElementById('save-btn').addEventListener('click', saveNotes);
    document.getElementById('copy-btn').addEventListener('click', copyNotes);
}

function downloadNotes() {
    if (!currentNotes) {
        alert('沒有可下載的筆記');
        return;
    }
    
    const title = document.getElementById('note-title').value || 'notes';
    const blob = new Blob([currentNotes], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title}.md`;
    a.click();
    URL.revokeObjectURL(url);
}

function saveNotes() {
    if (!currentNotes) {
        alert('沒有可儲存的筆記');
        return;
    }
    
    const noteData = {
        title: document.getElementById('note-title').value || '未命名筆記',
        content: currentNotes,
        createdAt: new Date().toISOString(),
        examSystem: document.getElementById('exam-system').value,
        subject: document.getElementById('subject').value,
        topic: document.getElementById('topic').value
    };
    
    const savedNotes = JSON.parse(localStorage.getItem('savedNotes') || '[]');
    savedNotes.push(noteData);
    localStorage.setItem('savedNotes', JSON.stringify(savedNotes));
    
    alert('筆記已儲存到本地');
}

async function copyNotes() {
    if (!currentNotes) {
        alert('沒有可複製的筆記');
        return;
    }
    
    try {
        await navigator.clipboard.writeText(currentNotes);
        alert('筆記已複製到剪貼簿');
    } catch (error) {
        console.error('Failed to copy:', error);
        alert('複製失敗');
    }
}

// =====================================================
// QUIZ LOGIC
// =====================================================

function checkQuizAnswers() {
    const container = document.getElementById('quiz-container');
    let correct = 0;
    
    currentQuiz.forEach((question, qIndex) => {
        const selected = container.querySelector(`.quiz-option[data-question="${qIndex}"].selected`);
        
        if (selected) {
            const selectedOption = parseInt(selected.dataset.option);
            
            // Find correct option (simple matching)
            let correctOption = -1;
            const correctLetter = question.correct.toUpperCase().trim();
            const letters = ['A', 'B', 'C', 'D'];
            correctOption = letters.indexOf(correctLetter);
            
            if (correctOption === -1) {
                correctOption = 0; // Fallback
            }
            
            if (selectedOption === correctOption) {
                selected.classList.add('correct');
                correct++;
            } else {
                selected.classList.add('incorrect');
                const correctElement = container.querySelector(`.quiz-option[data-question="${qIndex}"][data-option="${correctOption}"]`);
                if (correctElement) {
                    correctElement.classList.add('correct');
                }
            }
        }
    });
    
    alert(`測驗結果：${correct}/${currentQuiz.length} 題正確`);
}

// =====================================================
// UTILITY FUNCTIONS
// =====================================================

function collectInputData() {
    // Collect form data
    const title = document.getElementById('note-title').value.trim();
    const examSystem = document.getElementById('exam-system').value;
    const subject = document.getElementById('subject').value;
    const topic = document.getElementById('topic').value.trim();
    const detailLevel = document.querySelector('input[name="detail"]:checked').value;
    const language = document.querySelector('input[name="language"]:checked').value;
    
    // Collect sources
    const sources = {
        youtube: [],
        files: [],
        text: [],
        webpages: []
    };
    
    // YouTube sources
    document.querySelectorAll('#youtube-list .source-item').forEach(item => {
        sources.youtube.push(item._sourceData.data);
    });
    
    // Text sources
    document.querySelectorAll('#text-list .source-item').forEach(item => {
        sources.text.push(item._sourceData.data);
    });
    
    // File sources (convert to base64 or handle differently)
    document.querySelectorAll('#file-list .source-item').forEach(item => {
        // For now, just store file info
        sources.files.push({
            name: item._sourceData.data.name,
            size: item._sourceData.data.size,
            type: item._sourceData.data.type
        });
    });
    
    // Webpage sources
    document.querySelectorAll('#webpage-list .source-item').forEach(item => {
        sources.webpages.push(item._sourceData.data);
    });
    
    return {
        title: title || '未命名筆記',
        examSystem,
        subject,
        topic,
        customTopic: topic,
        detailLevel,
        language,
        sources
    };
}

function validateInputData(data) {
    const hasYoutube = data.sources.youtube.length > 0;
    const hasText = data.sources.text.length > 0;
    const hasFiles = data.sources.files.length > 0;
    const hasWebpages = data.sources.webpages.length > 0;
    
    return hasYoutube || hasText || hasFiles || hasWebpages;
}

function clearContainer(id) {
    const container = document.getElementById(id);
    if (container) {
        container.innerHTML = '';
    }
}

function isValidYouTubeUrl(url) {
    return /^(https?:\/\/)?(www\.)?(youtube\.com|youtu\.be)\//.test(url);
}

function isValidUrl(url) {
    try {
        new URL(url);
        return true;
    } catch {
        return false;
    }
}

function isValidFileType(file) {
    const validTypes = [
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'text/plain'
    ];
    return validTypes.includes(file.type);
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

console.log('📱 NexLearn AI Notes - Frontend Ready');