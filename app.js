// TaskMaster AI - Task Management Application

class TaskMasterAI {
    constructor() {
        this.tasks = [];
        this.categories = [
            {name: "Work", color: "#3B82F6", icon: "💼"},
            {name: "Personal", color: "#10B981", icon: "🏠"},
            {name: "Urgent", color: "#EF4444", icon: "⚡"},
            {name: "Shopping", color: "#F59E0B", icon: "🛒"},
            {name: "Health", color: "#8B5CF6", icon: "🏥"},
            {name: "Learning", color: "#06B6D4", icon: "📚"}
        ];
        this.priorities = [
            {name: "High", color: "#EF4444", value: 3},
            {name: "Medium", color: "#F59E0B", value: 2},
            {name: "Low", color: "#10B981", value: 1}
        ];
        this.currentFilter = {
            category: 'all',
            status: null,
            priority: null,
            search: ''
        };
        this.currentSort = 'deadline';
        this.selectedTasks = new Set();
        this.aiResponses = {
            greetings: [
                "Hi! I'm your AI task assistant. I can help you create tasks, break down complex projects, and boost your productivity. What would you like to work on today?",
                "Hello! Ready to tackle your to-do list? I can understand natural language like 'Remind me to call mom tomorrow at 3 PM' and create organized tasks for you.",
                "Welcome back! I'm here to help you stay organized and productive. Try telling me about any task or project you need to manage."
            ],
            taskCreationSuccess: [
                "Perfect! I've created that task for you. Would you like me to break it down into smaller, manageable subtasks?",
                "Task created successfully! Based on the deadline, I've set this as high priority. Does that look right?",
                "Got it! Your task is now organized and ready. I notice you have similar tasks - would you like some productivity tips?"
            ],
            productivityTips: [
                "💡 Tip: Try batching similar tasks together to maintain focus and reduce context switching.",
                "💡 Tip: Break large projects into smaller, actionable tasks. It makes them less overwhelming and easier to complete.",
                "💡 Tip: Consider using the 2-minute rule - if a task takes less than 2 minutes, do it immediately rather than adding it to your list."
            ]
        };
        this.isAiAssistantOpen = false;
        this.editingTask = null;

        this.init();
    }

    init() {
        this.loadFromStorage();
        this.initializeElements();
        this.bindEvents();
        this.populateCategories();
        this.loadSampleTasks();
        this.renderTasks();
        this.updateCounts();
        this.updateStats();
    }

    loadSampleTasks() {
        // Only load sample tasks if no tasks exist
        if (this.tasks.length === 0) {
            const sampleTasks = [
                {
                    id: "task_1",
                    title: "Prepare quarterly presentation",
                    description: "Create slides for Q3 business review meeting",
                    category: "Work",
                    priority: "high",
                    deadline: "2025-01-15T10:00:00",
                    completed: false,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                },
                {
                    id: "task_2",
                    title: "Buy groceries",
                    description: "Milk, bread, vegetables, and fruits for the week",
                    category: "Personal",
                    priority: "medium",
                    deadline: "2025-01-13T18:00:00",
                    completed: false,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                },
                {
                    id: "task_3",
                    title: "Complete JavaScript course",
                    description: "Finish remaining modules on advanced JavaScript concepts",
                    category: "Learning",
                    priority: "medium",
                    deadline: "2025-01-20T23:59:00",
                    completed: false,
                    createdAt: new Date().toISOString(),
                    completedAt: null
                },
                {
                    id: "task_4",
                    title: "Book annual health checkup",
                    description: "Schedule appointment with Dr. Smith for yearly physical",
                    category: "Health",
                    priority: "high",
                    deadline: "2024-12-16T16:00:00",
                    completed: true,
                    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
                    completedAt: new Date().toISOString()
                }
            ];
            
            this.tasks = sampleTasks;
            this.saveToStorage();
        }
    }

