import React, { createContext, useContext, useState, useEffect, useRef } from 'react';
import { useAuth } from './AuthContext';
import { useChat } from './ChatContext';
import { useCallHistory } from './CallHistoryContext';

const CallContext = createContext();

export const useCall = () => useContext(CallContext);

export const CallProvider = ({ children }) => {
    const { user } = useAuth();
    const { currentRoom, fetchMessages } = useChat();
    const { fetchCallHistory } = useCallHistory();
    const [callState, setCallState] = useState('idle'); // idle, ringing, incoming, connected
    const [callLogId, setCallLogId] = useState(null);
    const callStateRef = useRef('idle');

    // Update ref whenever state changes
    useEffect(() => {
        callStateRef.current = callState;
    }, [callState]);

    const [incomingCall, setIncomingCall] = useState(null);
    const [currentCall, setCurrentCall] = useState(null);
    const [localStream, setLocalStream] = useState(null);
    const localStreamRef = useRef(null);

    // Sync ref with state
    useEffect(() => {
        localStreamRef.current = localStream;
    }, [localStream]);

    const [remoteStream, setRemoteStream] = useState(null);
    const [isMuted, setIsMuted] = useState(false);
    const [callType, setCallType] = useState(null); // 'voice'

    const ws = useRef(null);
    const pc = useRef(null);

    const iceServers = {
        iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    };

    // Stabilize active room ID to prevent socket switches during calls
    const activeRoomId = (currentCall?.roomId || incomingCall?.roomId || currentRoom?.id);

    // WebSocket Signalling
    useEffect(() => {
        let socket = null;
        let reconnectTimeout = null;

        const connect = () => {
            if (user) {
                console.log(`[Signaling] Connecting to global signaling channel`);
                const token = localStorage.getItem('access_token');
                const host = window.location.hostname;
                const wsUrl = `ws://${host}:8000/ws/call/global/?token=${token}`;

                socket = new WebSocket(wsUrl);

                socket.onopen = () => {
                    console.log('[Signaling] Global channel connected');
                    ws.current = socket;
                };

                socket.onmessage = (event) => {
                    const data = JSON.parse(event.data);
                    console.log(`[Signaling] Received: ${data.type}`);
                    handleSignalingData(data);
                };

                socket.onclose = (event) => {
                    console.log(`[Signaling] Global channel closed (Code: ${event.code}). Reconnecting in 3s...`);
                    ws.current = null;

                    if (callStateRef.current !== 'idle' && !event.wasClean) {
                        cleanupCall();
                    }

                    if (user) {
                        reconnectTimeout = setTimeout(connect, 3000);
                    }
                };

                socket.onerror = (err) => {
                    console.error('[Signaling] WebSocket error', err);
                    socket.close();
                };
            }
        };

        connect();

        return () => {
            console.log(`[Signaling] Cleaning up global channel`);
            if (socket) {
                socket.onclose = null; // Prevent reconnect on cleanup
                socket.close();
            }
            if (reconnectTimeout) clearTimeout(reconnectTimeout);
            ws.current = null;
        };
    }, [user]);

    const handleSignalingData = async (data) => {
        console.log(`[Signaling] Handling ${data.type} from ${data.from}`);
        switch (data.type) {
            case 'call_offer':
                if (callStateRef.current === 'idle') {
                    console.log('[Signaling] New incoming call offer received');
                    setIncomingCall(data);
                    setCallState('incoming');
                    setCallType(data.callType);
                    setCallLogId(data.callLogId); // Store the ID from caller
                } else {
                    console.warn(`[Signaling] Ignored call_offer: current state is ${callStateRef.current}`);
                }
                break;
            case 'call_answer':
                if (pc.current) {
                    console.log('[Signaling] Received call answer, setting remote description');
                    try {
                        await pc.current.setRemoteDescription(new RTCSessionDescription(data.sdp));
                        setCallState('connected');
                        setCallLogId(data.callLogId); // Sync ID
                        console.log('[Signaling] Call connected successfully (Offerer side)');
                    } catch (e) {
                        console.error('[Signaling] Failed to set remote description on answer', e);
                        cleanupCall();
                    }
                } else {
                    console.warn('[Signaling] Received call_answer but pc.current is null');
                }
                break;
            case 'ice_candidate':
                if (pc.current && data.candidate) {
                    try {
                        console.log('[Signaling] Adding ICE candidate');
                        await pc.current.addIceCandidate(new RTCIceCandidate(data.candidate));
                    } catch (e) {
                        console.error('[Signaling] Error adding ice candidate', e);
                    }
                } else {
                    console.log('[Signaling] ICE candidate received but pc.current not ready or candidate null');
                }
                break;
            case 'call_log_created':
                console.log(`[Signaling] Call log created: ${data.callLogId}`);
                setCallLogId(data.callLogId);
                break;
            case 'call_reject':
            case 'call_end':
            case 'call_timeout':
                console.log(`[Signaling] Call stopped by peer (${data.type})`);
                cleanupCall();
                break;
            default:
                console.log(`[Signaling] Unknown message type: ${data.type}`);
                break;
        }
    };

    const startCall = async (targetUser, type, roomId) => {
        console.log(`[StartCall] Attempting to call ${targetUser.email} (user ID: ${targetUser.id})`);

        // Cleanup any existing call just in case
        if (pc.current || localStreamRef.current) {
            console.log('[StartCall] Cleaning up existing session before starting new call');
            cleanupCall();
        }

        const peerId = targetUser.id; // Capture stable peerId
        setCallType(type);
        setCurrentCall({ targetUser, roomId });
        setCallState('ringing');

        try {
            console.log('[StartCall] Requesting user media (Audio Only)...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
            console.log('[StartCall] Media stream acquired');
            setLocalStream(stream);

            const peerConnection = new RTCPeerConnection(iceServers);
            pc.current = peerConnection;

            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignaling({
                        type: 'ice_candidate',
                        candidate: event.candidate,
                        from: user.id,
                        targetId: peerId, // Use stable ID
                        callLogId: callLogId
                    });
                }
            };

            peerConnection.ontrack = (event) => {
                console.log('[WebRTC] Remote track received (Caller side)', event.track.kind);
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                } else {
                    // Fallback for some browsers/situations
                    setRemoteStream(prev => {
                        const newStream = prev || new MediaStream();
                        newStream.addTrack(event.track);
                        return newStream;
                    });
                }
            };

            console.log('[StartCall] Creating offer');
            const offer = await peerConnection.createOffer();
            await peerConnection.setLocalDescription(offer);

            const sendOffer = () => {
                if (ws.current && ws.current.readyState === WebSocket.OPEN) {
                    console.log('[StartCall] Sending call_offer via WebSocket');
                    sendSignaling({
                        type: 'call_offer',
                        sdp: offer,
                        from: user.id,
                        targetId: peerId,
                        callType: type,
                        roomId: roomId,
                        callerName: `${user.first_name || ''} ${user.last_name || ''}`.trim() || user.email,
                        callerAvatar: user.avatar,
                        callLogId: callLogId
                    });
                } else {
                    console.warn('[StartCall] WS not ready, retrying sendOffer...');
                    setTimeout(sendOffer, 200);
                }
            };
            sendOffer();

        } catch (err) {
            console.error('[StartCall] Error starting call:', err);
            cleanupCall();
        }
    };

    const acceptCall = async () => {
        if (!incomingCall) return;
        console.log(`[Accept] Attempting to accept call from ${incomingCall.from}`);

        const peerId = incomingCall.from; // Capture stable peerId
        const type = incomingCall.callType;
        const offerSdp = incomingCall.sdp;
        const roomId = incomingCall.roomId;

        setCurrentCall({
            targetUser: {
                id: peerId,
                email: incomingCall.callerName,
                avatar: incomingCall.callerAvatar
            },
            roomId: roomId
        });

        try {
            console.log('[Accept] Requesting user media (Audio Only)...');
            const stream = await navigator.mediaDevices.getUserMedia({
                video: false,
                audio: true
            });
            console.log('[Accept] Media stream acquired');
            setLocalStream(stream);
            setCallState('connected');

            const peerConnection = new RTCPeerConnection(iceServers);
            pc.current = peerConnection;

            stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

            peerConnection.onicecandidate = (event) => {
                if (event.candidate) {
                    sendSignaling({
                        type: 'ice_candidate',
                        candidate: event.candidate,
                        from: user.id,
                        targetId: peerId, // Use stable ID
                        callLogId: callLogId
                    });
                }
            };

            peerConnection.ontrack = (event) => {
                console.log('[WebRTC] Remote track received (Receiver side)', event.track.kind);
                if (event.streams && event.streams[0]) {
                    setRemoteStream(event.streams[0]);
                } else {
                    setRemoteStream(prev => {
                        const newStream = prev || new MediaStream();
                        newStream.addTrack(event.track);
                        return newStream;
                    });
                }
            };

            console.log('[Accept] Setting remote description (Offer)');
            await peerConnection.setRemoteDescription(new RTCSessionDescription(offerSdp));

            console.log('[Accept] Creating answer');
            const answer = await peerConnection.createAnswer();
            await peerConnection.setLocalDescription(answer);

            console.log('[Accept] Sending call_answer');
            sendSignaling({
                type: 'call_answer',
                sdp: answer,
                from: user.id,
                targetId: peerId,
                callLogId: incomingCall.callLogId
            });

            setIncomingCall(null);
            console.log('[Accept] Call setup complete');
        } catch (err) {
            console.error('[Accept] Failed to accept call:', err);
            rejectCall();
        }
    };

    const rejectCall = () => {
        if (incomingCall) {
            console.log(`[Reject] Rejecting call from ${incomingCall.from}`);
            sendSignaling({
                type: 'call_reject',
                from: user.id,
                targetId: incomingCall.from,
                callLogId: incomingCall.callLogId
            });
        }
        cleanupCall();
    };

    const endCall = () => {
        const targetId = currentCall?.targetUser?.id || incomingCall?.from;
        console.log(`[EndCall] Ending call with ${targetId}`);
        if (targetId) {
            sendSignaling({
                type: 'call_end',
                from: user.id,
                targetId: targetId,
                callLogId: callLogId
            });
        }
        cleanupCall();
    };

    const sendSignaling = (data) => {
        if (ws.current && ws.current.readyState === WebSocket.OPEN) {
            ws.current.send(JSON.stringify(data));
        }
    };

    const cleanupCall = () => {
        console.log('[Cleanup] Starting call cleanup');
        if (localStreamRef.current) {
            console.log('[Cleanup] Stopping local tracks');
            localStreamRef.current.getTracks().forEach(track => {
                track.stop();
                console.log(`[Cleanup] Stopped ${track.kind} track`);
            });
        }
        if (pc.current) {
            console.log('[Cleanup] Closing PeerConnection');
            pc.current.close();
            pc.current = null;
        }
        setCallState('idle');
        setIncomingCall(null);
        setCurrentCall(null);
        setLocalStream(null);
        setRemoteStream(null);
        setCallType(null);
        setCallLogId(null);
        fetchCallHistory(); // Refresh history whenever any call ends

        // Refresh chat messages if we are in a room
        if (activeRoomId) {
            fetchMessages(activeRoomId);
        }
    };

    const toggleMute = () => {
        if (localStream) {
            localStream.getAudioTracks()[0].enabled = isMuted;
            setIsMuted(!isMuted);
        }
    };

    return (
        <CallContext.Provider value={{
            callState,
            incomingCall,
            currentCall,
            localStream,
            remoteStream,
            startCall,
            acceptCall,
            rejectCall,
            endCall,
            isMuted,
            toggleMute,
            callType
        }}>
            {children}
        </CallContext.Provider>
    );
};
