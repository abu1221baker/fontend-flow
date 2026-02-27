import React, { createContext, useState, useContext, useEffect } from 'react';
import api from '../api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const checkAuth = async () => {
            const token = localStorage.getItem('access_token');
            if (token) {
                try {
                    const res = await api.get('/api/accounts/profile/');
                    setUser(res.data);
                } catch (error) {
                    console.error('Auth verification failed', error);
                    localStorage.clear();
                }
            }
            setLoading(false);
        };
        checkAuth();
    }, []);

    const login = async (credentials) => {
        const res = await api.post('/api/accounts/login/', credentials);
        localStorage.setItem('access_token', res.data.access);
        localStorage.setItem('refresh_token', res.data.refresh);

        // Fetch profile after login
        const profileRes = await api.get('/api/accounts/profile/');
        setUser(profileRes.data);
        return res.data;
    };

    const register = async (userData) => {
        const res = await api.post('/api/accounts/register/', userData);
        return res.data;
    };

    const logout = async () => {
        try {
            const refresh = localStorage.getItem('refresh_token');
            await api.post('/api/accounts/logout/', { refresh });
        } catch (error) {
            console.error('Logout error', error);
        } finally {
            localStorage.clear();
            setUser(null);
        }
    };

    const updateProfile = async (data) => {
        // Use standard axios behavior; if data is FormData, it will set content-type automatically
        const res = await api.patch('/api/accounts/profile/', data);
        setUser(res.data);
        return res.data;
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, updateProfile, loading }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);
