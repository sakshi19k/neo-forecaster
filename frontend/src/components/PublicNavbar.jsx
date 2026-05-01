import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield } from 'lucide-react';

const PublicNavbar = () => {
    const navigate = useNavigate();

    return (
        <nav className="fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 py-6 backdrop-blur-md bg-slate-950/20 border-b border-white/10">
            <div className="flex items-center gap-3 group cursor-pointer" onClick={() => navigate('/')}>
                <div className="p-2 transition-transform duration-300 group-hover:scale-110 group-hover:rotate-12 bg-sky-500/20 rounded-xl border border-sky-400/30 shadow-[0_0_20px_rgba(14,165,233,0.3)]">
                    <Shield className="w-6 h-6 text-sky-400" />
                </div>
                <span className="text-xl font-black uppercase tracking-[0.15em] bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                    NEO Forecaster
                </span>
            </div>

            <div className="hidden md:flex items-center gap-10">
                <Link
                    to="/"
                    className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors duration-300"
                >
                    Home
                </Link>
                <Link
                    to="/mission"
                    className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors duration-300"
                >
                    Our Mission
                </Link>
                <Link
                    to="/live-data"
                    className="text-sm font-bold uppercase tracking-widest text-slate-300 hover:text-white transition-colors duration-300"
                >
                    Live Data
                </Link>
                <Link
                    to="/login"
                    className="px-6 py-2.5 bg-white/10 hover:bg-white/20 border border-white/20 hover:border-white/40 rounded-full text-sm font-bold uppercase tracking-widest transition-all duration-300 backdrop-blur-md shadow-xl"
                >
                    Access Portal
                </Link>
            </div>
        </nav>
    );
};

export default PublicNavbar;
