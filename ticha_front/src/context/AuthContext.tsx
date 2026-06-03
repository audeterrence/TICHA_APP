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
  onboarding_completed: boolean;
}

interface AuthContextType {
  user: UserProfile | null;
  loading: boolean;
  profileLoaded: boolean;
  token: string | null;
  session: any | null;
  updateLevel: (level: string) => void;
  login: (email: string, password: string) => Promise<boolean>;
  loginAndGetOnboardingStatus: (email: string, password: string) => Promise<{ success: boolean; onboardingCompleted: boolean }>;
  signup: (email: string, password: string, name: string, level: string, casualInterest?: string) => Promise<boolean>;
  logout: () => Promise<void>;
  updateStreak: () => Promise<void>;
  addPoints: (points: number) => Promise<void>;
  refreshUser: () => Promise<UserProfile | null>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

const getAccessLevel = (level: string, mode: string): 'full' | 'limited' | 'preview' => {
  if (mode === 'casual') return 'full';
  return ['GCE O-Level', 'GCE A-Level'].includes(level) ? 'full' : 'limited';
};

const mapProfileToUser = (profile: any): UserProfile => ({
  id: profile.id,
  email: profile.email,
  name: profile.name,
  level: profile.level,
  mode: profile.mode,
  access: profile.access || getAccessLevel(profile.level, profile.mode),
  streak: profile.streak || 0,
  points: profile.points || 0,
  casualInterest: profile.casual_interest,
  stream: profile.stream,
  onboarding_completed: profile.onboarding_completed || false,
});

const buildUserFromMetadata = (session: any): UserProfile => {
  const metadata = session?.user?.user_metadata || {};
  const email = session?.user?.email || '';
  const name = metadata.name || email.split('@')[0] || 'User';
  const level = metadata.level || 'GCE A-Level';
  const mode = metadata.mode || 'exam';

  return {
    id: session.user.id,
    email,
    name,
    level,
    mode,
    access: metadata.access || getAccessLevel(level, mode),
    streak: metadata.streak || 0,
    points: metadata.points || 0,
    casualInterest: metadata.casual_interest || metadata.casualInterest,
    stream: metadata.stream,
    onboarding_completed: metadata.onboarding_completed === true,
  };
};

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<UserProfile | null>(null);
  const [session, setSession] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);
  const [profileLoaded, setProfileLoaded] = useState(false);

  // Effect 1: Listen to session changes (synchronous - NO profile query here)
  useEffect(() => {
    let cancelled = false;
    console.log('[AuthContext] Setting up auth state listener');

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      if (!cancelled) {
        console.log('[AuthContext] Auth state changed, session:', !!session);
        setSession(session);
      }
    });

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!cancelled) {
        console.log('[AuthContext] Initial session:', !!session);
        setSession(session);
      }
    });

    return () => {
      cancelled = true;
      subscription.unsubscribe();
    };
  }, []);

  // Effect 2: Load profile whenever session changes
  useEffect(() => {
    if (!session) {
      console.log('[AuthContext] No session, clearing user');
      setUser(null);
      setLoading(false);
      setProfileLoaded(true);
      return;
    }

    let cancelled = false;
    console.log('[AuthContext] Session detected, loading profile...');
    setLoading(true);
    setProfileLoaded(false);

    const loadProfile = async () => {
      try {
        console.log('[AuthContext] About to query profile');
        
        const { data, error } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (cancelled) return;

        console.log('[AuthContext] Raw query result:', { data, error });

        if (error) {
          console.error('[AuthContext] Profile fetch error:', error);
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
        } else if (data) {
          console.log('[AuthContext] Profile loaded successfully');
          setUser(mapProfileToUser(data));
        } else {
          console.error('[AuthContext] Profile not found. Signing user out.');
          await supabase.auth.signOut();
          setUser(null);
          setSession(null);
        }
      } catch (err) {
        console.error('[AuthContext] Unexpected error loading profile:', err);
        if (!cancelled) {
          setUser(null);
          setSession(null);
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
          setProfileLoaded(true);
          console.log('[AuthContext] Profile loading complete');
        }
      }
    };

    loadProfile();

    return () => {
      cancelled = true;
    };
  }, [session]);

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] login() called with email:', email);
    setLoading(true);
    setProfileLoaded(false);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      if (!data.session) throw new Error('No session returned');
      // Session effect will handle profile loading automatically
      return true;
    } catch (err: any) {
      console.error('[AuthContext] Login Error:', err.message);
      setLoading(false);
      setProfileLoaded(true);
      return false;
    }
  };

  const loginAndGetOnboardingStatus = async (email: string, password: string) => {
    console.log('[AuthContext] loginAndGetOnboardingStatus called');
    setLoading(true);
    setProfileLoaded(false);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) return { success: false, onboardingCompleted: false };
      if (!data.session) return { success: false, onboardingCompleted: false };
      
      // Session effect will handle profile loading automatically
      // Just return success - the component can check user.onboarding_completed after profile loads
      return { success: true, onboardingCompleted: false }; // Will be updated when profile loads
    } catch (err: any) {
      console.error('[AuthContext] loginAndGetOnboardingStatus error:', err);
      setLoading(false);
      setProfileLoaded(true);
      return { success: false, onboardingCompleted: false };
    }
  };

  const signup = async (email: string, password: string, name: string, level: string, casualInterest?: string) => {
    setLoading(true);
    setProfileLoaded(false);
    try {
      const mode = level === 'Casual Learner' ? 'casual' : 'exam';
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
            full_name: name,
            level,
            mode,
            casual_interest: casualInterest,
            onboarding_completed: false,
          }
        }
      });
      if (error) throw error;
      if (!data.user) throw new Error("No user returned");

      let profileCreated = false;
      let profileData: any = null;
      
      // Poll for profile creation (database trigger may take a moment)
      for (let i = 0; i < 10; i++) {
        await new Promise(resolve => setTimeout(resolve, 500));
        const { data: fetched, error: fetchError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        if (fetched) {
          profileCreated = true;
          profileData = fetched;
          if (!profileData.stream) {
            await supabase.from('profiles').update({ stream: 'science' }).eq('id', data.user.id);
            profileData.stream = 'science';
          }
          setUser(mapProfileToUser(profileData));
          break;
        }
      }
      
      // Fallback: manually insert profile if trigger didn't create it
      if (!profileCreated) {
        const { data: inserted, error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: data.user.id,
            email,
            name,
            level,
            mode,
            access: getAccessLevel(level, mode),
            casual_interest: casualInterest,
            onboarding_completed: false,
            stream: 'science',
            streak: 0,
            points: 0,
          })
          .select()
          .single();
        if (insertError) throw insertError;
        profileData = inserted;
        setUser(mapProfileToUser(profileData));
      }
      
      if (data.session) setSession(data.session);
      return true;
    } catch (err) {
      console.error('[AuthContext] signup Error:', err);
      return false;
    } finally {
      setLoading(false);
      setProfileLoaded(true);
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
      const payload = { user_id: user.id, current_streak: 1, last_active_date: today, updated_at: new Date().toISOString() };
      if (progress) {
        const lastActive = progress.last_active_date;
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        const yesterdayStr = yesterday.toISOString().split('T')[0];
        if (lastActive === yesterdayStr) newStreak = (progress.current_streak || 0) + 1;
        else if (lastActive !== today) newStreak = 1;
        else newStreak = progress.current_streak || 0;
        payload.current_streak = newStreak;
        const { error: updateError } = await supabase.from('user_progress').update(payload).eq('id', progress.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('user_progress').insert({ ...payload, total_xp: 0, longest_streak: 1 });
        if (insertError) throw insertError;
      }
      setUser({ ...user, streak: newStreak });
    } catch (error) {
      console.error('Error updating streak:', error);
    }
  };

  const addPoints = async (points: number) => {
    if (!user) return;
    try {
      const { data: progress, error: fetchError } = await supabase
        .from('user_progress')
        .select('*')
        .eq('user_id', user.id)
        .single();
      if (fetchError && fetchError.code !== 'PGRST116') throw fetchError;
      const newPoints = (user.points || 0) + points;
      const payload = { user_id: user.id, total_xp: newPoints, updated_at: new Date().toISOString() };
      if (progress) {
        const { error: updateError } = await supabase.from('user_progress').update(payload).eq('id', progress.id);
        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase.from('user_progress').insert({ ...payload, current_streak: 0, longest_streak: 0, average_mastery: 0 });
        if (insertError) throw insertError;
      }
      setUser({ ...user, points: newPoints });
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const refreshUser = async () => {
    if (!session) return null;
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    if (profile && !error) {
      const refreshedUser = mapProfileToUser(profile);
      setUser(refreshedUser);
      return refreshedUser;
    }
    return null;
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut({ scope: 'global' });
    } catch (err) {
      console.error('[AuthContext] Logout error:', err);
    } finally {
      setUser(null);
      setSession(null);
      setLoading(false);
      setProfileLoaded(true);
    }
  };

  const updateLevel = async (newLevel: string) => {
    if (!user) return;
    setUser({ ...user, level: newLevel });
    try {
      const { error } = await supabase.from('profiles').update({ level: newLevel }).eq('id', user.id);
      if (error) setUser({ ...user, level: user.level });
    } catch (err) {
      console.error('Error in updateLevel:', err);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      profileLoaded,
      token: session?.access_token || null,
      session,
      updateLevel,
      login,
      loginAndGetOnboardingStatus,
      signup,
      logout,
      updateStreak,
      addPoints,
      refreshUser
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