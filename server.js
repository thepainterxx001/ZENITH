require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const helmet = require('helmet');
const authMiddleware = require('./middleware/auth');
const adminOnly = require('./middleware/adminOnly');
const rateLimit = require('express-rate-limit');
const Schedule = require('./models/schedule');

const app = express();
app.use(express.json());

app.use(helmet());
app.use(cors());

// ──── Static files (HTML, CSS, JS) ─────────────
app.use(express.static(path.join(__dirname, 'public')));

// ──── MIDDLEWARE ─────────────

// ──── ROUTES ─────────────
const userRoutes = require('./routes/userRoutes');
app.use('/api/users', userRoutes);

// ──── USER SCHEMA ─────────────
const User = require('./models/User');

// ──── CREATE USER API ─────────────
app.post('/api/users', async (req, res) => {
   try {
      const { firstName, lastName, age, email, password, role, department } = req.body;

      const newUser = new User({
         firstName,
         lastName,
         age,
         email,
         password,
         role,
         department
      });

      await newUser.save(); 
      res.status(201).json({ message: 'User created successfully' });

   } catch (error) { 
      console.error("Database Save Error:", error.message);
      res.status(400).json({ error: error.message }); 
   }
});

// ──── CREATE SCHEDULE API ─────────────
app.post('/api/schedules', authMiddleware, adminOnly, async (req, res) => {
    try {
        const newSchedule = new Schedule(req.body);
        await newSchedule.save();
        res.status(201).json({ message: 'Schedule saved successfully!' });
    } catch (error) {
        console.error("Schedule Save Error:", error.message);
        res.status(400).json({ error: error.message });
    }
});

// ──── GET ALL SCHEDULES ─────────────
app.get('/api/schedules', authMiddleware, async (req, res) => {
    try {
        const schedules = await Schedule.find();
        res.json(schedules);
    } catch (error) {
        res.status(500).json({ message: "Failed to fetch schedules" });
    }
});

// ──── DELETE SCHEDULE ─────────────
app.delete('/api/schedules/:id', authMiddleware, adminOnly, async (req, res) => {
    try {
        await Schedule.findByIdAndDelete(req.params.id);
        res.json({ message: "Schedule deleted" });
    } catch (error) {
        res.status(500).json({ message: "Failed to delete schedule" });
    }
});

// ──── LOGIN ─────────────
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;

    try {
        const user = await User.findOne({ email });

        if (!user) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }

        // CREATE TOKEN
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1d' }
        );

        res.json({
            token,
            role: user.role
        });

    } catch (err) {
        console.error("Login Error:", err);
        res.status(500).json({ message: 'Server error' });
    }
});

// ──── PROTECTION ─────────────
app.get('/api/users', authMiddleware, adminOnly, async (req, res) => {
    const users = await User.find().select('-password');
    res.json(users);
});
app.delete('/api/users/:id', authMiddleware, async (req, res) => {
    await User.findByIdAndDelete(req.params.id);
    res.json({ message: "Deleted" });
});

// ──── RATE LIMIT ─────────────
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100
});

app.use(limiter);

// ──── DATABASE CONNECTION ─────────────
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('MongoDB Connected'))
.catch(err => console.log(err));

// ──── SERVER ─────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
   console.log(`Server is running at http://localhost:${PORT}`);
});

module.exports = app;





