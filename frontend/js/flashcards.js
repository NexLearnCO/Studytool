// Flashcard Management System

class FlashcardManager {
    constructor() {
        this.currentSet = null;
        this.currentCard = 0;
        this.isFlipped = false;
        this.initializeEventListeners();
    }

    initializeEventListeners() {
        // Listen for note generation completion to show flashcard generation option
        document.addEventListener('noteGenerated', (e) => {
            this.showFlashcardGenerationOption(e.detail.noteData);
        });
    }

    // Show option to generate flashcards from newly created note
    showFlashcardGenerationOption(noteData) {
        const notification = document.createElement('div');
        notification.className = 'flashcard-notification';
        notification.innerHTML = `
            <div class="notification-content">
                <i class="fas fa-layer-group"></i>
                <div class="notification-text">
                    <h4>筆記已生成完成！</h4>
                    <p>要為「${noteData.title}」生成記憶卡片嗎？</p>
                </div>
                <div class="notification-actions">
                    <button class="btn-secondary" onclick="this.dismissNotification()">
                        稍後
                    </button>
                    <button class="btn-primary" onclick="flashcardManager.generateFromNote('${noteData.id}')">
                        <i class="fas fa-magic"></i> 生成記憶卡
                    </button>
                </div>
            </div>
        `;

        // Add notification styles
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: 'white',
            border: '2px solid #667eea',
            borderRadius: '12px',
            padding: '20px',
            boxShadow: '0 8px 24px rgba(0, 0, 0, 0.15)',
            zIndex: '1001',
            maxWidth: '400px',
            animation: 'slideInRight 0.3s ease-out'
        });

        document.body.appendChild(notification);

        // Auto-dismiss after 10 seconds
        setTimeout(() => {
            if (notification.parentNode) {
                this.dismissNotification(notification);
            }
        }, 10000);
    }

    dismissNotification(notification) {
        if (!notification) {
            notification = document.querySelector('.flashcard-notification');
        }
        if (notification) {
            notification.style.animation = 'slideOutRight 0.3s ease-out';
            setTimeout(() => {
                if (notification.parentNode) {
                    notification.remove();
                }
            }, 300);
        }
    }

    // Generate flashcards from a specific note
    async generateFromNote(noteId) {
        this.dismissNotification();
        
        const notes = JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
        const note = notes.find(n => n.id === noteId);
        
        if (!note) {
            alert('找不到指定的筆記');
            return;
        }

        // Show generation options modal
        this.showFlashcardGenerationModal(note);
    }

    showFlashcardGenerationModal(note) {
        const modal = document.createElement('div');
        modal.className = 'modal';
        modal.style.display = 'flex';
        modal.innerHTML = `
            <div class="modal-content">
                <div class="modal-header">
                    <h2><i class="fas fa-layer-group"></i> 為「${note.title}」生成記憶卡</h2>
                    <button class="modal-close" onclick="this.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="generation-preview">
                        <div class="source-note">
                            <h4>來源筆記內容預覽：</h4>
                            <div class="note-preview">
                                ${note.content.substring(0, 300)}...
                            </div>
                        </div>
                        
                        <div class="generation-settings">
                            <div class="setting-group">
                                <label>卡片數量：</label>
                                <select id="flashcard-count">
                                    <option value="10">10張</option>
                                    <option value="15" selected>15張</option>
                                    <option value="20">20張</option>
                                    <option value="25">25張</option>
                                </select>
                            </div>
                            
                            <div class="setting-group">
                                <label>難度等級：</label>
                                <div class="difficulty-buttons">
                                    <button class="difficulty-btn" data-level="easy">簡單</button>
                                    <button class="difficulty-btn active" data-level="medium">適中</button>
                                    <button class="difficulty-btn" data-level="hard">困難</button>
                                </div>
                            </div>

                            <div class="setting-group">
                                <label>卡片類型：</label>
                                <div class="card-type-options">
                                    <label class="checkbox-label">
                                        <input type="checkbox" value="definition" checked> 定義解釋
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" value="example" checked> 舉例說明
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" value="application"> 應用題
                                    </label>
                                    <label class="checkbox-label">
                                        <input type="checkbox" value="comparison"> 比較分析
                                    </label>
                                </div>
                            </div>
                        </div>

                        <div class="generation-options">
                            <h4>生成後選項：</h4>
                            <label class="checkbox-label">
                                <input type="checkbox" id="auto-save-to-set" checked>
                                <span>自動保存到新的記憶卡集</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="allow-editing" checked>
                                <span>允許編輯後再保存</span>
                            </label>
                            <label class="checkbox-label">
                                <input type="checkbox" id="save-original">
                                <span>同時保留 AI 原始版本</span>
                            </label>
                        </div>
                    </div>

                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button class="btn-primary" onclick="flashcardManager.executeGeneration('${note.id}', this.closest('.modal'))">
                            <i class="fas fa-magic"></i> 生成記憶卡
                        </button>
                    </div>
                </div>
            </div>
        `;

        // Setup difficulty button interactions
        const difficultyBtns = modal.querySelectorAll('.difficulty-btn');
        difficultyBtns.forEach(btn => {
            btn.addEventListener('click', () => {
                difficultyBtns.forEach(b => b.classList.remove('active'));
                btn.classList.add('active');
            });
        });

        document.body.appendChild(modal);
    }

    async executeGeneration(noteId, modal) {
        const notes = JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
        const note = notes.find(n => n.id === noteId);
        
        if (!note) {
            alert('找不到指定的筆記');
            return;
        }

        // Get settings from modal
        const settings = this.collectGenerationSettings(modal);
        
        // Show loading state
        const generateBtn = modal.querySelector('.btn-primary');
        generateBtn.disabled = true;
        generateBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 生成中...';

        try {
            // Generate flashcards using AI
            const flashcards = await this.generateFlashcardsFromNote(note, settings);
            
            if (settings.allowEditing) {
                // Show editing interface
                this.showFlashcardEditor(flashcards, note, settings);
            } else if (settings.autoSaveToSet) {
                // Auto-save to new set
                this.saveFlashcardSet(flashcards, note.title + ' - 記憶卡集');
                alert('記憶卡生成並保存成功！');
            }
            
            modal.remove();

        } catch (error) {
            console.error('Flashcard generation error:', error);
            alert('生成記憶卡時發生錯誤：' + error.message);
        } finally {
            generateBtn.disabled = false;
            generateBtn.innerHTML = '<i class="fas fa-magic"></i> 生成記憶卡';
        }
    }

    collectGenerationSettings(modal) {
        return {
            count: parseInt(modal.querySelector('#flashcard-count').value),
            difficulty: modal.querySelector('.difficulty-btn.active').dataset.level,
            types: Array.from(modal.querySelectorAll('.card-type-options input:checked')).map(cb => cb.value),
            autoSaveToSet: modal.querySelector('#auto-save-to-set').checked,
            allowEditing: modal.querySelector('#allow-editing').checked,
            saveOriginal: modal.querySelector('#save-original').checked
        };
    }

    async generateFlashcardsFromNote(note, settings) {
        // Call backend API to generate flashcards
        const response = await fetch('http://localhost:5000/api/generate-flashcards', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                note_content: note.content,
                count: settings.count,
                difficulty: settings.difficulty,
                types: settings.types,
                language: note.language || 'zh-tw'
            })
        });

        const result = await response.json();
        if (!result.success) {
            throw new Error(result.error || '生成失敗');
        }

        return result.flashcards;
    }

    showFlashcardEditor(flashcards, sourceNote, settings) {
        const editorModal = document.createElement('div');
        editorModal.className = 'modal';
        editorModal.style.display = 'flex';
        
        editorModal.innerHTML = `
            <div class="modal-content large-modal">
                <div class="modal-header">
                    <h2><i class="fas fa-edit"></i> 編輯記憶卡集</h2>
                    <button class="modal-close" onclick="this.remove()">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                <div class="modal-body">
                    <div class="editor-header">
                        <div class="set-info">
                            <input type="text" id="set-title" class="set-title-input" 
                                   value="${sourceNote.title} - 記憶卡集" placeholder="記憶卡集標題">
                            <span class="card-counter">${flashcards.length} 張卡片</span>
                        </div>
                        <div class="editor-actions">
                            <button class="btn-secondary" onclick="flashcardManager.addNewCard()">
                                <i class="fas fa-plus"></i> 新增卡片
                            </button>
                            <button class="btn-secondary" onclick="flashcardManager.previewSet()">
                                <i class="fas fa-eye"></i> 預覽
                            </button>
                        </div>
                    </div>

                    <div class="cards-editor" id="cards-editor">
                        ${this.generateCardEditorHTML(flashcards)}
                    </div>

                    <div class="modal-actions">
                        <button class="btn-secondary" onclick="this.closest('.modal').remove()">取消</button>
                        <button class="btn-primary" onclick="flashcardManager.saveEditedSet('${sourceNote.id}', this.closest('.modal'))">
                            <i class="fas fa-save"></i> 保存記憶卡集
                        </button>
                    </div>
                </div>
            </div>
        `;

        document.body.appendChild(editorModal);
        this.setupCardEditorInteractions(editorModal);
    }

    generateCardEditorHTML(flashcards) {
        return flashcards.map((card, index) => `
            <div class="card-editor-item" data-card-index="${index}">
                <div class="card-editor-header">
                    <span class="card-number">#${index + 1}</span>
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="flashcardManager.duplicateCard(${index})">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="card-action-btn delete" onclick="flashcardManager.deleteCard(${index})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-sides">
                    <div class="card-side">
                        <label>正面 (問題)：</label>
                        <textarea class="card-front" placeholder="輸入問題或提示...">${card.front}</textarea>
                    </div>
                    <div class="card-side">
                        <label>背面 (答案)：</label>
                        <textarea class="card-back" placeholder="輸入答案或解釋...">${card.back}</textarea>
                    </div>
                </div>
                <div class="card-metadata">
                    <select class="card-difficulty">
                        <option value="easy" ${card.difficulty === 'easy' ? 'selected' : ''}>簡單</option>
                        <option value="medium" ${card.difficulty === 'medium' ? 'selected' : ''}>適中</option>
                        <option value="hard" ${card.difficulty === 'hard' ? 'selected' : ''}>困難</option>
                    </select>
                    <select class="card-type">
                        <option value="definition" ${card.type === 'definition' ? 'selected' : ''}>定義解釋</option>
                        <option value="example" ${card.type === 'example' ? 'selected' : ''}>舉例說明</option>
                        <option value="application" ${card.type === 'application' ? 'selected' : ''}>應用題</option>
                        <option value="comparison" ${card.type === 'comparison' ? 'selected' : ''}>比較分析</option>
                    </select>
                </div>
            </div>
        `).join('');
    }

    setupCardEditorInteractions(modal) {
        // Setup sortable cards (if needed)
        // Setup auto-save (if needed)
    }

    addNewCard() {
        const cardsEditor = document.getElementById('cards-editor');
        const cardCount = cardsEditor.children.length;
        
        const newCardHTML = `
            <div class="card-editor-item" data-card-index="${cardCount}">
                <div class="card-editor-header">
                    <span class="card-number">#${cardCount + 1}</span>
                    <div class="card-actions">
                        <button class="card-action-btn" onclick="flashcardManager.duplicateCard(${cardCount})">
                            <i class="fas fa-copy"></i>
                        </button>
                        <button class="card-action-btn delete" onclick="flashcardManager.deleteCard(${cardCount})">
                            <i class="fas fa-trash"></i>
                        </button>
                    </div>
                </div>
                <div class="card-sides">
                    <div class="card-side">
                        <label>正面 (問題)：</label>
                        <textarea class="card-front" placeholder="輸入問題或提示..."></textarea>
                    </div>
                    <div class="card-side">
                        <label>背面 (答案)：</label>
                        <textarea class="card-back" placeholder="輸入答案或解釋..."></textarea>
                    </div>
                </div>
                <div class="card-metadata">
                    <select class="card-difficulty">
                        <option value="easy">簡單</option>
                        <option value="medium" selected>適中</option>
                        <option value="hard">困難</option>
                    </select>
                    <select class="card-type">
                        <option value="definition" selected>定義解釋</option>
                        <option value="example">舉例說明</option>
                        <option value="application">應用題</option>
                        <option value="comparison">比較分析</option>
                    </select>
                </div>
            </div>
        `;
        
        cardsEditor.insertAdjacentHTML('beforeend', newCardHTML);
        this.updateCardCounter();
    }

    duplicateCard(index) {
        const cardsEditor = document.getElementById('cards-editor');
        const originalCard = cardsEditor.children[index];
        const newCard = originalCard.cloneNode(true);
        
        // Update card index and number
        const newIndex = cardsEditor.children.length;
        newCard.dataset.cardIndex = newIndex;
        newCard.querySelector('.card-number').textContent = `#${newIndex + 1}`;
        
        cardsEditor.appendChild(newCard);
        this.updateCardCounter();
    }

    deleteCard(index) {
        if (confirm('確定要刪除這張卡片嗎？')) {
            const cardsEditor = document.getElementById('cards-editor');
            cardsEditor.children[index].remove();
            this.reindexCards();
            this.updateCardCounter();
        }
    }

    reindexCards() {
        const cardsEditor = document.getElementById('cards-editor');
        Array.from(cardsEditor.children).forEach((card, index) => {
            card.dataset.cardIndex = index;
            card.querySelector('.card-number').textContent = `#${index + 1}`;
        });
    }

    updateCardCounter() {
        const counter = document.querySelector('.card-counter');
        const cardsEditor = document.getElementById('cards-editor');
        if (counter) {
            counter.textContent = `${cardsEditor.children.length} 張卡片`;
        }
    }

    saveEditedSet(sourceNoteId, modal) {
        const setTitle = modal.querySelector('#set-title').value || '未命名記憶卡集';
        const cards = this.collectEditedCards(modal);
        
        if (cards.length === 0) {
            alert('請至少保留一張卡片');
            return;
        }

        const flashcardSet = {
            id: Date.now().toString(),
            title: setTitle,
            sourceNoteId: sourceNoteId,
            cards: cards,
            createdAt: new Date().toISOString(),
            lastModified: new Date().toISOString()
        };

        this.saveFlashcardSet(flashcardSet);
        modal.remove();
        alert('記憶卡集保存成功！');
        
        // Switch to flashcard sets view
        window.sidebarManager?.switchView('flashcard-sets');
    }

    collectEditedCards(modal) {
        const cardItems = modal.querySelectorAll('.card-editor-item');
        const cards = [];
        
        cardItems.forEach(item => {
            const front = item.querySelector('.card-front').value.trim();
            const back = item.querySelector('.card-back').value.trim();
            
            if (front && back) {
                cards.push({
                    front: front,
                    back: back,
                    difficulty: item.querySelector('.card-difficulty').value,
                    type: item.querySelector('.card-type').value
                });
            }
        });
        
        return cards;
    }

    saveFlashcardSet(flashcardSet, title = null) {
        if (title) {
            flashcardSet = {
                id: Date.now().toString(),
                title: title,
                cards: flashcardSet,
                createdAt: new Date().toISOString(),
                lastModified: new Date().toISOString()
            };
        }
        
        const sets = JSON.parse(localStorage.getItem('nexlearn_flashcard_sets') || '[]');
        sets.unshift(flashcardSet);
        localStorage.setItem('nexlearn_flashcard_sets', JSON.stringify(sets));
    }

    previewSet() {
        // TODO: Implement flashcard set preview
        alert('預覽功能即將推出！');
    }
}

