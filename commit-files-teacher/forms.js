// FORMS JAVASCRIPT FILE - All Create/Edit Assignment and Quiz Functionality

// ==================== SHARED FORM FUNCTIONALITY ====================

// Setup date/time listeners (for enhanced date/time interface)
function setupDateTimeListeners() {
    const dueDateInput = document.getElementById('dueDate');
    const dueTimeInput = document.getElementById('dueTime');
    
    if (dueDateInput) {
        dueDateInput.addEventListener('change', updateDateTimePreview);
    }
    
    if (dueTimeInput) {
        dueTimeInput.addEventListener('change', updateDateTimePreview);
    }
}

// Update date/time preview
function updateDateTimePreview() {
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;
    const preview = document.getElementById('datetimePreview');
    const clearBtn = document.getElementById('clearBtn');
    
    if (dueDate || dueTime) {
        let displayText = '';
        
        if (dueDate) {
            const date = new Date(dueDate);
            const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
            displayText = date.toLocaleDateString('en-US', options);
        }
        
        if (dueTime) {
            displayText += displayText ? ' at ' : '';
            displayText += formatTime(dueTime);
        }
        
        preview.textContent = displayText;
        clearBtn.style.display = 'block';
    } else {
        preview.textContent = 'No due date set';
        clearBtn.style.display = 'none';
    }
}

// Format time for display
function formatTime(time) {
    const [hours, minutes] = time.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const displayHour = hour % 12 || 12;
    return `${displayHour}:${minutes} ${ampm}`;
}

// Clear date/time
function clearDateTime() {
    document.getElementById('dueDate').value = '';
    document.getElementById('dueTime').value = '';
    updateDateTimePreview();
}

// Set quick date/time options
function setQuickDateTime(option) {
    const now = new Date();
    let targetDate = new Date();
    
    switch (option) {
        case 'tomorrow':
            targetDate.setDate(now.getDate() + 1);
            break;
        case 'week':
            targetDate.setDate(now.getDate() + 7);
            break;
        case 'month':
            targetDate.setMonth(now.getMonth() + 1);
            break;
    }
    
    // Set time to 11:59 PM
    targetDate.setHours(23, 59, 0, 0);
    
    // Update inputs
    document.getElementById('dueDate').value = targetDate.toISOString().split('T')[0];
    document.getElementById('dueTime').value = '23:59';
    
    // Update preview
    updateDateTimePreview();
    
    // Show success feedback
    showNotification('Due date set successfully!', 'success');
}

// Setup form validation
function setupFormValidation() {
    const formInputs = document.querySelectorAll('.form-input, .form-select, .form-textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('blur', function() {
            validateField(this);
        });
        
        input.addEventListener('input', function() {
            clearFieldError(this);
        });
    });
}

// Validate individual field
function validateField(field) {
    const value = field.value.trim();
    const fieldName = field.id || field.name;
    
    clearFieldError(field);
    
    if (!value && field.hasAttribute('required')) {
        showFieldError(field, 'This field is required');
        return false;
    }
    
    // Specific validations
    switch (fieldName) {
        case 'assignmentTitle':
        case 'quizTitle':
            if (value.length < 3) {
                showFieldError(field, 'Title must be at least 3 characters long');
                return false;
            }
            break;
            
        case 'points':
        case 'totalPoints':
            const points = parseInt(value);
            if (isNaN(points) || points < 1) {
                showFieldError(field, 'Points must be a positive number');
                return false;
            }
            if (points > 1000) {
                showFieldError(field, 'Points cannot exceed 1000');
                return false;
            }
            break;
            
        case 'course':
            if (!value) {
                showFieldError(field, 'Please select a course');
                return false;
            }
            break;
            
        case 'dueDate':
            const selectedDate = new Date(value);
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            
            if (selectedDate < today) {
                showFieldError(field, 'Due date cannot be in the past');
                return false;
            }
            break;
    }
    
    return true;
}

