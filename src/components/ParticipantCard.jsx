import React from 'react';
import { MicOff, MoreVertical } from 'lucide-react';

export const ParticipantCard = ({ name, image, isSpeaking, isUser, isMuted }) => {
    return (
        <div className="relative aspect-video floating-card overflow-hidden group">
            {/* Background Image / Placeholder */}
            <img
                src={image}
                alt={name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
            />

            {/* Name Tag */}
            <div className={`absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold backdrop-blur-md border border-white/10 ${isSpeaking ? 'bg-brand-coke text-white shadow-lg' : 'bg-black/40 text-white/90'}`}>
                {isMuted && <MicOff size={12} className="text-white/60" />}
                <span>{name} {isUser && '(You)'}</span>
            </div>

            {/* Speaking Label (Top Right) */}
            {isSpeaking && (
                <div className="absolute top-3 right-3 px-2 py-0.5 bg-brand-coke rounded-md text-[8px] font-bold uppercase tracking-wider shadow-lg animate-pulse">
                    Speaking
                </div>
            )}

            {/* Hover Overlay */}
            <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-4">
                {/* Actions could go here */}
            </div>
        </div>
    );
};

export const EmptyCard = ({ name, initials }) => {
    return (
        <div className="relative aspect-video floating-card bg-background-active flex flex-col items-center justify-center group">
            <div className="w-20 h-20 rounded-full glass flex items-center justify-center text-xl font-bold text-white/40 shadow-inner">
                {initials}
            </div>

            <div className="absolute bottom-3 left-3 flex items-center gap-2 px-3 py-1.5 rounded-lg text-[10px] font-semibold bg-black/40 backdrop-blur-md border border-white/10 text-white/90">
                <MicOff size={12} className="text-white/60" />
                <span>{name}</span>
            </div>
        </div>
    )
}
