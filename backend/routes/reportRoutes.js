const express = require('express');
const router = express.Router();
const FireballReport = require('../models/FireballReport');
const { verifyToken, verifyScientist } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');

// Multer Storage Configuration
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, 'uploads/');
    },
    filename: function (req, file, cb) {
        cb(null, Date.now() + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: { fileSize: 50 * 1024 * 1024 } // 50MB limit
});

// Citizen: Submit report with media
router.post('/', verifyToken, upload.single('media'), async (req, res) => {
    try {
        const { location, soundDelaySeconds, soundType, color, brightness, fragmentation } = req.body;

        // location comes as a string in multipart/form-data
        const parsedLocation = typeof location === 'string' ? JSON.parse(location) : location;

        let mediaUrl = '';
        let mediaType = 'NONE';

        if (req.file) {
            mediaUrl = `/uploads/${req.file.filename}`;
            const ext = path.extname(req.file.originalname).toLowerCase();
            const images = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const videos = ['.mp4', '.mov', '.avi', '.mkv', '.webm'];

            if (images.includes(ext)) mediaType = 'IMAGE';
            else if (videos.includes(ext)) mediaType = 'VIDEO';
        }

        const newReport = new FireballReport({
            reportedBy: req.user.id,
            location: parsedLocation,
            soundDelaySeconds,
            soundType,
            color,
            brightness,
            fragmentation: fragmentation === 'true' || fragmentation === true,
            mediaUrl,
            mediaType
        });
        await newReport.save();
        res.status(201).json(newReport);
    } catch (err) {
        console.error(err);
        res.status(500).json({ message: err.message });
    }
});

// Public: Get all verified reports for the map
router.get('/verified', async (req, res) => {
    try {
        const reports = await FireballReport.find({ status: 'VERIFIED' })
            .select('location createdAt color brightness')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Citizen: Get own history
router.get('/my-history', verifyToken, async (req, res) => {
    try {
        const reports = await FireballReport.find({ reportedBy: req.user.id }).sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Scientist: Get all reports logic (Pending or Verified)
router.get('/', [verifyToken, verifyScientist], async (req, res) => {
    try {
        const reports = await FireballReport.find()
            .populate('reportedBy', 'fullName email')
            .sort({ createdAt: -1 });
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Scientist: Get pending reports
router.get('/pending', [verifyToken, verifyScientist], async (req, res) => {
    try {
        const reports = await FireballReport.find({ status: 'PENDING' }).populate('reportedBy', 'fullName email');
        res.json(reports);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

// Scientist: Update status
router.put('/:id/status', [verifyToken, verifyScientist], async (req, res) => {
    try {
        const { status } = req.body;
        const report = await FireballReport.findByIdAndUpdate(
            req.params.id,
            { status },
            { new: true }
        );
        res.json(report);
    } catch (err) {
        res.status(500).json({ message: err.message });
    }
});

module.exports = router;
