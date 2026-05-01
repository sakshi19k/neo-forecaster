const jwt = require('jsonwebtoken');

const verifyToken = (req, res, next) => {
    const token = req.header('Authorization');
    if (!token) return res.status(401).json({ message: 'Access Denied' });

    try {
        const verified = jwt.verify(token.replace('Bearer ', ''), process.env.JWT_SECRET);
        req.user = verified;
        next();
    } catch (err) {
        res.status(400).json({ message: 'Invalid Token' });
    }
};

const verifyScientist = (req, res, next) => {
    if (req.user.role !== 'SCIENTIST') {
        return res.status(403).json({ message: 'Access Denied: Scientist Role Required' });
    }
    next();
};

module.exports = { verifyToken, verifyScientist };
