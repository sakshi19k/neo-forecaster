import { useState, useEffect } from 'react';
import axios from 'axios';
import { Database, AlertTriangle, CheckCircle, XCircle, Search, Activity, Microscope, Shield, Zap } from 'lucide-react';

export default function ScientistDashboard() {
    const [activeTab, setActiveTab] = useState('threats');
    const [allAsteroids, setAllAsteroids] = useState([]);
    const [visibleAsteroids, setVisibleAsteroids] = useState([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [pendingReports, setPendingReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [explainingId, setExplainingId] = useState(null);
    const [explanationData, setExplanationData] = useState(null);
    const [globalStats, setGlobalStats] = useState(null);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [error, setError] = useState(null);

    const [reportSubTab, setReportSubTab] = useState('PENDING');
    const [selectedReport, setSelectedReport] = useState(null);
    const [reports, setReports] = useState([]);

    const filteredReports = reports.filter(r => r.status === reportSubTab);

    useEffect(() => {
        if (activeTab === 'threats') fetchNeoData();
        else if (activeTab === 'validation') fetchReports();
        else fetchGlobalStats();
    }, [activeTab]);

    const fetchGlobalStats = async () => {
        try {
            const res = await axios.get('http://localhost:8000/api/model-stats');
            setGlobalStats(res.data);
            setError(null);
        } catch (err) {
            console.error(err);
            if (err.code === 'ERR_NETWORK') setError('AI Microservice (Port 8000) is offline. Please start it using "python main.py"');
        }
    };

    const fetchNeoData = async () => {
        setLoading(true);
        setIsRefreshing(true);
        try {
            const res = await axios.get('http://localhost:8000/api/nasa-threats');
            const flatData = Object.values(res.data.near_earth_objects).flat();

            setAllAsteroids(flatData);
            setVisibleAsteroids(flatData.slice(0, 10));
            setCurrentIndex(0);
            setError(null);
        } catch (err) {
            console.error(err);
            if (err.code === 'ERR_NETWORK') setError('AI Microservice (Port 8000) is offline. Please start it using "python main.py"');
            else setError('Failed to fetch NASA data. Check internet connection or API key.');
        } finally {
            setLoading(false);
            setIsRefreshing(false);
        }
    };

    const handleRefreshFeed = () => {
        if (allAsteroids.length === 0) return;
        const nextIndex = currentIndex + 10;
        const newIndex = nextIndex >= allAsteroids.length ? 0 : nextIndex;
        setCurrentIndex(newIndex);
        setVisibleAsteroids(allAsteroids.slice(newIndex, newIndex + 10));
    };

    const fetchPending = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/reports/pending');
            setPendingReports(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchExplanation = async (obj) => {
        setExplainingId(obj.id);
        setExplanationData(null);
        try {
            const res = await axios.get(`http://localhost:8000/api/explain/${obj.id}`, {
                params: {
                    mag: obj.absolute_magnitude,
                    diameter: obj.diameter_max_km,
                    velocity: obj.velocity_kms,
                    miss_dist: obj.miss_distance_km
                }
            });
            setExplanationData(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchReports = async () => {
        setLoading(true);
        try {
            const res = await axios.get('http://localhost:5000/api/reports');
            setReports(res.data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleUpdateStatus = async (id, status) => {
        try {
            await axios.put(`http://localhost:5000/api/reports/${id}/status`, { status });
            fetchReports();
            setSelectedReport(null);
        } catch (err) {
            console.error(err);
        }
    };

    // Modal Component for Report Details
    const ReportModal = ({ report, onClose, onVerify }) => {
        if (!report) return null;
        return (
            <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
                <div className="glass-card w-full max-w-2xl overflow-hidden border-slate-700 shadow-2xl animate-in zoom-in-95 duration-200">
                    <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-lg ${report.status === 'VERIFIED' ? 'bg-emerald-500/20' : 'bg-yellow-500/20'}`}>
                                <Database className={`w-5 h-5 ${report.status === 'VERIFIED' ? 'text-emerald-400' : 'text-yellow-400'}`} />
                            </div>
                            <h3 className="text-xl font-bold font-mono">Report: {report._id.slice(-8)}</h3>
                        </div>
                        <button onClick={onClose} className="p-2 hover:bg-slate-800 rounded-lg transition-colors">
                            <XCircle className="w-6 h-6 text-slate-500" />
                        </button>
                    </div>
                    <div className="max-h-[70vh] overflow-y-auto">
                        <div className="p-8 space-y-8">
                            {report.mediaUrl && (
                                <div className="rounded-2xl overflow-hidden border border-slate-800 bg-slate-900 shadow-inner">
                                    {report.mediaType === 'IMAGE' ? (
                                        <img src={`http://localhost:5000${report.mediaUrl}`} alt="Fireball Sighting" className="w-full h-auto object-cover max-h-64" />
                                    ) : (
                                        <video controls className="w-full h-auto max-h-64">
                                            <source src={`http://localhost:5000${report.mediaUrl}`} />
                                            Your browser does not support the video tag.
                                        </video>
                                    )}
                                </div>
                            )}

                            <div className="grid grid-cols-2 gap-8">
                                <div>
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1 block">Observer</label>
                                    <p className="text-slate-200 font-medium">{report.reportedBy?.fullName || "Anonymous Citizen"}</p>
                                    <p className="text-xs text-slate-500">{report.reportedBy?.email || "No email provided"}</p>
                                </div>
                                <div className="text-right">
                                    <label className="text-[10px] uppercase tracking-[0.2em] text-slate-500 font-bold mb-1 block">Location</label>
                                    <p className="text-slate-200 font-medium">{report.location.coordinates[1].toFixed(4)}, {report.location.coordinates[0].toFixed(4)}</p>
                                    <p className="text-[10px] text-slate-500">Long/Lat GPS Coordinates</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Brightness</span>
                                    <span className="text-sky-400 font-bold">{report.brightness}</span>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Sound Type</span>
                                    <span className="text-sky-400 font-bold">{report.soundType}</span>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Color</span>
                                    <span className="text-sky-400 font-bold">{report.color || "None"}</span>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-6">
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Fragmentation</span>
                                    <span className={`text-xs font-bold ${report.fragmentation ? 'text-amber-400' : 'text-slate-500'}`}>
                                        {report.fragmentation ? 'DETECTED' : 'NONE REPORTED'}
                                    </span>
                                </div>
                                <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800">
                                    <span className="text-[9px] uppercase tracking-widest text-slate-500 font-bold block mb-1">Sound Delay</span>
                                    <span className="text-slate-300 font-bold font-mono">{report.soundDelaySeconds || 0}s</span>
                                </div>
                            </div>

                            <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex items-center justify-between">
                                <div>
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-0.5">Sighting Timestamp</span>
                                    <span className="text-slate-400 text-xs">{new Date(report.createdAt).toLocaleString()}</span>
                                </div>
                                <div className="text-right">
                                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold block mb-0.5">Current Status</span>
                                    <span className={`text-[10px] font-black uppercase tracking-widest ${report.status === 'VERIFIED' ? 'text-emerald-400' : 'text-yellow-400'}`}>
                                        {report.status}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div className="p-6 bg-slate-900/80 border-t border-slate-800 flex justify-end gap-3">
                        <button onClick={onClose} className="px-6 py-2.5 rounded-lg border border-slate-700 text-slate-400 hover:bg-slate-800 transition-all font-bold text-[10px] uppercase tracking-widest">
                            Close
                        </button>
                        {report.status === 'PENDING' && (
                            <>
                                <button
                                    onClick={() => onVerify(report._id)}
                                    className="px-6 py-2.5 rounded-lg bg-emerald-600 text-white hover:bg-emerald-500 shadow-lg shadow-emerald-500/20 hover:shadow-emerald-500/40 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                                >
                                    <CheckCircle className="w-4 h-4" /> Verify
                                </button>
                                <button
                                    onClick={() => handleUpdateStatus(report._id, 'REJECTED')}
                                    className="px-6 py-2.5 rounded-lg bg-rose-600 text-white hover:bg-rose-500 shadow-lg shadow-rose-500/20 hover:shadow-rose-500/40 transition-all font-bold text-[10px] uppercase tracking-widest flex items-center gap-2"
                                >
                                    <XCircle className="w-4 h-4" /> Reject
                                </button>
                            </>
                        )}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 mt-16 text-slate-200">
            {/* ... header ... content below */}
            <ReportModal
                report={selectedReport}
                onClose={() => setSelectedReport(null)}
                onVerify={(id) => handleUpdateStatus(id, 'VERIFIED')}
            />
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-rose-500/20 rounded-lg">
                        <Microscope className="w-6 h-6 text-rose-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white">Scientific Oversight Console</h1>
                        <p className="text-slate-400 text-sm">Real-time threat detection and SHAP Explainable AI (XAI)</p>
                    </div>
                </div>

                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl">
                    <button
                        onClick={() => setActiveTab('threats')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'threats' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <Activity className="w-4 h-4" /> NASA Triage
                    </button>
                    <button
                        onClick={() => setActiveTab('validation')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'validation' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <Database className="w-4 h-4" /> Reports
                    </button>
                    <button
                        onClick={() => setActiveTab('analytics')}
                        className={`flex items-center gap-2 px-6 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'analytics' ? 'bg-slate-800 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'
                            }`}
                    >
                        <Zap className="w-4 h-4" /> AI Analytics
                    </button>
                </div>
            </header>

            {error && (
                <div className="bg-rose-500/10 border border-rose-500/20 p-4 rounded-xl flex items-center gap-3 animate-in slide-in-from-top-2 duration-300">
                    <AlertTriangle className="w-5 h-5 text-rose-400" />
                    <p className="text-sm font-medium text-rose-300">{error}</p>
                </div>
            )}

            {activeTab === 'threats' ? (
                <div className="space-y-6">
                    <div className="glass-card overflow-hidden">
                        <div className="p-6 border-b border-slate-800 flex items-center justify-between">
                            <h2 className="text-lg font-semibold flex items-center gap-2">
                                <Search className="w-5 h-5 text-sky-400" /> Real-time NeoWs Feed
                            </h2>
                            <div className="flex items-center gap-4">
                                {allAsteroids.length > 0 && (
                                    <span className="text-[10px] font-mono text-slate-500 uppercase tracking-widest">
                                        Batch {(currentIndex / 10) + 1} / {Math.ceil(allAsteroids.length / 10)}
                                    </span>
                                )}
                                <button
                                    onClick={handleRefreshFeed}
                                    className="text-sm font-medium text-sky-400 hover:text-sky-300 transition-all active:scale-95"
                                >
                                    Refresh Feed
                                </button>
                                <button
                                    onClick={fetchNeoData}
                                    className="p-1.5 text-slate-500 hover:text-sky-400 transition-colors"
                                    title="Hard Sync with NASA"
                                >
                                    <Activity className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
                                </button>
                            </div>
                        </div>
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900/50 text-slate-400 text-[11px] uppercase tracking-[0.2em] font-bold">
                                        <th className="px-6 py-4">Designation</th>
                                        <th className="px-6 py-4">Size (km)</th>
                                        <th className="px-6 py-4">Velocity (km/s)</th>
                                        <th className="px-6 py-4">Miss Dist (km)</th>
                                        <th className="px-6 py-4">Energy (Mt)</th>
                                        <th className="px-6 py-4">AI Prediction</th>
                                        <th className="px-6 py-4">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {visibleAsteroids.map((obj) => (
                                        <tr key={obj.id} className={`group ${obj.prediction === 'DANGER' ? 'bg-rose-500/5' : 'hover:bg-slate-800/30'}`}>
                                            <td className="px-6 py-4 font-mono text-slate-300">{obj.name}</td>
                                            <td className="px-6 py-4 text-slate-500">{obj.diameter_max_km.toFixed(3)}</td>
                                            <td className="px-6 py-4 text-slate-500">{obj.velocity_kms.toFixed(1)}</td>
                                            <td className="px-6 py-4 text-slate-500">{(obj.miss_distance_km / 1000000).toFixed(2)}M</td>
                                            <td className="px-6 py-4 text-slate-400">{obj.kinetic_energy_megatons.toFixed(1)}</td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${obj.prediction === 'DANGER' ? 'bg-rose-500 text-white animate-pulse shadow-[0_0_15px_rgba(244,63,94,0.4)]' : 'bg-slate-800 text-slate-400'
                                                    }`}>
                                                    {obj.prediction === 'DANGER' && <AlertTriangle className="w-3 h-3" />}
                                                    {obj.prediction} ({(obj.danger_probability * 100).toFixed(0)}%)
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <button
                                                    onClick={() => fetchExplanation(obj)}
                                                    className={`text-xs font-bold uppercase tracking-widest px-3 py-1.5 rounded border transition-all ${explainingId === obj.id ? 'bg-sky-500 border-sky-500 text-white' : 'border-slate-700 text-slate-500 hover:border-sky-500 hover:text-sky-400'}`}
                                                >
                                                    Explain
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                    {loading && <tr><td colSpan="7" className="py-20 text-center text-slate-500 animate-pulse">Synchronizing Orbit Data...</td></tr>}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {explainingId && (
                        <div className="glass-card p-6 border-sky-500/30 animate-in fade-in slide-in-from-bottom-4 duration-300">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-white flex items-center gap-2">
                                    <Shield className="w-5 h-5 text-sky-400" /> SHAP Feature Importance: {allAsteroids.find(t => t.id === explainingId)?.name}
                                </h3>
                                <button onClick={() => setExplainingId(null)} className="text-slate-500 hover:text-white transition-colors">Close Analysis</button>
                            </div>

                            {!explanationData ? (
                                <div className="py-12 flex justify-center items-center gap-3 text-slate-500">
                                    <Activity className="w-5 h-5 animate-spin" /> Calculating SHAP values...
                                </div>
                            ) : (
                                <div className="space-y-6">
                                    {explanationData.explanations.map((exp, idx) => {
                                        const isPositive = exp.score > 0;
                                        const percentage = Math.abs(exp.score) * 100;
                                        return (
                                            <div key={idx} className="space-y-2 group/bar">
                                                <div className="flex justify-between text-[11px] mb-1">
                                                    <span className="capitalize text-slate-500 font-bold tracking-widest">{exp.feature.replace(/_/g, ' ')}</span>
                                                    <span className={`font-mono font-bold ${isPositive ? 'text-rose-400' : 'text-emerald-400'}`}>
                                                        {isPositive ? '↑' : '↓'} {Math.abs(exp.score * 100).toFixed(1)}% influence
                                                    </span>
                                                </div>
                                                <div className="h-3 w-full bg-slate-900 rounded-full overflow-hidden border border-slate-800 flex relative">
                                                    <div
                                                        className={`h-full transition-all duration-1000 ease-out relative z-10 ${isPositive ? 'bg-gradient-to-r from-rose-600 to-rose-400 shadow-[0_0_10px_rgba(244,63,94,0.3)]' : 'bg-gradient-to-r from-emerald-600 to-emerald-400 shadow-[0_0_10px_rgba(16,185,129,0.3)]'}`}
                                                        style={{ width: `${Math.min(percentage * 5, 100)}%` }}
                                                    >
                                                        <div className="absolute inset-0 bg-white/20 animate-pulse-slow"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })}
                                    <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/10 text-[10px] text-sky-400/70 italic leading-relaxed">
                                        <AlertTriangle className="w-3 h-3 inline mr-1 mb-0.5" />
                                        SHAP Analysis: Factors marked in RED pushed the model toward a DANGER classification. Factors in GREEN increased the confidence in a SAFE result.
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            ) : activeTab === 'validation' ? (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="flex justify-center">
                        <div className="flex p-1 bg-slate-900/80 border border-slate-800 rounded-full shadow-inner">
                            <button
                                onClick={() => setReportSubTab('PENDING')}
                                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${reportSubTab === 'PENDING' ? 'bg-slate-800 text-yellow-400 shadow-lg border border-yellow-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Pending Triage
                            </button>
                            <button
                                onClick={() => setReportSubTab('VERIFIED')}
                                className={`px-6 py-2 rounded-full text-xs font-black uppercase tracking-widest transition-all ${reportSubTab === 'VERIFIED' ? 'bg-slate-800 text-emerald-400 shadow-lg border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'}`}
                            >
                                Verified Archive
                            </button>
                        </div>
                    </div>

                    <div className="glass-card overflow-hidden">
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead>
                                    <tr className="bg-slate-900/50 text-slate-400 text-[11px] uppercase tracking-[0.2em] font-bold">
                                        <th className="px-6 py-4">Report ID</th>
                                        <th className="px-6 py-4">Sighting Date</th>
                                        <th className="px-6 py-4">Location</th>
                                        <th className="px-6 py-4">Event Type</th>
                                        <th className="px-6 py-4">Status</th>
                                        <th className="px-6 py-4 text-center">Action</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {filteredReports.map((report) => (
                                        <tr key={report._id} className="hover:bg-slate-800/30 transition-colors group">
                                            <td className="px-6 py-4 font-mono text-slate-200 text-[10px]">{report._id.slice(-8)}</td>
                                            <td className="px-6 py-4 text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</td>
                                            <td className="px-6 py-4 text-slate-400">
                                                {report.location.coordinates[1].toFixed(2)}, {report.location.coordinates[0].toFixed(2)}
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-sky-400 font-medium">{report.brightness || report.soundType}</span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${report.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : report.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20'}`}>
                                                    {report.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <button
                                                    onClick={() => setSelectedReport(report)}
                                                    className="text-xs font-bold uppercase tracking-widest bg-slate-800 border border-slate-700 px-4 py-1.5 rounded-lg text-slate-400 hover:border-sky-500 hover:text-sky-400 transition-all active:scale-95"
                                                >
                                                    {report.status === 'PENDING' ? 'Review' : 'View Details'}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                        {filteredReports.length === 0 && (
                            <div className="py-20 flex flex-col items-center justify-center text-center px-4 animate-in fade-in zoom-in-95 duration-500">
                                <div className="w-16 h-16 bg-slate-900 border border-slate-800 rounded-full flex items-center justify-center mb-4 opacity-50 shadow-inner">
                                    <Database className="w-8 h-8 text-slate-600" />
                                </div>
                                <h3 className="text-slate-300 font-bold uppercase tracking-[0.2em] text-xs">Awaiting Atmospheric Telemetry</h3>
                                <p className="text-slate-500 text-[10px] mt-2 max-w-[280px] leading-relaxed">
                                    No {reportSubTab === 'PENDING' ? 'pending triage' : 'verified'} citizen sighting reports are currently registered in our neural cache.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            ) : (
                <div className="space-y-8 animate-in fade-in duration-500">
                    <div className="grid md:grid-cols-2 gap-8">
                        <div className="glass-card p-8 border-sky-500/20">
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-sky-500/20 rounded-lg">
                                    <Activity className="w-6 h-6 text-sky-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Global Feature Sensitivity</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black">AI Model Weighted Metrics</p>
                                </div>
                            </div>

                            {!globalStats ? (
                                <div className="py-20 text-center text-slate-600 italic text-sm animate-pulse">Accessing neural weights...</div>
                            ) : (
                                <div className="space-y-6">
                                    {[...globalStats.global_importance].sort((a, b) => b.importance - a.importance).map((stat, idx) => (
                                        <div key={idx} className="space-y-2">
                                            <div className="flex justify-between items-end">
                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{stat.feature.replace(/_/g, ' ')}</span>
                                                <span className="text-sky-400 font-mono text-xs">{(stat.importance * 100).toFixed(1)}% weight</span>
                                            </div>
                                            <div className="h-1.5 w-full bg-slate-900 rounded-full overflow-hidden flex">
                                                <div
                                                    className="h-full bg-sky-500 shadow-[0_0_10px_rgba(14,165,233,0.3)] transition-all duration-[2000ms]"
                                                    style={{ width: `${stat.importance * 400}%` }}
                                                ></div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="pt-6 border-t border-slate-800/50 mt-6 grid grid-cols-2 gap-4">
                                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-600 font-black uppercase mb-1">Architecture</div>
                                            <div className="text-sky-400 font-bold text-xs">{globalStats.model}</div>
                                        </div>
                                        <div className="p-3 bg-slate-900/50 rounded-xl border border-slate-800">
                                            <div className="text-[9px] text-slate-600 font-black uppercase mb-1">Learning Set</div>
                                            <div className="text-sky-400 font-bold text-xs">{globalStats.training_samples} Primary Vectors</div>
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>

                        <div className="glass-card p-8 border-rose-500/20 relative overflow-hidden">
                            <div className="absolute -right-8 -bottom-8 opacity-[0.03] rotate-12">
                                <Shield className="w-64 h-64 text-rose-500" />
                            </div>
                            <div className="flex items-center gap-3 mb-8">
                                <div className="p-2 bg-rose-500/20 rounded-lg">
                                    <Search className="w-6 h-6 text-rose-400" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-bold text-white">Model Confidence Logic</h3>
                                    <p className="text-xs text-slate-500 uppercase tracking-widest font-black">XAI Decision Boundary</p>
                                </div>
                            </div>

                            <div className="space-y-4 relative z-10">
                                <div className="p-4 bg-emerald-500/5 rounded-xl border border-emerald-500/10">
                                    <h4 className="text-xs font-bold text-emerald-400 mb-2 uppercase tracking-tighter">Impact Reduction (SAFE)</h4>
                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                        Factors like high "Miss Distance" or lower "Absolute Magnitude" push the probability towards SAFE. Smaller asteroids with slower velocities significantly reduce kinetic threat profiles.
                                    </p>
                                </div>
                                <div className="p-4 bg-rose-500/5 rounded-xl border border-rose-500/10">
                                    <h4 className="text-xs font-bold text-rose-400 mb-2 uppercase tracking-tighter">Impact Escalation (DANGER)</h4>
                                    <p className="text-[11px] text-slate-400 leading-relaxed italic">
                                        Extreme "Velocity" and "Diameter Max" are the primary drivers of DANGER classifications. Any asteroid within 0.05 AU with MT energy &gt; 10 trigger defensive alerts.
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
