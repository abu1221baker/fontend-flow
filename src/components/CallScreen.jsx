import React, { useEffect, useRef } from 'react';
import { Mic, MicOff, PhoneOff } from 'lucide-react';
import { useCall } from '../context/CallContext';
import { API_BASE_URL } from '../api';
import { getAvatarUrl } from '../utils/avatar';

export const CallScreen = () => {
    const {
        callState,
        localStream,
        remoteStream,
        endCall,
        isMuted,
        toggleMute,
        callType,
        currentCall
    } = useCall();

    const remoteAudioRef = useRef(null);

    useEffect(() => {
        if (remoteAudioRef.current && remoteStream) {
            remoteAudioRef.current.srcObject = remoteStream;
        }
    }, [remoteStream]);

    if (callState === 'idle') return null;

    return (
        <div className="fixed inset-0 z-[90] bg-background-dark flex flex-col animate-in fade-in duration-500">
            {/* Hidden audio element for voice in both modes */}
            <audio ref={remoteAudioRef} autoPlay playsInline />

            {/* Main Area */}
            <div className="flex-1 relative overflow-hidden bg-black/20 flex items-center justify-center">
                <div className="flex flex-col items-center justify-center gap-8 text-center animate-in zoom-in duration-500">
                    <div className="w-32 h-32 rounded-full bg-brand-coke/10 flex items-center justify-center relative">
                        {callState === 'ringing' && (
                            <div className="absolute inset-0 rounded-full bg-brand-coke/20 animate-ping" />
                        )}
                        <div className="w-24 h-24 rounded-full bg-brand-coke flex items-center justify-center text-white text-4xl font-bold shadow-lg relative z-10 overflow-hidden border-2 border-white/10">
                            {currentCall?.targetUser?.avatar ? (
                                <img src={getAvatarUrl(currentCall.targetUser.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                            ) : (
                                currentCall?.targetUser?.email?.charAt(0).toUpperCase()
                            )}
                        </div>
                    </div>
                    <div>
                        <h2 className="text-2xl font-bold text-white mb-2">{currentCall?.targetUser?.email}</h2>
                        <p className="text-sm font-bold uppercase tracking-[0.2em] text-white/40 animate-pulse">
                            {callState === 'ringing' ? 'Ringing...' : 'Voice Call'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Controls Bar */}
            <div className="h-32 flex items-center justify-center gap-6 px-8 glass border-t border-white/5">
                <button
                    onClick={toggleMute}
                    className={`w-14 h-14 rounded-full flex items-center justify-center transition-all ${isMuted ? 'bg-brand-coke text-white' : 'bg-white/5 text-white/60 hover:bg-white/10'}`}
                >
                    {isMuted ? <MicOff size={24} /> : <Mic size={24} />}
                </button>

                <button
                    onClick={endCall}
                    className="w-16 h-16 rounded-full bg-brand-coke flex items-center justify-center text-white shadow-xl hover:brightness-110 active:scale-95 transition-all"
                >
                    <PhoneOff size={28} />
                </button>
            </div>
        </div>
    );
};