// Show field error
function showFieldError(field, message) {
    clearFieldError(field);
    
    field.style.borderColor = 'rgba(220, 53, 69, 1)';
    
    const errorElement = document.createElement('div');
    errorElement.className = 'field-error';
    errorElement.textContent = message;
    errorElement.style.color = 'rgba(220, 53, 69, 1)';
    errorElement.style.fontSize = '12px';
    errorElement.style.marginTop = '5px';
    
    field.parentNode.appendChild(errorElement);
}

// Clear field error
function clearFieldError(field) {
    field.style.borderColor = '';
    const errorElement = field.parentNode.querySelector('.field-error');
    if (errorElement) {
        errorElement.remove();
    }
}

// Validate entire form
function validateForm() {
    const requiredFields = ['assignmentTitle', 'quizTitle', 'instructions', 'points', 'totalPoints', 'course', 'dueDate', 'dueTime'];
    let isValid = true;
    
    requiredFields.forEach(fieldId => {
        const field = document.getElementById(fieldId);
        if (field && !validateField(field)) {
            isValid = false;
        }
    });
    
    return isValid;
}

// Collect form data
function collectFormData() {
    const isQuiz = document.getElementById('quizTitle') !== null;
    
    if (isQuiz) {
        return {
            title: document.getElementById('quizTitle').value,
            instructions: document.getElementById('instructions').value,
            points: parseInt(document.getElementById('totalPoints').value),
            course: document.getElementById('course').value,
            dueDate: document.getElementById('dueDate').value,
            dueTime: document.getElementById('dueTime').value,
            timeLimit: document.getElementById('timeLimit').value,
            shuffleQuestions: document.getElementById('shuffleQuestions')?.checked || false,
            showResults: document.getElementById('showResults')?.checked || false,
            allowRetakes: document.getElementById('allowRetakes')?.checked || false,
            notifyStudents: document.getElementById('notifyStudents')?.checked || false,
            updatedAt: new Date().toISOString(),
            status: 'published'
        };
    } else {
        return {
            title: document.getElementById('assignmentTitle').value,
            instructions: document.getElementById('instructions').value,
            points: parseInt(document.getElementById('points').value),
            course: document.getElementById('course').value,
            dueDate: document.getElementById('dueDate').value,
            dueTime: document.getElementById('dueTime').value,
            allowLateSubmission: document.getElementById('allowLateSubmission')?.checked || false,
            showRubric: document.getElementById('showRubric')?.checked || false,
            notifyStudents: document.getElementById('notifyStudents')?.checked || false,
            updatedAt: new Date().toISOString(),
            status: 'published'
        };
    }
}

// ==================== CREATE ASSIGNMENT FUNCTIONALITY ====================

// Assignment Creation JavaScript
function handleAssignmentSubmit(e) {
    e.preventDefault();
    
    // Get form data
    const formData = new FormData(e.target);
    const assignmentData = {
        title: formData.get('title'),
        instructions: formData.get('instructions'),
        points: formData.get('points'),
        course: formData.get('course'),
        dueDate: formData.get('dueDate'),
        dueTime: formData.get('dueTime'),
        allowLateSubmission: formData.get('allowLateSubmission') === 'on',
        showRubric: formData.get('showRubric') === 'on',
        notifyStudents: formData.get('notifyStudents') === 'on'
    };
    
    // Validate form data
    if (!validateAssignmentData(assignmentData)) {
        return;
    }
    
    // Show loading state
    showLoadingState();
    
    // Simulate API call
    setTimeout(() => {
        // Save assignment (in real app, this would be an API call)
        saveAssignment(assignmentData);
        
        // Hide loading state
        hideLoadingState();
        
        // Show success message
        showFormMessage('Assignment published successfully!', 'success');
        
        // Redirect after delay
        setTimeout(() => {
            window.location.href = 'teacher.html';
        }, 2000);
    }, 1500);
}

