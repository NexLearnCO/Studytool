// Trilium-style Note Tree Manager

class TriliumNoteTree {
    constructor() {
        this.noteTree = [];
        this.smartCollections = {};
        this.tags = new Set();
        this.initializeTree();
        this.setupEventListeners();
    }

    initializeTree() {
        this.loadNoteTree();
        this.generateSmartCollections();
        this.extractTags();
        this.renderTree();
        this.renderCollections();
        this.renderTags();
    }

    setupEventListeners() {
        // Listen for new notes being created
        document.addEventListener('noteGenerated', (e) => {
            this.addNoteToTree(e.detail.noteData);
        });

        // Setup subject change listener for dynamic topics
        const subjectSelect = document.getElementById('subject-select');
        if (subjectSelect) {
            subjectSelect.addEventListener('change', () => {
                this.populateTopics(subjectSelect.value);
            });
        }
    }

    loadNoteTree() {
        const notes = JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
        this.noteTree = this.organizeNotesIntoTree(notes);
    }

    organizeNotesIntoTree(notes) {
        const tree = {};
        
        notes.forEach(note => {
            // Create hierarchy based on exam system > subject > topic
            const examSystem = note.examSystem || 'uncategorized';
            const subject = note.subject || 'general';
            const topic = note.topic || note.customTopic || 'misc';
            
            if (!tree[examSystem]) {
                tree[examSystem] = {};
            }
            if (!tree[examSystem][subject]) {
                tree[examSystem][subject] = {};
            }
            if (!tree[examSystem][subject][topic]) {
                tree[examSystem][subject][topic] = [];
            }
            
            tree[examSystem][subject][topic].push(note);
        });
        
        return tree;
    }

    generateSmartCollections() {
        const notes = JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
        this.smartCollections = {};

        // Group by exam system
        notes.forEach(note => {
            const examSystem = note.examSystem;
            if (examSystem) {
                if (!this.smartCollections[examSystem]) {
                    this.smartCollections[examSystem] = [];
                }
                this.smartCollections[examSystem].push(note);
            }
        });

        // Group by subject
        notes.forEach(note => {
            const subject = note.subject;
            if (subject) {
                const key = `subject_${subject}`;
                if (!this.smartCollections[key]) {
                    this.smartCollections[key] = [];
                }
                this.smartCollections[key].push(note);
            }
        });

        // Group by creation date (Recent, This Week, This Month)
        const now = new Date();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        const oneMonth = 30 * oneDay;

        this.smartCollections['recent'] = notes.filter(note => {
            const noteDate = new Date(note.createdAt);
            return (now - noteDate) < oneDay;
        });

        this.smartCollections['this_week'] = notes.filter(note => {
            const noteDate = new Date(note.createdAt);
            return (now - noteDate) < oneWeek;
        });

        this.smartCollections['this_month'] = notes.filter(note => {
            const noteDate = new Date(note.createdAt);
            return (now - noteDate) < oneMonth;
        });
    }

    extractTags() {
        const notes = JSON.parse(localStorage.getItem('nexlearn_notes') || '[]');
        this.tags.clear();

        notes.forEach(note => {
            // Extract tags from content (looking for #hashtags)
            const content = note.content || '';
            const hashtagRegex = /#([a-zA-Z0-9_\u4e00-\u9fa5]+)/g;
            let match;
            while ((match = hashtagRegex.exec(content)) !== null) {
                this.tags.add(match[1]);
            }

            // Add subject and topic as tags
            if (note.subject) this.tags.add(note.subject);
            if (note.topic) this.tags.add(note.topic);
            if (note.customTopic) this.tags.add(note.customTopic);
        });
    }

