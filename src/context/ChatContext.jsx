import React, { createContext, useState, useContext, useEffect, useCallback } from 'react';
import api from '../api';
import { useAuth } from './AuthContext';

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
    const { user } = useAuth();
    const [rooms, setRooms] = useState([]);
    const [currentRoom, setCurrentRoom] = useState(null);
    const [messages, setMessages] = useState([]);
    const [callLogs, setCallLogs] = useState([]);
    const [ws, setWs] = useState(null);

    // Fetch rooms
    const fetchRooms = useCallback(async () => {
        try {
            const res = await api.get('/api/chat/rooms/');
            // Handle paginated response
            const roomsData = Array.isArray(res.data) ? res.data : (res.data.results || []);
            setRooms(roomsData);
        } catch (error) {
            console.error('Failed to fetch rooms', error);
        }
    }, []);

    // Fetch messages for a room
    const fetchMessages = useCallback(async (roomId) => {
        try {
            // Fetch messages and call logs in parallel
            const [msgsRes, logsRes] = await Promise.all([
                api.get(`/api/chat/messages/?room_id=${roomId}`),
                api.get(`/api/chat/call-logs/?room_id=${roomId}`)
            ]);

            const messagesData = Array.isArray(msgsRes.data) ? msgsRes.data : (msgsRes.data.results || []);
            const logsData = Array.isArray(logsRes.data) ? logsRes.data : (logsRes.data.results || []);

            setMessages(messagesData);
            setCallLogs(logsData);
        } catch (error) {
            console.error('Failed to fetch messages or call logs', error);
        }
    }, []);

    // Search users
    const searchUsers = async (query) => {
        try {
            const res = await api.get(`/api/accounts/users/?search=${query}`);
            return Array.isArray(res.data) ? res.data : (res.data.results || []);
        } catch (error) {
            console.error('Failed to search users', error);
            return [];
        }
    };

    // Create or get existing room with another user
    const createOrGetRoom = async (otherUserId) => {
        try {
            const res = await api.post('/api/chat/rooms/', {
                participant_ids: [otherUserId]
            });
            const room = res.data;

            // Refresh rooms list if it's a new room (or just to keep it updated)
            await fetchRooms();

            // Select the new/existing room
            setCurrentRoom(room);
            fetchMessages(room.id);
            return room;
        } catch (error) {
            console.error('Failed to create/get room', error);
            return null;
        }
    };

    // WebSocket Connection
    useEffect(() => {
        let socket = null;
        let reconnectTimeout = null;

        const connect = () => {
            if (user && currentRoom) {
                console.log(`[ChatWS] Connecting to room ${currentRoom.id}`);
                const token = localStorage.getItem('access_token');
                const host = window.location.hostname;
                const wsUrl = `ws://${host}:8000/ws/chat/${currentRoom.id}/?token=${token}`;

                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log('[ChatWS] Connected');
                    setWs(socket);
                };

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    if (data && data.room) {
                        setMessages((prev) => {
                            if (prev.some(m => m.id === data.id)) return prev;
                            return [...prev, data];
                        });
                    }
                };

                socket.onclose = (e) => {
                    console.log(`[ChatWS] Disconnected (Code: ${e.code}). Reconnecting in 3s...`);
                    setWs(null);
                    // Only reconnect if we still have user and currentRoom
                    if (user && currentRoom) {
                        reconnectTimeout = setTimeout(connect, 3000);
                    }
                };

                socket.onerror = (err) => {
                    console.error('[ChatWS] Error', err);
                    socket.close();
                };
            }
        };

        connect();

        return () => {
            console.log('[ChatWS] Cleaning up');
            if (socket) {
                socket.onclose = null; // Prevent reconnect on intentional cleanup
                socket.close();
            }
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            setWs(null);
        };
    }, [user, currentRoom]);

    const sendMessage = (text) => {
        if (ws && ws.readyState === WebSocket.OPEN) {
            ws.send(JSON.stringify({
                content: text
            }));
        }
    };

    const uploadImage = async (file, roomId) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            formData.append('room_id', roomId);
            formData.append('file_type', 'image');

            const res = await api.post('/api/chat/attachments/', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return res.data;
        } catch (error) {
            console.error('Failed to upload image', error);
            throw error;
        }
    };

    const selectRoom = (room) => {
        setCurrentRoom(room);
        fetchMessages(room.id);
    };

    useEffect(() => {
        if (user) {
            fetchRooms();
        }
    }, [user, fetchRooms]);

    return (
        <ChatContext.Provider value={{
            rooms,
            currentRoom,
            messages,
            callLogs,
            sendMessage,
            uploadImage,
            selectRoom,
            fetchRooms,
            fetchMessages,
            searchUsers,
            createOrGetRoom
        }}>
            {children}
        </ChatContext.Provider>
    );
};

export const useChat = () => useContext(ChatContext);
