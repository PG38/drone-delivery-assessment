const express = require('express');
const router = express.Router();
const db = require('../database');

// Get all orders
router.get('/', (req, res) => {
    try {
        const stmt = db.prepare('SELECT * FROM orders');
        const orders = stmt.all();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Create a new order
router.post('/', (req, res) => {
    const { origin, destination } = req.body;

    if (!origin || !destination) {
        return res.status(400).json({ error: 'Origin and destination are required' });
    }

    const insertOrder = db.prepare('INSERT INTO orders (origin, destination) VALUES (?, ?)');
    const findDrone = db.prepare('SELECT id FROM drones WHERE status = ? LIMIT 1');
    const updateDrone = db.prepare('UPDATE drones SET status = ?, current_order_id = ? WHERE id = ?');
    const updateOrder = db.prepare('UPDATE orders SET status = ?, assigned_drone = ? WHERE id = ?');

    const assignDroneTransaction = db.transaction((orderId) => {
        const drone = findDrone.get('IDLE');
        if (drone) {
            updateDrone.run('BUSY', orderId, drone.id);
            updateOrder.run('ASSIGNED', drone.id, orderId);
            return drone.id;
        }
        return null;
    });

    try {
        const info = insertOrder.run(origin, destination);
        const orderId = info.lastInsertRowid;

        const assignedDroneId = assignDroneTransaction(orderId);

        res.status(201).json({
            message: 'Order created',
            orderId: orderId,
            status: assignedDroneId ? 'ASSIGNED' : 'PENDING',
            assignedDrone: assignedDroneId
        });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update order status (e.g., DELIVERED)
router.put('/:id', (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    if (!['PENDING', 'ASSIGNED', 'DELIVERED', 'FAILED'].includes(status)) {
        return res.status(400).json({ error: 'Invalid status' });
    }

    const getOrder = db.prepare('SELECT * FROM orders WHERE id = ?');
    const updateOrder = db.prepare('UPDATE orders SET status = ? WHERE id = ?');
    const freeDrone = db.prepare('UPDATE drones SET status = ?, current_order_id = NULL WHERE id = ?');

    const completeOrderTransaction = db.transaction((orderId, newStatus) => {
        const order = getOrder.get(orderId);
        if (!order) throw new Error('Order not found');

        updateOrder.run(newStatus, orderId);

        if ((newStatus === 'DELIVERED' || newStatus === 'FAILED') && order.assigned_drone) {
            freeDrone.run('IDLE', order.assigned_drone);
        }
    });

    try {
        completeOrderTransaction(id, status);
        res.json({ message: 'Order updated successfully' });
    } catch (err) {
        if (err.message === 'Order not found') {
            return res.status(404).json({ error: 'Order not found' });
        }
        res.status(500).json({ error: err.message });
    }
});

module.exports = router;
