import React, { useState, useRef, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { useChat } from '../context/ChatContext';
import { Video, Mic, Share2, Grid, PhoneOff, MessageSquare, Users, Plus, Monitor, LogOut, Search, ArrowLeft, Loader2, Check, CheckCheck, ShieldCheck, Phone, History } from 'lucide-react';
import { useNavigate, useLocation } from 'react-router-dom';
import { API_BASE_URL } from '../api';
import { getAvatarUrl } from '../utils/avatar';
import { useCall } from '../context/CallContext';
import { useCallHistory } from '../context/CallHistoryContext';
import { CallModal } from './CallModal';
import { CallScreen } from './CallScreen';
import { ProfileView } from './ProfileView';

export const Layout = ({ children }) => {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const location = useLocation();
    const isHistoryPage = location.pathname === '/calls';
    const { currentRoom, messages, callLogs, sendMessage, uploadImage, searchUsers, createOrGetRoom, rooms, selectRoom } = useChat();
    const { missedCallsCount } = useCallHistory();
    const { startCall } = useCall();
    const [inputText, setInputText] = useState('');
    const [isSearching, setIsSearching] = useState(false);
    const [isProfileOpen, setIsProfileOpen] = useState(false);
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [searchLoading, setSearchLoading] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const messagesEndRef = useRef(null);
    const fileInputRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        if (currentRoom) {
            scrollToBottom();
        }
    }, [messages, callLogs, currentRoom]);

    const handleSend = (e) => {
        e.preventDefault();
        if (inputText.trim()) {
            sendMessage(inputText);
            setInputText('');
        }
    };

    const handleSearch = async (e) => {
        const query = e.target.value;
        setSearchQuery(query);
        if (query.length > 1) {
            setSearchLoading(true);
            const results = await searchUsers(query);
            setSearchResults(results);
            setSearchLoading(false);
        } else {
            setSearchResults([]);
        }
    };

    const handleStartChat = async (otherUser) => {
        const room = await createOrGetRoom(otherUser.id);
        if (room) {
            setIsSearching(false);
            setSearchQuery('');
            setSearchResults([]);
        }
    };

    const handleImageUpload = async (e) => {
        const file = e.target.files[0];
        if (file && currentRoom) {
            setIsUploading(true);
            try {
                await uploadImage(file, currentRoom.id);
            } catch (error) {
                alert('Failed to upload image. Please try again.');
            } finally {
                setIsUploading(false);
                if (fileInputRef.current) fileInputRef.current.value = '';
            }
        }
    };

    return (
        <div className="flex h-screen bg-background-dark text-white overflow-hidden">
            {/* Left Sidebar - Chat List & Search */}
            <aside className="w-80 md:w-96 glass-dark border-r border-white/5 flex flex-col z-20">
                {/* Sidebar Header */}
                <div className="p-4 h-16 flex items-center justify-between border-b border-white/5 bg-background-dark/40">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl border border-white/10 overflow-hidden shadow-floating bg-background-card">
                            {user?.avatar ? (
                                <img src={getAvatarUrl(user.avatar)} alt="Me" className="w-full h-full object-cover" />
                            ) : (
                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${user?.id}`} alt="Me" />
                            )}
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-xs font-bold text-white/90 truncate capitalize">{user?.first_name} {user?.last_name}</h3>
                            <p className="text-[9px] text-brand-coke truncate font-black uppercase tracking-widest">flow</p>
                        </div>
                    </div>
                    <div className="flex items-center gap-1">
                        <button
                            onClick={() => {
                                setIsSearching(!isSearching);
                                if (isHistoryPage) navigate('/');
                            }}
                            className={`p-2 rounded-xl transition-all ${isSearching && !isHistoryPage ? 'bg-brand-coke text-white shadow-glow' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                            title="Find People"
                        >
                            <Users size={20} />
                        </button>
                        <button
                            onClick={() => navigate('/calls')}
                            className={`p-2 rounded-xl transition-all relative ${isHistoryPage ? 'bg-brand-coke text-white shadow-glow' : 'text-white/40 hover:bg-white/5 hover:text-white'}`}
                            title="Call History"
                        >
                            <History size={20} />
                            {missedCallsCount > 0 && (
                                <span className="absolute -top-1 -right-1 bg-brand-coke text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-background-dark shadow-glow animate-bounce">
                                    {missedCallsCount}
                                </span>
                            )}
                        </button>
                        <button
                            onClick={() => setIsProfileOpen(true)}
                            className="p-2 text-white/30 hover:text-brand-coke transition-colors rounded-xl hover:bg-white/5"
                            title="Open Profile"
                        >
                            <Monitor size={20} />
                        </button>
                        <button onClick={logout} className="p-2 text-white/30 hover:text-brand-coke transition-colors rounded-xl hover:bg-white/5" title="Logout">
                            <LogOut size={20} />
                        </button>
                    </div>
                </div>

                {/* Sidebar Search Area */}
                <div className="p-4">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-white/20 group-focus-within:text-brand-coke transition-colors" size={16} />
                        <input
                            type="text"
                            placeholder={isSearching ? "Search people..." : "Search chats..."}
                            className="w-full bg-background-dark/50 border border-white/5 rounded-xl py-3 pl-10 pr-4 text-xs focus:outline-none focus:border-brand-coke/40 focus:ring-1 focus:ring-brand-coke/20 transition-all font-medium placeholder:text-white/20"
                            value={searchQuery}
                            onChange={handleSearch}
                            onFocus={() => setIsSearching(true)}
                        />
                    </div>
                </div>

                {/* Sidebar Scroll Area */}
                <div className="flex-1 overflow-y-auto custom-scrollbar px-2 space-y-1">
                    {isSearching ? (
                        <div className="space-y-1">
                            {searchLoading ? (
                                <div className="flex flex-col items-center justify-center p-8 text-white/10">
                                    <Loader2 className="animate-spin mb-2" size={24} />
                                    <span className="text-[10px] uppercase font-bold tracking-tighter">Searching...</span>
                                </div>
                            ) : searchResults.length > 0 ? (
                                searchResults.map((u) => (
                                    <div
                                        key={u.id}
                                        onClick={() => createOrGetRoom(u.id)}
                                        className="group flex items-center gap-4 p-4 rounded-2xl cursor-pointer hover:bg-white/5 border border-transparent hover:border-white/5 transition-all animate-in fade-in slide-in-from-right-2 duration-300"
                                    >
                                        <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden shadow-sm bg-background-card flex-shrink-0">
                                            {u.avatar ? (
                                                <img src={getAvatarUrl(u.avatar)} alt={u.email} className="w-full h-full object-cover" />
                                            ) : (
                                                <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${u.id}`} alt={u.email} />
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <h4 className="text-sm font-bold text-white/90 truncate">{u.first_name} {u.last_name}</h4>
                                            <p className="text-[10px] text-white/40 truncate font-medium">{u.email}</p>
                                        </div>
                                        <Plus className="text-white/10 group-hover:text-brand-coke transition-colors" size={18} />
                                    </div>
                                ))
                            ) : (
                                <div className="text-center p-8 text-white/10">
                                    <Users size={32} className="mx-auto mb-2 opacity-50" />
                                    <p className="text-[10px] font-bold uppercase tracking-widest">{searchQuery.length > 1 ? "No results found" : "Find friends"}</p>
                                </div>
                            )}
                        </div>
                    ) : (
                        rooms.map((room) => {
                            const otherUser = room.participants?.find(p => p.id !== user?.id);
                            const displayName = room.name || (otherUser ? `${otherUser.first_name} ${otherUser.last_name}` : 'Chat');
                            const avatarPath = otherUser?.avatar
                                ? getAvatarUrl(otherUser.avatar)
                                : `https://api.dicebear.com/7.x/identicon/svg?seed=${room.id}`;

                            return (
                                <div
                                    key={room.id}
                                    onClick={() => selectRoom(room)}
                                    className={`group flex items-center gap-4 p-4 rounded-2xl cursor-pointer transition-all border border-transparent animate-in slide-in-from-left-2 duration-500
                                    ${currentRoom?.id === room.id
                                            ? 'bg-brand-coke/10 border-brand-coke/20 shadow-glow relative'
                                            : 'hover:bg-white/5 hover:border-white/5'}`}
                                >
                                    {currentRoom?.id === room.id && (
                                        <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-brand-coke rounded-r-full shadow-glow" />
                                    )}
                                    <div className="w-12 h-12 rounded-2xl border border-white/10 overflow-hidden shadow-sm bg-background-card flex-shrink-0">
                                        <img src={avatarPath} alt="Room" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex justify-between items-baseline mb-0.5">
                                            <h4 className={`text-sm font-bold truncate ${currentRoom?.id === room.id ? 'text-white' : 'text-white/80'}`}>
                                                {displayName}
                                            </h4>
                                            <span className="text-[9px] font-bold text-white/20">
                                                {room.last_message ? new Date(room.last_message.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false }) : ''}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-white/40 truncate font-medium group-hover:text-white/60 transition-colors">
                                            {room.last_message?.content || 'No messages yet...'}
                                        </p>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </aside>

            {/* Main Content Area - Message View or Call History */}
            <main className="flex-1 flex flex-col overflow-hidden relative bg-background-dark">
                {children ? (
                    children
                ) : currentRoom ? (
                    <>
                        {/* Chat Header */}
                        <header className="h-16 flex items-center justify-between px-6 bg-background-dark/40 backdrop-blur-md z-10 border-b border-white/5">
                            <div className="flex items-center gap-4">
                                <div className="w-10 h-10 rounded-2xl border border-white/10 overflow-hidden shadow-floating bg-background-card">
                                    {(() => {
                                        const otherUser = currentRoom.participants?.find(p => p.id !== user?.id);
                                        return otherUser?.avatar ? (
                                            <img src={getAvatarUrl(otherUser.avatar)} alt="Avatar" className="w-full h-full object-cover" />
                                        ) : (
                                            <img src={`https://api.dicebear.com/7.x/identicon/svg?seed=${currentRoom.id}`} alt="Room" />
                                        );
                                    })()}
                                </div>
                                <div>
                                    <h1 className="text-sm font-bold text-white/90">
                                        {currentRoom.name || currentRoom.participants?.filter(p => p.id !== user?.id).map(p => p.first_name || p.email.split('@')[0]).join(', ') || 'Chat'}
                                    </h1>
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-accent-green animate-pulse shadow-glow" />
                                        <p className="text-[10px] font-bold text-white/40 uppercase tracking-widest">{currentRoom.participants?.length || 0} online</p>
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => {
                                        const otherUser = currentRoom.participants?.find(p => p.id !== user?.id);
                                        if (otherUser) startCall(otherUser, 'voice', currentRoom.id);
                                    }}
                                    className="p-2.5 text-white/30 hover:text-brand-coke transition-all rounded-xl hover:bg-white/5 active:scale-90"
                                >
                                    <Phone size={20} />
                                </button>
                                <button className="p-2.5 text-white/30 hover:text-white transition-all rounded-xl hover:bg-white/5 active:scale-90">
                                    <Grid size={20} />
                                </button>
                            </div>
                        </header>

                        {/* Messages Area */}

                        <div className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar relative z-0">
                            {(() => {
                                // Merge and sort messages and call logs
                                const combined = [
                                    ...messages.map(m => ({ ...m, type: 'message', sortTime: new Date(m.timestamp).getTime() })),
                                    ...callLogs.map(l => ({ ...l, type: 'call', sortTime: new Date(l.started_at).getTime() }))
                                ].sort((a, b) => a.sortTime - b.sortTime);

                                if (combined.length === 0) {
                                    return (
                                        <div className="h-full flex flex-col items-center justify-center opacity-20 select-none">
                                            <div className="w-20 h-20 bg-white/5 border border-white/10 rounded-full flex items-center justify-center mb-6 shadow-inner">
                                                <ShieldCheck size={32} className="text-white/20" />
                                            </div>
                                            <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/20">End-to-End Encrypted</p>
                                        </div>
                                    );
                                }

                                return combined.map((item, idx) => {
                                    if (item.type === 'message') {
                                        const isMe = item.sender === user?.id;
                                        return (
                                            <div key={`msg-${item.id || idx}`} className={`flex ${isMe ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-4 duration-500`}>
                                                <div className={`flex flex-col gap-1.5 max-w-[75%] ${isMe ? 'items-end' : 'items-start'}`}>
                                                    {!isMe && (
                                                        <span className="text-[10px] font-bold uppercase tracking-widest text-white/30 ml-3 mb-0.5">
                                                            {item.sender_email?.split('@')[0]}
                                                        </span>
                                                    )}
                                                    <div className={`px-5 py-3 rounded-2xl shadow-floating text-[13px] leading-relaxed font-medium relative
                                                        ${isMe
                                                            ? 'bg-brand-coke text-white rounded-tr-none pb-5'
                                                            : 'bg-background-card/80 glass-light text-white/90 rounded-tl-none border border-white/5 pb-5'}`}
                                                    >
                                                        {item.attachments && item.attachments.length > 0 && (
                                                            <div className="mb-3 rounded-xl overflow-hidden shadow-lg border border-white/5 bg-black/20">
                                                                {item.attachments.map(att => att.file && (
                                                                    <img
                                                                        key={att.id}
                                                                        src={att.file.startsWith('http') ? att.file : `${API_BASE_URL.replace(/\/$/, '')}${att.file.startsWith('/') ? '' : '/'}${att.file.replace(/^\//, '')}`}
                                                                        alt="Shared Image"
                                                                        className="max-w-full max-h-[300px] object-contain hover:scale-105 transition-transform duration-500 cursor-pointer"
                                                                        onClick={() => window.open(att.file.startsWith('http') ? att.file : `${API_BASE_URL.replace(/\/$/, '')}${att.file.startsWith('/') ? '' : '/'}${att.file.replace(/^\//, '')}`, '_blank')}
                                                                    />
                                                                ))}
                                                            </div>
                                                        )}
                                                        {item.content && <p>{item.content}</p>}
                                                        <div className={`absolute bottom-1.5 right-3 flex items-center gap-1.5 whitespace-nowrap`}>
                                                            <span className="text-[8px] font-bold text-white/40 uppercase tracking-tighter">
                                                                {new Date(item.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            </span>
                                                            {isMe && (
                                                                <div className="flex items-center">
                                                                    {item.is_read ? (
                                                                        <CheckCheck size={11} className="text-white" />
                                                                    ) : (
                                                                        <Check size={11} className="text-white/40" />
                                                                    )}
                                                                </div>
                                                            )}
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    } else {
                                        // Render Call Log bubble
                                        const isOutgoing = item.caller === user?.id;
                                        const isMissed = item.status === 'missed';
                                        return (
                                            <div key={`call-${item.id || idx}`} className="flex justify-center animate-in zoom-in duration-700">
                                                <div className="bg-white/5 border border-white/5 rounded-2xl px-6 py-3 flex items-center gap-4 shadow-floating backdrop-blur-sm">
                                                    <div className={`p-2 rounded-xl ${isMissed ? 'bg-brand-coke/20 text-brand-coke' : 'bg-white/5 text-white/40'}`}>
                                                        {item.call_type === 'video' ? <Video size={16} /> : <Phone size={16} />}
                                                    </div>
                                                    <div className="flex flex-col">
                                                        <span className={`text-[11px] font-bold ${isMissed ? 'text-brand-coke' : 'text-white/60'}`}>
                                                            {item.call_type.charAt(0).toUpperCase() + item.call_type.slice(1)} Call
                                                            {isMissed && ' (Missed)'}
                                                        </span>
                                                        <span className="text-[9px] font-medium text-white/30 uppercase tracking-widest">
                                                            {isOutgoing ? 'Outgoing' : 'Incoming'} • {new Date(item.started_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                                            {item.duration > 0 && ` • ${Math.floor(item.duration / 60)}:${(item.duration % 60).toString().padStart(2, '0')}`}
                                                        </span>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    }
                                });
                            })()}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-6 bg-background-dark/40 backdrop-blur-md border-t border-white/5">
                            <form onSubmit={handleSend} className="relative group max-w-4xl mx-auto">
                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    onChange={handleImageUpload}
                                    accept="image/*"
                                    className="hidden"
                                />
                                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-3">
                                    <button
                                        type="button"
                                        onClick={() => fileInputRef.current?.click()}
                                        disabled={isUploading}
                                        className="text-white/20 hover:text-brand-coke transition-colors disabled:opacity-50"
                                    >
                                        {isUploading ? <Loader2 size={18} className="animate-spin" /> : <Plus size={18} />}
                                    </button>
                                </div>
                                <input
                                    type="text"
                                    placeholder="Write a secure message..."
                                    className="w-full bg-background-dark/80 border border-white/10 rounded-2xl py-4 pl-12 pr-14 text-[13px] focus:outline-none focus:border-brand-coke/50 focus:ring-1 focus:ring-brand-coke/20 transition-all shadow-inner font-medium placeholder:text-white/20"
                                    value={inputText}
                                    onChange={(e) => setInputText(e.target.value)}
                                />
                                <button
                                    type="submit"
                                    disabled={!inputText.trim()}
                                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-brand-coke p-2.5 rounded-xl text-white shadow-glow hover:scale-105 active:scale-95 transition-all disabled:opacity-0 disabled:scale-90"
                                >
                                    <Share2 size={18} className="rotate-90 translate-x-0.5" />
                                </button>
                            </form>
                        </div>
                    </>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center p-12 text-center animate-in fade-in duration-1000">
                        <div className="w-32 h-32 bg-brand-coke/10 rounded-full flex items-center justify-center mb-8 relative">
                            <div className="absolute inset-0 bg-brand-coke/20 rounded-full animate-ping" />
                            <Video className="text-brand-coke relative z-10" size={48} />
                        </div>
                        <h2 className="text-4xl font-black tracking-tighter mb-4 text-brand-coke italic">flow</h2>
                        <h3 className="text-xl font-bold tracking-tight mb-4">Seamless Connections</h3>
                        <p className="text-[13px] text-white/40 max-w-sm font-medium leading-relaxed">
                            Experience the next level of private messaging. Select a conversation from the sidebar or start a new flow with your friends.
                        </p>
                        <div className="mt-12 flex items-center gap-4 text-[10px] font-black uppercase tracking-widest text-white/10">
                            <div className="flex items-center gap-1.5"><Monitor size={14} /> Desktop Flow</div>
                            <div className="w-1 h-1 rounded-full bg-white/10" />
                            <div className="flex items-center gap-1.5"><Users size={14} /> Group Flow</div>
                        </div>
                    </div>
                )}
            </main>

            {/* Calling UI */}
            <CallModal />
            <CallScreen />

            {/* Profile UI */}
            <ProfileView isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} />
        </div>
    );
};
