const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const db = require('../database');

const SECRET_KEY = 'supersecretkey'; // In production, use environment variable

// Register User
router.post('/register', (req, res) => {
    const { username, password, type } = req.body;

    if (!username || !password || !type) {
        return res.status(400).json({ error: 'Missing required fields' });
    }

    if (!['admin', 'enduser', 'drone'].includes(type)) {
        return res.status(400).json({ error: 'Invalid user type' });
    }

    const hashedPassword = bcrypt.hashSync(password, 8);

    try {
        const stmt = db.prepare('INSERT INTO users (username, password, type) VALUES (?, ?, ?)');
        stmt.run(username, hashedPassword, type);

        // If it's a drone, also add to drones table
        if (type === 'drone') {
            const droneStmt = db.prepare('INSERT INTO drones (id) VALUES (?)');
            droneStmt.run(username);
        }

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        if (err.code === 'SQLITE_CONSTRAINT_PRIMARYKEY') {
            return res.status(409).json({ error: 'Username already exists' });
        }
        res.status(500).json({ error: err.message });
    }
});

// Login User
router.post('/login', (req, res) => {
    const { username, password } = req.body;

    if (!username || !password) {
        return res.status(400).json({ error: 'Missing credentials' });
    }

    const stmt = db.prepare('SELECT * FROM users WHERE username = ?');
    const user = stmt.get(username);

    if (!user) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const passwordIsValid = bcrypt.compareSync(password, user.password);
    if (!passwordIsValid) {
        return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign({ username: user.username, type: user.type }, SECRET_KEY, {
        expiresIn: 86400 // 24 hours
    });

    res.status(200).json({ token, type: user.type });
});

module.exports = router;
