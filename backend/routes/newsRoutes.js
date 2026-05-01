const express = require('express');
const router = express.Router();
const newsController = require('../controllers/newsController');

// Route to get space news
router.get('/space-news', newsController.getSpaceNews);

module.exports = router;
