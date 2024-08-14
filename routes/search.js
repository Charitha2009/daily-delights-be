// routes/search.js
const express = require('express');
const router = express.Router();
const Fruit = require('../models/Fruit');
const Vegetable = require('../models/Vegetable');
const Nut = require('../models/Nut');
const Snack = require('../models/Snack');
const DairyProduct = require('../models/DairyProduct');
const Pulse = require('../models/Pulse');
const Meat = require('../models/Meat');

router.get('/search', async (req, res) => {
    const query = req.query.q;
    const regex = new RegExp(query, 'i'); // case-insensitive regex

    try {
        const fruits = await Fruit.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        const vegetables = await Vegetable.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        const nuts = await Nut.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        const snacks = await Snack.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        const dairyProducts = await DairyProduct.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        const pulses = await Pulse.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        const meats = await Meat.find({
            $or: [
                { name: { $regex: regex } },
                { description: { $regex: regex } }
            ]
        });

        const results = [
            ...fruits,
            ...vegetables,
            ...nuts,
            ...snacks,
            ...dairyProducts,
            ...pulses,
            ...meats
        ];

        res.json(results);
    } catch (error) {
        res.status(500).json({ error: 'Error searching items' });
    }
});

module.exports = router;
