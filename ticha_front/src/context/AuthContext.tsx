import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '../services/supabase';

export interface UserProfile {
  id: string;
  email: string;
  name: string;
  level: string; 
  mode: 'exam' | 'casual';
  access: 'full' | 'limited' | 'preview';
  streak: number;
  points: number;
  casualInterest?: string;
  stream?: 'science' | 'arts';
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  token: string | null;           
  session: any | null;             
  updateLevel: (level: string) => void; 
  login: (email: string, password: string) => Promise<boolean>;
  signup: (email: string, password: string, name: string, level: string, casualInterest?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateStreak: () => Promise<void>;
  addPoints: (points: number) => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAccessLevel = (level: string, mode: string): 'full' | 'limited' | 'preview' => {
  if (mode === 'casual') return 'full';
  return ['GCE O-Level', 'GCE A-Level'].includes(level) ? 'full' : 'limited';
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null); 
  const [loading, setLoading] = useState(true);

  // Load user session on startup
  useEffect(() => {
    const checkSession = async () => {
      try {
        const { data: sessionData } = await supabase.auth.getSession();
        if (sessionData.session) {
          setSession(sessionData.session); 
          const { data: profile, error } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', sessionData.session.user.id)
            .single();
          
          if (profile && !error) {
            setUser({
              id: profile.id,
              email: profile.email,
              name: profile.name,
              level: profile.level,
              mode: profile.mode,
              access: profile.access || getAccessLevel(profile.level, profile.mode),
              streak: profile.streak || 0,
              points: profile.points || 0,
              casualInterest: profile.casual_interest,
              stream: profile.stream
            });
          }
        }
      } catch (error) {
        console.error('Session check error:', error);
      } finally {
        setLoading(false);
      }
    };
    checkSession();

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();
        
        if (profile) {
          setUser({
            id: profile.id,
            email: profile.email,
            name: profile.name,
            level: profile.level,
            mode: profile.mode,
            access: profile.access || getAccessLevel(profile.level, profile.mode),
            streak: profile.streak || 0,
            points: profile.points || 0,
            casualInterest: profile.casual_interest,
            stream: profile.stream
          });
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  const login = async (email: string, password: string) => {
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
        
      if (profileError) throw profileError;
      
      if (profile) {
        setUser({
          id: profile.id,
          email: profile.email,
          name: profile.name,
          level: profile.level,
          mode: profile.mode,
          access: profile.access || getAccessLevel(profile.level, profile.mode),
          streak: profile.streak || 0,
          points: profile.points || 0,
          casualInterest: profile.casual_interest,
          stream: profile.stream
        });
      }
      return true;
    } catch (err) {
      console.error('Login Error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, level: string, casualInterest?: string) => {
    setLoading(true);
    try {
      const mode = level === 'Casual Learner' ? 'casual' : 'exam';
      
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
            level: level,
            mode: mode,
            casual_interest: casualInterest
          }
        }
      });

      if (error) {
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          alert('This email is already registered. Please log in instead.');
        }
        throw error;
      }
      
      if (!data.user) throw new Error("No user returned");

      // ✅ No manual profile fetch – the onAuthStateChange listener will set the user
      return true;
    } catch (err) {
      console.error('Signup Error:', err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  const updateStreak = async () => {
    if (!user) return;
    
    try {
      const today = new Date().toISOString().split('T')[0];
      const { data: progress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();

      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;

      let newStreak = 1;
      if (progress) {
        const lastActive = progress.last_active_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];

        if (lastActive === yesterdayStr) {
          newStreak = (progress.current_streak || 0) + 1;
        } else if (lastActive !== today) {
          newStreak = 1;
        } else {
          newStreak = progress.current_streak || 0;
        }
      }

      const { error: upsertError } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          current_streak: newStreak,
          last_active_date: today,
          updated_at: new Date().toISOString()
        });

      if (upsertError) throw upsertError;

      // Update user state
      setUser({ ...user, streak: newStreak });
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const addPoints = async (points: number) => {
    if (!user) return;
    
    try {
      const newPoints = (user.points || 0) + points;
      
      const { error } = await supabase
        .from('user_progress')
        .upsert({
          user_id: user.id,
          total_xp: newPoints,
          updated_at: new Date().toISOString()
        });

      if (error) throw error;

      // Update user state
      setUser({ ...user, points: newPoints });
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const updateLevel = async (newLevel: string) => {
    if (!user) return;

    // 1. Update local state for immediate UI feedback
    setUser({ ...user, level: newLevel });

    // 2. Perform the database update to make it permanent
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ level: newLevel })
        .eq('id', user.id);

      if (error) {
        console.error('Failed to update level in database:', error);
        // Optional: Revert local state if database update fails
        setUser({ ...user, level: user.level }); 
      }
    } catch (err) {
      console.error('Error in updateLevel:', err);
    }
  };

  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      token: session?.access_token || null,
      session,
      updateLevel,
      login, 
      signup, 
      logout, 
      updateStreak, 
      addPoints 
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};