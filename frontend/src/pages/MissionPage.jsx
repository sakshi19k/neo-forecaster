import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Shield, Target, Cpu, Globe } from 'lucide-react';
import PublicNavbar from '../components/PublicNavbar';

const MissionPage = () => {
    const navigate = useNavigate();

    return (
        <div className="relative min-h-screen w-full overflow-x-hidden bg-slate-950 font-sans antialiased text-white pb-20">
            {/* Background Image with Overlay */}
            <div
                className="fixed inset-0 bg-cover bg-center bg-no-repeat"
                style={{
                    backgroundImage: `url('https://images.unsplash.com/photo-1451187580459-43490279c0fa?auto=format&fit=crop&q=80&w=2000')`,
                }}
            >
                <div className="absolute inset-0 bg-gradient-to-b from-slate-950/90 via-slate-950/70 to-slate-950/95" />
            </div>

            <PublicNavbar />

            {/* Content Area */}
            <div className="relative z-10 pt-32 px-6 max-w-5xl mx-auto space-y-24">
                {/* Header */}
                <header className="text-center space-y-8 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-[10px] font-black uppercase tracking-[0.3em] shadow-[0_0_20px_rgba(14,165,233,0.1)]">
                        Humanity's Shield
                    </div>
                    <h1 className="text-4xl md:text-6xl font-black tracking-tight leading-tight">
                        Bridging the Gap Between <br />
                        <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 to-rose-400">the Stars and the Ground</span>
                    </h1>
                </header>

                {/* Grid Sections */}
                <div className="grid gap-12">
                    {/* The Challenge */}
                    <section className="glass-card p-8 md:p-12 border-white/10 relative overflow-hidden group hover:border-sky-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Target className="w-32 h-32 text-sky-400" />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-400/20">
                                <Target className="w-6 h-6 text-sky-400" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-widest">The Challenge</h2>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed font-medium">
                            Historically, planetary defense has relied entirely on centralized space agencies and massive optical telescopes.
                            While these institutional systems are incredibly powerful, they possess critical observational blind spots.
                            Telescopes cannot easily detect Near-Earth Objects (NEOs) approaching from the direction of the Sun—a
                            vulnerability demonstrated by the <span className="text-white font-bold">2013 Chelyabinsk meteor event</span>,
                            which struck without warning. When atmospheric entries do occur, the collection of ground-level data from
                            civilian observers remains fragmented, noisy, and difficult to verify.
                        </p>
                    </section>

                    {/* Our Solution */}
                    <section className="glass-card p-8 md:p-12 border-white/10 relative overflow-hidden group hover:border-rose-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Globe className="w-32 h-32 text-rose-400" />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-rose-500/10 rounded-xl border border-rose-400/20">
                                <Globe className="w-6 h-6 text-rose-400" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-widest">Our Solution</h2>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed font-medium">
                            NEO Forecaster was engineered to <span className="text-white font-bold">decentralize and modernize</span> planetary defense.
                            By unifying live orbital data from NASA's Sentry systems with crowdsourced, mathematically standardized
                            citizen science, we are creating a more resilient early-warning network.
                        </p>
                    </section>

                    {/* The Technology */}
                    <section className="glass-card p-8 md:p-12 border-white/10 relative overflow-hidden group hover:border-sky-500/30 transition-all duration-500">
                        <div className="absolute top-0 right-0 p-8 opacity-5 group-hover:opacity-10 transition-opacity">
                            <Cpu className="w-32 h-32 text-sky-400" />
                        </div>
                        <div className="flex items-center gap-4 mb-8">
                            <div className="p-3 bg-sky-500/10 rounded-xl border border-sky-400/20">
                                <Cpu className="w-6 h-6 text-sky-400" />
                            </div>
                            <h2 className="text-2xl font-black uppercase tracking-widest">The Technology</h2>
                        </div>
                        <p className="text-slate-300 text-lg leading-relaxed font-medium">
                            We replace opaque, slow-moving orbital mechanics with real-time, <span className="text-white font-bold">Explainable Artificial Intelligence (XAI)</span>.
                            Our machine learning engine not only predicts threat probabilities instantaneously but provides complete mathematical transparency to researchers.
                            NEO Forecaster ensures that humanity is no longer just watching the skies—we are actively predicting them.
                        </p>
                    </section>
                </div>

                {/* Call to Action */}
                <div className="text-center pt-12 animate-in fade-in duration-1000 delay-500">
                    <button
                        onClick={() => navigate('/login')}
                        className="px-8 py-4 bg-sky-500 hover:bg-sky-400 rounded-xl text-sm font-black uppercase tracking-[0.2em] transition-all hover:scale-105 shadow-[0_0_30px_rgba(14,165,233,0.3)]"
                    >
                        Join the Network
                    </button>
                </div>
            </div>

            {/* Dynamic Background Accents */}
            <div className="fixed top-1/4 -left-20 w-[500px] h-[500px] bg-sky-500/5 blur-[150px] rounded-full pointer-events-none" />
            <div className="fixed bottom-1/4 -right-20 w-[600px] h-[600px] bg-rose-500/5 blur-[180px] rounded-full pointer-events-none" />
        </div>
    );
};

export default MissionPage;
