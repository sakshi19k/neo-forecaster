import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { Globe, Zap, Activity, Shield, Search, ArrowRight, Loader2 } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const LiveData = () => {
    const navigate = useNavigate();
    const [asteroids, setAsteroids] = useState([]);
    const [loading, setLoading] = useState(true);
    const [metrics, setMetrics] = useState({
        total: 0,
        closest: 0,
        maxVelocity: 0
    });

    useEffect(() => {
        const fetchPublicData = async () => {
            try {
                // Fetching from the AI microservice which aggregates NASA data
                const res = await axios.get('http://localhost:8000/api/nasa-threats');
                // Extract and flatten the date-grouped data
                const data = Object.values(res.data.near_earth_objects).flat();
                setAsteroids(data);

                // Calculate Metrics
                if (data.length > 0) {
                    const total = data.length;
                    const closest = Math.min(...data.map(a => a.miss_distance_km));
                    const maxVelocity = Math.max(...data.map(a => a.velocity_kms));
                    setMetrics({ total, closest, maxVelocity });
                }
            } catch (err) {
                console.error("Failed to fetch live data:", err);
            } finally {
                setLoading(false);
            }
        };

        fetchPublicData();
    }, []);

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 font-sans antialiased text-white pb-32">
            {/* Background Effects */}
            <div className="fixed inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(14,165,233,0.1),transparent_70%)] pointer-events-none" />
            <div className="fixed top-1/4 -left-20 w-[500px] h-[500px] bg-sky-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-1/4 -right-20 w-[600px] h-[600px] bg-rose-500/5 blur-[180px] rounded-full pointer-events-none" />

            <PublicNavbar />

            <main className="relative z-10 pt-32 px-6 max-w-7xl mx-auto space-y-16">
                {/* Header Section */}
                <header className="text-center space-y-6 animate-in fade-in slide-in-from-top-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                        Real-Time Orbital Telemetry
                    </div>
                    <h1 className="text-4xl md:text-5xl font-black tracking-tight text-white uppercase">
                        Live Near-Earth <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-rose-400">Object Tracking</span>
                    </h1>
                    <p className="text-slate-400 max-w-2xl mx-auto text-sm font-medium leading-relaxed">
                        Public access to live orbital data synchronized directly with NASA's NeoWs (Near Earth Object Web Service) registry.
                    </p>
                </header>

                {/* Metrics Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-in fade-in duration-1000 delay-300">
                    <div className="glass-card p-8 border-white/10 flex flex-col items-center text-center group hover:border-sky-500/30 transition-all">
                        <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mb-6 border border-sky-500/20 text-sky-400">
                            <Globe className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-white mb-2">{loading ? '---' : metrics.total}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Total Objects Today</div>
                    </div>

                    <div className="glass-card p-8 border-white/10 flex flex-col items-center text-center group hover:border-rose-500/30 transition-all text-rose-400">
                        <div className="w-12 h-12 bg-rose-500/10 rounded-xl flex items-center justify-center mb-6 border border-rose-500/20 text-rose-400">
                            <Activity className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-white mb-2">{loading ? '---' : (metrics.closest / 1000000).toFixed(2)}M</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Closest Approach (Km)</div>
                    </div>

                    <div className="glass-card p-8 border-white/10 flex flex-col items-center text-center group hover:border-sky-500/30 transition-all text-sky-400">
                        <div className="w-12 h-12 bg-sky-500/10 rounded-xl flex items-center justify-center mb-6 border border-sky-500/20 text-sky-400">
                            <Zap className="w-6 h-6" />
                        </div>
                        <div className="text-3xl font-black text-white mb-2">{loading ? '---' : metrics.maxVelocity.toFixed(1)}</div>
                        <div className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em]">Max Velocity (Km/s)</div>
                    </div>
                </div>

                {/* Data Table */}
                <div className="glass-card overflow-hidden border-white/10 animate-in fade-in duration-1000 delay-500">
                    <div className="p-6 border-b border-white/10 bg-white/5 flex items-center justify-between">
                        <h2 className="text-lg font-bold flex items-center gap-3">
                            <Search className="w-5 h-5 text-sky-400" /> Current Orbital Catalog
                        </h2>
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest bg-slate-900 px-3 py-1 rounded-full border border-white/5">
                            NASA REST API v1.0
                        </span>
                    </div>

                    <div className="overflow-x-auto">
                        <table className="w-full text-left">
                            <thead>
                                <tr className="bg-slate-950/50 text-slate-400 text-[11px] uppercase tracking-[0.2em] font-bold border-b border-white/5">
                                    <th className="px-8 py-5">Designation</th>
                                    <th className="px-8 py-5 text-right">Size (Max Km)</th>
                                    <th className="px-8 py-5 text-right">Relative Velocity (Km/s)</th>
                                    <th className="px-8 py-5 text-right">Miss Distance (Km)</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-white/5">
                                {loading ? (
                                    <tr>
                                        <td colSpan="4" className="py-24 text-center">
                                            <div className="flex flex-col items-center gap-4 text-slate-500">
                                                <Loader2 className="w-10 h-10 animate-spin text-sky-500" />
                                                <span className="text-xs font-bold uppercase tracking-widest">Accessing NASA Orbital Registry...</span>
                                            </div>
                                        </td>
                                    </tr>
                                ) : (
                                    asteroids.map((obj) => (
                                        <tr key={obj.id} className="hover:bg-white/5 transition-colors group">
                                            <td className="px-8 py-5 font-mono text-slate-300 group-hover:text-white transition-colors">{obj.name}</td>
                                            <td className="px-8 py-5 text-right text-slate-400 font-mono tracking-tighter">{obj.diameter_max_km.toFixed(3)}</td>
                                            <td className="px-8 py-5 text-right text-slate-400 font-mono tracking-tighter">{obj.velocity_kms.toFixed(2)}</td>
                                            <td className="px-8 py-5 text-right text-slate-400 font-mono tracking-tighter">{(obj.miss_distance_km / 1000000).toFixed(2)}M</td>
                                        </tr>
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* CTA Banner */}
                <div className="relative group animate-in fade-in duration-1000 delay-700">
                    <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-rose-600 rounded-3xl blur-2xl opacity-20 group-hover:opacity-40 transition-opacity" />
                    <div className="glass-card relative p-12 border-white/10 flex flex-col md:flex-row items-center justify-between gap-8 text-center md:text-left overflow-hidden">
                        <div className="space-y-4 relative z-10">
                            <h2 className="text-3xl font-black tracking-tight text-white leading-tight">
                                Unlock AI-Driven Threat <br />
                                <span className="text-sky-400">Predictions and XAI Analytics.</span>
                            </h2>
                            <p className="text-slate-400 text-sm max-w-md font-medium">
                                Registered researchers and systems gain access to neural network scoring, predictive impact modeling, and SHAP explainability values.
                            </p>
                        </div>
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative px-8 py-4 bg-white text-slate-950 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-2xl flex items-center gap-3"
                        >
                            Access Secure Portal <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </main>
        </div>
    );
};

export default LiveData;
