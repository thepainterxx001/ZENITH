// ==========================
// GLOBAL FUNCTIONS (IMPORTANT)
// ==========================
window.showSection = showSection;
window.toggleDropdown = toggleDropdown;

function isTokenExpired(token) {
    try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        return payload.exp * 1000 < Date.now();
    } catch {
        return true;
    }
}

const token = localStorage.getItem('token');

if (!token || isTokenExpired(token)) {
    localStorage.removeItem('token');
    window.location.href = '/pages/login.html';
}

// ==========================
// SHOW / NAVIGATION
// ==========================
function showSection(sectionId) {
    localStorage.setItem('activeSection', sectionId);

    document.querySelectorAll('.content-section')
        .forEach(section => section.classList.remove('active'));

    const target = document.getElementById(sectionId);
    if (target) target.classList.add('active');

    updateActiveNavItem(sectionId);
}

function updateActiveNavItem(sectionId) {
    document.querySelectorAll('.nav-item, .dropdown-item')
        .forEach(el => el.classList.remove('active'));

    let activeItem;

    if (sectionId === 'create-accounts') {
        activeItem = document.querySelector('.nav-item:nth-child(1)');
    } else if (sectionId === 'teacher-accounts') {
        activeItem = document.querySelector('.dropdown-item:nth-child(1)');
        document.querySelector('.nav-item.dropdown')?.classList.add('active');
    } else if (sectionId === 'student-accounts') {
        activeItem = document.querySelector('.dropdown-item:nth-child(2)');
        document.querySelector('.nav-item.dropdown')?.classList.add('active');
    } else if (sectionId === 'manage-schedules') {
        activeItem = document.querySelector('.fa-calendar-alt')?.parentElement;
    }

    if (activeItem) activeItem.classList.add('active');
}

// ==========================
// DROPDOWN
// ==========================
function toggleDropdown() {
    const dropdown = document.querySelector('.dropdown');
    const content = document.getElementById('manageDropdown');

    dropdown.classList.toggle('active');
    content.classList.toggle('show');
}

// Close dropdown
document.addEventListener('click', (e) => {
    const dropdown = document.querySelector('.dropdown');
    const content = document.getElementById('manageDropdown');

    if (!dropdown || !content) return;

    if (!dropdown.contains(e.target)) {
        dropdown.classList.remove('active');
        content.classList.remove('show');
    }
});

// AUTO LOGOUT - inactive
function setupAutoLogout() {
    let timeout;

    function resetTimer() {
        clearTimeout(timeout);

        timeout = setTimeout(() => {
            alert("Session expired. Logging out...");
            localStorage.removeItem('token');
            window.location.href = '/pages/login.html';
        }, 10 * 60 * 1000); // 10 minutes
    }

    // Detect user activity
    ['click', 'mousemove', 'keypress', 'scroll'].forEach(event => {
        document.addEventListener(event, resetTimer);
    });

    resetTimer(); // start timer
}

// ==========================
// MAIN INIT
// ==========================
document.addEventListener('DOMContentLoaded', () => {

    setupCreateUser();
    setupDeleteButtons();
    setupSearch();
    setupLogout();
    loadSavedSection();
    fetchUsers(); // load from backend

    setupAutoLogout();

    const dropdownToggle = document.getElementById('dropdownToggle');
    if (dropdownToggle) {
        dropdownToggle.addEventListener('click', toggleDropdown);
    }

    document.querySelectorAll('.nav-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });

    document.querySelectorAll('.dropdown-item').forEach(item => {
        item.addEventListener('click', () => {
            const section = item.getAttribute('data-section');
            if (section) {
                showSection(section);
            }
        });
    });

    function setupRoleDependency() {
        const roleSelect = document.getElementById('role');
        const departmentRow = document.getElementById('departmentRow');

        roleSelect.addEventListener('change', function () {
            if (this.value === 'teacher' || this.value === 'student') {
                departmentRow.style.display = 'flex';
            } else {
                departmentRow.style.display = 'none';
            }
        });
    }

    setupRoleDependency();

    fetchTeachersForSchedule(); // Fetch teachers for the schedule management section
    fetchSchedules(); // Fetch schedules for the schedule management section

});


// ==========================
// CREATE USER (CONNECTED)
// ==========================
function setupCreateUser() {
    const btn = document.querySelector('.create-user-btn');
    const department = document.getElementById('department')?.value || "";
    if (!btn) return;

    btn.addEventListener('click', async (e) => {
        e.preventDefault();

        try {
            const data = getFormData();

            if (!validateForm(data)) return;

            const res = await fetch('/api/users', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(data)
            });

            //  Read the actual error message from the backend!
            // if (!res.ok) {
            //     const errorData = await res.json();
            //     console.error("Backend Error Details:", errorData); // This prints the exact problem!
            //     showNotification(errorData.error || errorData.message || 'Failed to create user', 'error');
            //     return;
            // }

            showNotification('Account created!', 'success');
            addToRecentAccounts(data);
            clearCreateAccountForm();
            fetchUsers();

        } catch (err) {
            console.error(err);
            showNotification('Failed to create user', 'error');
        }
    });
}

