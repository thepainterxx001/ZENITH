// MAIN JAVASCRIPT FILE - Dashboard and Core Functionality

// ==================== DASHBOARD FUNCTIONALITY ====================

// Show/hide sections based on navigation
function showSection(sectionId) {
    // Save current section to localStorage
    localStorage.setItem('activeTeacherSection', sectionId);
    
    // Hide all sections
    const sections = document.querySelectorAll('.content-section');
    sections.forEach(section => {
        section.classList.remove('active');
    });
    
    // Show the selected section
    const targetSection = document.getElementById(sectionId);
    if (targetSection) {
        targetSection.classList.add('active');
        
        // Initialize grade table if showing grades section
        if (sectionId === 'grades') {
            setTimeout(() => {
                initializeGradeTable();
                setupKeyboardNavigation();
                setupGradeFilters();
            }, 100);
        }
    }
    
    // Update active nav item
    updateActiveNavItem(sectionId);
}

// Update active navigation item
function updateActiveNavItem(sectionId) {
    // Remove active class from all nav items and dropdown items
    const navItems = document.querySelectorAll('.nav-item');
    const dropdownItems = document.querySelectorAll('.dropdown-item');
    
    navItems.forEach(item => {
        item.classList.remove('active');
    });
    
    dropdownItems.forEach(item => {
        item.classList.remove('active');
    });
    
    // Add active class to the clicked nav item or dropdown item
    let activeItem;
    switch(sectionId) {
        case 'student-lessons':
            activeItem = document.querySelector('.nav-item:nth-child(1)');
            break;
        case 'student-assignments':
            activeItem = document.querySelector('.nav-item:nth-child(2)');
            break;
        case 'student-quizzes':
            activeItem = document.querySelector('.nav-item:nth-child(3)');
            break;
        case 'submissions':
            activeItem = document.querySelector('.dropdown-item:nth-child(1)');
            // Also highlight parent dropdown
            document.querySelector('.nav-item.dropdown').classList.add('active');
            break;
        case 'grades':
            activeItem = document.querySelector('.dropdown-item:nth-child(2)');
            // Also highlight parent dropdown
            document.querySelector('.nav-item.dropdown').classList.add('active');
            break;
    }
    
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Toggle dropdown functionality
function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.getElementById('analyticsDropdown');
    
    // Don't close if already open - this allows clicking to toggle without closing
    if (dropdownContent.classList.contains('show')) {
        // Keep it open and just update nav state
        updateActiveNavItem('submissions');
        return;
    }
    
    dropdown.classList.add('active');
    dropdownContent.classList.add('show');
    
    // Update active nav item for dropdown
    updateActiveNavItem('submissions');
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.getElementById('analyticsDropdown');
    
    // Don't close if clicking inside the dropdown or on dropdown items
    if (!dropdown.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdown.classList.remove('active');
        dropdownContent.classList.remove('show');
    }
});

// ==================== FILE UPLOAD FUNCTIONALITY ====================

// Setup file upload functionality
function setupFileUpload() {
    const fileInput = document.getElementById('fileInput');
    const uploadArea = document.getElementById('uploadArea');
    const filesList = document.getElementById('filesList');
    
    if (!fileInput || !uploadArea || !filesList) return;
    
    // Handle file selection
    fileInput.addEventListener('change', function(e) {
        handleFiles(e.target.files);
    });
    
    // Handle drag and drop
    uploadArea.addEventListener('dragover', function(e) {
        e.preventDefault();
        uploadArea.classList.add('dragover');
    });
    
    uploadArea.addEventListener('dragleave', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
    });
    
    uploadArea.addEventListener('drop', function(e) {
        e.preventDefault();
        uploadArea.classList.remove('dragover');
        handleFiles(e.dataTransfer.files);
    });
    
    // Click to upload
    uploadArea.addEventListener('click', function() {
        fileInput.click();
    });
    
    // Setup file action buttons
    setupFileActions();
}