    renderTree() {
        const treeContainer = document.getElementById('note-tree');
        if (!treeContainer) return;

        if (Object.keys(this.noteTree).length === 0) {
            treeContainer.innerHTML = `
                <div class="empty-tree">
                    <i class="fas fa-seedling"></i>
                    <span>開始建立您的知識樹</span>
                </div>
            `;
            return;
        }

        let treeHTML = '';
        
        Object.keys(this.noteTree).forEach(examSystem => {
            const examDisplayName = this.getExamSystemDisplayName(examSystem);
            treeHTML += `
                <div class="tree-node exam-system-node">
                    <div class="tree-node-header" onclick="triliumTree.toggleNode(this)">
                        <i class="fas fa-chevron-right toggle-icon"></i>
                        <i class="fas fa-graduation-cap node-icon"></i>
                        <span class="node-label">${examDisplayName}</span>
                        <span class="node-count">(${this.countNotesInExamSystem(examSystem)})</span>
                    </div>
                    <div class="tree-node-children" style="display: none;">
                        ${this.renderSubjects(examSystem)}
                    </div>
                </div>
            `;
        });

        treeContainer.innerHTML = treeHTML;
    }

    renderSubjects(examSystem) {
        let subjectsHTML = '';
        
        Object.keys(this.noteTree[examSystem]).forEach(subject => {
            const subjectDisplayName = this.getSubjectDisplayName(subject);
            subjectsHTML += `
                <div class="tree-node subject-node">
                    <div class="tree-node-header" onclick="triliumTree.toggleNode(this)">
                        <i class="fas fa-chevron-right toggle-icon"></i>
                        <i class="fas fa-book node-icon"></i>
                        <span class="node-label">${subjectDisplayName}</span>
                        <span class="node-count">(${this.countNotesInSubject(examSystem, subject)})</span>
                    </div>
                    <div class="tree-node-children" style="display: none;">
                        ${this.renderTopics(examSystem, subject)}
                    </div>
                </div>
            `;
        });

        return subjectsHTML;
    }

    renderTopics(examSystem, subject) {
        let topicsHTML = '';
        
        Object.keys(this.noteTree[examSystem][subject]).forEach(topic => {
            const notes = this.noteTree[examSystem][subject][topic];
            topicsHTML += `
                <div class="tree-node topic-node">
                    <div class="tree-node-header" onclick="triliumTree.toggleNode(this)">
                        <i class="fas fa-chevron-right toggle-icon"></i>
                        <i class="fas fa-folder node-icon"></i>
                        <span class="node-label">${topic}</span>
                        <span class="node-count">(${notes.length})</span>
                    </div>
                    <div class="tree-node-children" style="display: none;">
                        ${this.renderNotes(notes)}
                    </div>
                </div>
            `;
        });

        return topicsHTML;
    }

    renderNotes(notes) {
        let notesHTML = '';
        
        notes.forEach(note => {
            notesHTML += `
                <div class="tree-node note-node" data-note-id="${note.id}">
                    <div class="tree-node-header" onclick="triliumTree.openNote('${note.id}')">
                        <i class="fas fa-sticky-note note-icon"></i>
                        <span class="node-label">${note.title}</span>
                        <span class="note-date">${new Date(note.createdAt).toLocaleDateString()}</span>
                    </div>
                </div>
            `;
        });

        return notesHTML;
    }