// Validate assignment data
function validateAssignmentData(data) {
    // Check required fields
    if (!data.title || data.title.trim().length < 3) {
        showFormMessage('Title must be at least 3 characters long', 'error');
        return false;
    }
    
    if (!data.instructions || data.instructions.trim().length < 10) {
        showFormMessage('Instructions must be at least 10 characters long', 'error');
        return false;
    }
    
    if (!data.points || data.points < 1 || data.points > 1000) {
        showFormMessage('Points must be between 1 and 1000', 'error');
        return false;
    }
    
    if (!data.course) {
        showFormMessage('Please select a course', 'error');
        return false;
    }
    
    if (!data.dueDate) {
        showFormMessage('Please select a due date', 'error');
        return false;
    }
    
    if (!data.dueTime) {
        showFormMessage('Please select a due time', 'error');
        return false;
    }
    
    // Check if due date is in the future
    const dueDateTime = new Date(`${data.dueDate}T${data.dueTime}`);
    const now = new Date();
    if (dueDateTime <= now) {
        showFormMessage('Due date must be in the future', 'error');
        return false;
    }
    
    return true;
}

// Setup date validation
function setupDateValidation() {
    const dueDateInput = document.getElementById('dueDate');
    const dueTimeInput = document.getElementById('dueTime');
    
    if (dueDateInput) {
        // Set minimum date to today
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.setAttribute('min', today);
        
        // Add change event listener
        dueDateInput.addEventListener('change', function() {
            validateDueDateTime();
        });
    }
    
    if (dueTimeInput) {
        dueTimeInput.addEventListener('change', function() {
            validateDueDateTime();
        });
    }
}

// Validate due date and time
function validateDueDateTime() {
    const dueDateInput = document.getElementById('dueDate');
    const dueTimeInput = document.getElementById('dueTime');
    
    if (dueDateInput.value && dueTimeInput.value) {
        const dueDateTime = new Date(`${dueDateInput.value}T${dueTimeInput.value}`);
        const now = new Date();
        
        if (dueDateTime <= now) {
            showFormMessage('Due date must be in the future', 'error');
            dueDateInput.classList.add('error');
            dueTimeInput.classList.add('error');
        } else {
            clearFormMessage();
            dueDateInput.classList.remove('error');
            dueTimeInput.classList.remove('error');
        }
    }
}

// Setup character counters
function setupCharacterCounters() {
    const titleInput = document.getElementById('assignmentTitle');
    const instructionsTextarea = document.getElementById('instructions');
    
    if (titleInput) {
        titleInput.addEventListener('input', function() {
            const charCount = this.value.length;
            const maxLength = 100;
            
            if (charCount > maxLength) {
                this.value = this.value.substring(0, maxLength);
            }
        });
    }
    
    if (instructionsTextarea) {
        instructionsTextarea.addEventListener('input', function() {
            const charCount = this.value.length;
            const maxLength = 2000;
            
            if (charCount > maxLength) {
                this.value = this.value.substring(0, maxLength);
            }
        });
    }
}

// Setup auto-save functionality
function setupAutoSave() {
    let autoSaveTimer;
    const formInputs = document.querySelectorAll('#assignmentForm input, #assignmentForm select, #assignmentForm textarea');
    
    formInputs.forEach(input => {
        input.addEventListener('input', function() {
            clearTimeout(autoSaveTimer);
            autoSaveTimer = setTimeout(() => {
                autoSaveDraft();
            }, 30000); // Auto-save after 30 seconds of inactivity
        });
    });
}

// Auto-save draft
function autoSaveDraft() {
    const formData = new FormData(document.getElementById('assignmentForm'));
    const draftData = {};
    
    for (let [key, value] of formData.entries()) {
        draftData[key] = value;
    }
    
    // Save to localStorage
    localStorage.setItem('assignmentDraft', JSON.stringify(draftData));
    
    // Show subtle notification
    showFormMessage('Draft auto-saved', 'info', 2000);
}

// Save draft manually
function saveDraft() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly before saving.', 'error');
        return;
    }
    
    const assignmentData = collectFormData();
    
    // In a real app, this would save to a database
    console.log('Saving draft:', assignmentData);
    
    // Show success message
    showNotification('Assignment saved as draft successfully!', 'success');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// Load draft from localStorage