// Handle uploaded files
function handleFiles(files) {
    const validTypes = ['application/pdf', 'application/vnd.ms-powerpoint', 'application/vnd.openxmlformats-officedocument.presentationml.presentation'];
    const maxSize = 10 * 1024 * 1024; // 10MB
    
    // Get selected subject
    const subjectSelect = document.getElementById('subjectSelect');
    const selectedSubject = subjectSelect ? subjectSelect.value : '';
    
    for (let file of files) {
        // Validate file type
        if (!validTypes.includes(file.type)) {
            showNotification(`${file.name} is not a supported file type. Please upload PDF or PowerPoint files.`, 'error');
            continue;
        }
        
        // Validate file size
        if (file.size > maxSize) {
            showNotification(`${file.name} is too large. Maximum file size is 10MB.`, 'error');
            continue;
        }
        
        // Validate subject selection
        if (!selectedSubject) {
            showNotification('Please select a subject before uploading files.', 'warning');
            continue;
        }
        
        // Add file to list
        addFileToList(file, selectedSubject);
        showNotification(`${file.name} uploaded successfully for ${selectedSubject}!`, 'success');
    }
    
    // Clear file input
    document.getElementById('fileInput').value = '';
}

// Add file to the list
function addFileToList(file, subject = '') {
    const filesList = document.getElementById('filesList');
    if (!filesList) return;
    
    // Create file item
    const fileItem = document.createElement('div');
    fileItem.className = 'file-item';
    
    // Determine file icon and color
    let iconClass = 'fa-file';
    let iconColor = 'rgba(100, 102, 239, 1)';
    
    if (file.type === 'application/pdf') {
        iconClass = 'fa-file-pdf';
        iconColor = '#dc3545';
    } else if (file.type.includes('powerpoint') || file.type.includes('presentation')) {
        iconClass = 'fa-file-powerpoint';
        iconColor = '#ff6b35';
    }
    
    // Format file size
    const fileSize = formatFileSize(file.size);
    
    // Get current date
    const uploadDate = new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
    });
    
    // Create subject display
    const subjectDisplay = subject ? `<span class="file-subject">Subject: ${subject}</span>` : '';
    
    fileItem.innerHTML = `
        <div class="file-icon">
            <i class="fas ${iconClass}" style="color: ${iconColor}"></i>
        </div>
        <div class="file-info">
            <span class="file-name">${file.name}</span>
            <span class="file-size">${fileSize}</span>
            ${subjectDisplay}
            <span class="upload-date">Uploaded: ${uploadDate}</span>
        </div>
        <div class="file-actions">
            <button class="btn-download" title="Download">
                <i class="fas fa-download"></i>
            </button>
            <button class="btn-delete" title="Delete">
                <i class="fas fa-trash"></i>
            </button>
        </div>
    `;
    
    // Add to list (after the h4 header)
    const header = filesList.querySelector('h4');
    if (header.nextSibling) {
        filesList.insertBefore(fileItem, header.nextSibling);
    } else {
        filesList.appendChild(fileItem);
    }
    
    // Setup actions for this file
    setupFileItemActions(fileItem);
}

// Setup file item actions
function setupFileItemActions(fileItem) {
    const downloadBtn = fileItem.querySelector('.btn-download');
    const deleteBtn = fileItem.querySelector('.btn-delete');
    const fileName = fileItem.querySelector('.file-name').textContent;
    
    if (downloadBtn) {
        downloadBtn.addEventListener('click', function() {
            showNotification(`Downloading ${fileName}...`, 'info');
            // In a real app, this would trigger a download
        });
    }
    
    if (deleteBtn) {
        deleteBtn.addEventListener('click', function() {
            if (confirm(`Are you sure you want to delete ${fileName}?`)) {
                fileItem.remove();
                showNotification(`${fileName} deleted successfully!`, 'success');
            }
        });
    }
}

// Setup existing file actions
function setupFileActions() {
    const fileItems = document.querySelectorAll('.file-item');
    fileItems.forEach(setupFileItemActions);
}

// Format file size
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    
    return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
}

// ==================== CALENDAR FUNCTIONALITY ====================

