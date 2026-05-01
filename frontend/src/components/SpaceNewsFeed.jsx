import { useState, useEffect } from 'react';
import axios from 'axios';
import { ExternalLink, Calendar, Newspaper, AlertCircle } from 'lucide-react';

export default function SpaceNewsFeed() {
    const [articles, setArticles] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchNews = async () => {
            try {
                const response = await axios.get('http://localhost:5000/api/news/space-news');
                // The backend returns an array of articles, or { articles: [] } on failure
                setArticles(Array.isArray(response.data) ? response.data : response.data.articles || []);
                setError(null);
            } catch (err) {
                console.error('Frontend error fetching space news:', err);
                setError('Failed to synchronize with orbiting news relays.');
            } finally {
                setLoading(false);
            }
        };

        fetchNews();
    }, []);

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-6">
                    {[1, 2, 3, 4].map(n => (
                        <div key={n} className="glass-card overflow-hidden animate-pulse">
                            <div className="h-48 bg-slate-800/50" />
                            <div className="p-6 space-y-4">
                                <div className="h-4 bg-slate-800 rounded w-3/4" />
                                <div className="h-3 bg-slate-800 rounded w-1/4" />
                                <div className="space-y-2">
                                    <div className="h-3 bg-slate-800 rounded w-full" />
                                    <div className="h-3 bg-slate-800 rounded w-5/6" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="p-8 glass-card border-rose-500/20 text-center space-y-4">
                <div className="w-12 h-12 bg-rose-500/20 rounded-full flex items-center justify-center mx-auto">
                    <AlertCircle className="w-6 h-6 text-rose-400" />
                </div>
                <h3 className="text-white font-bold uppercase tracking-widest text-sm">{error}</h3>
                <p className="text-slate-400 text-xs italic">Please verify your connection to the deep space network.</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            <header className="flex items-center gap-3">
                <div className="p-2 bg-sky-500/20 rounded-lg">
                    <Newspaper className="w-6 h-6 text-sky-400" />
                </div>
                <div>
                    <h2 className="text-2xl font-bold text-white tracking-tight">Space News & Educational Insights</h2>
                    <p className="text-slate-400 text-sm">Latest updates from NASA and Global Astronomical Observatories</p>
                </div>
            </header>

            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {articles.map((article, index) => (
                    <div
                        key={index}
                        className="glass-card group flex flex-col border-slate-800 hover:border-sky-500/30 transition-all duration-300 relative overflow-hidden h-full"
                    >
                        {/* Article Image */}
                        <div className="h-48 overflow-hidden relative">
                            <img
                                src={article.image_url}
                                alt={article.title}
                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-slate-950/80 to-transparent" />
                            <div className="absolute bottom-4 left-4 flex items-center gap-2 bg-slate-950/60 backdrop-blur-md px-3 py-1 rounded-full border border-slate-700/50">
                                <Calendar className="w-3 h-3 text-sky-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    {formatDate(article.published_at)}
                                </span>
                            </div>
                        </div>

                        {/* Article Content */}
                        <div className="p-5 flex-grow flex flex-col">
                            <h3 className="text-base font-bold text-white mb-2 line-clamp-2 leading-tight group-hover:text-sky-400 transition-colors">
                                {article.title}
                            </h3>
                            <p className="text-slate-400 text-xs mb-4 line-clamp-3 leading-relaxed flex-grow">
                                {article.summary}
                            </p>

                            <a
                                href={article.url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="mt-auto inline-flex items-center justify-center gap-2 w-full py-2.5 bg-slate-900 border border-slate-800 rounded-lg text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] group-hover:bg-sky-500 group-hover:text-white group-hover:border-sky-400 transition-all"
                            >
                                Read Full Article <ExternalLink className="w-3 h-3" />
                            </a>
                        </div>
                    </div>
                ))}
            </div>

            {articles.length === 0 && (
                <div className="py-20 bg-slate-900/50 rounded-2xl border-2 border-dashed border-slate-800 flex flex-col items-center justify-center text-center px-4">
                    <Newspaper className="w-12 h-12 text-slate-600 mb-4 opacity-20" />
                    <h3 className="text-slate-300 font-bold uppercase tracking-[0.2em] text-xs">No active signals found</h3>
                    <p className="text-slate-500 text-xs mt-2 max-w-[250px]">The space weather news feed is temporarily empty. Check back after next satellite pass.</p>
                </div>
            )}
        </div>
    );
}