function loadDraft() {
    const draftData = localStorage.getItem('assignmentDraft');
    
    if (draftData) {
        const draft = JSON.parse(draftData);
        const form = document.getElementById('assignmentForm');
        
        // Populate form fields
        Object.keys(draft).forEach(key => {
            const field = form.querySelector(`[name="${key}"]`);
            if (field) {
                if (field.type === 'checkbox') {
                    field.checked = draft[key] === 'on';
                } else {
                    field.value = draft[key];
                }
            }
        });
        
        showFormMessage('Draft loaded', 'info', 2000);
    }
}

// Save assignment (simulated)
function saveAssignment(assignmentData) {
    // In a real app, this would make an API call
    console.log('Saving assignment:', assignmentData);
    
    // Clear draft after successful save
    localStorage.removeItem('assignmentDraft');
}

// ==================== CREATE QUIZ FUNCTIONALITY ====================

// Save quiz draft
function saveQuizDraft() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly before saving.', 'error');
        return;
    }
    
    const quizData = collectFormData();
    
    // In a real app, this would save to a database
    console.log('Saving draft:', quizData);
    
    // Show success message
    showNotification('Quiz saved as draft successfully!', 'success');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// Publish quiz
function publishQuiz() {
    // Validate form
    const title = document.getElementById('quizTitle').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    const points = document.getElementById('points').value.trim();
    const course = document.getElementById('course').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;
    
    if (!title || !instructions || !points || !course || !dueDate || !dueTime) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (questions.length === 0) {
        showNotification('Please add at least one question to the quiz', 'error');
        return;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.question.trim()) {
            showNotification(`Please enter text for Question ${i + 1}`, 'error');
            return;
        }
        
        if (question.type === 'multiple-choice') {
            const validOptions = question.options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                showNotification(`Question ${i + 1} needs at least 2 valid options`, 'error');
                return;
            }
        }
    }
    
    // Collect form data including questions
    const quizData = {
        title: title,
        instructions: instructions,
        points: parseInt(points),
        course: course,
        dueDate: dueDate,
        dueTime: dueTime,
        questions: getQuestionsData(),
        createdAt: new Date().toISOString()
    };
    
    // In a real app, this would save to a database and notify students
    console.log('Publishing quiz:', quizData);
    
    // Show success message
    showNotification('Quiz published successfully! Students will be notified.', 'success');
    
    // Clear draft
    localStorage.removeItem('quizDraft');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// Add questions functionality
function addQuestions() {
    showNotification('Question builder coming soon!', 'info');
}

// Publish assignment
function publishAssignment() {
    // Validate form
    const title = document.getElementById('assignmentTitle').value.trim();
    const instructions = document.getElementById('instructions').value.trim();
    const points = document.getElementById('points').value.trim();
    const course = document.getElementById('course').value.trim();
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;
    
    if (!title || !instructions || !points || !course || !dueDate || !dueTime) {
        showNotification('Please fill in all required fields', 'error');
        return;
    }
    
    if (questions.length === 0) {
        showNotification('Please add at least one question to the assignment', 'error');
        return;
    }
    
    // Validate questions
    for (let i = 0; i < questions.length; i++) {
        const question = questions[i];
        if (!question.question.trim()) {
            showNotification(`Please enter text for Question ${i + 1}`, 'error');
            return;
        }
        
        if (question.type === 'multiple-choice') {
            const validOptions = question.options.filter(opt => opt.trim());
            if (validOptions.length < 2) {
                showNotification(`Question ${i + 1} needs at least 2 valid options`, 'error');
                return;
            }
        }
    }
    
    // Collect form data including questions
    const assignmentData = {
        title: title,
        instructions: instructions,
        points: parseInt(points),
        course: course,
        dueDate: dueDate,
        dueTime: dueTime,
        questions: getQuestionsData(),
        createdAt: new Date().toISOString()
    };
    
    // Simulate API call
    console.log('Publishing assignment:', assignmentData);
    
    // Show success message
    showNotification('Assignment published successfully!', 'success');
    
    // Clear draft
    localStorage.removeItem('assignmentDraft');
    
    // Redirect to dashboard after delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// ==================== EDIT ASSIGNMENT FUNCTIONALITY ====================

// Save assignment changes
function saveAssignmentChanges() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly before saving.', 'error');
        return;
    }
    
    const assignmentData = collectFormData();
    
    // In a real app, this would update the database
    console.log('Updating assignment:', assignmentData);
    
    // Show success message
    showNotification('Assignment updated successfully!', 'success');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// Update assignment (same as save for editing)