    initializeElements() {
        // Theme toggle
        this.themeToggle = document.getElementById('themeToggle');
        
        // AI Assistant
        this.aiToggle = document.getElementById('aiToggle');
        this.aiAssistant = document.getElementById('aiAssistant');
        this.aiClose = document.getElementById('aiClose');
        this.aiInput = document.getElementById('aiInput');
        this.aiSend = document.getElementById('aiSend');
        this.aiChat = document.getElementById('aiChat');
        this.suggestionList = document.getElementById('suggestionList');
        
        // Task controls
        this.searchInput = document.getElementById('searchInput');
        this.sortSelect = document.getElementById('sortSelect');
        this.addTaskBtn = document.getElementById('addTaskBtn');
        this.quickTaskInput = document.getElementById('quickTaskInput');
        this.quickAddBtn = document.getElementById('quickAddBtn');
        
        // Task list
        this.taskList = document.getElementById('taskList');
        this.taskListTitle = document.getElementById('taskListTitle');
        
        // Modal
        this.taskModal = document.getElementById('taskModal');
        this.modalTitle = document.getElementById('modalTitle');
        this.taskForm = document.getElementById('taskForm');
        this.modalClose = document.getElementById('modalClose');
        this.cancelBtn = document.getElementById('cancelBtn');
        
        // Bulk actions
        this.bulkActions = document.getElementById('bulkActions');
        this.selectAllBtn = document.getElementById('selectAllBtn');
        this.bulkCompleteBtn = document.getElementById('bulkCompleteBtn');
        this.bulkDeleteBtn = document.getElementById('bulkDeleteBtn');

        // Filters
        this.categoryFilters = document.getElementById('categoryFilters');
    }

