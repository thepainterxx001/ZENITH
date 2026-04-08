const express = require('express');
const router  = express.Router();
const User    = require('../models/User');

// FIX 5: Missing '/' in route — was router.post('login') should be router.post('/login')
router.post('/login', async (req, res) => {
   if (req.session?.userId) {
      return res.json({ redirect: req.session.role === 'admin' ? '/pages/admin.html' : '/pages/home.html' });
   }

   const { username, password } = req.body;

   if (!username || !password || typeof username !== 'string' || typeof password !== 'string') {
      return res.status(400).json({ error: 'Please provide a valid username and password.' });
   }

   const sanitised = username.trim().toLowerCase();

   try {
      // FIX 6: password field has `select: false` in schema, so we must explicitly select it
      const user = await User.findOne({ username: sanitised }).select('+password');

      if (!user) {
         return res.status(401).json({ error: 'Invalid username or password.' });
      }

      if (user.isLocked) {
         const minutesLeft = Math.ceil((user.lockUntil - Date.now()) / 60000);
         return res.status(423).json({ error: `Account temporarily locked. Try again in ${minutesLeft} minute(s).` });
      }

      const passwordMatch = await user.comparePassword(password);

      if (!passwordMatch) {
         await user.incLoginAttempts();
         return res.status(401).json({ error: 'Invalid username or password.' });
      }

      // FIX 7: Method was named `resetloginAttempts` (lowercase l) in model — fixed below in User.js
      await user.resetLoginAttempts();

      req.session.regenerate((err) => {
         if (err) {
            console.error('Session regeneration error:', err);
            return res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
         }
         req.session.userId   = user._id.toString();
         req.session.username = user.username;
         req.session.role     = user.role;

         // FIX 8: Redirect typo '/pages/gome.html' -> '/pages/home.html'
         res.json({ redirect: user.role === 'admin' ? '/pages/admin.html' : '/pages/home.html' });
      });
   } catch (err) {
      console.error('Login error:', err);
      res.status(500).json({ error: 'An unexpected error occurred. Please try again.' });
   }
});

router.post('/logout', (req, res) => {
   req.session.destroy((err) => {
      if (err) console.error('Session destroy error:', err);
      res.clearCookie('sid');
      res.json({ ok: true });
   });
});

router.get('/api/me', (req, res) => {
   if (!req.session?.userId) {
      return res.status(401).json({ error: 'Not authenticated.' });
   }
   res.json({ username: req.session.username, role: req.session.role });
});

module.exports = router;
