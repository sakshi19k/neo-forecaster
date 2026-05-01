const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors());
const path = require('path');
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Models
const User = require('./models/User');
const FireballReport = require('./models/FireballReport');

// Connect to MongoDB with timeout
mongoose.connect(process.env.MONGODB_URI, {
    serverSelectionTimeoutMS: 5000 // 5 seconds timeout
})
    .then(() => console.log('MongoDB connected'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware to check DB connection status
const checkDB = (req, res, next) => {
    if (mongoose.connection.readyState !== 1) {
        return res.status(503).json({ message: 'Database connecting or unavailable. Please try again in 10 seconds.' });
    }
    next();
};

// Port
const PORT = process.env.PORT || 5000;

app.get('/', (req, res) => {
    res.send('Planetary Defense System Backend API');
});

// Import Routes
const authRoutes = require('./routes/authRoutes');
const reportRoutes = require('./routes/reportRoutes');
const newsRoutes = require('./routes/newsRoutes');

app.use('/api/auth', checkDB, authRoutes);
app.use('/api/reports', checkDB, reportRoutes);
app.use('/api/news', newsRoutes);

app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
