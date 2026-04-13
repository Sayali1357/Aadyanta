import axios from 'axios';
import { UserProfile } from '@/types/career';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3001/api';

interface LoginCredentials {
    email: string;
    password: string;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
}

interface AuthResponse {
    token: string;
    user: {
        id: string;
        email: string;
        name: string;
    };
}

class AuthService {
    private tokenKey = 'auth_token';
    private userKey = 'auth_user';

    /**
     * Register a new user
     */
    async register(data: RegisterData): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/register`, data);

            // Store token and user data
            this.setToken(response.data.token);
            this.setUser(response.data.user);

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Registration failed');
        }
    }

    /**
     * Login user
     */
    async login(credentials: LoginCredentials): Promise<AuthResponse> {
        try {
            const response = await axios.post<AuthResponse>(`${API_URL}/auth/login`, credentials);

            // Store token and user data
            this.setToken(response.data.token);
            this.setUser(response.data.user);

            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Login failed');
        }
    }

    /**
     * Logout user
     */
    logout(): void {
        localStorage.removeItem(this.tokenKey);
        localStorage.removeItem(this.userKey);
    }

    /**
     * Get current user from localStorage
     */
    getCurrentUser(): { id: string; email: string; name: string } | null {
        const userStr = localStorage.getItem(this.userKey);
        if (!userStr) return null;

        try {
            return JSON.parse(userStr);
        } catch {
            return null;
        }
    }

    /**
     * Get auth token
     */
    getToken(): string | null {
        return localStorage.getItem(this.tokenKey);
    }

    /**
     * Check if user is authenticated
     */
    isAuthenticated(): boolean {
        const token = this.getToken();
        if (!token) return false;

        // Check if token is expired (basic check)
        try {
            const payload = JSON.parse(atob(token.split('.')[1]));
            return payload.exp * 1000 > Date.now();
        } catch {
            return false;
        }
    }

    /**
     * Get authorization header for API requests
     */
    getAuthHeader(): { Authorization: string } | {} {
        const token = this.getToken();
        return token ? { Authorization: `Bearer ${token}` } : {};
    }

    /**
     * Fetch user profile
     */
    async getUserProfile(): Promise<UserProfile> {
        try {
            const response = await axios.get<UserProfile>(`${API_URL}/user/profile`, {
                headers: this.getAuthHeader(),
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch user profile');
        }
    }

    /**
     * Update user profile
     */
    async updateUserProfile(updates: Partial<UserProfile>): Promise<UserProfile> {
        try {
            const response = await axios.put<UserProfile>(
                `${API_URL}/user/profile`,
                updates,
                { headers: this.getAuthHeader() }
            );
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update profile');
        }
    }

    /**
     * Save career assessment results
     */
    async saveCareerAssessment(assessmentData: any): Promise<void> {
        try {
            await axios.post(
                `${API_URL}/user/assessment`,
                assessmentData,
                { headers: this.getAuthHeader() }
            );
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to save assessment');
        }
    }

    /**
     * Get or create roadmap for user's selected career
     */
    async getRoadmap(careerId: string): Promise<any> {
        try {
            const response = await axios.get(`${API_URL}/roadmap/${careerId}`, {
                headers: this.getAuthHeader(),
            });
            return response.data;
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to fetch roadmap');
        }
    }

    /**
     * Update user progress on a topic
     */
    async updateProgress(topicId: string, completed: boolean): Promise<void> {
        try {
            await axios.post(
                `${API_URL}/user/progress`,
                { topicId, completed },
                { headers: this.getAuthHeader() }
            );
        } catch (error: any) {
            throw new Error(error.response?.data?.message || 'Failed to update progress');
        }
    }

    // Private helper methods
    private setToken(token: string): void {
        localStorage.setItem(this.tokenKey, token);
    }

    private setUser(user: { id: string; email: string; name: string }): void {
        localStorage.setItem(this.userKey, JSON.stringify(user));
    }
}

export const authService = new AuthService();
