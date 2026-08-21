require('dotenv').config();
const express = require('express');
const bcrypt = require('bcryptjs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

const users = [];

const ADMIN_USERNAME = 'admin';
// WALA NANG PASSWORD DITO: Kukunin na ito sa Vercel Settings
const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD; 

// ADMIN LOGIN API
app.post('/api/admin-login', (req, res) => {
    try {
        const { username, password } = req.body;

        if (username === ADMIN_USERNAME && password === ADMIN_PASSWORD) {
            res.status(200).json({ message: 'Admin Access Granted', role: 'admin' });
        } else {
            res.status(401).json({ message: 'Invalid Admin Username or Password' });
        }
    } catch (error) {
        res.status(500).json({ message: 'Server error during admin login' });
    }
});

// REGISTER API
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        const existingUser = users.find(u => u.username === username);
        if (existingUser) {
            return res.status(400).json({ message: 'Username already taken' });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        users.push({
            username,
            email,
            password: hashedPassword 
        });

        res.status(201).json({ message: 'Account created successfully!' });
    } catch (error) {
        res.status(500).json({ message: 'Server error during registration' });
    }
});

// LOGIN API
app.post('/api/login', async (req, res) => {
    try {
        const { username, password } = req.body;

        const user = users.find(u => u.username === username);
        if (!user) {
            return res.status(400).json({ message: 'Invalid Username or Password' });
        }

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) {
            return res.status(400).json({ message: 'Invalid Username or Password' });
        }

        res.status(200).json({ message: 'Login successful', username: user.username });
    } catch (error) {
        res.status(500).json({ message: 'Server error during login' });
    }
});

if (process.env.NODE_ENV !== 'production') {
    app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));
}

// Kailangan ito ng Vercel para sa Express backend
module.exports = app;