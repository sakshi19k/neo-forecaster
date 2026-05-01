import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Shield, ChevronRight } from 'lucide-react';

import PublicNavbar from './PublicNavbar';

const LandingPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative h-screen w-full overflow-hidden bg-slate-950 font-sans antialiased text-white">
            {/* Background Image with Overlay */}
            <div
                className="absolute inset-0 bg-cover bg-center bg-no-repeat transition-transform duration-1000 scale-105"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1446776811953-b23d57bd21aa?auto=format&fit=crop&q=80&w=2000')`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/80 via-slate-950/40 to-slate-950/90" />
            </div>

            <PublicNavbar />

            {/* Hero Content */}
            <div className="relative z-10 h-full flex flex-col items-center justify-center px-4 text-center">
                <div className="space-y-6 max-w-6xl animate-in fade-in zoom-in duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-xs font-black uppercase tracking-[0.3em] mb-4 shadow-[0_0_30px_rgba(14,165,233,0.15)]">
                        Planetary Defense Network
                    </div>

                    <div className="flex flex-col items-center">
                        <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold tracking-[0.2em] text-white uppercase text-center leading-none drop-shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                            NEO<br className="sm:hidden" /> FORECASTER
                        </h1>
                    </div>

                    <div className="h-1 w-32 bg-sky-500 mx-auto rounded-full shadow-[0_0_20px_rgba(14,165,233,0.8)]" />

                    <div className="pt-20">
                        <button
                            onClick={() => navigate('/login')}
                            className="group relative px-10 py-5 bg-sky-500 hover:bg-sky-400 rounded-2xl text-lg font-black uppercase tracking-[0.2em] transition-all duration-500 shadow-[0_0_40px_rgba(14,165,233,0.4)] hover:shadow-[0_0_60px_rgba(14,165,233,0.6)] hover:-translate-y-1"
                        >
                            <span className="relative z-10 flex items-center gap-3">
                                Explore the Portal <ChevronRight className="w-6 h-6 group-hover:translate-x-1 transition-transform" />
                            </span>
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1000" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Bottom Subtle Overlay */}
            <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-slate-950 to-transparent pointer-events-none" />

            {/* Dynamic Background Accents */}
            <div className="absolute top-1/4 -left-20 w-[500px] h-[500px] bg-sky-500/10 blur-[150px] rounded-full mix-blend-screen pointer-events-none animate-pulse" />
            <div className="absolute bottom-1/4 -right-20 w-[600px] h-[600px] bg-rose-500/10 blur-[180px] rounded-full mix-blend-screen pointer-events-none animate-pulse delay-700" />
        </div>
    );
};

export default LandingPage;
