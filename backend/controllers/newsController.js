const axios = require('axios');

/**
 * Controller to fetch space news from Spaceflight News API v4
 * GET /api/news/space-news
 */
exports.getSpaceNews = async (req, res) => {
    try {
        const response = await axios.get('https://api.spaceflightnewsapi.net/v4/articles/?search=asteroid&limit=9&ordering=-published_at');

        // Parse and clean the response
        const articles = response.data.results.map(article => ({
            title: article.title,
            url: article.url,
            image_url: article.image_url,
            summary: article.summary,
            published_at: article.published_at
        }));

        res.json(articles);
    } catch (error) {
        console.error('Error fetching space news:', error.message);
        // Fallback to empty array and 500 status to prevent backend crash
        res.status(500).json({
            message: 'Failed to fetch space news.',
            articles: []
        });
    }
};
