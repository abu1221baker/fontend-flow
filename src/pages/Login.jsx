import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { Mail, Lock, Loader2, CheckCircle2 } from 'lucide-react';

const Login = () => {
    const location = useLocation();
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await login({ email, password });
            navigate('/');
        } catch (error) {
            setError('Invalid email or password. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
            <div className="w-full max-w-md glass p-8 rounded-2xl shadow-floating animate-in fade-in transition-all duration-700">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-brand-coke p-3 rounded-2xl shadow-lg mb-4">
                        <Lock className="text-white" size={24} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-brand-coke italic mb-4">flow</h1>
                    <h2 className="text-2xl font-bold tracking-tight">Welcome Back</h2>
                    <p className="text-white/50 text-xs mt-2">Sign in to continue your flow</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-brand-coke/10 border border-brand-coke/20 rounded-xl text-brand-coke text-xs font-bold animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {location.state?.message && !error && (
                    <div className="mb-6 p-4 bg-accent-green/10 border border-accent-green/20 rounded-xl text-accent-green text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                        <CheckCircle2 size={16} />
                        {location.state.message}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                        <div className="relative">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="email"
                                required
                                className="w-full bg-background-dark/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-coke/50 transition-all font-medium"
                                placeholder="yousuf@example.com"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Password</label>
                        <div className="relative">
                            <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                            <input
                                type="password"
                                required
                                className="w-full bg-background-dark/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm focus:outline-none focus:border-brand-coke/50 transition-all font-medium"
                                placeholder="••••••••"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-coke py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-floating mt-4 disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Login to Account'}
                    </button>
                </form>

                <p className="text-center text-xs text-white/40 mt-8">
                    Don't have an account? <Link to="/register" className="text-brand-coke font-bold hover:underline">Sign up now</Link>
                </p>
            </div>
        </div>
    );
};

export default Login;