    bindEvents() {
        // Theme toggle
        if (this.themeToggle) {
            this.themeToggle.addEventListener('click', () => this.toggleTheme());
        }
        
        // AI Assistant
        if (this.aiToggle) {
            this.aiToggle.addEventListener('click', () => this.toggleAiAssistant());
        }
        if (this.aiClose) {
            this.aiClose.addEventListener('click', () => this.toggleAiAssistant());
        }
        if (this.aiSend) {
            this.aiSend.addEventListener('click', () => this.sendAiMessage());
        }
        if (this.aiInput) {
            this.aiInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.sendAiMessage();
            });
        }
        
        // Task controls
        if (this.searchInput) {
            this.searchInput.addEventListener('input', (e) => this.handleSearch(e.target.value));
        }
        if (this.sortSelect) {
            this.sortSelect.addEventListener('change', (e) => this.handleSort(e.target.value));
        }
        if (this.addTaskBtn) {
            this.addTaskBtn.addEventListener('click', () => this.openTaskModal());
        }
        if (this.quickAddBtn) {
            this.quickAddBtn.addEventListener('click', () => this.quickAddTask());
        }
        if (this.quickTaskInput) {
            this.quickTaskInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') this.quickAddTask();
            });
        }
        
        // Modal
        if (this.taskModal) {
            this.taskModal.addEventListener('click', (e) => {
                if (e.target === this.taskModal) this.closeTaskModal();
            });
        }
        if (this.modalClose) {
            this.modalClose.addEventListener('click', () => this.closeTaskModal());
        }
        if (this.cancelBtn) {
            this.cancelBtn.addEventListener('click', () => this.closeTaskModal());
        }
        if (this.taskForm) {
            this.taskForm.addEventListener('submit', (e) => this.handleTaskSubmit(e));
        }
        
        // Bulk actions
        if (this.selectAllBtn) {
            this.selectAllBtn.addEventListener('click', () => this.selectAllTasks());
        }
        if (this.bulkCompleteBtn) {
            this.bulkCompleteBtn.addEventListener('click', () => this.bulkCompleteSelected());
        }
        if (this.bulkDeleteBtn) {
            this.bulkDeleteBtn.addEventListener('click', () => this.bulkDeleteSelected());
        }

        // Escape key to close modals
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.taskModal && !this.taskModal.classList.contains('hidden')) {
                    this.closeTaskModal();
                }
            }
        });
    }

    populateCategories() {
        // Clear existing category filters except "All Tasks"
        const allTasksBtn = this.categoryFilters.querySelector('[data-category="all"]');
        this.categoryFilters.innerHTML = '';
        if (allTasksBtn) {
            this.categoryFilters.appendChild(allTasksBtn);
        } else {
            // Create "All Tasks" button if it doesn't exist
            const button = document.createElement('button');
            button.className = 'filter-btn active';
            button.dataset.category = 'all';
            button.innerHTML = `
                <span class="filter-icon">📋</span>
                All Tasks
                <span class="filter-count" id="allCount">0</span>
            `;
            button.addEventListener('click', () => this.setFilter('category', 'all'));
            this.categoryFilters.appendChild(button);
        }

        // Populate category filters
        this.categories.forEach(category => {
            const button = document.createElement('button');
            button.className = 'filter-btn';
            button.dataset.category = category.name.toLowerCase();
            button.innerHTML = `
                <span class="filter-icon">${category.icon}</span>
                ${category.name}
                <span class="filter-count" id="${category.name.toLowerCase()}Count">0</span>
            `;
            button.addEventListener('click', () => this.setFilter('category', category.name.toLowerCase()));
            this.categoryFilters.appendChild(button);
        });

        // Add status filter event listeners
        document.querySelectorAll('[data-status]').forEach(btn => {
            btn.addEventListener('click', () => this.setFilter('status', btn.dataset.status));
        });

        // Add priority filter event listeners
        document.querySelectorAll('[data-priority]').forEach(btn => {
            btn.addEventListener('click', () => this.setFilter('priority', btn.dataset.priority));
        });

        // Populate modal category select
        const taskCategory = document.getElementById('taskCategory');
        if (taskCategory) {
            taskCategory.innerHTML = '<option value="">Select Category</option>';
            this.categories.forEach(category => {
                const option = document.createElement('option');
                option.value = category.name;
                option.textContent = category.name;
                taskCategory.appendChild(option);
            });
        }
    }

    toggleTheme() {
        const currentTheme = document.body.getAttribute('data-color-scheme');
        const newTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.body.setAttribute('data-color-scheme', newTheme);
        
        const themeIcon = this.themeToggle.querySelector('.theme-icon');
        if (themeIcon) {
            themeIcon.textContent = newTheme === 'dark' ? '☀️' : '🌙';
        }
        
        localStorage.setItem('theme', newTheme);
    }

    toggleAiAssistant() {
        this.isAiAssistantOpen = !this.isAiAssistantOpen;
        if (this.aiAssistant) {
            this.aiAssistant.classList.toggle('active', this.isAiAssistantOpen);
        }
        
        if (this.isAiAssistantOpen) {
            this.generateSuggestions();
        }
    }

    sendAiMessage() {
        if (!this.aiInput) return;
        
        const message = this.aiInput.value.trim();
        if (!message) return;

        // Add user message to chat
        this.addAiMessage(message, 'user');
        this.aiInput.value = '';

        // Process the message and generate response
        setTimeout(() => {
            const response = this.processAiMessage(message);
            this.addAiMessage(response, 'assistant');
        }, 500);
    }

    addAiMessage(message, sender) {
        if (!this.aiChat) return;
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `ai-message ai-message--${sender}`;
        messageDiv.innerHTML = `
            <div class="ai-avatar">${sender === 'user' ? '👤' : '🤖'}</div>
            <div class="ai-content">
                <p>${message}</p>
            </div>
        `;
        this.aiChat.appendChild(messageDiv);
        this.aiChat.scrollTop = this.aiChat.scrollHeight;
    }

    processAiMessage(message) {
        const lowerMessage = message.toLowerCase();
        
        // Task creation patterns
        if (lowerMessage.includes('remind me') || lowerMessage.includes('add task') || lowerMessage.includes('create task')) {
            const task = this.parseTaskFromMessage(message);
            if (task) {
                this.createTask(task);
                return this.getRandomResponse('taskCreationSuccess');
            }
        }
        
        // Daily summary request
        if (lowerMessage.includes('plan for today') || lowerMessage.includes('today\'s tasks') || lowerMessage.includes('what\'s my day')) {
            return this.generateDailySummary();
        }
        
        // Productivity tips
        if (lowerMessage.includes('tips') || lowerMessage.includes('help') || lowerMessage.includes('productive')) {
            return this.getRandomResponse('productivityTips');
        }
        
        // Default helpful response
        return "I understand you'd like help with task management. Try asking me to create a task like 'Remind me to call mom tomorrow at 3 PM' or ask 'What's my plan for today?'";
    }

    parseTaskFromMessage(message) {
        // Simple natural language parsing simulation
        const patterns = {
            title: /(?:remind me to|add task|create task)\s+([^,]+?)(?:\s+(?:tomorrow|today|on|at|by)|\s*$)/i,
            time: /(?:at|@)\s+(\d{1,2}(?::\d{2})?\s*(?:am|pm|AM|PM)?)/i,
            date: /(tomorrow|today|next week|next monday|next tuesday|next wednesday|next thursday|next friday)/i
        };

        const titleMatch = message.match(patterns.title);
        if (!titleMatch) return null;

        const task = {
            title: titleMatch[1].trim(),
            category: this.inferCategory(message),
            priority: this.inferPriority(message),
            deadline: this.parseDeadline(message)
        };

        return task;
    }

    inferCategory(message) {
        const categoryKeywords = {
            'work': ['meeting', 'presentation', 'report', 'email', 'client', 'project'],
            'health': ['doctor', 'appointment', 'exercise', 'gym', 'medicine', 'checkup'],
            'personal': ['call', 'family', 'friend', 'home', 'personal'],
            'shopping': ['buy', 'purchase', 'store', 'groceries', 'shopping'],
            'learning': ['study', 'course', 'learn', 'read', 'practice']
        };

        const lowerMessage = message.toLowerCase();
        for (const [category, keywords] of Object.entries(categoryKeywords)) {
            if (keywords.some(keyword => lowerMessage.includes(keyword))) {
                return category.charAt(0).toUpperCase() + category.slice(1);
            }
        }
        return 'Personal';
    }

    inferPriority(message) {
        const lowerMessage = message.toLowerCase();
        if (lowerMessage.includes('urgent') || lowerMessage.includes('important') || lowerMessage.includes('asap')) {
            return 'high';
        }
        if (lowerMessage.includes('eventually') || lowerMessage.includes('sometime')) {
            return 'low';
        }
        return 'medium';
    }

    parseDeadline(message) {
        const now = new Date();
        const lowerMessage = message.toLowerCase();

        if (lowerMessage.includes('today')) {
            return new Date(now.getFullYear(), now.getMonth(), now.getDate(), 23, 59).toISOString();
        }
        if (lowerMessage.includes('tomorrow')) {
            const tomorrow = new Date(now);
            tomorrow.setDate(tomorrow.getDate() + 1);
            return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59).toISOString();
        }
        if (lowerMessage.includes('next week')) {
            const nextWeek = new Date(now);
            nextWeek.setDate(nextWeek.getDate() + 7);
            return new Date(nextWeek.getFullYear(), nextWeek.getMonth(), nextWeek.getDate(), 23, 59).toISOString();
        }

        // Default to tomorrow if no specific time mentioned
        const tomorrow = new Date(now);
        tomorrow.setDate(tomorrow.getDate() + 1);
        return new Date(tomorrow.getFullYear(), tomorrow.getMonth(), tomorrow.getDate(), 23, 59).toISOString();
    }

    generateDailySummary() {
        const today = new Date().toDateString();
        const todayTasks = this.tasks.filter(task => {
            if (!task.deadline) return false;
            return new Date(task.deadline).toDateString() === today;
        });

        const pendingToday = todayTasks.filter(task => !task.completed).length;
        const highPriority = this.tasks.filter(task => !task.completed && task.priority === 'high').length;
        const overdue = this.getOverdueTasks().length;

        let summary = `Here's your day ahead: `;
        if (pendingToday > 0) {
            summary += `You have ${pendingToday} tasks due today. `;
        }
        if (highPriority > 0) {
            summary += `${highPriority} high-priority items need attention. `;
        }
        if (overdue > 0) {
            summary += `⚠️ ${overdue} overdue tasks require immediate action. `;
        }
        
        if (pendingToday === 0 && highPriority === 0 && overdue === 0) {
            summary += `Looking great! No urgent tasks for today. Perfect time to work on long-term goals! 🎯`;
        }

        return summary;
    }

    getRandomResponse(category) {
        const responses = this.aiResponses[category];
        return responses[Math.floor(Math.random() * responses.length)];
    }

    generateSuggestions() {
        if (!this.suggestionList) return;
        
        const suggestions = [];
        
        // Task breakdown suggestions
        const largeTasks = this.tasks.filter(task => 
            !task.completed && 
            task.description && 
            task.description.length > 50
        );
        
        if (largeTasks.length > 0) {
            suggestions.push(`Break down "${largeTasks[0].title}" into smaller subtasks`);
        }

        // Priority suggestions
        const unsetPriorityTasks = this.tasks.filter(task => !task.completed && !task.priority);
        if (unsetPriorityTasks.length > 0) {
            suggestions.push('Set priorities for your unorganized tasks');
        }

        // Deadline suggestions
        const noDeadlineTasks = this.tasks.filter(task => !task.completed && !task.deadline);
        if (noDeadlineTasks.length > 0) {
            suggestions.push('Add deadlines to help prioritize your tasks');
        }

        // Productivity tips
        suggestions.push(this.getRandomResponse('productivityTips'));

        this.renderSuggestions(suggestions);
    }

    renderSuggestions(suggestions) {
        if (!this.suggestionList) return;
        
        this.suggestionList.innerHTML = '';
        suggestions.forEach(suggestion => {
            const item = document.createElement('div');
            item.className = 'suggestion-item';
            item.textContent = suggestion;
            item.addEventListener('click', () => {
                if (this.aiInput) {
                    this.aiInput.value = suggestion;
                    this.sendAiMessage();
                }
            });
            this.suggestionList.appendChild(item);
        });
    }

    setFilter(type, value) {
        // Update filter
        if (this.currentFilter[type] === value) {
            this.currentFilter[type] = type === 'category' ? 'all' : null;
        } else {
            this.currentFilter[type] = value;
        }

        // Update active filter buttons
        document.querySelectorAll('.filter-btn').forEach(btn => btn.classList.remove('active'));
        
        if (this.currentFilter.category !== 'all') {
            const btn = document.querySelector(`[data-category="${this.currentFilter.category}"]`);
            if (btn) btn.classList.add('active');
        } else {
            const btn = document.querySelector('[data-category="all"]');
            if (btn) btn.classList.add('active');
        }
        
        if (this.currentFilter.status) {
            const btn = document.querySelector(`[data-status="${this.currentFilter.status}"]`);
            if (btn) btn.classList.add('active');
        }
        
        if (this.currentFilter.priority) {
            const btn = document.querySelector(`[data-priority="${this.currentFilter.priority}"]`);
            if (btn) btn.classList.add('active');
        }

        this.updateTaskListTitle();
        this.renderTasks();
    }

    updateTaskListTitle() {
        if (!this.taskListTitle) return;
        
        let title = 'All Tasks';
        
        if (this.currentFilter.category !== 'all') {
            const category = this.categories.find(cat => cat.name.toLowerCase() === this.currentFilter.category);
            title = `${category?.name || 'Category'} Tasks`;
        }
        
        if (this.currentFilter.status) {
            title = this.currentFilter.status.charAt(0).toUpperCase() + this.currentFilter.status.slice(1) + ' Tasks';
        }
        
        if (this.currentFilter.priority) {
            title = this.currentFilter.priority.charAt(0).toUpperCase() + this.currentFilter.priority.slice(1) + ' Priority Tasks';
        }

        this.taskListTitle.textContent = title;
    }

    handleSearch(query) {
        this.currentFilter.search = query.toLowerCase();
        this.renderTasks();
    }

    handleSort(sortBy) {
        this.currentSort = sortBy;
        this.renderTasks();
    }

    quickAddTask() {
        if (!this.quickTaskInput) return;
        
        const input = this.quickTaskInput.value.trim();
        if (!input) return;

        const task = this.parseTaskFromMessage(`add task ${input}`);
        if (task) {
            this.createTask(task);
            this.quickTaskInput.value = '';
            
            // Show AI response
            if (this.isAiAssistantOpen && this.aiChat) {
                this.addAiMessage(`Created task: ${task.title}`, 'assistant');
            }
        } else {
            // Simple task creation
            const simpleTask = {
                title: input,
                category: 'Personal',
                priority: 'medium',
                deadline: null
            };
            this.createTask(simpleTask);
            this.quickTaskInput.value = '';
        }
    }

    openTaskModal(task = null) {
        if (!this.taskModal) return;
        
        this.editingTask = task;
        if (this.modalTitle) {
            this.modalTitle.textContent = task ? 'Edit Task' : 'Add New Task';
        }
        
        if (task) {
            const taskId = document.getElementById('taskId');
            const taskTitle = document.getElementById('taskTitle');
            const taskDescription = document.getElementById('taskDescription');
            const taskCategory = document.getElementById('taskCategory');
            const taskPriority = document.getElementById('taskPriority');
            const taskDeadline = document.getElementById('taskDeadline');
            
            if (taskId) taskId.value = task.id;
            if (taskTitle) taskTitle.value = task.title;
            if (taskDescription) taskDescription.value = task.description || '';
            if (taskCategory) taskCategory.value = task.category;
            if (taskPriority) taskPriority.value = task.priority;
            if (taskDeadline) taskDeadline.value = task.deadline ? 
                new Date(task.deadline).toISOString().slice(0, 16) : '';
        } else {
            if (this.taskForm) this.taskForm.reset();
            const taskId = document.getElementById('taskId');
            if (taskId) taskId.value = '';
        }
        
        this.taskModal.classList.remove('hidden');
        const taskTitle = document.getElementById('taskTitle');
        if (taskTitle) taskTitle.focus();
    }

    closeTaskModal() {
        if (!this.taskModal) return;
        
        this.taskModal.classList.add('hidden');
        this.editingTask = null;
        if (this.taskForm) this.taskForm.reset();
    }

    handleTaskSubmit(e) {
        e.preventDefault();
        
        const taskTitle = document.getElementById('taskTitle');
        const taskDescription = document.getElementById('taskDescription');
        const taskCategory = document.getElementById('taskCategory');
        const taskPriority = document.getElementById('taskPriority');
        const taskDeadline = document.getElementById('taskDeadline');
        
        if (!taskTitle || !taskCategory || !taskPriority) return;
        
        const task = {
            title: taskTitle.value.trim(),
            description: taskDescription ? taskDescription.value.trim() : '',
            category: taskCategory.value,
            priority: taskPriority.value,
            deadline: taskDeadline ? taskDeadline.value || null : null
        };

        if (!task.title || !task.category || !task.priority) {
            alert('Please fill in all required fields');
            return;
        }

        if (this.editingTask) {
            this.updateTask(this.editingTask.id, task);
        } else {
            this.createTask(task);
        }

        this.closeTaskModal();
    }

    createTask(taskData) {
        const task = {
            id: 'task_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9),
            ...taskData,
            completed: false,
            createdAt: new Date().toISOString(),
            completedAt: null
        };

        this.tasks.push(task);
        this.saveToStorage();
        this.renderTasks();
        this.updateCounts();
        this.updateStats();
    }

    updateTask(id, updates) {
        const taskIndex = this.tasks.findIndex(task => task.id === id);
        if (taskIndex !== -1) {
            this.tasks[taskIndex] = { ...this.tasks[taskIndex], ...updates };
            this.saveToStorage();
            this.renderTasks();
            this.updateCounts();
            this.updateStats();
        }
    }

    toggleTaskComplete(id) {
        const task = this.tasks.find(task => task.id === id);
        if (task) {
            task.completed = !task.completed;
            task.completedAt = task.completed ? new Date().toISOString() : null;
            this.saveToStorage();
            this.renderTasks();
            this.updateCounts();
            this.updateStats();
        }
    }

    deleteTask(id) {
        if (confirm('Are you sure you want to delete this task?')) {
            this.tasks = this.tasks.filter(task => task.id !== id);
            this.selectedTasks.delete(id);
            this.saveToStorage();
            this.renderTasks();
            this.updateCounts();
            this.updateStats();
        }
    }

    selectAllTasks() {
        const visibleTasks = this.getFilteredTasks();
        const allSelected = visibleTasks.every(task => this.selectedTasks.has(task.id));
        
        if (allSelected) {
            visibleTasks.forEach(task => this.selectedTasks.delete(task.id));
        } else {
            visibleTasks.forEach(task => this.selectedTasks.add(task.id));
        }
        
        this.renderTasks();
        this.updateBulkActions();
    }

    bulkCompleteSelected() {
        this.selectedTasks.forEach(id => {
            const task = this.tasks.find(task => task.id === id);
            if (task && !task.completed) {
                task.completed = true;
                task.completedAt = new Date().toISOString();
            }
        });
        
        this.selectedTasks.clear();
        this.saveToStorage();
        this.renderTasks();
        this.updateCounts();
        this.updateStats();
        this.updateBulkActions();
    }

    bulkDeleteSelected() {
        if (confirm(`Delete ${this.selectedTasks.size} selected tasks?`)) {
            this.tasks = this.tasks.filter(task => !this.selectedTasks.has(task.id));
            this.selectedTasks.clear();
            this.saveToStorage();
            this.renderTasks();
            this.updateCounts();
            this.updateStats();
            this.updateBulkActions();
        }
    }

    updateBulkActions() {
        if (this.bulkActions) {
            this.bulkActions.style.display = this.selectedTasks.size > 0 ? 'flex' : 'none';
        }
    }

    getFilteredTasks() {
        return this.tasks.filter(task => {
            // Category filter
            if (this.currentFilter.category !== 'all' && 
                task.category.toLowerCase() !== this.currentFilter.category) {
                return false;
            }
            
            // Status filter
            if (this.currentFilter.status) {
                switch (this.currentFilter.status) {
                    case 'pending':
                        if (task.completed) return false;
                        break;
                    case 'completed':
                        if (!task.completed) return false;
                        break;
                    case 'overdue':
                        if (task.completed || !this.isOverdue(task)) return false;
                        break;
                    case 'today':
                        if (!task.deadline || !this.isDueToday(task)) return false;
                        break;
                }
            }
            
            // Priority filter
            if (this.currentFilter.priority && task.priority !== this.currentFilter.priority) {
                return false;
            }
            
            // Search filter
            if (this.currentFilter.search) {
                const searchLower = this.currentFilter.search;
                return task.title.toLowerCase().includes(searchLower) ||
                       (task.description && task.description.toLowerCase().includes(searchLower));
            }
            
            return true;
        });
    }

    getSortedTasks(tasks) {
        return tasks.sort((a, b) => {
            switch (this.currentSort) {
                case 'deadline':
                    if (!a.deadline && !b.deadline) return 0;
                    if (!a.deadline) return 1;
                    if (!b.deadline) return -1;
                    return new Date(a.deadline) - new Date(b.deadline);
                    
                case 'priority':
                    const priorityValues = { high: 3, medium: 2, low: 1 };
                    return (priorityValues[b.priority] || 0) - (priorityValues[a.priority] || 0);
                    
                case 'category':
                    return a.category.localeCompare(b.category);
                    
                case 'created':
                    return new Date(b.createdAt) - new Date(a.createdAt);
                    
                default:
                    return 0;
            }
        });
    }

    renderTasks() {
        if (!this.taskList) return;
        
        const filteredTasks = this.getFilteredTasks();
        const sortedTasks = this.getSortedTasks(filteredTasks);
        
        if (sortedTasks.length === 0) {
            this.taskList.innerHTML = `
                <div class="empty-state">
                    <div class="empty-state-icon">📝</div>
                    <h3>No tasks found</h3>
                    <p>Try adjusting your filters or create a new task</p>
                </div>
            `;
            return;
        }

        this.taskList.innerHTML = '';
        sortedTasks.forEach(task => {
            const taskElement = this.createTaskElement(task);
            this.taskList.appendChild(taskElement);
        });

        this.updateBulkActions();
    }

    createTaskElement(task) {
        const taskDiv = document.createElement('div');
        taskDiv.className = `task-item ${task.completed ? 'completed' : ''} ${this.isOverdue(task) ? 'overdue' : ''}`;
        
        const category = this.categories.find(cat => cat.name === task.category);
        const priority = this.priorities.find(p => p.name.toLowerCase() === task.priority);
        
        const deadlineText = this.formatDeadline(task.deadline);
        const deadlineClass = this.getDeadlineClass(task);

        taskDiv.innerHTML = `
            <input type="checkbox" class="task-checkbox" ${this.selectedTasks.has(task.id) ? 'checked' : ''}>
            <input type="checkbox" class="task-complete-checkbox" ${task.completed ? 'checked' : ''}>
            <div class="task-content">
                <div class="task-header">
                    <h4 class="task-title">${task.title}</h4>
                    <div class="task-actions">
                        <button class="task-action-btn edit" title="Edit">✏️</button>
                        <button class="task-action-btn delete" title="Delete">🗑️</button>
                    </div>
                </div>
                ${task.description ? `<p class="task-description">${task.description}</p>` : ''}
                <div class="task-meta">
                    <span class="task-category" style="background-color: ${category?.color}20; color: ${category?.color}">
                        ${category?.icon} ${task.category}
                    </span>
                    <span class="task-priority">
                        <span class="priority-dot priority-${task.priority}"></span>
                        ${task.priority.charAt(0).toUpperCase() + task.priority.slice(1)} Priority
                    </span>
                    ${task.deadline ? `<span class="task-deadline ${deadlineClass}">${deadlineText}</span>` : ''}
                </div>
            </div>
        `;

        // Add event listeners
        const checkbox = taskDiv.querySelector('.task-checkbox');
        const completeCheckbox = taskDiv.querySelector('.task-complete-checkbox');
        const editBtn = taskDiv.querySelector('.edit');
        const deleteBtn = taskDiv.querySelector('.delete');
        const titleElement = taskDiv.querySelector('.task-title');

        if (checkbox) {
            checkbox.addEventListener('change', (e) => {
                if (e.target.checked) {
                    this.selectedTasks.add(task.id);
                } else {
                    this.selectedTasks.delete(task.id);
                }
                this.updateBulkActions();
            });
        }

        if (completeCheckbox) {
            completeCheckbox.addEventListener('change', () => this.toggleTaskComplete(task.id));
        }

        if (editBtn) {
            editBtn.addEventListener('click', () => this.openTaskModal(task));
        }

        if (deleteBtn) {
            deleteBtn.addEventListener('click', () => this.deleteTask(task.id));
        }

        if (titleElement) {
            titleElement.addEventListener('click', () => this.openTaskModal(task));
        }

        return taskDiv;
    }

    formatDeadline(deadline) {
        if (!deadline) return '';
        
        const date = new Date(deadline);
        const now = new Date();
        const diffTime = date - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffDays < 0) {
            return `${Math.abs(diffDays)} days overdue`;
        } else if (diffDays === 0) {
            return `Due today at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else if (diffDays === 1) {
            return `Due tomorrow at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        } else {
            return `Due ${date.toLocaleDateString()} at ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
        }
    }

    getDeadlineClass(task) {
        if (!task.deadline || task.completed) return '';
        
        const now = new Date();
        const deadline = new Date(task.deadline);
        const diffTime = deadline - now;
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        if (diffTime < 0) return 'overdue';
        if (diffDays <= 1) return 'today';
        return '';
    }

    isOverdue(task) {
        return task.deadline && !task.completed && new Date(task.deadline) < new Date();
    }

    isDueToday(task) {
        if (!task.deadline) return false;
        const today = new Date().toDateString();
        return new Date(task.deadline).toDateString() === today;
    }

    getOverdueTasks() {
        return this.tasks.filter(task => this.isOverdue(task));
    }

    updateCounts() {
        // Category counts
        const allCountEl = document.getElementById('allCount');
        if (allCountEl) allCountEl.textContent = this.tasks.length;
        
        this.categories.forEach(category => {
            const count = this.tasks.filter(task => task.category === category.name).length;
            const element = document.getElementById(`${category.name.toLowerCase()}Count`);
            if (element) element.textContent = count;
        });

        // Status counts
        const pendingCountEl = document.getElementById('pendingCount');
        const completedCountEl = document.getElementById('completedCount');
        const overdueCountEl = document.getElementById('overdueCount');
        const todayCountEl = document.getElementById('todayCount');
        
        if (pendingCountEl) pendingCountEl.textContent = this.tasks.filter(task => !task.completed).length;
        if (completedCountEl) completedCountEl.textContent = this.tasks.filter(task => task.completed).length;
        if (overdueCountEl) overdueCountEl.textContent = this.getOverdueTasks().length;
        if (todayCountEl) todayCountEl.textContent = this.tasks.filter(task => this.isDueToday(task)).length;

        // Priority counts
        const highCountEl = document.getElementById('highCount');
        const mediumCountEl = document.getElementById('mediumCount');
        const lowCountEl = document.getElementById('lowCount');
        
        if (highCountEl) highCountEl.textContent = this.tasks.filter(task => task.priority === 'high' && !task.completed).length;
        if (mediumCountEl) mediumCountEl.textContent = this.tasks.filter(task => task.priority === 'medium' && !task.completed).length;
        if (lowCountEl) lowCountEl.textContent = this.tasks.filter(task => task.priority === 'low' && !task.completed).length;
    }

    updateStats() {
        const total = this.tasks.length;
        const completed = this.tasks.filter(task => task.completed).length;
        const completedToday = this.tasks.filter(task => 
            task.completed && 
            task.completedAt && 
            new Date(task.completedAt).toDateString() === new Date().toDateString()
        ).length;
        
        const completionRate = total > 0 ? Math.round((completed / total) * 100) : 0;

        const totalTasksEl = document.getElementById('totalTasks');
        const completedTodayEl = document.getElementById('completedToday');
        const productivityScoreEl = document.getElementById('productivityScore');
        
        if (totalTasksEl) totalTasksEl.textContent = total;
        if (completedTodayEl) completedTodayEl.textContent = completedToday;
        if (productivityScoreEl) productivityScoreEl.textContent = `${completionRate}%`;

        // Footer stats
        const pending = total - completed;
        const footerProgressEl = document.getElementById('footerProgress');
        const footerStreakEl = document.getElementById('footerStreak');
        
        if (footerProgressEl) footerProgressEl.textContent = `${completedToday}/${pending + completedToday} tasks completed`;
        if (footerStreakEl) footerStreakEl.textContent = this.calculateStreak() + ' days';
    }

    calculateStreak() {
        // Simple streak calculation - days with completed tasks
        const today = new Date();
        let streak = 0;
        
        for (let i = 0; i < 30; i++) {
            const date = new Date(today);
            date.setDate(date.getDate() - i);
            const dateString = date.toDateString();
            
            const hasCompletedTask = this.tasks.some(task => 
                task.completed && 
                task.completedAt &&
                new Date(task.completedAt).toDateString() === dateString
            );
            
            if (hasCompletedTask) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }
        
        return streak;
    }

    saveToStorage() {
        try {
            localStorage.setItem('taskmaster_tasks', JSON.stringify(this.tasks));
            localStorage.setItem('taskmaster_filters', JSON.stringify(this.currentFilter));
            localStorage.setItem('taskmaster_sort', this.currentSort);
        } catch (error) {
            console.warn('Could not save to localStorage:', error);
        }
    }

    loadFromStorage() {
        try {
            const savedTasks = localStorage.getItem('taskmaster_tasks');
            const savedFilters = localStorage.getItem('taskmaster_filters');
            const savedSort = localStorage.getItem('taskmaster_sort');
            const savedTheme = localStorage.getItem('theme');
            
            if (savedTasks) {
                this.tasks = JSON.parse(savedTasks);
            }
            
            if (savedFilters) {
                this.currentFilter = { ...this.currentFilter, ...JSON.parse(savedFilters) };
            }
            
            if (savedSort) {
                this.currentSort = savedSort;
                // Update sort select
                setTimeout(() => {
                    if (this.sortSelect) this.sortSelect.value = savedSort;
                }, 100);
            }

            if (savedTheme) {
                document.body.setAttribute('data-color-scheme', savedTheme);
                const themeIcon = document.querySelector('.theme-icon');
                if (themeIcon) {
                    themeIcon.textContent = savedTheme === 'dark' ? '☀️' : '🌙';
                }
            }
        } catch (error) {
            console.warn('Could not load from localStorage:', error);
        }
    }
}

// Initialize the application
const app = new TaskMasterAI();

// Export for global access
window.app = app;