    renderCollections() {
        const collectionsContainer = document.getElementById('smart-collections');
        if (!collectionsContainer) return;

        if (Object.keys(this.smartCollections).length === 0) {
            collectionsContainer.innerHTML = `
                <div class="empty-collections">
                    <i class="fas fa-magic"></i>
                    <span>基於您的筆記自動分類</span>
                </div>
            `;
            return;
        }

        let collectionsHTML = '';

        // Special collections
        if (this.smartCollections['recent'] && this.smartCollections['recent'].length > 0) {
            collectionsHTML += `
                <div class="collection-item" onclick="triliumTree.showCollection('recent')">
                    <i class="fas fa-clock collection-icon"></i>
                    <span class="collection-label">今日新增</span>
                    <span class="collection-count">${this.smartCollections['recent'].length}</span>
                </div>
            `;
        }

        if (this.smartCollections['this_week'] && this.smartCollections['this_week'].length > 0) {
            collectionsHTML += `
                <div class="collection-item" onclick="triliumTree.showCollection('this_week')">
                    <i class="fas fa-calendar-week collection-icon"></i>
                    <span class="collection-label">本週</span>
                    <span class="collection-count">${this.smartCollections['this_week'].length}</span>
                </div>
            `;
        }

        // Exam system collections
        Object.keys(this.smartCollections).forEach(key => {
            if (key.startsWith('subject_')) {
                const subject = key.replace('subject_', '');
                const notes = this.smartCollections[key];
                if (notes.length > 0) {
                    collectionsHTML += `
                        <div class="collection-item" onclick="triliumTree.showCollection('${key}')">
                            <i class="fas fa-bookmark collection-icon"></i>
                            <span class="collection-label">${this.getSubjectDisplayName(subject)}</span>
                            <span class="collection-count">${notes.length}</span>
                        </div>
                    `;
                }
            } else if (!['recent', 'this_week', 'this_month'].includes(key)) {
                const notes = this.smartCollections[key];
                if (notes.length > 0) {
                    collectionsHTML += `
                        <div class="collection-item" onclick="triliumTree.showCollection('${key}')">
                            <i class="fas fa-graduation-cap collection-icon"></i>
                            <span class="collection-label">${this.getExamSystemDisplayName(key)}</span>
                            <span class="collection-count">${notes.length}</span>
                        </div>
                    `;
                }
            }
        });

        collectionsContainer.innerHTML = collectionsHTML;
    }

    renderTags() {
        const tagsContainer = document.getElementById('tags-list');
        if (!tagsContainer) return;

        if (this.tags.size === 0) {
            tagsContainer.innerHTML = `
                <div class="empty-tags">
                    <i class="fas fa-tag"></i>
                    <span>標籤會自動從筆記中提取</span>
                </div>
            `;
            return;
        }

        let tagsHTML = '';
        Array.from(this.tags).sort().forEach(tag => {
            tagsHTML += `
                <div class="tag-item" onclick="triliumTree.filterByTag('${tag}')">
                    <i class="fas fa-tag tag-icon"></i>
                    <span class="tag-label">${tag}</span>
                </div>
            `;
        });

        tagsContainer.innerHTML = tagsHTML;
    }

    // Helper methods
    getExamSystemDisplayName(key) {
        const displayNames = {
            'ibdp': 'IB DP',
            'al': 'A Level',
            'as': 'AS Level',
            'gcse': 'GCSE',
            'igcse': 'IGCSE',
            'ap': 'AP',
            'sat': 'SAT',
            'hkdse': 'HKDSE',
            'ielts': 'IELTS',
            'toefl': 'TOEFL',
            'uncategorized': '未分類'
        };
        return displayNames[key] || key;
    }

    getSubjectDisplayName(key) {
        const displayNames = {
            'chemistry': '化學',
            'physics': '物理',
            'biology': '生物',
            'pure-mathematics': '純數學',
            'applied-mathematics': '應用數學',
            'computer-science': '計算機科學',
            'history': '歷史',
            'geography': '地理',
            'english': '英語',
            'general': '一般'
        };
        return displayNames[key] || key;
    }

    countNotesInExamSystem(examSystem) {
        let count = 0;
        Object.values(this.noteTree[examSystem]).forEach(subjects => {
            Object.values(subjects).forEach(topics => {
                Object.values(topics).forEach(notes => {
                    count += notes.length;
                });
            });
        });
        return count;
    }

    countNotesInSubject(examSystem, subject) {
        let count = 0;
        Object.values(this.noteTree[examSystem][subject]).forEach(notes => {
            count += notes.length;
        });
        return count;
    }

    // Interaction methods
    toggleNode(header) {
        const children = header.nextElementSibling;
        const toggle = header.querySelector('.toggle-icon');
        
        if (children.style.display === 'none') {
            children.style.display = 'block';
            toggle.style.transform = 'rotate(90deg)';
            header.parentElement.classList.add('expanded');
        } else {
            children.style.display = 'none';
            toggle.style.transform = 'rotate(0deg)';
            header.parentElement.classList.remove('expanded');
        }
    }