// Initialize flashcard manager
document.addEventListener('DOMContentLoaded', () => {
    window.flashcardManager = new FlashcardManager();
});

// Add notification styles
const notificationStyles = document.createElement('style');
notificationStyles.textContent = `
@keyframes slideInRight {
    from {
        transform: translateX(100%);
        opacity: 0;
    }
    to {
        transform: translateX(0);
        opacity: 1;
    }
}

@keyframes slideOutRight {
    from {
        transform: translateX(0);
        opacity: 1;
    }
    to {
        transform: translateX(100%);
        opacity: 0;
    }
}

.flashcard-notification {
    animation: slideInRight 0.3s ease-out;
}

.notification-content {
    display: flex;
    align-items: center;
    gap: 16px;
}

.notification-content i {
    font-size: 24px;
    color: #667eea;
}

.notification-text h4 {
    margin: 0 0 4px 0;
    color: #2d3748;
    font-size: 16px;
}

.notification-text p {
    margin: 0;
    color: #718096;
    font-size: 14px;
}

.notification-actions {
    display: flex;
    gap: 8px;
    margin-top: 12px;
}

.card-editor-item {
    background: white;
    border: 2px solid #e2e8f0;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 16px;
    transition: all 0.3s ease;
}

.card-editor-item:hover {
    border-color: #cbd5e0;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.05);
}

.card-editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16px;
    padding-bottom: 12px;
    border-bottom: 1px solid #e2e8f0;
}

.card-number {
    font-weight: 600;
    color: #667eea;
    font-size: 14px;
}

.card-actions {
    display: flex;
    gap: 8px;
}

.card-action-btn {
    background: none;
    border: none;
    color: #718096;
    cursor: pointer;
    padding: 4px 8px;
    border-radius: 4px;
    transition: all 0.3s ease;
}

.card-action-btn:hover {
    background: #e2e8f0;
    color: #4a5568;
}

.card-action-btn.delete:hover {
    background: #fed7d7;
    color: #c53030;
}

.card-sides {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    margin-bottom: 16px;
}

.card-side label {
    display: block;
    margin-bottom: 8px;
    font-weight: 600;
    color: #4a5568;
    font-size: 14px;
}

.card-front,
.card-back {
    width: 100%;
    min-height: 80px;
    padding: 12px;
    border: 2px solid #e2e8f0;
    border-radius: 8px;
    font-family: inherit;
    font-size: 14px;
    resize: vertical;
    transition: border-color 0.3s ease;
}

.card-front:focus,
.card-back:focus {
    outline: none;
    border-color: #667eea;
}

.card-metadata {
    display: flex;
    gap: 12px;
}

.card-difficulty,
.card-type {
    padding: 6px 12px;
    border: 2px solid #e2e8f0;
    border-radius: 6px;
    font-size: 12px;
    background: white;
}

.editor-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24px;
    padding: 16px;
    background: #f8fafc;
    border-radius: 8px;
}

.set-info {
    display: flex;
    align-items: center;
    gap: 16px;
}

.set-title-input {
    font-size: 18px;
    font-weight: 600;
    border: none;
    background: transparent;
    color: #2d3748;
    min-width: 300px;
}

.set-title-input:focus {
    outline: 2px solid #667eea;
    background: white;
    padding: 4px 8px;
    border-radius: 4px;
}

.card-counter {
    color: #718096;
    font-size: 14px;
}

.editor-actions {
    display: flex;
    gap: 12px;
}

.cards-editor {
    max-height: 60vh;
    overflow-y: auto;
    padding-right: 8px;
}

@media (max-width: 768px) {
    .card-sides {
        grid-template-columns: 1fr;
    }
    
    .editor-header {
        flex-direction: column;
        gap: 16px;
    }
    
    .set-info {
        flex-direction: column;
        align-items: flex-start;
        gap: 8px;
    }
    
    .flashcard-notification {
        right: 10px;
        left: 10px;
        max-width: none;
    }
}
`;

document.head.appendChild(notificationStyles);