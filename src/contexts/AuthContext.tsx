import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { authService } from '@/services/authService';
import { UserProfile } from '@/types/career';

interface AuthContextType {
    user: { id: string; email: string; name: string } | null;
    userProfile: UserProfile | null;
    isAuthenticated: boolean;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    refreshProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
    const [user, setUser] = useState<{ id: string; email: string; name: string } | null>(null);
    const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Check if user is logged in on mount
        const currentUser = authService.getCurrentUser();
        if (currentUser && authService.isAuthenticated()) {
            setUser(currentUser);
            loadUserProfile();
        } else {
            setIsLoading(false);
        }
    }, []);

    const loadUserProfile = async () => {
        try {
            const profile = await authService.getUserProfile();
            setUserProfile(profile);
        } catch (error) {
            console.error('Failed to load user profile:', error);
            // If profile fetch fails, logout user
            logout();
        } finally {
            setIsLoading(false);
        }
    };

    const login = async (email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.login({ email, password });
            setUser(response.user);
            await loadUserProfile();
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const register = async (name: string, email: string, password: string) => {
        setIsLoading(true);
        try {
            const response = await authService.register({ name, email, password });
            setUser(response.user);
            await loadUserProfile();
        } catch (error) {
            setIsLoading(false);
            throw error;
        }
    };

    const logout = () => {
        authService.logout();
        setUser(null);
        setUserProfile(null);
        window.location.href = '/login';
    };

    const refreshProfile = async () => {
        if (!user) return;
        await loadUserProfile();
    };

    const value: AuthContextType = {
        user,
        userProfile,
        isAuthenticated: !!user && authService.isAuthenticated(),
        isLoading,
        login,
        register,
        logout,
        refreshProfile,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = (): AuthContextType => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within AuthProvider');
    }
    return context;
};
