// Show/hide sections based on navigation
function showSection(sectionId) {
    // Save current section to localStorage
    localStorage.setItem('activeSection', sectionId);
    
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
        case 'create-accounts':
            activeItem = document.querySelector('.nav-item:nth-child(1)');
            break;
        case 'teacher-accounts':
            activeItem = document.querySelector('.dropdown-item:nth-child(1)');
            // Also highlight parent dropdown
            document.querySelector('.nav-item.dropdown').classList.add('active');
            break;
        case 'student-accounts':
            activeItem = document.querySelector('.dropdown-item:nth-child(2)');
            // Also highlight parent dropdown
            document.querySelector('.nav-item.dropdown').classList.add('active');
            break;
        case 'manage-schedules':
            // Use querySelector with icon class to be more specific since structure changed
            activeItem = document.querySelector('.nav-item i.fa-calendar-alt').parentElement;
            break;
    }
    
    if (activeItem) {
        activeItem.classList.add('active');
    }
}

// Toggle dropdown functionality
function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.getElementById('manageDropdown');
    
    // Don't close if already open - this allows clicking to toggle without closing
    if (dropdownContent.classList.contains('show')) {
        // Keep it open and just update nav state
        updateActiveNavItem('teacher-accounts');
        return;
    }
    
    dropdown.classList.add('active');
    dropdownContent.classList.add('show');
    
    // Update active nav item for dropdown
    updateActiveNavItem('teacher-accounts'); // Use any child section
}

// Close dropdown when clicking outside
document.addEventListener('click', function(event) {
    const dropdown = document.querySelector('.dropdown');
    const dropdownContent = document.getElementById('manageDropdown');
    
    // Don't close if clicking inside the dropdown or on dropdown items
    if (!dropdown.contains(event.target) && !dropdownContent.contains(event.target)) {
        dropdown.classList.remove('active');
        dropdownContent.classList.remove('show');
    }
});

// Create User button functionality
document.addEventListener('DOMContentLoaded', function() {
    const createUserBtn = document.querySelector('.create-user-btn');
    if (createUserBtn) {
        createUserBtn.addEventListener('click', function() {
            // Get form values
            const firstName = document.getElementById('firstName').value;
            const lastName = document.getElementById('lastName').value;
            const age = document.getElementById('age').value;
            const email = document.getElementById('email').value;
            const password = document.getElementById('password').value;
            const role = document.getElementById('role').value;
            
            // Basic validation
            if (!firstName || !lastName || !age || !email || !password || !role) {
                showNotification('Please fill in all fields', 'error');
                return;
            }
            
            // Email validation
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (!emailRegex.test(email)) {
                showNotification('Please enter a valid email address', 'error');
                return;
            }
            
            // Age validation
            if (age < 1 || age > 120) {
                showNotification('Please enter a valid age', 'error');
                return;
            }
            
            // Simulate account creation (in real app, this would be an API call)
            console.log('Creating user:', { firstName, lastName, age, email, role });
            
            // Show success message
            showNotification('Account created successfully!', 'success');
            
            // Add to recent accounts (placeholder functionality)
            addToRecentAccounts({ firstName, lastName, email, role });
            
            // Clear form
            clearCreateAccountForm();
        });
    }
    
    // Logout functionality
    const logoutBtn = document.querySelector('.logout');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function() {
            if (confirm('Are you sure you want to logout?')) {
                // In real app, this would clear session/cookies
                window.location.href = 'index.html';
            }
        });
    }
    
    // Delete button functionality
    const deleteButtons = document.querySelectorAll('.delete-btn');
    deleteButtons.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to delete this account?')) {
                const row = this.closest('tr');
                row.remove();
                showNotification('Account deleted successfully', 'success');
            }
        });
    });
    
    // Save and Cancel buttons functionality
    const saveBtns = document.querySelectorAll('.save-btn');
    const cancelBtns = document.querySelectorAll('.cancel-btn');
    
    saveBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            showNotification('Changes saved successfully!', 'success');
        });
    });
    
    cancelBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            if (confirm('Are you sure you want to discard changes?')) {
                // In real app, this would reload the data
                location.reload();
            }
        });
    });
    
    // Load persisted section
    const savedSection = localStorage.getItem('activeSection');
    if (savedSection) {
        showSection(savedSection);
        
        // If it was a sub-section of manage accounts, open the dropdown
        if (savedSection === 'teacher-accounts' || savedSection === 'student-accounts') {
            const dropdown = document.querySelector('.dropdown');
            const dropdownContent = document.getElementById('manageDropdown');
            if (dropdown && dropdownContent) {
                dropdown.classList.add('active');
                dropdownContent.classList.add('show');
            }
        }
    } else {
        // Default to create-accounts if no saved section
        showSection('create-accounts');
    }
});

// Show notification (simple implementation)
function showNotification(message, type) {
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification ${type}`;
    notification.textContent = message;
    
    // Style the notification
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
        ${type === 'success' ? 'background-color: rgba(40, 167, 69, 1);' : 'background-color: rgba(220, 53, 69, 1);'}
    `;
    
    // Add to page
    document.body.appendChild(notification);
    
    // Remove after 3 seconds
    setTimeout(() => {
        notification.style.opacity = '0';
        setTimeout(() => {
            document.body.removeChild(notification);
        }, 300);
    }, 3000);
}

// Add to recent accounts (placeholder functionality)
function addToRecentAccounts(user) {
    const recentAccountsDiv = document.querySelector('.recent-accounts-placeholder');
    if (recentAccountsDiv) {
        // Clear placeholder text
        recentAccountsDiv.innerHTML = '';
        
        // Create user element
        const userElement = document.createElement('div');
        userElement.style.cssText = `
            background-color: #f8f9fa;
            padding: 10px;
            margin-bottom: 10px;
            border-radius: 10px;
            color: rgba(12, 23, 43, 1);
            font-size: 13px;
        `;
        userElement.innerHTML = `
            <strong>${user.firstName} ${user.lastName}</strong><br>
            <small>${user.email}</small><br>
            <small>Role: ${user.role}</small>
        `;
        
        recentAccountsDiv.appendChild(userElement);
    }
}

// Clear create account form
function clearCreateAccountForm() {
    document.getElementById('firstName').value = '';
    document.getElementById('lastName').value = '';
    document.getElementById('age').value = '';
    document.getElementById('email').value = '';
    document.getElementById('password').value = '';
    document.getElementById('role').value = '';
}

// Search functionality for accounts
document.addEventListener('DOMContentLoaded', function() {
    const searchInputs = document.querySelectorAll('.search-input');
    
    searchInputs.forEach(input => {
        input.addEventListener('keyup', function() {
            const searchTerm = this.value.toLowerCase();
            const table = this.closest('.accounts-management').querySelector('table');
            const rows = table.querySelectorAll('tbody tr');
            
            rows.forEach(row => {
                const text = row.textContent.toLowerCase();
                row.style.display = text.includes(searchTerm) ? '' : 'none';
            });
        });
    });
});