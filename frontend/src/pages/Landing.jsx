import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Shield, Activity, Globe, Zap, LogOut, ChevronRight } from 'lucide-react';

export default function Landing() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    if (!user) return null;

    const handleLogout = () => {
        logout();
        navigate('/');
    };

    return (
        <div className="min-h-screen pt-24 pb-12 px-6 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Decorative Elements */}
            <div className="absolute top-1/4 -left-1/4 w-96 h-96 bg-sky-500/10 blur-[120px] rounded-full pointer-events-none" />
            <div className="absolute bottom-1/4 -right-1/4 w-96 h-96 bg-rose-500/10 blur-[120px] rounded-full pointer-events-none" />

            <div className="w-full max-w-4xl relative z-10">
                <header className="text-center mb-16 space-y-4">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] mb-4">
                        <Shield className="w-3 h-3" /> Planetary Defense Network Active
                    </div>
                    <h1 className="text-5xl md:text-7xl font-black text-white tracking-tighter">
                        Welcome, <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-rose-400 uppercase">{user.fullName.split(' ')[0]}</span>
                    </h1>
                    <p className="text-slate-400 text-lg max-w-2xl mx-auto font-medium">
                        You are currently authorized as a <span className="text-sky-400 font-bold tracking-widest uppercase">{user.role}</span>.
                        The Neo Forecaster system is ready for your input.
                    </p>
                </header>

                <div className="grid md:grid-cols-2 gap-8 mb-12">
                    <Link
                        to="/dashboard"
                        className="glass-card group p-8 border-sky-500/20 hover:border-sky-500/50 transition-all relative overflow-hidden flex flex-col items-center text-center"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Zap className="w-24 h-24 text-sky-400" />
                        </div>
                        <div className="w-16 h-16 bg-sky-500/10 rounded-2xl flex items-center justify-center mb-6 border border-sky-500/30 group-hover:scale-110 transition-transform">
                            <Activity className="w-8 h-8 text-sky-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Access Command Center</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Enter the primary interface for telemetry tracking, threat detection, and scientific validation.
                        </p>
                        <div className="inline-flex items-center gap-2 text-sky-400 font-bold text-xs uppercase tracking-widest">
                            Proceed to Dashboard <ChevronRight className="w-4 h-4" />
                        </div>
                    </Link>

                    <button
                        onClick={handleLogout}
                        className="glass-card group p-8 border-rose-500/20 hover:border-rose-500/50 transition-all relative overflow-hidden flex flex-col items-center text-center"
                    >
                        <div className="absolute top-0 right-0 p-4 opacity-5 group-hover:opacity-10 transition-opacity">
                            <LogOut className="w-24 h-24 text-rose-400" />
                        </div>
                        <div className="w-16 h-16 bg-rose-500/10 rounded-2xl flex items-center justify-center mb-6 border border-rose-500/30 group-hover:scale-110 transition-transform">
                            <LogOut className="w-8 h-8 text-rose-400" />
                        </div>
                        <h2 className="text-2xl font-bold text-white mb-3">Terminate Session</h2>
                        <p className="text-slate-500 text-sm leading-relaxed mb-6">
                            Securely sign out of the defense network and return to the main login portal.
                        </p>
                        <div className="inline-flex items-center gap-2 text-rose-400 font-bold text-xs uppercase tracking-widest">
                            Sign Out Now <ChevronRight className="w-4 h-4" />
                        </div>
                    </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-8 opacity-40">
                    <div className="flex items-center gap-2 grayscale group-hover:grayscale-0 transition-all">
                        <Globe className="w-5 h-5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Global Watch</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-slate-400" />
                        <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">Neural Link v4.2</span>
                    </div>
                </div>
            </div>
        </div>
    );
}
