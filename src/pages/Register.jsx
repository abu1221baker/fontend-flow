import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate, Link } from 'react-router-dom';
import { User, Mail, Lock, Loader2, UserPlus, Type } from 'lucide-react';

const Register = () => {
    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        try {
            await register({
                first_name: firstName,
                last_name: lastName,
                email,
                password
            });
            navigate('/login', { state: { message: 'Account created successfully! Please login.' } });
        } catch (error) {
            console.error('Registration error:', error.response?.data);
            const msg = error.response?.data?.email || error.response?.data?.password || 'Registration failed. Please try again.';
            setError(Array.isArray(msg) ? msg[0] : msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-background-dark p-6">
            <div className="w-full max-w-md glass p-8 rounded-2xl shadow-floating animate-in fade-in transition-all duration-700">
                <div className="flex flex-col items-center mb-10">
                    <div className="bg-brand-coke p-3 rounded-2xl shadow-lg mb-4">
                        <UserPlus className="text-white" size={24} />
                    </div>
                    <h1 className="text-4xl font-black tracking-tighter text-brand-coke italic mb-4">flow</h1>
                    <h2 className="text-2xl font-bold tracking-tight">Create Account</h2>
                    <p className="text-white/50 text-xs mt-2">Start your journey with flow today</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-brand-coke/10 border border-brand-coke/20 rounded-xl text-brand-coke text-xs font-bold animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">First Name</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background-dark/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-brand-coke/50 transition-all font-medium"
                                    placeholder="John"
                                    value={firstName}
                                    onChange={(e) => setFirstName(e.target.value)}
                                />
                            </div>
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Last Name</label>
                            <div className="relative">
                                <Type className="absolute left-4 top-1/2 -translate-y-1/2 text-white/20" size={18} />
                                <input
                                    type="text"
                                    required
                                    className="w-full bg-background-dark/50 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-xs focus:outline-none focus:border-brand-coke/50 transition-all font-medium"
                                    placeholder="Doe"
                                    value={lastName}
                                    onChange={(e) => setLastName(e.target.value)}
                                />
                            </div>
                        </div>
                    </div>

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
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Create Account'}
                    </button>
                </form>

                <p className="text-center text-xs text-white/40 mt-8">
                    Already have an account? <Link to="/login" className="text-brand-coke font-bold hover:underline">Log in now</Link>
                </p>
            </div>
        </div>
    );
};

export default Register;
