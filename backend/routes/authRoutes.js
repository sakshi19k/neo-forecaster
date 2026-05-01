const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Register Route
router.post('/register', async (req, res) => {
    try {
        const { fullName, email, password, role, institutionalCode } = req.body;

        // Institutional access layer for Scientists
        if (role === 'SCIENTIST') {
            console.log('Validating Scientist registration...');
            console.log('Received code:', institutionalCode);
            console.log('Expected code:', process.env.SCIENTIST_ACCESS_CODE);

            if (!institutionalCode || institutionalCode.trim() !== (process.env.SCIENTIST_ACCESS_CODE || "").trim()) {
                console.log('Validation FAILED');
                return res.status(403).json({ message: "Invalid Institutional Access Code. Registration denied." });
            }
            console.log('Validation SUCCESS');
        }
        let user = await User.findOne({ email });
        if (user) return res.status(400).json({ message: 'User already exists' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        user = new User({ fullName, email, password: hashedPassword, role });
        await user.save();

        res.status(201).json({ message: 'User registered successfully' });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Login Route
router.post('/login', async (req, res) => {
    try {
        const { email, password, expectedRole } = req.body;
        const user = await User.findOne({ email });
        if (!user) return res.status(400).json({ message: 'Invalid credentials' });

        const isMatch = await bcrypt.compare(password, user.password);
        if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

        // Strict role validation
        if (expectedRole && user.role !== expectedRole) {
            return res.status(403).json({
                message: `Invalid portal. Please switch to the correct tab for your account role.`
            });
        }
        // JWT Token Generation
        const token = jwt.sign(
            { id: user._id, role: user.role },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        res.json({ token, role: user.role, fullName: user.fullName });
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