// Setup calendar navigation
function setupCalendarNavigation() {
    const prevBtn = document.querySelector('.btn-prev');
    const nextBtn = document.querySelector('.btn-next');
    const currentMonth = document.querySelector('.current-month');
    
    if (prevBtn && nextBtn && currentMonth) {
        let currentDate = new Date();
        
        // Sample schedule data - in a real app this would come from a database
        const scheduleData = {
            // Days with classes (month-day: true)
            '4-5': true, '4-8': true, '4-12': true, '4-15': true, '4-19': true, 
            '4-22': true, '4-26': true, '4-29': true,
            '5-3': true, '5-6': true, '5-10': true, '5-13': true, '5-17': true,
            '5-20': true, '5-24': true, '5-27': true, '5-31': true,
            '3-1': true, '3-4': true, '3-8': true, '3-11': true, '3-15': true,
            '3-18': true, '3-22': true, '3-25': true, '3-29': true
        };
        
        function updateCalendarDisplay() {
            const monthNames = ['January', 'February', 'March', 'April', 'May', 'June',
                              'July', 'August', 'September', 'October', 'November', 'December'];
            currentMonth.textContent = `${monthNames[currentDate.getMonth()]} ${currentDate.getFullYear()}`;
            
            // Generate calendar days
            generateCalendarDays(currentDate, scheduleData);
        }
        
        function generateCalendarDays(date, scheduleData) {
            const calendarBody = document.getElementById('calendarBody');
            if (!calendarBody) return;
            
            const year = date.getFullYear();
            const month = date.getMonth();
            
            // Get first day of month and number of days
            const firstDay = new Date(year, month, 1).getDay();
            const daysInMonth = new Date(year, month + 1, 0).getDate();
            
            // Clear existing days
            calendarBody.innerHTML = '';
            
            // Add empty cells for days before month starts
            for (let i = 0; i < firstDay; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                calendarBody.appendChild(emptyDay);
            }
            
            // Add days of the month
            const today = new Date();
            for (let day = 1; day <= daysInMonth; day++) {
                const dayElement = document.createElement('div');
                dayElement.className = 'calendar-day';
                
                // Check if this day has classes
                const scheduleKey = `${month + 1}-${day}`;
                const hasClass = scheduleData[scheduleKey];
                
                // Check if this is today
                const isToday = year === today.getFullYear() && 
                               month === today.getMonth() && 
                               day === today.getDate();
                
                if (hasClass) {
                    dayElement.classList.add('has-class');
                    dayElement.innerHTML = `
                        <span class="day-number">${day}</span>
                        <div class="class-dot"></div>
                    `;
                } else {
                    dayElement.innerHTML = `<span class="day-number">${day}</span>`;
                }
                
                if (isToday) {
                    dayElement.classList.add('today');
                }
                
                // Add click handler
                dayElement.addEventListener('click', function() {
                    const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun',
                                      'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
                    const dateStr = `${monthNames[month]} ${day}, ${year}`;
                    if (hasClass) {
                        showNotification(`Classes scheduled for ${dateStr}`, 'info');
                    } else {
                        showNotification(`No classes on ${dateStr}`, 'info');
                    }
                });
                
                calendarBody.appendChild(dayElement);
            }
            
            // Add empty cells to complete the last week
            const totalCells = calendarBody.children.length;
            const remainingCells = 42 - totalCells; // 6 weeks * 7 days
            for (let i = 0; i < remainingCells; i++) {
                const emptyDay = document.createElement('div');
                emptyDay.className = 'calendar-day empty';
                calendarBody.appendChild(emptyDay);
            }
        }
        
        prevBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() - 1);
            updateCalendarDisplay();
        });
        
        nextBtn.addEventListener('click', function() {
            currentDate.setMonth(currentDate.getMonth() + 1);
            updateCalendarDisplay();
        });
        
        // Initial display
        updateCalendarDisplay();
    }
}

// ==================== BUTTON LISTENERS ====================

// Setup button listeners
function setupButtonListeners() {
    // File upload functionality
    setupFileUpload();
    
    // Add assignment button
    const addAssignmentBtn = document.querySelector('.add-assignment-btn');
    if (addAssignmentBtn) {
        addAssignmentBtn.addEventListener('click', function() {
            showNotification('Create Assignment functionality coming soon!', 'info');
        });
    }
    
    // Add quiz button
    const addQuizBtn = document.querySelector('.add-quiz-btn');
    if (addQuizBtn) {
        addQuizBtn.addEventListener('click', function() {
            showNotification('Create Quiz functionality coming soon!', 'info');
        });
    }
    
    // View all buttons
    const viewAllBtns = document.querySelectorAll('.view-all-btn');
    viewAllBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('View All functionality coming soon!', 'info');
        });
    });
    
    // Edit and View buttons
    const editBtns = document.querySelectorAll('.btn-edit');
    editBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Edit functionality coming soon!', 'info');
        });
    });
    
    const viewBtns = document.querySelectorAll('.btn-view');
    viewBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('View functionality coming soon!', 'info');
        });
    });
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                localStorage.removeItem('activeTeacherSection');
                showNotification('Logged out successfully!', 'success');
                // In a real app, this would redirect to login page
                setTimeout(() => {
                    location.reload();
                }, 1500);
            }
        });
    }
}

