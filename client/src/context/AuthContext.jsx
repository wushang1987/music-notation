import { createContext, useState, useEffect } from 'react';
import api from '../api';
import { jwtDecode } from 'jwt-decode';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode(token);
                // Check expiry if needed
                setUser({ token, ...decoded }); // Simplified, ideally fetch user profile
            } catch (error) {
                localStorage.removeItem('token');
            }
        }
        setLoading(false);
    }, []);

    const login = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('token', data.token);
        const decoded = jwtDecode(data.token);
        setUser({ token: data.token, ...decoded });
    };

    const register = async (username, email, password) => {
        await api.post('/auth/register', { username, email, password });
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, login, register, logout, loading }}>
            {children}
        </AuthContext.Provider>
    );
};