    openNote(noteId) {
        // TODO: Implement note opening functionality
        console.log('Opening note:', noteId);
        
        // For now, switch to notes view and highlight the note
        if (window.sidebarManager) {
            window.sidebarManager.switchView('all-notes');
            
            // Highlight the note after a short delay
            setTimeout(() => {
                const noteCard = document.querySelector(`[data-note-id="${noteId}"]`);
                if (noteCard) {
                    noteCard.scrollIntoView({ behavior: 'smooth' });
                    noteCard.classList.add('highlighted');
                    setTimeout(() => noteCard.classList.remove('highlighted'), 2000);
                }
            }, 300);
        }
    }

    showCollection(collectionKey) {
        const notes = this.smartCollections[collectionKey];
        if (!notes) return;

        // Switch to notes view and filter
        if (window.sidebarManager) {
            window.sidebarManager.switchView('all-notes');
            
            // TODO: Implement collection filtering
            console.log('Showing collection:', collectionKey, notes);
        }
    }

    filterByTag(tag) {
        // TODO: Implement tag filtering
        console.log('Filtering by tag:', tag);
        
        if (window.sidebarManager) {
            window.sidebarManager.switchView('all-notes');
        }
    }

    addNoteToTree(noteData) {
        // Add new note to tree structure
        this.loadNoteTree();
        this.generateSmartCollections();
        this.extractTags();
        this.renderTree();
        this.renderCollections();
        this.renderTags();
    }

    // Topic population based on subject
    populateTopics(subject) {
        const topicSelect = document.getElementById('topic-select');
        const topicSelection = document.getElementById('topic-selection');
        
        if (!topicSelect || !topicSelection) return;

        // Show/hide topic selection
        if (subject) {
            topicSelection.style.display = 'block';
            topicSelect.innerHTML = '<option value="">選擇主題...</option>';
            
            const topics = this.getTopicsForSubject(subject);
            topics.forEach(topic => {
                const option = document.createElement('option');
                option.value = topic.value;
                option.textContent = topic.label;
                topicSelect.appendChild(option);
            });
        } else {
            topicSelection.style.display = 'none';
        }
    }

    getTopicsForSubject(subject) {
        const topicMappings = {
            'chemistry': [
                { value: 'atomic-structure', label: '原子結構' },
                { value: 'bonding', label: '化學鍵' },
                { value: 'organic-chemistry', label: '有機化學' },
                { value: 'inorganic-chemistry', label: '無機化學' },
                { value: 'physical-chemistry', label: '物理化學' },
                { value: 'analytical-chemistry', label: '分析化學' }
            ],
            'physics': [
                { value: 'mechanics', label: '力學' },
                { value: 'thermodynamics', label: '熱力學' },
                { value: 'waves', label: '波動' },
                { value: 'electricity', label: '電學' },
                { value: 'magnetism', label: '磁學' },
                { value: 'modern-physics', label: '現代物理' }
            ],
            'biology': [
                { value: 'cell-biology', label: '細胞生物學' },
                { value: 'genetics', label: '遺傳學' },
                { value: 'evolution', label: '演化' },
                { value: 'ecology', label: '生態學' },
                { value: 'human-biology', label: '人體生物學' },
                { value: 'molecular-biology', label: '分子生物學' }
            ],
            'pure-mathematics': [
                { value: 'algebra', label: '代數' },
                { value: 'calculus', label: '微積分' },
                { value: 'geometry', label: '幾何學' },
                { value: 'trigonometry', label: '三角學' },
                { value: 'complex-numbers', label: '複數' },
                { value: 'sequences-series', label: '數列級數' }
            ]
        };

        return topicMappings[subject] || [];
    }
}

// Initialize Trilium tree manager
document.addEventListener('DOMContentLoaded', () => {
    window.triliumTree = new TriliumNoteTree();
});