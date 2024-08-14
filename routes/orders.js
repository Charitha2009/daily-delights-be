// routes/orders.js
const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Route to fetch orders for a specific user
router.get('/:userId', async (req, res) => {
    const { userId } = req.params;

    try {
        const orders = await Order.find({ userId })
            // .populate('items.id', 'name description')
            .sort({ createdAt: -1 }); // Sort by creation date, latest first

        res.json({ orders });
    } catch (error) {
        console.error('Error fetching orders:', error);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

module.exports = router;
