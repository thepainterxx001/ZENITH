// ==================== STUDENT DASHBOARD FUNCTIONALITY ====================

// Show section functionality
function showSection(sectionId) {
    // Save current section to localStorage
    localStorage.setItem('activeStudentSection', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
    }
    
    // Update active nav item
    updateActiveNavItem(sectionId);
}

// Update active navigation item
function updateActiveNavItem(sectionId) {
    // Remove active class from all nav items
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the clicked nav item
    navItems.forEach(item => {
        if (item.getAttribute('onclick') && item.getAttribute('onclick').includes(sectionId)) {
            item.classList.add('active');
        }
    });
}

// Initialize dashboard on page load
document.addEventListener('DOMContentLoaded', function() {
    // Check if there's a saved section in localStorage
    const savedSection = localStorage.getItem('activeStudentSection');
    if (savedSection) {
        showSection(savedSection);
    } else {
        // Default to overview section
        showSection('overview');
    }
});

// Logout functionality
document.querySelector('.logout').addEventListener('click', function() {
    if (confirm('Are you sure you want to logout?')) {
        // Clear localStorage
        localStorage.clear();
        // Redirect to login page (placeholder)
        alert('Logging out...');
        // window.location.href = 'login.html';
    }
});

// Search functionality
const searchInput = document.querySelector('.search-bar input');
if (searchInput) {
    searchInput.addEventListener('input', function(e) {
        const searchTerm = e.target.value.toLowerCase();
        // Implement search functionality here
        console.log('Searching for:', searchTerm);
    });
}

// Download lesson functionality
function downloadLesson(button) {
    const lessonCard = button.closest('.lesson-card');
    const lessonTitle = lessonCard.querySelector('h4').textContent;
    
    // Placeholder for download functionality
    // Backend team will implement actual file download
    alert(`Downloading lesson: ${lessonTitle}\n\n(Backend will handle actual file download)`);
}

// Continue button functionality
document.querySelectorAll('.continue-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        if (this.classList.contains('completed')) {
            // View completed lesson
            alert('Viewing completed lesson...');
        } else {
            // Continue lesson
            alert('Continuing lesson...');
        }
    });
});

// Submit button functionality
document.querySelectorAll('.submit-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Functionality handled by onclick attribute
    });
});

// Start quiz button functionality
document.querySelectorAll('.start-btn').forEach(btn => {
    btn.addEventListener('click', function() {
        // Functionality handled by onclick attribute
    });
});

// View assignment function
function viewAssignment() {
    window.location.href = 'view-assignment.html';
}

// View quiz function
function viewQuiz() {
    window.location.href = 'view-quiz.html';
}

// Download file function
function downloadFile(filename) {
    // Placeholder for download functionality
    // Backend team will implement actual file download
    alert(`Downloading file: ${filename}\n\n(Backend will handle actual file download)`);
}

// Submit assignment function
function submitAssignment() {
    // Placeholder for submission functionality
    // Backend team will implement actual submission
    alert('Assignment submitted successfully!\n\n(Backend will handle actual submission)');
}

// Submit quiz function
function submitQuiz() {
    // Placeholder for submission functionality
    // Backend team will implement actual submission
    alert('Quiz submitted successfully!\n\n(Backend will handle actual submission)');
}

// Go to dashboard function
function goToDashboard() {
    window.location.href = 'student.html';
}

// Quiz functionality
let currentQuestion = 1;
let totalQuestions = 20;
let answeredQuestions = new Set();

// Initialize quiz
document.addEventListener('DOMContentLoaded', function() {
    if (document.getElementById('questionGrid')) {
        generateQuestionGrid();
    }
});

// Generate question navigation grid
function generateQuestionGrid() {
    const grid = document.getElementById('questionGrid');
    if (!grid) return;

    for (let i = 1; i <= totalQuestions; i++) {
        const item = document.createElement('div');
        item.className = 'question-grid-item';
        item.textContent = i;
        item.onclick = () => goToQuestion(i);
        
        if (i === currentQuestion) {
            item.classList.add('current');
        }
        
        grid.appendChild(item);
    }
}

// Go to specific question
function goToQuestion(questionNum) {
    currentQuestion = questionNum;
    updateQuestionDisplay();
    updateNavigationButtons();
    updateQuestionGrid();
}

// Update question display
function updateQuestionDisplay() {
    document.getElementById('currentQuestion').textContent = currentQuestion;
    document.getElementById('totalQuestions').textContent = totalQuestions;
    const progressPercent = Math.round((currentQuestion / totalQuestions) * 100);
    document.getElementById('progressPercent').textContent = progressPercent + '%';
    document.getElementById('progressFill').style.width = progressPercent + '%';
    
    document.querySelector('.question-number-badge').textContent = 'Question ' + currentQuestion;
}

// Update navigation buttons
function updateNavigationButtons() {
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    const submitBtn = document.querySelector('.submit-btn');
    
    prevBtn.disabled = currentQuestion === 1;
    
    if (currentQuestion === totalQuestions) {
        nextBtn.style.display = 'none';
        submitBtn.style.display = 'flex';
    } else {
        nextBtn.style.display = 'flex';
        submitBtn.style.display = 'none';
    }
}

// Update question grid
function updateQuestionGrid() {
    const items = document.querySelectorAll('.question-grid-item');
    items.forEach((item, index) => {
        item.classList.remove('current');
        if (index + 1 === currentQuestion) {
            item.classList.add('current');
        }
    });
}

// Previous question
function previousQuestion() {
    if (currentQuestion > 1) {
        goToQuestion(currentQuestion - 1);
    }
}

// Next question
function nextQuestion() {
    if (currentQuestion < totalQuestions) {
        // Mark current question as answered if an option is selected
        const selectedOption = document.querySelector('input[name="current_answer"]:checked');
        if (selectedOption) {
            answeredQuestions.add(currentQuestion);
            updateQuestionGrid();
        }
        
        goToQuestion(currentQuestion + 1);
    }
}