// ==================== SEARCH FUNCTIONALITY ====================

// Search functionality (placeholder)
document.addEventListener('DOMContentLoaded', function() {
    const searchBar = document.querySelector('.search-bar input');
    const searchIcon = document.querySelector('.search-bar i');
    
    if (searchBar && searchIcon) {
        searchIcon.addEventListener('click', function() {
            const searchTerm = searchBar.value.trim();
            if (searchTerm) {
                showNotification(`Searching for: ${searchTerm}`, 'info');
            } else {
                showNotification('Please enter a search term', 'warning');
            }
        });
        
        searchBar.addEventListener('keypress', function(e) {
            if (e.key === 'Enter') {
                const searchTerm = this.value.trim();
                if (searchTerm) {
                    showNotification(`Searching for: ${searchTerm}`, 'info');
                } else {
                    showNotification('Please enter a search term', 'warning');
                }
            }
        });
    }
    
    // Header icon interactions
    const headerIcons = document.querySelectorAll('.header-icons i');
    headerIcons.forEach(icon => {
        icon.addEventListener('click', function() {
            if (this.classList.contains('fa-bell')) {
                showNotification('Notifications coming soon!', 'info');
            } else if (this.classList.contains('fa-comment')) {
                showNotification('Messages coming soon!', 'info');
            } else if (this.classList.contains('fa-user-circle')) {
                showNotification('Profile settings coming soon!', 'info');
            }
        });
    });
});

// ==================== NOTIFICATION SYSTEM ====================

