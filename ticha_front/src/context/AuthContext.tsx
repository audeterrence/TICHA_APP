import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: string; // BEPC, Probatoire, BAC, GCE O-Level, GCE A-Level
  streak: number;
  points: number;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, name?: string) => Promise<boolean>;
  signup: (email: string, name: string, level: string) => Promise<boolean>;
  logout: () => void;
  updateLevel: (level: string) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check if token exists in localStorage on startup
    const storedToken = localStorage.getItem('ticha_token');
    const storedUser = localStorage.getItem('ticha_user');

    if (storedToken && storedUser) {
      setToken(storedToken);
      setUser(JSON.parse(storedUser));
    }
    setLoading(false);
  }, []);

  const login = async (email: string, name = 'Student') => {
    setLoading(true);
    try {
      // 1. Attempt local API call
      const response = await api.post('/api/profiles', { email, name });
      const userProfile: UserProfile = {
        id: response.data.id || 'usr_1',
        email: response.data.email || email,
        name: response.data.name || name,
        level: response.data.level || 'BAC',
        streak: response.data.streak ?? 12,
        points: response.data.points ?? 1450,
      };

      setToken('mock_jwt_token_fastapi');
      setUser(userProfile);
      localStorage.setItem('ticha_token', 'mock_jwt_token_fastapi');
      localStorage.setItem('ticha_user', JSON.stringify(userProfile));
      setLoading(false);
      return true;
    } catch (error) {
      console.warn('[TICHA AUTH] Backend offline, logging in using mock account.', error);
      
      // Fallback: Create mock profile
      const fallbackUser: UserProfile = {
        id: 'usr_mock_123',
        email,
        name: email.split('@')[0],
        level: 'BAC',
        streak: 12,
        points: 1450,
      };

      await new Promise((resolve) => setTimeout(resolve, 500)); // natural delay
      setToken('mock_jwt_token_fallback');
      setUser(fallbackUser);
      localStorage.setItem('ticha_token', 'mock_jwt_token_fallback');
      localStorage.setItem('ticha_user', JSON.stringify(fallbackUser));
      setLoading(false);
      return true;
    }
  };

  const signup = async (email: string, name: string, level: string) => {
    setLoading(true);
    try {
      // 1. Attempt local API signup
      const response = await api.post('/api/profiles', { email, name, level });
      const userProfile: UserProfile = {
        id: response.data.id || 'usr_2',
        email: response.data.email || email,
        name: response.data.name || name,
        level: response.data.level || level,
        streak: 1,
        points: 100,
      };

      setToken('mock_jwt_token_fastapi');
      setUser(userProfile);
      localStorage.setItem('ticha_token', 'mock_jwt_token_fastapi');
      localStorage.setItem('ticha_user', JSON.stringify(userProfile));
      setLoading(false);
      return true;
    } catch (error) {
      console.warn('[TICHA AUTH] Backend offline, signing up locally using mock context.', error);

      const fallbackUser: UserProfile = {
        id: 'usr_mock_' + Math.random().toString(36).substr(2, 9),
        email,
        name,
        level,
        streak: 1,
        points: 100,
      };

      await new Promise((resolve) => setTimeout(resolve, 500));
      setToken('mock_jwt_token_fallback');
      setUser(fallbackUser);
      localStorage.setItem('ticha_token', 'mock_jwt_token_fallback');
      localStorage.setItem('ticha_user', JSON.stringify(fallbackUser));
      setLoading(false);
      return true;
    }
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('ticha_token');
    localStorage.removeItem('ticha_user');
  };

  const updateLevel = (newLevel: string) => {
    if (user) {
      const updated = { ...user, level: newLevel };
      setUser(updated);
      localStorage.setItem('ticha_user', JSON.stringify(updated));
      
      // Proactively sync with API (fire-and-forget)
      api.post('/api/profiles', { email: user.email, level: newLevel }).catch((err) => {
        console.warn('[TICHA API] Failed to sync educational level setting change to server:', err.message);
      });
    }
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, signup, logout, updateLevel }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
