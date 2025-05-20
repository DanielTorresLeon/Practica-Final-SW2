import React, { createContext, useContext, useState, useEffect } from 'react';
import { jwtDecode } from 'jwt-decode';

interface User {
    id: string;
    email: string;
    is_freelancer: boolean;
}

interface AuthContextType {
    user: User | null;
    login: (token: string) => void;
    logout: () => void;
    isLoading: boolean;
    isFreeLancer: () => boolean;
    getToken: () => Promise<string | null>;
}

const AuthContext = createContext<AuthContextType>({
    user: null,
    login: () => {},
    logout: () => {},
    isLoading: true,
    isFreeLancer: () => false,
    getToken: async () => null,
});

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    
    const login = (token: string) => {
        localStorage.setItem('token', token);
        const decoded = jwtDecode<{ sub: string; email: string; is_freelancer: boolean }>(token);
        setUser({
            id: decoded.sub, 
            email: decoded.email,
            is_freelancer: decoded.is_freelancer
        });
        return decoded;
    };

    const logout = () => {
        localStorage.removeItem('token');
        setUser(null);
    };

    const isFreeLancer = () => {
        return user?.is_freelancer ?? false; 
    };

    const getToken = async () => {
        return localStorage.getItem('token');
    };

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            try {
                const decoded = jwtDecode<{ sub: string; email: string; is_freelancer: boolean }>(token);
                setUser({
                    id: decoded.sub,
                    email: decoded.email,
                    is_freelancer: decoded.is_freelancer
                });
            } catch (err) {
                console.error('Invalid token:', err);
                localStorage.removeItem('token');
            }
        }
        setIsLoading(false); 
    }, []);

    return (
        <AuthContext.Provider value={{ user, login, logout, isFreeLancer, getToken }}>
            {children}
        </AuthContext.Provider>
    );
};

export const useAuth = () => useContext(AuthContext);