// Show notification (simple implementation)
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
    let bgColor = '#6466ef'; // default info color
    if (type === 'success') {
        bgColor = 'rgba(40, 167, 69, 1)';
    } else if (type === 'error') {
        bgColor = 'rgba(220, 53, 69, 1)';
    } else if (type === 'warning') {
        bgColor = 'rgba(255, 193, 7, 1)';
    }
    
    notification.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 15px 20px;
        border-radius: 10px;
        color: white;
        font-weight: 500;
        z-index: 1000;
        transition: opacity 0.3s;
        background-color: ${bgColor};
        box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            if (document.body.contains(notification)) {
                document.body.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// ==================== INITIALIZATION ====================

// Initialize page on load
document.addEventListener('DOMContentLoaded', function() {
    // Load persisted section
    const savedSection = localStorage.getItem('activeTeacherSection');
    if (savedSection) {
        showSection(savedSection);
        
        // If it was a sub-section of analytics, open the dropdown
        if (savedSection === 'submissions' || savedSection === 'grades') {
            const dropdown = document.querySelector('.dropdown');
            const dropdownContent = document.getElementById('analyticsDropdown');
            if (dropdown && dropdownContent) {
                dropdown.classList.add('active');
                dropdownContent.classList.add('show');
            }
        }
    } else {
        // Default to student-lessons if no saved section
        showSection('student-lessons');
    }
    
    // Setup button event listeners
    setupButtonListeners();
    
    // Setup calendar navigation
    setupCalendarNavigation();
});

// ==================== UTILITY FUNCTIONS ====================

// Go to dashboard (used by other pages)
function goToDashboard() {
    window.location.href = 'teacher.html';
}

// View assignment submissions
function viewAssignmentSubmissions(assignmentId) {
    window.location.href = 'assignment-submissions.html?id=' + assignmentId;
}

// View quiz submissions
function viewQuizSubmissions(quizId) {
    window.location.href = 'quiz-submissions.html?id=' + quizId;
}

// ==================== SUBMISSIONS FILTERS ====================

// Show/hide custom date range based on date filter selection
document.addEventListener('DOMContentLoaded', function() {
    const dateFilter = document.getElementById('dateFilter');
    if (dateFilter) {
        dateFilter.addEventListener('change', function() {
            const customDateRange = document.getElementById('customDateRange');
            if (this.value === 'custom') {
                customDateRange.style.display = 'block';
            } else {
                customDateRange.style.display = 'none';
            }
        });
    }
});

// Apply filters
function applyFilters() {
    const subjectFilter = document.getElementById('subjectFilter').value;
    const dateFilter = document.getElementById('dateFilter').value;
    const startDate = document.getElementById('startDate').value;
    const endDate = document.getElementById('endDate').value;
    
    console.log('Applying filters:', { subjectFilter, dateFilter, startDate, endDate });
    
    // In a real application, this would filter the submissions based on the selected criteria
    // For now, we'll show a notification
    showNotification('Filters applied successfully!', 'success');
}

// Clear filters
function clearFilters() {
    document.getElementById('subjectFilter').value = 'all';
    document.getElementById('dateFilter').value = 'all';
    document.getElementById('customDateRange').style.display = 'none';
    document.getElementById('startDate').value = '';
    document.getElementById('endDate').value = '';
    
    showNotification('Filters cleared!', 'info');
}

// ==================== STUDENT GRADES TABLE FUNCTIONALITY ====================

let currentPage = 1;
const studentsPerPage = 8;

// Initialize grade table when grades section is shown
function initializeGradeTable() {
    const editableCells = document.querySelectorAll('.grade-cell.editable');
    editableCells.forEach(cell => {
        cell.addEventListener('click', function() {
            editGradeCell(this);
        });

        cell.addEventListener('blur', function() {
            calculateStudentGrades(this.closest('tr'));
        });
    });

    // Calculate initial grades
    const studentRows = document.querySelectorAll('.student-row');
    studentRows.forEach(row => calculateStudentGrades(row));
}

// Edit grade cell
function editGradeCell(cell) {
    const currentValue = cell.getAttribute('data-value');
    const newValue = prompt('Enter grade (0-100):', currentValue);
    
    if (newValue !== null) {
        const grade = parseFloat(newValue);
        if (!isNaN(grade) && grade >= 0 && grade <= 100) {
            cell.textContent = grade;
            cell.setAttribute('data-value', grade);
            cell.classList.remove('missing');
            calculateStudentGrades(cell.closest('tr'));
        } else if (newValue === '') {
            cell.textContent = '-';
            cell.setAttribute('data-value', '');
            cell.classList.add('missing');
            calculateStudentGrades(cell.closest('tr'));
        }
    }
}

// Calculate student grades (total, average, letter)
function calculateStudentGrades(row) {
    const gradeCells = row.querySelectorAll('.grade-cell');
    let total = 0;
    let count = 0;
    let hasMissing = false;

    gradeCells.forEach(cell => {
        const value = parseFloat(cell.getAttribute('data-value'));
        if (!isNaN(value)) {
            total += value;
            count++;
        } else {
            hasMissing = true;
        }
    });

    const totalCell = row.querySelector('.grade-total');
    const averageCell = row.querySelector('.grade-average');
    const letterCell = row.querySelector('.grade-letter');

    if (count > 0) {
        const average = total / count;
        totalCell.textContent = total.toFixed(1);
        averageCell.textContent = average.toFixed(1);
        letterCell.textContent = getLetterGrade(average);
        
        if (!hasMissing) {
            row.classList.remove('has-missing');
        } else {
            row.classList.add('has-missing');
        }
    } else {
        totalCell.textContent = '-';
        averageCell.textContent = '-';
        letterCell.textContent = '-';
        row.classList.add('has-missing');
    }
}

// Get letter grade from numeric grade
function getLetterGrade(grade) {
    if (grade >= 97) return 'A+';
    if (grade >= 93) return 'A';
    if (grade >= 90) return 'A-';
    if (grade >= 87) return 'B+';
    if (grade >= 83) return 'B';
    if (grade >= 80) return 'B-';
    if (grade >= 77) return 'C+';
    if (grade >= 73) return 'C';
    if (grade >= 70) return 'C-';
    if (grade >= 67) return 'D+';
    if (grade >= 63) return 'D';
    if (grade >= 60) return 'D-';
    return 'F';
}

// Setup keyboard navigation for grade table
function setupKeyboardNavigation() {
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Tab' || e.key.startsWith('Arrow')) {
            handleKeyboardNavigation(e);
        }
    });
}

