/**
 * FIX 14: This file was being required by server.js as a route module — it is a BROWSER file.
 * It belongs in public/js/ only and is loaded by HTML via <script> tags.
 *
 * Also fixed: logout now calls POST /logout via fetch instead of just navigating to a URL.
 */

(async () => {
   try {
      const res = await fetch('/api/me', { credentials: 'same-origin' });

      if (!res.ok) {
         window.location.href = '/pages/login.html';
         return;
      }

      const { username, role } = await res.json();

      document.querySelectorAll('#nav-username, #greeting-username').forEach((el) => {
         el.textContent = username;
      });

      const isAdminPage = document.querySelector('.admin-theme');
      if (isAdminPage && role !== 'admin') {
         window.location.href = '/pages/error.html';
      }

   } catch {
      window.location.href = '/pages/login.html';
   }
})();

// Logout
document.getElementById('logout-btn')?.addEventListener('click', async () => {
   await fetch('/logout', { method: 'POST', credentials: 'same-origin' });
   window.location.href = '/pages/login.html';
});
