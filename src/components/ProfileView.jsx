import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Loader2, Camera, X, Check } from 'lucide-react';
import { API_BASE_URL } from '../api';
import { getAvatarUrl } from '../utils/avatar';
import api from '../api';

export const ProfileView = ({ isOpen, onClose }) => {
    const { user, updateProfile } = useAuth();
    const [firstName, setFirstName] = useState(user?.first_name || '');
    const [lastName, setLastName] = useState(user?.last_name || '');
    const [avatar, setAvatar] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(user?.avatar || null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState(false);

    if (!isOpen) return null;

    const handleFileChange = (e) => {
        const file = e.target.files[0];
        if (file) {
            setAvatar(file);
            const reader = new FileReader();
            reader.onloadend = () => {
                setAvatarPreview(reader.result);
            };
            reader.readAsDataURL(file);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        setError('');
        setSuccess(false);

        const formData = new FormData();
        formData.append('first_name', firstName);
        formData.append('last_name', lastName);
        if (avatar) {
            formData.append('avatar', avatar);
        }

        try {
            await updateProfile(formData);
            setSuccess(true);
            setTimeout(() => setSuccess(false), 3000);
        } catch (err) {
            setError('Failed to update profile. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass p-8 rounded-3xl shadow-floating max-w-md w-full relative animate-in zoom-in-95 duration-500">
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 text-white/20 hover:text-white transition-colors"
                >
                    <X size={20} />
                </button>

                <div className="flex flex-col items-center mb-8">
                    <div className="relative group mb-4">
                        <label className="cursor-pointer block relative">
                            <input
                                type="file"
                                className="hidden"
                                accept="image/*"
                                onChange={handleFileChange}
                            />
                            <div className="w-24 h-24 rounded-3xl bg-brand-coke/10 flex items-center justify-center border border-white/10 shadow-lg overflow-hidden">
                                {avatarPreview ? (
                                    <img
                                        src={getAvatarUrl(avatarPreview)}
                                        alt="Profile"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <span className="text-3xl font-bold text-brand-coke uppercase">
                                        {user?.email.charAt(0)}
                                    </span>
                                )}
                            </div>
                            <div className="absolute inset-0 bg-black/40 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-[2px]">
                                <Camera className="text-white" size={24} />
                            </div>
                        </label>
                    </div>
                    <h2 className="text-xl font-bold text-white">Profile Settings</h2>
                    <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest mt-1">Manage your professional identity</p>
                </div>

                {error && (
                    <div className="mb-6 p-4 bg-brand-coke/10 border border-brand-coke/20 rounded-xl text-brand-coke text-xs font-bold animate-in fade-in slide-in-from-top-2">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="mb-6 p-4 bg-accent-green/10 border border-accent-green/20 rounded-xl text-accent-green text-xs font-bold animate-in fade-in slide-in-from-top-2 flex items-center gap-2">
                        <Check size={16} />
                        Profile updated successfully!
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="space-y-2">
                        <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Email Address</label>
                        <div className="relative group">
                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-white/10" size={18} />
                            <input
                                type="email"
                                disabled
                                className="w-full bg-white/5 border border-white/5 rounded-xl py-3.5 pl-12 pr-4 text-sm text-white/40 cursor-not-allowed"
                                value={user?.email || ''}
                            />
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">First Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-background-dark/50 border border-white/5 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-brand-coke/50 transition-all font-medium"
                                placeholder="First"
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                            />
                        </div>
                        <div className="space-y-2">
                            <label className="text-[10px] font-bold uppercase tracking-widest text-white/40 ml-1">Last Name</label>
                            <input
                                type="text"
                                required
                                className="w-full bg-background-dark/50 border border-white/5 rounded-xl py-3.5 px-4 text-sm focus:outline-none focus:border-brand-coke/50 transition-all font-medium"
                                placeholder="Last"
                                value={lastName}
                                onChange={(e) => setLastName(e.target.value)}
                            />
                        </div>
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full btn-coke py-4 rounded-xl flex items-center justify-center gap-2 font-bold text-sm shadow-floating mt-4 active:scale-95 transition-all disabled:opacity-50"
                    >
                        {loading ? <Loader2 className="animate-spin" size={20} /> : 'Save Changes'}
                    </button>
                </form>
            </div>
        </div>
    );
};
