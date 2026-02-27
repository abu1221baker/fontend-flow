import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const CallHistoryContext = createContext();

export const useCallHistory = () => useContext(CallHistoryContext);

export const CallHistoryProvider = ({ children }) => {
    const { user } = useAuth();
    const [callLogs, setCallLogs] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    const fetchCallHistory = async () => {
        if (!user) return;
        setLoading(true);
        try {
            const response = await api.get('/api/chat/call-logs/');
            // Handle both paginated and non-paginated responses
            const data = Array.isArray(response.data) ? response.data : (response.data.results || []);
            setCallLogs(data);
            setError(null);
        } catch (err) {
            console.error('Failed to fetch call history:', err);
            setError('Failed to load call history');
        } finally {
            setLoading(false);
        }
    };

    const missedCallsCount = Array.isArray(callLogs) 
        ? callLogs.filter(log => log.receiver === user?.id && log.status === 'missed').length
        : 0;

    useEffect(() => {
        if (user) {
            fetchCallHistory();
        }
    }, [user]);

    return (
        <CallHistoryContext.Provider value={{
            callLogs,
            loading,
            error,
            fetchCallHistory,
            missedCallsCount
        }}>
            {children}
        </CallHistoryContext.Provider>
    );
};
