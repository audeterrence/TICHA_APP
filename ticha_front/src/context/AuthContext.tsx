import React, { createContext, useContext, useState, useEffect } from 'react';
import api from '../services/api';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: string; // BEPC, Probatoire, BAC, GCE O-Level, GCE A-Level, Casual Learner
  mode: 'exam' | 'casual';
  access: 'full' | 'limited' | 'preview';
  streak: number;
  points: number;
  casualInterest?: string;
}

interface AuthContextType {
  user: UserProfile | null;
  token: string | null;
  loading: boolean;
  login: (email: string, password?: string, name?: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, level: string, casualInterest?: string) => Promise<boolean>;
  logout: () => void;
  updateLevel: (level: string) => void;
  updateStreak: () => void;
  addPoints: (points: number) => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Helper: Determine access level based on user's exam level
const getAccessLevel = (level: string, mode: string): 'full' | 'limited' | 'preview' => {
  if (mode === 'casual') return 'full'; // Casual learners get full access to casual content
  
  // Full access only for GCE levels (MVP)
  const fullAccessLevels = ['GCE O-Level', 'GCE A-Level'];
  if (fullAccessLevels.includes(level)) {
    return 'full';
  }
  
  // Limited access for BEPC, BAC, Probatoire (coming soon)
  const limitedLevels = ['BEPC', 'BAC', 'Probatoire'];
  if (limitedLevels.includes(level)) {
    return 'limited';
  }
  
  return 'preview';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Check localStorage first (MVP priority)
    const storedToken = localStorage.getItem('ticha_token');
    const storedUser = localStorage.getItem('ticha_user');

    if (storedToken && storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser);
        setToken(storedToken);
        setUser(parsedUser);
      } catch (e) {
        console.error('Failed to parse stored user', e);
        localStorage.removeItem('ticha_token');
        localStorage.removeItem('ticha_user');
      }
    }
    setLoading(false);
  }, []);

  // Save to localStorage whenever user/token changes
  useEffect(() => {
    if (token && user) {
      localStorage.setItem('ticha_token', token);
      localStorage.setItem('ticha_user', JSON.stringify(user));
    } else {
      localStorage.removeItem('ticha_token');
      localStorage.removeItem('ticha_user');
    }
  }, [token, user]);

  const login = async (email: string, password = 'Student', name?: string) => {
    setLoading(true);
    
    // First check localStorage for existing user (MVP fast path)
    const storedUser = localStorage.getItem('ticha_user');
    if (storedUser) {
      try {
        const existingUser = JSON.parse(storedUser);
        if (existingUser.email === email) {
          setToken(localStorage.getItem('ticha_token') || 'mock_token');
          setUser(existingUser);
          setLoading(false);
          return true;
        }
      } catch (e) {
        console.error('Failed to parse stored user', e);
      }
    }
    
    try {
      // Attempt backend API call
      const response = await api.post('/api/profiles', { email, name: name || email.split('@')[0] });
      const userProfile: UserProfile = {
        id: response.data.id || 'usr_1',
        email: response.data.email || email,
        name: response.data.name || name || email.split('@')[0],
        level: response.data.level || 'GCE A-Level',
        mode: response.data.mode || 'exam',
        access: getAccessLevel(response.data.level || 'GCE A-Level', response.data.mode || 'exam'),
        streak: response.data.streak ?? 0,
        points: response.data.points ?? 0,
      };

      const newToken = 'mock_jwt_token_' + Date.now();
      setToken(newToken);
      setUser(userProfile);
      setLoading(false);
      return true;
    } catch (error) {
      console.warn('[TICHA AUTH] Backend offline, creating mock account.', error);
      
      // Fallback: Create mock profile in localStorage
      const mockLevel = 'GCE A-Level';
      const fallbackUser: UserProfile = {
        id: 'usr_mock_' + Math.random().toString(36).substr(2, 9),
        email,
        name: name || email.split('@')[0],
        level: mockLevel,
        mode: 'exam',
        access: getAccessLevel(mockLevel, 'exam'),
        streak: 0,
        points: 0,
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      setToken(mockToken);
      setUser(fallbackUser);
      setLoading(false);
      return true;
    }
  };

  const signup = async (email: string, password: string, name: string, level: string, casualInterest?: string) => {
    setLoading(true);
    
    // Determine mode and access level
    const mode = level === 'Casual Learner' ? 'casual' : 'exam';
    const accessLevel = getAccessLevel(level, mode);
    
    try {
      // Attempt backend API signup
      const response = await api.post('/api/profiles', { 
        email, 
        name, 
        level: mode === 'casual' ? 'Casual Learner' : level,
        mode,
        casualInterest 
      });
      
      const userProfile: UserProfile = {
        id: response.data.id || 'usr_' + Date.now(),
        email: response.data.email || email,
        name: response.data.name || name,
        level: response.data.level || level,
        mode: response.data.mode || mode,
        access: accessLevel,
        streak: 0,
        points: 0,
        casualInterest: casualInterest,
      };

      const newToken = 'mock_jwt_token_' + Date.now();
      setToken(newToken);
      setUser(userProfile);
      setLoading(false);
      return true;
    } catch (error) {
      console.warn('[TICHA AUTH] Backend offline, saving to localStorage only.', error);

      // Store in localStorage only (MVP)
      const fallbackUser: UserProfile = {
        id: 'usr_mock_' + Math.random().toString(36).substr(2, 9),
        email,
        name,
        level: level,
        mode: mode,
        access: accessLevel,
        streak: 0,
        points: 0,
        casualInterest: casualInterest,
      };

      const mockToken = 'mock_jwt_token_' + Date.now();
      setToken(mockToken);
      setUser(fallbackUser);
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
      const newAccess = getAccessLevel(newLevel, user.mode);
      const updated = { ...user, level: newLevel, access: newAccess };
      setUser(updated);
      localStorage.setItem('ticha_user', JSON.stringify(updated));
      
      // Proactively sync with API (fire-and-forget)
      api.post('/api/profiles', { email: user.email, level: newLevel }).catch((err) => {
        console.warn('[TICHA API] Failed to sync educational level:', err.message);
      });
    }
  };

  const updateStreak = () => {
    if (user) {
      const lastActive = localStorage.getItem('ticha_last_active');
      const today = new Date().toDateString();
      
      let newStreak = user.streak;
      if (lastActive !== today) {
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastActive === yesterday.toDateString()) {
          newStreak = user.streak + 1;
        } else if (lastActive !== today) {
          newStreak = 1;
        }
        
        localStorage.setItem('ticha_last_active', today);
        const updated = { ...user, streak: newStreak };
        setUser(updated);
        localStorage.setItem('ticha_user', JSON.stringify(updated));
      }
    }
  };

  const addPoints = (points: number) => {
    if (user) {
      const updated = { ...user, points: user.points + points };
      setUser(updated);
      localStorage.setItem('ticha_user', JSON.stringify(updated));
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      token, 
      loading, 
      login, 
      signup, 
      logout, 
      updateLevel,
      updateStreak,
      addPoints,
    }}>
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