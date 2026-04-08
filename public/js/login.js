document.getElementById('loginBtn').addEventListener('click', async () => {
   const email = document.getElementById('email').value;
   const password = document.getElementById('password').value;

   if (!email || !password) {
      alert("Please fill in all fields");
      return;
   }

   try {
      const res = await fetch('/api/login', {
         method: 'POST',
         headers: {
            'Content-Type': 'application/json'
         },
         body: JSON.stringify({ email, password })
      });

      const data = await res.json();

      if (res.ok) {
         localStorage.setItem('token', data.token);

         // ROLE-BASED REDIRECT
         if (data.role === 'admin') {
            window.location.href = '/pages/admin.html';
         } else if (data.role === 'teacher') {
            window.location.href = '/pages/teacher.html';
         } else {
            window.location.href = '/pages/home.html'; // For student dashboard
         }
      } else {
         alert(data.message || "Login failed");
      }

   } catch (err) {
      console.error(err);
      alert("Server error");
   }
});

// --- Password Visibility Toggle ---
const showPasswordCheckbox = document.getElementById('showPassword');
const passwordInput = document.getElementById('password');
const eyeIcon = document.getElementById('pw-eye');

if (showPasswordCheckbox && passwordInput && eyeIcon) {
   showPasswordCheckbox.addEventListener('change', function () {
      if (this.checked) {
         // Checkbox is checked: show text and change icon to locked
         passwordInput.type = 'text';
         eyeIcon.textContent = '🔒';
      } else {
         // Checkbox is unchecked: hide text and change icon to open
         passwordInput.type = 'password';
         eyeIcon.textContent = '👁';
      }
   });
}