function updateAssignment() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly before updating.', 'error');
        return;
    }
    
    // Additional validation for updating
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;
    
    if (!dueTime) {
        showNotification('Please specify a due time for the assignment.', 'error');
        return;
    }
    
    const assignmentData = collectFormData();
    
    // In a real app, this would update the database and notify students
    console.log('Publishing updated assignment:', assignmentData);
    
    // Show success message
    showNotification('Assignment updated and published successfully! Students will be notified.', 'success');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// ==================== EDIT QUIZ FUNCTIONALITY ====================

// Save quiz changes
function saveQuizChanges() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly before saving.', 'error');
        return;
    }
    
    const quizData = collectFormData();
    
    // In a real app, this would update the database
    console.log('Updating quiz:', quizData);
    
    // Show success message
    showNotification('Quiz updated successfully!', 'success');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// Update quiz (same as save for editing)
function updateQuiz() {
    if (!validateForm()) {
        showNotification('Please fill in all required fields correctly before updating.', 'error');
        return;
    }
    
    // Additional validation for updating
    const dueDate = document.getElementById('dueDate').value;
    const dueTime = document.getElementById('dueTime').value;
    
    if (!dueTime) {
        showNotification('Please specify a due time for the quiz.', 'error');
        return;
    }
    
    const quizData = collectFormData();
    
    // In a real app, this would update the database and notify students
    console.log('Publishing updated quiz:', quizData);
    
    // Show success message
    showNotification('Quiz updated and published successfully! Students will be notified.', 'success');
    
    // Redirect to dashboard after a delay
    setTimeout(() => {
        goToDashboard();
    }, 2000);
}

// ==================== SHARED UTILITY FUNCTIONS ====================

// Show form message
function showFormMessage(message, type, duration = 5000) {
    // Remove existing messages
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
    
    // Create new message
    const messageElement = document.createElement('div');
    messageElement.className = `form-message ${type}`;
    messageElement.textContent = message;
    messageElement.style.display = 'block';
    
    // Insert after form header
    const formHeader = document.querySelector('.creation-header, .page-header');
    if (formHeader) {
        formHeader.after(messageElement);
    }
    
    // Auto-hide after duration
    if (duration > 0) {
        setTimeout(() => {
            if (messageElement.parentNode) {
                messageElement.remove();
            }
        }, duration);
    }
}

// Clear form message
function clearFormMessage() {
    const existingMessage = document.querySelector('.form-message');
    if (existingMessage) {
        existingMessage.remove();
    }
}

// Show loading state
function showLoadingState() {
    const submitButton = document.querySelector('.btn-publish');
    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerHTML = '<i class="fas fa-spinner fa-spin"></i> Publishing...';
    }
}

// Hide loading state
function hideLoadingState() {
    const submitButton = document.querySelector('.btn-publish');
    if (submitButton) {
        submitButton.disabled = false;
        submitButton.innerHTML = '<i class="fas fa-paper-plane"></i> Publish Assignment';
    }
}

