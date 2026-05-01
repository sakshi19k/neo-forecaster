import { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, MapPin, Palette, Volume2, Split, History, LayoutDashboard, Zap, Sun, Target, Globe, Camera, Film, Newspaper, Activity } from 'lucide-react';
import SpaceNewsFeed from '../components/SpaceNewsFeed';

export default function CitizenDashboard() {
    const [activeTab, setActiveTab] = useState('command');
    const [formData, setFormData] = useState({
        location: { coordinates: [] },
        soundDelaySeconds: '',
        soundType: 'NONE',
        color: '',
        brightness: 'VENUS',
        fragmentation: false
    });
    const [lat, setLat] = useState('');
    const [lon, setLon] = useState('');
    const [media, setMedia] = useState(null);
    const [history, setHistory] = useState([]);
    const [verifiedReports, setVerifiedReports] = useState([]);
    const [loading, setLoading] = useState(false);
    const [showSuccess, setShowSuccess] = useState(false);

    useEffect(() => {
        fetchHistory();
        fetchVerified();
    }, []);

    const fetchHistory = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reports/my-history');
            setHistory(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const fetchVerified = async () => {
        try {
            const res = await axios.get('http://localhost:5000/api/reports/verified');
            setVerifiedReports(res.data);
        } catch (err) {
            console.error(err);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const data = new FormData();
            data.append('location', JSON.stringify({
                type: 'Point',
                coordinates: [parseFloat(lon), parseFloat(lat)]
            }));
            data.append('soundDelaySeconds', formData.soundDelaySeconds);
            data.append('soundType', formData.soundType);
            data.append('color', formData.color);
            data.append('brightness', formData.brightness);
            data.append('fragmentation', formData.fragmentation);
            if (media) data.append('media', media);

            await axios.post('http://localhost:5000/api/reports', data, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            setFormData({
                location: { coordinates: [] },
                soundDelaySeconds: '',
                soundType: 'NONE',
                color: '',
                brightness: 'VENUS',
                fragmentation: false
            });
            setMedia(null);
            setLat(''); setLon('');
            fetchHistory();
            setShowSuccess(true);
            setTimeout(() => setShowSuccess(false), 5000);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 max-w-7xl mx-auto space-y-8 mt-16 text-slate-200">
            <header className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-800/50 pb-8">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-sky-500/20 rounded-lg">
                        <LayoutDashboard className="w-6 h-6 text-sky-400" />
                    </div>
                    <div>
                        <h1 className="text-2xl font-bold text-white tracking-widest uppercase text-sm">Citizen Observer Portal</h1>
                        <p className="text-slate-400 text-xs font-medium">Contribute to global planetary defense</p>
                    </div>
                </div>

                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl self-start md:self-center">
                    <button
                        onClick={() => setActiveTab('command')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase transition-all ${activeTab === 'command' ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Zap className="w-4 h-4" /> Command
                    </button>
                    <button
                        onClick={() => setActiveTab('news')}
                        className={`flex items-center gap-2 px-6 py-2.5 rounded-lg text-xs font-bold tracking-[0.1em] uppercase transition-all ${activeTab === 'news' ? 'bg-sky-500 text-white shadow-[0_0_15px_rgba(14,165,233,0.3)]' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        <Newspaper className="w-4 h-4" /> Space News
                    </button>
                </div>
            </header>

            {activeTab === 'command' ? (
                <div className="grid lg:grid-cols-3 gap-8 animate-in fade-in duration-500">
                    <div className="lg:col-span-1 space-y-6">
                        <div className="glass-card p-6 border-emerald-500/20 bg-emerald-500/5">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2 text-emerald-400">
                                <Globe className="w-5 h-5" /> Live Verified Impacts
                            </h2>
                            <div className="space-y-4">
                                {verifiedReports.slice(0, 5).map(report => (
                                    <div key={report._id} className="p-3 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center gap-4 animate-in fade-in duration-500">
                                        <div className="p-2 bg-rose-500/20 rounded-lg">
                                            <Target className="w-4 h-4 text-rose-400" />
                                        </div>
                                        <div>
                                            <div className="text-xs font-bold text-slate-300">
                                                {report.location.coordinates[1].toFixed(2)}°N, {report.location.coordinates[0].toFixed(2)}°E
                                            </div>
                                            <div className="text-[10px] text-slate-500 uppercase font-bold tracking-tighter">
                                                {new Date(report.createdAt).toLocaleDateString()} • {report.brightness}
                                            </div>
                                        </div>
                                    </div>
                                ))}
                                {verifiedReports.length === 0 && (
                                    <p className="text-xs text-slate-500 italic text-center py-4">No impacts verified today.</p>
                                )}
                            </div>
                        </div>

                        <div className="glass-card p-6 border-slate-700/50">
                            <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                                <History className="w-5 h-5 text-sky-400" /> My Contribution History
                            </h2>
                            <div className="space-y-3">
                                {history.map((report) => (
                                    <div key={report._id} className="p-3 bg-slate-900/30 rounded-lg border border-slate-800/50 flex justify-between items-center group hover:bg-slate-800/50 transition-all">
                                        <div>
                                            <div className="text-xs font-mono text-slate-400">{new Date(report.createdAt).toLocaleDateString()}</div>
                                            <div className="text-sm font-bold text-slate-200 uppercase tracking-tighter">{report.color || 'Unspecified'} Fireball</div>
                                        </div>
                                        <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase tracking-widest border ${report.status === 'VERIFIED' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30' :
                                            report.status === 'REJECTED' ? 'bg-rose-500/10 text-rose-400 border-rose-500/30' :
                                                'bg-slate-500/10 text-slate-400 border-slate-700'
                                            }`}>
                                            {report.status === 'VERIFIED' ? 'Verified by Researcher' : report.status}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2">
                        <div className="glass-card p-8 border-sky-500/30 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-4 opacity-10">
                                <Zap className="w-32 h-32 text-sky-400" />
                            </div>

                            <h2 className="text-2xl font-bold mb-8 flex items-center gap-3 text-white">
                                <Send className="w-6 h-6 text-sky-400" /> Scientific Meteor Report
                            </h2>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Location Data</h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 ml-1">LATITUDE</label>
                                                <input
                                                    type="number" step="any" placeholder="40.71"
                                                    className="input-field border-slate-800 focus:border-sky-500" required
                                                    value={lat} onChange={(e) => setLat(e.target.value)}
                                                />
                                            </div>
                                            <div>
                                                <label className="block text-[11px] font-bold text-slate-400 mb-1.5 ml-1">LONGITUDE</label>
                                                <input
                                                    type="number" step="any" placeholder="-74.00"
                                                    className="input-field border-slate-800 focus:border-sky-500" required
                                                    value={lon} onChange={(e) => setLon(e.target.value)}
                                                />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest">Brightness Benchmark</h3>
                                        <div className="relative">
                                            <Sun className="absolute left-3 top-3 w-5 h-5 text-amber-500/50" />
                                            <select
                                                className="input-field pl-10 appearance-none cursor-pointer"
                                                value={formData.brightness}
                                                onChange={(e) => setFormData({ ...formData, brightness: e.target.value })}
                                            >
                                                <option value="SUN">Brighter than the Sun (Danger!)</option>
                                                <option value="MOON">Brighter than the Moon</option>
                                                <option value="VENUS">Brighter than Venus</option>
                                                <option value="STARRY_NIGHT">Standard Star-like</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>

                                <div className="grid md:grid-cols-3 gap-6">
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-400 ml-1">SOUND TYPE</label>
                                        <select
                                            className="input-field cursor-pointer"
                                            value={formData.soundType}
                                            onChange={(e) => setFormData({ ...formData, soundType: e.target.value })}
                                        >
                                            <option value="NONE">No Sound Heard</option>
                                            <option value="BOOM">Sonic Boom / Thump</option>
                                            <option value="WHISTLING">Whistling / Hissing</option>
                                            <option value="OTHER">Other Sound</option>
                                        </select>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-400 ml-1">SOUND DELAY (SEC)</label>
                                        <div className="relative">
                                            <Volume2 className="absolute left-3 top-2.5 w-5 h-5 text-slate-600" />
                                            <input
                                                type="number" placeholder="Eg. 60"
                                                className="input-field pl-10"
                                                value={formData.soundDelaySeconds}
                                                onChange={(e) => setFormData({ ...formData, soundDelaySeconds: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="block text-[11px] font-bold text-slate-400 ml-1">PRIMARY COLOR</label>
                                        <div className="relative">
                                            <Palette className="absolute left-3 top-2.5 w-5 h-5 text-slate-600" />
                                            <input
                                                type="text" placeholder="Greenish Blue"
                                                className="input-field pl-10 uppercase text-xs"
                                                value={formData.color}
                                                onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="p-4 bg-sky-500/5 rounded-xl border border-sky-500/10 grid md:grid-cols-2 gap-4">
                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Camera className="w-4 h-4" /> Visual Evidence
                                        </h3>
                                        <div className="relative group">
                                            <input
                                                type="file"
                                                accept="image/*,video/*"
                                                className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                onChange={(e) => setMedia(e.target.files[0])}
                                            />
                                            <div className="p-4 border-2 border-dashed border-slate-800 rounded-xl bg-slate-900/50 flex flex-col items-center justify-center gap-2 group-hover:border-sky-500/50 transition-all">
                                                {media ? (
                                                    <div className="text-center">
                                                        <div className="text-sky-400 font-bold text-xs truncate max-w-[200px]">{media.name}</div>
                                                        <div className="text-[10px] text-slate-500 uppercase">{(media.size / 1024 / 1024).toFixed(2)} MB</div>
                                                    </div>
                                                ) : (
                                                    <>
                                                        <Film className="w-8 h-8 text-slate-700" />
                                                        <div className="text-[10px] text-slate-500 font-bold uppercase tracking-widest text-center">Upload Photo/Video of the event</div>
                                                    </>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-4">
                                        <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-2">
                                            <Split className="w-4 h-4" /> Fragmentation
                                        </h3>
                                        <div className="p-4 bg-slate-900/50 rounded-xl border border-slate-800 flex items-center justify-between h-[84px]">
                                            <div>
                                                <div className="text-[10px] text-slate-500 uppercase font-black">Multiple pieces?</div>
                                            </div>
                                            <label className="relative inline-flex items-center cursor-pointer">
                                                <input
                                                    type="checkbox" className="sr-only peer"
                                                    checked={formData.fragmentation}
                                                    onChange={(e) => setFormData({ ...formData, fragmentation: e.target.checked })}
                                                />
                                                <div className="w-11 h-6 bg-slate-800 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-sky-500"></div>
                                            </label>
                                        </div>
                                    </div>
                                </div>

                                <button type="submit" disabled={loading} className="btn-primary w-full py-4 text-xs font-black uppercase tracking-[0.3em] shadow-[0_0_30px_rgba(14,165,233,0.3)] hover:shadow-sky-500/50 transition-all">
                                    {loading ? 'Uploading Data Package...' : 'Submit to Science Command'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            ) : (
                <div className="animate-in slide-in-from-bottom-4 fade-in duration-500">
                    <SpaceNewsFeed />
                </div>
            )}

            {showSuccess && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-300">
                    <div className="glass-card max-w-sm w-full p-8 border-emerald-500/30 text-center animate-in zoom-in duration-300">
                        <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                            <Zap className="w-10 h-10 text-emerald-400 fill-emerald-400/20" />
                        </div>
                        <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Submitted Successfully!</h2>
                        <p className="text-slate-400 text-sm mb-6 leading-relaxed">
                            Your report has been logged in the global defense registry. Thank you for your vital contribution to planetary tracking.
                        </p>
                        <button
                            onClick={() => setShowSuccess(false)}
                            className="w-full py-3 bg-emerald-500 hover:bg-emerald-600 text-white font-bold rounded-xl transition-all shadow-lg shadow-emerald-500/20 font-black uppercase tracking-widest text-xs"
                        >
                            Return to Command
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
