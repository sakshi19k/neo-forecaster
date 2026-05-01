import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Shield, User, Mail, Lock } from 'lucide-react';

export default function Login() {
    const [isRegister, setIsRegister] = useState(false);
    const [formData, setFormData] = useState({ fullName: '', email: '', password: '', role: 'CITIZEN', institutionalCode: '' });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);
    const { login, register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);
        try {
            let userData;
            if (isRegister) {
                await register(formData);
                userData = await login(formData.email, formData.password, formData.role);
            } else {
                userData = await login(formData.email, formData.password, formData.role);
            }

            if (userData.role === 'CITIZEN') {
                navigate('/citizen-dashboard');
            } else if (userData.role === 'SCIENTIST') {
                navigate('/scientist-dashboard');
            } else {
                navigate('/');
            }
        } catch (err) {
            console.error(err);
            setError(err.response?.data?.message || 'Connection error. Is the backend and MongoDB running?');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center p-4">
            <div className="glass-card w-full max-w-md p-8">
                <div className="flex flex-col items-center mb-6">
                    <div className="w-16 h-16 bg-sky-500/20 rounded-2xl flex items-center justify-center mb-4 border border-sky-500/30">
                        <Shield className="w-8 h-8 text-sky-400" />
                    </div>
                    <h1 className="text-3xl font-bold text-white tracking-tight">Neo Forecaster</h1>
                    <p className="text-slate-400 mt-1">Planetary Defense System</p>
                </div>

                <div className="flex p-1 bg-slate-900 border border-slate-800 rounded-xl mb-6">
                    <button
                        onClick={() => setFormData({ ...formData, role: 'CITIZEN' })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${formData.role === 'CITIZEN' ? 'bg-sky-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        CITIZEN
                    </button>
                    <button
                        onClick={() => setFormData({ ...formData, role: 'SCIENTIST' })}
                        className={`flex-1 py-2 px-4 rounded-lg text-sm font-bold transition-all ${formData.role === 'SCIENTIST' ? 'bg-rose-500 text-white shadow-lg' : 'text-slate-500 hover:text-slate-300'}`}
                    >
                        SCIENTIST
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {isRegister && (
                        <div>
                            <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Full Name</label>
                            <div className="relative">
                                <User className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="text"
                                    placeholder="John Doe"
                                    value={formData.fullName}
                                    className="input-field pl-10"
                                    required={isRegister}
                                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                />
                            </div>
                        </div>
                    )}

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">
                            {formData.role === 'SCIENTIST' ? 'Scientific ID / Email' : 'Email Address'}
                        </label>
                        <div className="relative">
                            <Mail className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                            <input
                                type="email"
                                placeholder={formData.role === 'SCIENTIST' ? 'scientist@nasa.gov' : 'citizen@nasa.gov'}
                                value={formData.email}
                                className="input-field pl-10"
                                required
                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-slate-300 mb-1.5 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                            <input
                                type="password"
                                placeholder="••••••••"
                                value={formData.password}
                                className="input-field pl-10"
                                required
                                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                            />
                        </div>
                    </div>
                    {isRegister && formData.role === 'SCIENTIST' && (
                        <div className="animate-in fade-in slide-in-from-top-2 duration-300">
                            <label className="block text-sm font-medium text-rose-300 mb-1.5 ml-1 flex items-center gap-2">
                                <Shield className="w-4 h-4" /> Institutional Access Code
                            </label>
                            <div className="relative">
                                <Lock className="absolute left-3 top-2.5 w-5 h-5 text-slate-500" />
                                <input
                                    type="password"
                                    placeholder="NEO-XXXX-XX"
                                    value={formData.institutionalCode}
                                    className="input-field pl-10 border-rose-500/30 focus:border-rose-500"
                                    required={isRegister && formData.role === 'SCIENTIST'}
                                    onChange={(e) => setFormData({ ...formData, institutionalCode: e.target.value })}
                                />
                            </div>
                            <p className="text-[10px] text-slate-500 mt-1 ml-1 uppercase tracking-widest font-bold">Verification Required for Scientist Role</p>
                        </div>
                    )}

                    {error && <p className="text-red-400 text-sm text-center font-medium bg-red-400/10 py-2 rounded-lg">{error}</p>}

                    <button type="submit" disabled={loading} className={`w-full py-3 mt-4 text-lg font-bold rounded-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed ${formData.role === 'SCIENTIST' ? 'bg-rose-500 hover:bg-rose-600 text-white' : 'bg-sky-500 hover:bg-sky-600 text-white'
                        }`}>
                        {loading ? 'Processing...' : (isRegister ? 'Create Account' : `Sign In as ${formData.role.toLowerCase()}`)}
                    </button>
                </form>

                <p className="text-center mt-6 text-slate-400 text-sm">
                    {isRegister ? 'Already have an account?' : "Don't have an account?"}{' '}
                    <button
                        onClick={() => setIsRegister(!isRegister)}
                        className="text-sky-400 hover:text-sky-300 font-semibold transition-colors"
                    >
                        {isRegister ? 'Sign In' : 'Join the Defense'}
                    </button>
                </p>
            </div>
        </div>
    );
}
