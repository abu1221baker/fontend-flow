import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ChatProvider } from './context/ChatContext';
import { CallProvider } from './context/CallContext';
import { CallHistoryProvider } from './context/CallHistoryContext';
import { Layout } from './components/Layout';
import CallHistoryPage from './pages/CallHistoryPage';
import Login from './pages/Login';
import Register from './pages/Register';

const PrivateRoute = ({ children }) => {
    const { user, loading } = useAuth();
    if (loading) return (
        <div className="h-screen bg-background-dark flex items-center justify-center">
            <div className="w-12 h-12 border-4 border-brand-coke border-t-transparent rounded-full animate-spin"></div>
        </div>
    );
    return user ? children : <Navigate to="/login" />;
};

function AppContent() {
    const { user } = useAuth();

    return (
        <Routes>
            <Route path="/login" element={!user ? <Login /> : <Navigate to="/" />} />
            <Route path="/register" element={!user ? <Register /> : <Navigate to="/" />} />
            <Route
                path="/"
                element={
                    <PrivateRoute>
                        <Layout />
                    </PrivateRoute>
                }
            />
            <Route
                path="/calls"
                element={
                    <PrivateRoute>
                        <Layout>
                            <CallHistoryPage />
                        </Layout>
                    </PrivateRoute>
                }
            />
        </Routes>
    );
}

function App() {
    return (
        <Router>
            <AuthProvider>
                <ChatProvider>
                    <CallHistoryProvider>
                        <CallProvider>
                            <AppContent />
                        </CallProvider>
                    </CallHistoryProvider>
                </ChatProvider>
            </AuthProvider>
        </Router>
    );
}

export default App;