// ==========================
// FETCH USERS (BACKEND → UI)
// ==========================
async function fetchUsers() {
    try {
        const res = await fetch('/api/users', {
            headers: {
                'Authorization': 'Bearer ' + localStorage.getItem('token')
            }
        });
        const users = await res.json();

        populateTables(users);

    } catch (err) {
        console.error(err);
    }
}

// ==========================
// FETCH SCHEDULES
// ==========================
async function fetchSchedules() {
    try {
        const res = await fetch('/api/schedules', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        
        const schedules = await res.json();
        const tbody = document.getElementById('schedule-tbody');
        
        // Don't clear the table if it's not an array
        if (!Array.isArray(schedules)) return; 
        
        tbody.innerHTML = ''; // Clear the table first

        schedules.forEach(sched => {
            const tr = document.createElement('tr');
            tr.innerHTML = `
                <td><strong>${sched.teacherId}</strong></td>
                <td>${sched.teacherName}</td>
                <td>${sched.day}</td>
                <td>${sched.subject}</td>
                <td>${sched.startTime} to ${sched.endTime}</td>
                <td>${sched.room}</td>
                <td>
                    <i class="fas fa-trash delete-schedule-btn" data-id="${sched._id}" style="cursor:pointer; color:red;"></i>
                </td>
            `;
            tbody.appendChild(tr);
        });

        // Activate the trashcan icon
        setupDeleteScheduleButtons();

    } catch (err) {
        console.error("Failed to load schedules", err);
    }
}

// ==========================
// POPULATE TABLES
// ==========================
function populateTables(users) {
    const teacherTable = document.querySelector('#teacher-accounts tbody');
    const studentTable = document.querySelector('#student-accounts tbody');

    teacherTable.innerHTML = '';
    studentTable.innerHTML = '';

    users.forEach(user => {
        const row = `
            <tr>
                <td><strong>${user.schoolId || 'N/A'}</strong></td> <td>${user.firstName} ${user.lastName}</td>
                <td>${user.age}</td>
                <td>${user.email}</td>
                <td>${user.role}</td>
                <td>${user.department || '-'}</td>
                <td>
                    <i class="fas fa-trash delete-btn" data-id="${user._id}" style="cursor:pointer; color:red;"></i>
                </td>
            </tr>
        `;

        if (user.role === 'teacher') teacherTable.innerHTML += row;
        if (user.role === 'student') studentTable.innerHTML += row;
    });

    setupDeleteButtons();
}

// ==========================
// DELETE USER (CONNECTED)
// ==========================
function setupDeleteButtons() {
    document.querySelectorAll('.delete-btn').forEach(btn => {
        btn.onclick = async function () {
            const id = this.dataset.id;

            if (!confirm('Delete this user?')) return;

            try {
                const res = await fetch(`/api/users/${id}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });

                if (!res.ok) throw new Error();

                showNotification('Deleted!', 'success');
                fetchUsers();

            } catch {
                showNotification('Delete failed', 'error');
            }
        };
    });
}

// ==========================
// DELETE SCHEDULE LOGIC
// ==========================
function setupDeleteScheduleButtons() {
    document.querySelectorAll('.delete-schedule-btn').forEach(btn => {
        btn.onclick = async function () { 
            const scheduleId = this.dataset.id;
            console.log("Attempting to delete schedule ID:", scheduleId);

            if (!confirm('Are you sure you want to delete this schedule?')) return;

            try {
                const res = await fetch(`/api/schedules/${scheduleId}`, {
                    method: 'DELETE',
                    headers: {
                        'Authorization': 'Bearer ' + localStorage.getItem('token')
                    }
                });

                if (!res.ok) {
                    const errorData = await res.json();
                    console.error("Backend Error Details:", errorData);
                    throw new Error(errorData.message || 'Failed to delete');
                }

                showNotification('Schedule deleted!', 'success');
                fetchSchedules(); // Instantly refresh the table

            } catch (err) {
                console.error("Delete Action Failed:", err);
                showNotification(err.message || 'Could not delete schedule', 'error');
            }
        };
    });
}

// ==========================
// FORM HELPERS
// ==========================
function getFormData() {
    return {
        firstName: document.getElementById('firstName').value,
        lastName: document.getElementById('lastName').value,
        age: document.getElementById('age').value,
        email: document.getElementById('email').value,
        password: document.getElementById('password').value,
        role: document.getElementById('role').value,
        department: document.getElementById('department')?.value || ''
    };
}

function validateForm(data) {
    if (!data.firstName || !data.lastName || !data.age || !data.email || !data.password || !data.role) {
        showNotification('Fill all fields', 'error');
        return false;
    }

    if (data.age < 1 || data.age > 120) {
        showNotification('Invalid age', 'error');
        return false;
    }

    if ((data.role === 'teacher' || data.role === 'student') && !data.department) {
        showNotification('Select a department', 'error');
        return false;
    }

    return true;
}

// ==========================
// UI HELPERS
// ==========================
function showNotification(msg, type) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `
        position:fixed;top:20px;right:20px;
        background:${type === 'success' ? 'green' : 'red'};
        color:white;padding:10px;border-radius:8px;
    `;
    document.body.appendChild(div);

    setTimeout(() => div.remove(), 3000);
}

function addToRecentAccounts(user) {
    const div = document.querySelector('.recent-accounts-placeholder');
    div.innerHTML = `<strong>${user.firstName} ${user.lastName}</strong><br>${user.email}`;
}

function clearCreateAccountForm() {
    document.querySelectorAll('#create-accounts input, #create-accounts select')
        .forEach(el => el.value = '');
}

// ==========================
// SEARCH
// ==========================
function setupSearch() {
    document.querySelectorAll('.search-input').forEach(input => {
        input.addEventListener('keyup', function () {
            const term = this.value.toLowerCase();
            const rows = this.closest('.accounts-management')
                .querySelectorAll('tbody tr');

            rows.forEach(row => {
                row.style.display = row.textContent.toLowerCase().includes(term) ? '' : 'none';
            });
        });
    });
}

// ==========================
// MANAGE SCHEDULES LOGIC
// ==========================
let availableTeachers = []; // This will hold our teachers

// 1. Fetch teachers when the page loads
async function fetchTeachersForSchedule() {
    try {
        const res = await fetch('/api/users', {
            headers: { 'Authorization': 'Bearer ' + localStorage.getItem('token') }
        });
        const users = await res.json();

        if (Array.isArray(users)) {
            // Filter the list so ONLY teachers show up in the dropdown
            availableTeachers = users.filter(user => user.role === 'teacher');
        }
    } catch (err) {
        console.error("Failed to fetch teachers for schedule", err);
    }
}

// 2. Make the "Add" button create a new row
document.getElementById('addScheduleBtn')?.addEventListener('click', () => {
    const tbody = document.getElementById('schedule-tbody');

    // Build the dropdown options from our fetched teachers
    let teacherOptions = '<option value="">Select Teacher...</option>';
    availableTeachers.forEach(teacher => {
        // Use the 4-digit schoolId as the value!
        teacherOptions += `<option value="${teacher.schoolId}">${teacher.firstName} ${teacher.lastName}</option>`;
    });

    // Create the new row
    const tr = document.createElement('tr');
    tr.innerHTML = `
        <td class="teacher-id-cell" style="color: gray; font-style: italic;">Auto-fills...</td>
        <td>
            <select class="teacher-select">
                ${teacherOptions}
            </select>
        </td>
        <td>
            <select class="day-select">
                <option value="Monday">Monday</option>
                <option value="Tuesday">Tuesday</option>
                <option value="Wednesday">Wednesday</option>
                <option value="Thursday">Thursday</option>
                <option value="Friday">Friday</option>
                <option value="Saturday">Saturday</option>
            </select>
        </td>
        <td>
            <select class="subject-input">
                <option value="">Select Subject...</option>
                <option value="Web Development">Web Development</option>
                <option value="Data Structures">Data Structures</option>
                <option value="Software Engineering">Software Engineering</option>
                <option value="Artificial Intelligence">Artificial Intelligence</option>
                <option value="Database Systems">Database Systems</option>
            </select>
        </td>
        <td>
            <div class="time-input-group">
                <input type="time" class="start-time">
                <span>to</span>
                <input type="time" class="end-time">
            </div>
        </td>
        <td>
            <select class="room-input">
                <option value="">Select Room...</option>
                <option value="Lab 101">Lab 101</option>
                <option value="Lab 102">Lab 102</option>
                <option value="Room 301">Room 301</option>
                <option value="Room 302">Room 302</option>
                <option value="Room 303">Room 303</option>
            </select>
        </td>
        <td>
            <button class="save-row-btn" style="background: #28a745; color: white; border: none; padding: 5px 10px; border-radius: 4px; cursor: pointer;">Save</button>
            <i class="fas fa-trash delete-btn cancel-row" style="margin-left: 10px; cursor: pointer;"></i>
        </td>
    `;

    // 3. The Auto-Populate
    const teacherSelect = tr.querySelector('.teacher-select');
    const idCell = tr.querySelector('.teacher-id-cell');

    teacherSelect.addEventListener('change', (e) => {
        // For ID when teacher is selected
        if (e.target.value) {
            idCell.textContent = e.target.value;
            idCell.style.color = "black";
            idCell.style.fontStyle = "normal";
        } else {
            idCell.textContent = "Auto-fills...";
            idCell.style.color = "gray";
        }
    });

    // 4. remove row
    tr.querySelector('.cancel-row').addEventListener('click', () => {
        tr.remove();
    });

    // Save
    const saveBtn = tr.querySelector('.save-row-btn');

    saveBtn.addEventListener('click', async () => {
        const teacherSelect = tr.querySelector('.teacher-select');
        const data = {
            teacherId: teacherSelect.value,
            teacherName: teacherSelect.options[teacherSelect.selectedIndex].text,
            day: tr.querySelector('.day-select').value,
            subject: tr.querySelector('.subject-input').value,
            startTime: tr.querySelector('.start-time').value,
            endTime: tr.querySelector('.end-time').value,
            room: tr.querySelector('.room-input').value
        };

        // fullfill
        if (!data.teacherId || !data.subject || !data.startTime || !data.endTime || !data.room) {
            showNotification('Please fill in all schedule fields!', 'error');
            return;
        }

        // for the backend
        try {
            const res = await fetch('/api/schedules', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': 'Bearer ' + localStorage.getItem('token')
                },
                body: JSON.stringify(data)
            });

            if (!res.ok) throw new Error('Failed to save schedule');

            // lock row when saved
            showNotification('Schedule Saved to Database!', 'success');
            saveBtn.textContent = 'Saved!';
            saveBtn.style.backgroundColor = 'gray';
            saveBtn.disabled = true; // Prevents clicking it twice
            // tr.querySelector('.cancel-row').style.display = 'none'; // Hide the trashcan

        } catch (err) {
            console.error(err);
            showNotification('Failed to save schedule', 'error');
        }
    });

    // Add the row to the table!
    tbody.appendChild(tr);
});

// ==========================
// LOGOUT
// ==========================
function setupLogout() {
    document.querySelector('.logout')?.addEventListener('click', () => {
        if (confirm('Logout?')) {
            localStorage.removeItem('token');
            window.location.href = '/pages/login.html';
        }

    });
}

// ==========================
// LOAD SAVED TAB
// ==========================
function loadSavedSection() {
    const saved = localStorage.getItem('activeSection') || 'create-accounts';
    showSection(saved);
}