// Handle keyboard navigation
function handleKeyboardNavigation(e) {
    const activeCell = document.activeElement;
    if (!activeCell.classList.contains('grade-cell')) return;

    const row = activeCell.closest('tr');
    const cells = Array.from(row.querySelectorAll('.grade-cell.editable'));
    const currentIndex = cells.indexOf(activeCell);

    if (e.key === 'Tab') {
        e.preventDefault();
        const nextIndex = e.shiftKey ? currentIndex - 1 : currentIndex + 1;
        if (nextIndex >= 0 && nextIndex < cells.length) {
            cells[nextIndex].focus();
        }
    } else if (e.key === 'ArrowRight') {
        if (currentIndex < cells.length - 1) {
            cells[currentIndex + 1].focus();
        }
    } else if (e.key === 'ArrowLeft') {
        if (currentIndex > 0) {
            cells[currentIndex - 1].focus();
        }
    } else if (e.key === 'ArrowDown') {
        const nextRow = row.nextElementSibling;
        if (nextRow) {
            const nextCells = nextRow.querySelectorAll('.grade-cell.editable');
            if (nextCells[currentIndex]) {
                nextCells[currentIndex].focus();
            }
        }
    } else if (e.key === 'ArrowUp') {
        const prevRow = row.previousElementSibling;
        if (prevRow) {
            const prevCells = prevRow.querySelectorAll('.grade-cell.editable');
            if (prevCells[currentIndex]) {
                prevCells[currentIndex].focus();
            }
        }
    }
}

// Setup filters for grade table
function setupGradeFilters() {
    const studentSearch = document.getElementById('studentSearch');
    if (studentSearch) {
        studentSearch.addEventListener('input', function() {
            filterStudents();
        });
    }

    const showMissing = document.getElementById('showMissing');
    if (showMissing) {
        showMissing.addEventListener('change', function() {
            filterStudents();
        });
    }

    const showTopPerformers = document.getElementById('showTopPerformers');
    if (showTopPerformers) {
        showTopPerformers.addEventListener('change', function() {
            filterStudents();
        });
    }

    const showNeedImprovement = document.getElementById('showNeedImprovement');
    if (showNeedImprovement) {
        showNeedImprovement.addEventListener('change', function() {
            filterStudents();
        });
    }
}

// Filter students
function filterStudents() {
    const studentSearch = document.getElementById('studentSearch');
    if (!studentSearch) return;
    
    const searchTerm = studentSearch.value.toLowerCase();
    const showMissing = document.getElementById('showMissing').checked;
    const showTopPerformers = document.getElementById('showTopPerformers').checked;
    const showNeedImprovement = document.getElementById('showNeedImprovement').checked;

    const studentRows = document.querySelectorAll('.student-row');
    studentRows.forEach(row => {
        const studentName = row.querySelector('.student-name').textContent.toLowerCase();
        const studentId = row.querySelector('.student-id').textContent.toLowerCase();
        const average = parseFloat(row.querySelector('.grade-average').textContent);
        const hasMissing = row.classList.contains('has-missing');

        let visible = true;

        if (searchTerm && !studentName.includes(searchTerm) && !studentId.includes(searchTerm)) {
            visible = false;
        }

        if (showMissing && !hasMissing) {
            visible = false;
        }

        if (showTopPerformers && average < 90) {
            visible = false;
        }

        if (showNeedImprovement && average >= 70) {
            visible = false;
        }

        row.style.display = visible ? '' : 'none';
    });
}

