import React from 'react';
import { Phone, PhoneOff, Video } from 'lucide-react';
import { useCall } from '../context/CallContext';
import { API_BASE_URL } from '../api';
import { getAvatarUrl } from '../utils/avatar';

export const CallModal = () => {
    const { incomingCall, acceptCall, rejectCall } = useCall();

    if (!incomingCall) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm animate-in fade-in duration-300">
            <div className="glass p-8 rounded-3xl shadow-floating max-w-sm w-full flex flex-col items-center gap-6 animate-in zoom-in-95 duration-500">
                <div className="w-20 h-20 rounded-full bg-brand-coke/20 flex items-center justify-center relative">
                    <div className="absolute inset-0 rounded-full bg-brand-coke/20 animate-ping" />
                    <div className="w-16 h-16 rounded-full bg-brand-coke flex items-center justify-center text-white text-2xl font-bold shadow-lg relative z-10 overflow-hidden">
                        {incomingCall.callerAvatar ? (
                            <img src={getAvatarUrl(incomingCall.callerAvatar)} alt="Caller" className="w-full h-full object-cover" />
                        ) : (
                            incomingCall.callerName?.charAt(0)
                        )}
                    </div>
                </div>

                <div className="text-center">
                    <h3 className="text-xl font-bold text-white mb-1">{incomingCall.callerName}</h3>
                    <p className="text-sm text-white/40 font-medium uppercase tracking-widest flex items-center justify-center gap-2">
                        <Phone size={16} />
                        Incoming Voice Call
                    </p>
                </div>

                <div className="flex items-center gap-6 mt-2">
                    <button
                        onClick={rejectCall}
                        className="w-14 h-14 rounded-full bg-brand-coke flex items-center justify-center text-white shadow-lg hover:brightness-110 transition-all active:scale-95"
                    >
                        <PhoneOff size={24} />
                    </button>
                    <button
                        onClick={acceptCall}
                        className="w-14 h-14 rounded-full bg-accent-green flex items-center justify-center text-white shadow-lg hover:brightness-110 transition-all active:scale-95"
                    >
                        <Phone size={24} />
                    </button>
                </div>
            </div>
        </div>
    );
};
