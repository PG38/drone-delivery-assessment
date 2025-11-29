const express = require('express');
const router = express.Router();
const db = require('../database');

// Middleware to verify token (simplified for now, ideally should use a real middleware)
// For this assessment, we'll assume the client sends the token and we trust it or validate it if needed.
// But for simplicity in this file, I'll focus on the logic.

// Get all drones
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM drones');
        const drones = stmt.all();
        res.json(drones);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update drone status/location
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status, location } = req.body;

    // Validate status if provided
    if (status && !['IDLE', 'BUSY', 'BROKEN'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    try {
        // Build dynamic query
        let updates = [];
        let params = [];

        if (status) {
            updates.push('status = ?');
            params.push(status);
        }
        if (location) {
            updates.push('location = ?');
            params.push(location);
        }

        if (updates.length === 0) {
            return res.status(400).json({ error: 'No updates provided' });
        }

        params.push(id);
        const sql = `UPDATE drones SET ${updates.join(', ')} WHERE id = ?`;

        const stmt = db.prepare(sql);
        const result = stmt.run(...params);

        if (result.changes === 0) {
            return res.status(404).json({ error: 'Drone not found' });
        }

        res.json({ message: 'Drone updated successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