// Add assessment column
function addAssessmentColumn() {
    const columnName = prompt('Enter assessment column name:');
    if (columnName) {
        const weight = prompt('Enter weight percentage (e.g., 10 for 10%):', '10');
        if (weight) {
            const table = document.getElementById('gradesTable');
            if (!table) return;
            
            const headerRow = table.querySelector('thead tr');
            const letterHeader = headerRow.querySelector('th:nth-last-child(2)');
            
            const newHeader = document.createElement('th');
            newHeader.className = 'sticky-header grade-column';
            newHeader.setAttribute('data-weight', weight);
            newHeader.textContent = `${columnName} (${weight}%)`;
            headerRow.insertBefore(newHeader, letterHeader);

            const studentRows = document.querySelectorAll('.student-row');
            studentRows.forEach(row => {
                const totalCell = row.querySelector('.grade-total');
                const newCell = document.createElement('td');
                newCell.className = 'grade-cell editable missing';
                newCell.setAttribute('data-assessment', columnName.toLowerCase().replace(/\s/g, ''));
                newCell.setAttribute('data-value', '');
                newCell.textContent = '-';
                newCell.addEventListener('click', function() {
                    editGradeCell(this);
                });
                newCell.addEventListener('blur', function() {
                    calculateStudentGrades(this.closest('tr'));
                });
                row.insertBefore(newCell, totalCell);
            });

            initializeGradeTable();
        }
    }
}

// Save grades
function saveGrades() {
    const studentRows = document.querySelectorAll('.student-row');
    const gradesData = [];

    studentRows.forEach(row => {
        const studentId = row.getAttribute('data-student-id');
        const studentName = row.querySelector('.student-name').textContent;
        const gradeCells = row.querySelectorAll('.grade-cell');
        const grades = {};

        gradeCells.forEach(cell => {
            const assessment = cell.getAttribute('data-assessment');
            const value = cell.getAttribute('data-value');
            if (assessment && value) {
                grades[assessment] = parseFloat(value);
            }
        });

        const comment = row.querySelector('.comment-cell').textContent;

        gradesData.push({
            studentId,
            studentName,
            grades,
            comment
        });
    });

    console.log('Saving grades:', gradesData);
    alert('Grades saved successfully! (Check console for data)');
}

// Export grades
function exportGrades() {
    alert('Exporting grades to CSV...');
}

// Pagination functions
function previousPage() {
    if (currentPage > 1) {
        currentPage--;
        updatePagination();
    }
}

function nextPage() {
    const studentRows = document.querySelectorAll('.student-row');
    const totalPages = Math.ceil(studentRows.length / studentsPerPage);
    
    if (currentPage < totalPages) {
        currentPage++;
        updatePagination();
    }
}

function goToPage(page) {
    const studentRows = document.querySelectorAll('.student-row');
    const totalPages = Math.ceil(studentRows.length / studentsPerPage);
    
    if (page >= 1 && page <= totalPages) {
        currentPage = page;
        updatePagination();
    }
}

function updatePagination() {
    const buttons = document.querySelectorAll('.pagination-btn');
    const studentRows = document.querySelectorAll('.student-row');
    const totalPages = Math.ceil(studentRows.length / studentsPerPage);
    
    // Remove active class from all buttons
    buttons.forEach(btn => btn.classList.remove('active'));
    
    // Add active class to current page button (skip first and last which are arrows)
    const pageButtons = Array.from(buttons).slice(1, -1);
    if (pageButtons[currentPage - 1]) {
        pageButtons[currentPage - 1].classList.add('active');
    }
    
    // Update visibility of students based on pagination
    studentRows.forEach((row, index) => {
        const start = (currentPage - 1) * studentsPerPage;
        const end = start + studentsPerPage;
        row.style.display = (index >= start && index < end) ? '' : 'none';
    });

    // Update pagination info
    const totalStudents = studentRows.length;
    const start = (currentPage - 1) * studentsPerPage + 1;
    const end = Math.min(currentPage * studentsPerPage, totalStudents);
    const paginationInfo = document.querySelector('.pagination-info span');
    if (paginationInfo) {
        paginationInfo.textContent = `Showing ${start}-${end} of ${totalStudents} students`;
    }
    
    // Enable/disable navigation buttons based on current page and total pages
    const prevButton = buttons[0];
    const nextButton = buttons[buttons.length - 1];
    
    prevButton.disabled = currentPage === 1;
    nextButton.disabled = currentPage === totalPages;
}

// Initialize grade table when page loads
document.addEventListener('DOMContentLoaded', function() {
    // Check if grades section is visible and initialize
    const gradesSection = document.getElementById('grades');
    if (gradesSection && gradesSection.classList.contains('active')) {
        initializeGradeTable();
        setupKeyboardNavigation();
        setupGradeFilters();
    }
});
