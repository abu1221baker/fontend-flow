import React from 'react';
import { useCallHistory } from '../context/CallHistoryContext';
import { useAuth } from '../context/AuthContext';
import { Phone, Video, ArrowUpRight, ArrowDownLeft, Clock, Calendar } from 'lucide-react';
import { format, isToday, isYesterday } from 'date-fns';
import { getAvatarUrl } from '../utils/avatar';

const CallHistoryPage = () => {
    const { user } = useAuth();
    const { callLogs, loading, error } = useCallHistory();

    const formatTimestamp = (timestamp) => {
        const date = new Date(timestamp);
        if (isToday(date)) return format(date, 'h:mm a');
        if (isYesterday(date)) return 'Yesterday';
        return format(date, 'MMM d, yyyy');
    };

    const formatDuration = (seconds) => {
        if (!seconds) return '00:00';
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    };

    const logsArray = Array.isArray(callLogs) ? callLogs : [];

    if (loading && logsArray.length === 0) {
        return (
            <div className="flex-1 flex items-center justify-center bg-background-dark/50 backdrop-blur-md">
                <div className="w-12 h-12 border-4 border-brand-coke border-t-transparent rounded-full animate-spin"></div>
            </div>
        );
    }

    return (
        <div className="flex-1 overflow-y-auto bg-background-dark/50 backdrop-blur-md p-6 space-y-6">
            <h1 className="text-3xl font-bold text-white mb-8 ml-2">Call History</h1>

            {logsArray.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-64 text-white/50 space-y-4">
                    <Phone className="w-16 h-16 opacity-20" />
                    <p className="text-xl">No call history yet</p>
                </div>
            ) : (
                <div className="grid gap-4">
                    {logsArray.map((log) => {
                        const isOutgoing = log.caller === user?.id;
                        const otherUser = isOutgoing ? log.receiver_details : log.caller_details;
                        const isMissed = log.status === 'missed';

                        return (
                            <div
                                key={log.id}
                                className="group relative flex items-center p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-brand-coke/10"
                            >
                                <div className="relative">
                                    <img
                                        src={getAvatarUrl(otherUser?.email)}
                                        alt={otherUser?.email}
                                        className="w-14 h-14 rounded-full border-2 border-white/20"
                                    />
                                    <div className={`absolute -bottom-1 -right-1 p-1.5 rounded-full ${isMissed ? 'bg-brand-coke' : 'bg-green-500'} shadow-lg`}>
                                        <Phone className="w-3 h-3 text-white" />
                                    </div>
                                </div>

                                <div className="ml-5 flex-1 min-w-0">
                                    <div className="flex items-center justify-between">
                                        <h3 className="text-lg font-semibold text-white truncate">
                                            {otherUser?.first_name ? `${otherUser.first_name} ${otherUser.last_name}` : otherUser?.email}
                                        </h3>
                                        <span className="text-sm text-white/40 flex items-center">
                                            <Calendar className="w-3 h-3 mr-1.5" />
                                            {formatTimestamp(log.started_at)}
                                        </span>
                                    </div>

                                    <div className="flex items-center mt-1 space-x-4">
                                        <div className="flex items-center">
                                            {isOutgoing ? (
                                                <ArrowUpRight className="w-4 h-4 text-blue-400 mr-1" />
                                            ) : (
                                                <ArrowDownLeft className={`w-4 h-4 ${isMissed ? 'text-brand-coke' : 'text-green-400'} mr-1`} />
                                            )}
                                            <span className={`text-sm ${isMissed ? 'text-brand-coke font-medium' : 'text-white/60'}`}>
                                                {log.status.charAt(0).toUpperCase() + log.status.slice(1)}
                                            </span>
                                        </div>

                                        {log.duration > 0 && (
                                            <div className="flex items-center text-sm text-white/40">
                                                <Clock className="w-3 h-3 mr-1.5" />
                                                {formatDuration(log.duration)}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
};

export default CallHistoryPage;