// Show notification (reused from main.js)
function showNotification(message, type = 'info') {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 8px;
        color: white;
        font-weight: 500;
        z-index: 10000;
        min-width: 300px;
        box-shadow: 0 4px 12px rgba(0, 0, 0, 0.3);
        transform: translateX(100%);
        transition: transform 0.3s ease;
    `;
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.backgroundColor = 'rgba(40, 167, 69, 1)';
            break;
        case 'error':
            notification.style.backgroundColor = 'rgba(220, 53, 69, 1)';
            break;
        case 'warning':
            notification.style.backgroundColor = 'rgba(255, 193, 7, 1)';
            break;
        default:
            notification.style.backgroundColor = 'rgba(100, 102, 239, 1)';
    }
    
    notification.textContent = message;
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Go to dashboard
function goToDashboard() {
    window.location.href = 'teacher.html';
}

// ==================== QUESTION BUILDER FUNCTIONALITY ====================

// Question data storage
let questions = [];
let questionIdCounter = 1;

// Add new question
function addQuestion() {
    const questionId = questionIdCounter++;
    const question = {
        id: questionId,
        type: 'multiple-choice',
        question: '',
        points: 1,
        options: ['', '', '', ''],
        correctAnswer: 0
    };
    
    questions.push(question);
    renderQuestion(question);
    updateQuestionsDisplay();
    
    // Scroll to the new question
    setTimeout(() => {
        const questionElement = document.getElementById(`question-${questionId}`);
        if (questionElement) {
            questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
        }
    }, 100);
}

// Render question HTML
function renderQuestion(question) {
    const questionsList = document.getElementById('questionsList');
    const noQuestions = document.getElementById('noQuestions');
    
    if (noQuestions) {
        noQuestions.style.display = 'none';
    }
    
    const questionElement = document.createElement('div');
    questionElement.className = 'question-item';
    questionElement.id = `question-${question.id}`;
    
    questionElement.innerHTML = `
        <div class="question-header">
            <div class="question-info">
                <span class="question-number">Question ${questions.indexOf(question) + 1}</span>
                <select class="question-type" onchange="changeQuestionType(${question.id}, this.value)">
                    <option value="multiple-choice" ${question.type === 'multiple-choice' ? 'selected' : ''}>Multiple Choice</option>
                    <option value="true-false" ${question.type === 'true-false' ? 'selected' : ''}>True/False</option>
                    <option value="short-answer" ${question.type === 'short-answer' ? 'selected' : ''}>Short Answer</option>
                    <option value="essay" ${question.type === 'essay' ? 'selected' : ''}>Essay</option>
                </select>
                <input type="number" class="question-points" value="${question.points}" min="1" max="100" placeholder="Points" onchange="updateQuestionPoints(${question.id}, this.value)">
            </div>
            <div class="question-actions">
                <button type="button" class="btn-duplicate" onclick="duplicateQuestion(${question.id})" title="Duplicate">
                    <i class="fas fa-copy"></i>
                </button>
                <button type="button" class="btn-delete" onclick="deleteQuestion(${question.id})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </div>
        </div>
        <div class="question-content">
            <div class="form-group">
                <textarea class="question-text" placeholder="Enter your question here..." onchange="updateQuestionText(${question.id}, this.value)">${question.question}</textarea>
            </div>
            <div class="question-options" id="question-options-${question.id}">
                ${renderQuestionOptions(question)}
            </div>
        </div>
    `;
    
    questionsList.appendChild(questionElement);
}

// Render question options based on type
function renderQuestionOptions(question) {
    switch (question.type) {
        case 'multiple-choice':
            return `
                <div class="options-container">
                    <label class="options-label">Answer Options:</label>
                    ${question.options.map((option, index) => `
                        <div class="option-item">
                            <input type="radio" name="correct-${question.id}" value="${index}" ${question.correctAnswer === index ? 'checked' : ''} onchange="updateCorrectAnswer(${question.id}, ${index})">
                            <input type="text" class="option-text" value="${option}" placeholder="Option ${String.fromCharCode(65 + index)}" onchange="updateOptionText(${question.id}, ${index}, this.value)">
                            <button type="button" class="btn-remove-option" onclick="removeOption(${question.id}, ${index})" ${question.options.length <= 2 ? 'style="display:none"' : ''}>
                                <i class="fas fa-times"></i>
                            </button>
                        </div>
                    `).join('')}
                    <button type="button" class="btn-add-option" onclick="addOption(${question.id})" ${question.options.length >= 6 ? 'style="display:none"' : ''}>
                        <i class="fas fa-plus"></i>
                        Add Option
                    </button>
                </div>
            `;
        case 'true-false':
            return `
                <div class="options-container">
                    <label class="options-label">Correct Answer:</label>
                    <div class="true-false-options">
                        <label class="radio-label">
                            <input type="radio" name="correct-${question.id}" value="0" ${question.correctAnswer === 0 ? 'checked' : ''} onchange="updateCorrectAnswer(${question.id}, 0)">
                            <span>True</span>
                        </label>
                        <label class="radio-label">
                            <input type="radio" name="correct-${question.id}" value="1" ${question.correctAnswer === 1 ? 'checked' : ''} onchange="updateCorrectAnswer(${question.id}, 1)">
                            <span>False</span>
                        </label>
                    </div>
                </div>
            `;
        case 'short-answer':
        case 'essay':
            return `
                <div class="options-container">
                    <label class="options-label">Expected Answer (for grading reference):</label>
                    <textarea class="expected-answer" placeholder="Enter the expected answer or key points..." onchange="updateExpectedAnswer(${question.id}, this.value)">${question.expectedAnswer || ''}</textarea>
                </div>
            `;
        default:
            return '';
    }
}

// Update question type
function changeQuestionType(questionId, newType) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.type = newType;
        
        // Reset question data for new type
        if (newType === 'multiple-choice') {
            question.options = ['', '', '', ''];
            question.correctAnswer = 0;
        } else if (newType === 'true-false') {
            question.correctAnswer = 0;
        } else {
            question.expectedAnswer = '';
        }
        
        // Re-render options
        const optionsContainer = document.getElementById(`question-options-${questionId}`);
        if (optionsContainer) {
            optionsContainer.innerHTML = renderQuestionOptions(question);
        }
    }
}

// Update question text
function updateQuestionText(questionId, text) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.question = text;
    }
}

// Update question points
function updateQuestionPoints(questionId, points) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.points = parseInt(points) || 1;
    }
}

// Update correct answer
function updateCorrectAnswer(questionId, answerIndex) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.correctAnswer = answerIndex;
    }
}

// Update option text
function updateOptionText(questionId, optionIndex, text) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options) {
        question.options[optionIndex] = text;
    }
}

// Add new option
function addOption(questionId) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length < 6) {
        question.options.push('');
        
        // Re-render options
        const optionsContainer = document.getElementById(`question-options-${questionId}`);
        if (optionsContainer) {
            optionsContainer.innerHTML = renderQuestionOptions(question);
        }
    }
}

// Remove option
function removeOption(questionId, optionIndex) {
    const question = questions.find(q => q.id === questionId);
    if (question && question.options && question.options.length > 2) {
        question.options.splice(optionIndex, 1);
        
        // Adjust correct answer if needed
        if (question.correctAnswer >= question.options.length) {
            question.correctAnswer = question.options.length - 1;
        }
        
        // Re-render options
        const optionsContainer = document.getElementById(`question-options-${questionId}`);
        if (optionsContainer) {
            optionsContainer.innerHTML = renderQuestionOptions(question);
        }
    }
}

// Update expected answer for short answer/essay
function updateExpectedAnswer(questionId, answer) {
    const question = questions.find(q => q.id === questionId);
    if (question) {
        question.expectedAnswer = answer;
    }
}

// Delete question
function deleteQuestion(questionId) {
    if (confirm('Are you sure you want to delete this question?')) {
        questions = questions.filter(q => q.id !== questionId);
        
        // Remove from DOM
        const questionElement = document.getElementById(`question-${questionId}`);
        if (questionElement) {
            questionElement.remove();
        }
        
        updateQuestionsDisplay();
    }
}

// Duplicate question
function duplicateQuestion(questionId) {
    const originalQuestion = questions.find(q => q.id === questionId);
    if (originalQuestion) {
        const newQuestion = {
            ...originalQuestion,
            id: questionIdCounter++,
            question: originalQuestion.question + ' (Copy)',
            options: [...(originalQuestion.options || [])]
        };
        
        questions.push(newQuestion);
        renderQuestion(newQuestion);
        updateQuestionsDisplay();
        
        // Scroll to the new question
        setTimeout(() => {
            const questionElement = document.getElementById(`question-${newQuestion.id}`);
            if (questionElement) {
                questionElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
        }, 100);
    }
}

// Update questions display
function updateQuestionsDisplay() {
    const questionsCount = document.querySelector('.questions-count');
    const noQuestions = document.getElementById('noQuestions');
    
    if (questionsCount) {
        questionsCount.textContent = `${questions.length} question${questions.length !== 1 ? 's' : ''} added`;
    }
    
    if (noQuestions) {
        noQuestions.style.display = questions.length === 0 ? 'block' : 'none';
    }
    
    // Update question numbers
    questions.forEach((question, index) => {
        const questionElement = document.getElementById(`question-${question.id}`);
        if (questionElement) {
            const questionNumber = questionElement.querySelector('.question-number');
            if (questionNumber) {
                questionNumber.textContent = `Question ${index + 1}`;
            }
        }
    });
}

// Get all questions data
function getQuestionsData() {
    return questions.map(q => ({
        type: q.type,
        question: q.question,
        points: q.points,
        options: q.options,
        correctAnswer: q.correctAnswer,
        expectedAnswer: q.expectedAnswer
    }));
}

// Clear all questions
function clearAllQuestions() {
    if (confirm('Are you sure you want to remove all questions?')) {
        questions = [];
        questionIdCounter = 1;
        
        const questionsList = document.getElementById('questionsList');
        if (questionsList) {
            questionsList.innerHTML = '';
        }
        
        updateQuestionsDisplay();
    }
}

// ==================== INITIALIZATION FOR DIFFERENT PAGES ====================

// Initialize create assignment page
function initCreateAssignment() {
    // Setup form submission
    const assignmentForm = document.getElementById('assignmentForm');
    if (assignmentForm) {
        assignmentForm.addEventListener('submit', handleAssignmentSubmit);
    }
    
    // Setup date validation
    setupDateValidation();
    
    // Setup character counters
    setupCharacterCounters();
    
    // Setup form auto-save
    setupAutoSave();
    
    // Load draft on page load
    loadDraft();
}

// Initialize create quiz page
function initCreateQuiz() {
    // Set minimum date to today
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
    }
    
    // Setup date/time listeners
    setupDateTimeListeners();
    
    // Form validation
    setupFormValidation();
}

// Initialize edit assignment page
function initEditAssignment() {
    // Set minimum date to today
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
    }
    
    // Setup date/time listeners
    setupDateTimeListeners();
    
    // Form validation
    setupFormValidation();
    
    // Initialize date/time preview with existing values
    updateDateTimePreview();
}

// Initialize edit quiz page
function initEditQuiz() {
    // Set minimum date to today
    const dueDateInput = document.getElementById('dueDate');
    if (dueDateInput) {
        const today = new Date().toISOString().split('T')[0];
        dueDateInput.min = today;
    }
    
    // Setup date/time listeners
    setupDateTimeListeners();
    
    // Form validation
    setupFormValidation();
    
    // Initialize date/time preview with existing values
    updateDateTimePreview();
}

// ==================== PAGE-SPECIFIC INITIALIZATION ====================

// Determine which page we're on and initialize accordingly
document.addEventListener('DOMContentLoaded', function() {
    const path = window.location.pathname;
    const filename = path.substring(path.lastIndexOf('/') + 1);
    
    switch (filename) {
        case 'create-assignment.html':
            initCreateAssignment();
            break;
        case 'create-quiz.html':
            initCreateQuiz();
            break;
        case 'edit-assignment.html':
            initEditAssignment();
            break;
        case 'edit-quiz.html':
            initEditAssignment(); // Uses same init as edit assignment
            break;
    }
});

// ==================== NAVIGATION AWAY HANDLING ====================

// Handle navigation away with unsaved changes
window.addEventListener('beforeunload', function(e) {
    const form = document.getElementById('assignmentForm') || document.getElementById('quizForm');
    if (!form) return;
    
    const formData = new FormData(form);
    let hasChanges = false;
    
    // Check if form has any data
    for (let [key, value] of formData.entries()) {
        if (value && value.trim() !== '') {
            hasChanges = true;
            break;
        }
    }
    
    if (hasChanges) {
        e.preventDefault();
        e.returnValue = 'You have unsaved changes. Are you sure you want to leave?';
        return e.returnValue;
    }
});
