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

  // Load user session on startup
  useEffect(() => {
    let isSubscribed = true;
    console.log('[AuthContext] useEffect fired, listening for auth changes');

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (!isSubscribed) return;
      console.log('[AuthContext] onAuthStateChange event:', event, 'has session:', !!session);

      try {
        if (session) {
          setSession(session);
          setUser(buildUserFromMetadata(session));
          console.log('[AuthContext] Setting session for user:', session.user.id);
          
          try {
            console.log('[AuthContext] Fetching profile for user:', session.user.id);
            const { data: profile, error: profileError } = await supabase
              .from('profiles')
              .select('*')
              .eq('id', session.user.id)
              .single();

            console.log('[AuthContext] onAuthStateChange profile fetch returned:', { profile, profileError });

            if (!isSubscribed) return;

            if (profile && !profileError) {
              console.log('[AuthContext] Profile loaded successfully:', profile.name);
              setUser(mapProfileToUser(profile));
            }
          } catch (profileFetchErr: any) {
            console.error('[AuthContext] Exception during profile fetch:', profileFetchErr?.message || profileFetchErr);
          }
        } else {
          console.log('[AuthContext] No session in onAuthStateChange');
          setUser(null);
          setSession(null);
        }
      } finally {
        console.log('[AuthContext] Setting loading to false');
        setLoading(false);
      }
    });

    return () => {
      isSubscribed = false;
      subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password: string) => {
    console.log('[AuthContext] login() called with email:', email);
    console.log('[AuthContext] Current session state:', !!session);

    // If session already exists in React state, just wait for onAuthStateChange to set user
    if (session) {
      console.log('[AuthContext] Session exists in state, waiting for onAuthStateChange to set user');
      // Wait a bit for user state to be set by onAuthStateChange
      await new Promise(resolve => setTimeout(resolve, 500));
      console.log('[AuthContext] login() returning true (session existed, user should be set)');
      return true;
    }

    setLoading(true);
    try {
      // No existing session in state - perform fresh login
      console.log('[AuthContext] No session in state, performing signInWithPassword');
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      console.log('[AuthContext] signInWithPassword result:', { hasError: !!error, hasData: !!data, hasSession: !!data?.session });

      if (error) {
        console.error('[AuthContext] signInWithPassword error:', error);
        throw error;
      }

      if (!data.session) {
        console.error('[AuthContext] Login succeeded but no session returned');
        throw new Error('Authentication succeeded but session not created. Please try again.');
      }

      console.log('[AuthContext] Setting session, access_token:', data.session.access_token ? 'present' : 'MISSING');
      setSession(data.session);
      setUser(buildUserFromMetadata(data.session));

      console.log('[AuthContext] Fetching profile for user:', data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      console.log('[AuthContext] Profile fetch result:', { hasProfile: !!profile, error: profileError });

      if (profileError) throw profileError;

      if (profile) {
        console.log('[AuthContext] Setting user state:', { id: profile.id, name: profile.name, level: profile.level });
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
          stream: profile.stream,
          onboarding_completed: profile.onboarding_completed || false
        });
      }
      console.log('[AuthContext] login() returning true');
      return true;
    } catch (err: any) {
      console.error('[AuthContext] Login Error:', err.message || err);
      return false;
    } finally {
      setLoading(false);
    }
  };

  // Variant that returns onboarding status directly (avoids closure stale data issue)
  const loginAndGetOnboardingStatus = async (email: string, password: string) => {
    console.log('[AuthContext] loginAndGetOnboardingStatus() called with email:', email);
    setLoading(true);
    console.log('[AuthContext] Performing signInWithPassword');
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      
      console.log('[AuthContext] signInWithPassword result:', {
        hasError: !!error,
        error: error?.message,
        hasData: !!data,
        hasSession: !!data?.session
      });

      if (error) {
        console.error('[AuthContext] signInWithPassword error:', error.message);
        return { success: false, onboardingCompleted: false };
      }
      
      if (!data.session) {
        console.error('[AuthContext] Login succeeded but no session returned');
        return { success: false, onboardingCompleted: false };
      }

      console.log('[AuthContext] Session obtained, user:', data.user.id);
      setSession(data.session);

      console.log('[AuthContext] Fetching profile for user:', data.user.id);
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();
      
      console.log('[AuthContext] Profile fetch result:', {
        hasProfile: !!profile,
        errorCode: profileError?.code,
        errorMessage: profileError?.message
      });

      if (profileError || !profile) {
        console.warn('[AuthContext] Existing profile missing or failed to load; using metadata for routing', { profileError });
        const metadata = data.user.user_metadata || {};
        const onboardingCompleted = metadata.onboarding_completed === true;
        setUser(buildUserFromMetadata(data.session));
        return { success: true, onboardingCompleted };
      }

      const onboardingCompleted = profile.onboarding_completed || false;
      setUser(mapProfileToUser(profile));

      console.log('[AuthContext] Returning success with onboardingCompleted:', onboardingCompleted);
      return { success: true, onboardingCompleted };
    } catch (err: any) {
      console.error('[AuthContext] loginAndGetOnboardingStatus error:', err.message || err);
      return { success: false, onboardingCompleted: false };
    } finally {
      console.log('[AuthContext] Setting loading to false in loginAndGetOnboardingStatus');
      setLoading(false);
    }
  };

  const signup = async (email: string, password: string, name: string, level: string, casualInterest?: string) => {
    setLoading(true);
    console.log('[AuthContext] signup() called with email:', email, 'name:', name, 'level:', level);
    try {
      const mode = level === 'Casual Learner' ? 'casual' : 'exam';
      console.log('[AuthContext] signup() - mode:', mode);

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
      console.log('[AuthContext] signup() - signUp result:', { error, hasUser: !!data?.user, hasSession: !!data?.session });

      if (error) {
        console.error('[AuthContext] signup() - signUp error:', error);
        // Handle specific error cases
        if (error.message.includes('User already registered')) {
          alert('This email is already registered. Please log in instead.');
        }
        throw error;
      }

      if (!data.user) throw new Error("No user returned");

      // Wait for profile to be created (give DB trigger time to create it)
      let profileCreated = false;
      let profileData: any = null;
      let attempts = 0;
      console.log('[AuthContext] signup() - Waiting for profile creation...');
      while (!profileCreated && attempts < 10) {
        await new Promise(resolve => setTimeout(resolve, 500));
        console.log('[AuthContext] signup() - Profile check attempt:', attempts + 1);
        const { data: fetchedProfile, error: profileError } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', data.user.id)
          .single();
        console.log('[AuthContext] signup() - Profile check result:', { profileError, hasProfile: !!fetchedProfile });
        if (fetchedProfile) {
          profileCreated = true;
          profileData = fetchedProfile;
          console.log('[AuthContext] signup() - Profile created successfully!');
          // Also ensure stream is set
          if (!profileData.stream) {
            console.log('[AuthContext] signup() - Setting default stream to science');
            await supabase
              .from('profiles')
              .update({ stream: 'science' })
              .eq('id', data.user.id);
            profileData.stream = 'science';
          }
          // SET THE USER STATE
          setUser({
            id: profileData.id,
            email: profileData.email,
            name: profileData.name,
            level: profileData.level,
            mode: profileData.mode,
            access: profileData.access || getAccessLevel(profileData.level, profileData.mode),
            streak: profileData.streak || 0,
            points: profileData.points || 0,
            casualInterest: profileData.casual_interest,
            stream: profileData.stream,
            onboarding_completed: profileData.onboarding_completed || false
          });
          console.log('[AuthContext] signup() - User state set');
        }
        attempts++;
      }

      if (!profileCreated) {
        console.warn('[AuthContext] signup() - Profile NOT created after 10 attempts! Attempting fallback insert...');
        const { data: insertedProfile, error: insertError } = await supabase
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

        if (insertError) {
          console.error('[AuthContext] signup() - Profile insert fallback failed:', insertError);
          throw insertError;
        }

        if (insertedProfile) {
          profileData = insertedProfile;
          profileCreated = true;
          console.log('[AuthContext] signup() - Profile fallback insert succeeded');
          setUser({
            id: profileData.id,
            email: profileData.email,
            name: profileData.name,
            level: profileData.level,
            mode: profileData.mode,
            access: profileData.access || getAccessLevel(profileData.level, profileData.mode),
            streak: profileData.streak || 0,
            points: profileData.points || 0,
            casualInterest: profileData.casual_interest,
            stream: profileData.stream || 'science',
            onboarding_completed: profileData.onboarding_completed || false
          });
          console.log('[AuthContext] signup() - User state set from fallback insert');
        }
      }

      if (!profileCreated) {
        throw new Error('Profile creation timed out or failed. Please try again or contact support.');
      }

      // Also set session explicitly and initialize user from metadata
      if (data.session) {
        console.log('[AuthContext] signup() - Setting session');
        setSession(data.session);
        setUser(buildUserFromMetadata(data.session));
      }

      console.log('[AuthContext] signup() - Returning true, profileCreated:', profileCreated);
      return true;
    } catch (err) {
      console.error('[AuthContext] signup() Error:', err);
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
      const payload = {
        user_id: user.id,
        current_streak: 1,
        last_active_date: today,
        updated_at: new Date().toISOString(),
      };

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

        payload.current_streak = newStreak;

        const { error: updateError } = await supabase
          .from('user_progress')
          .update(payload)
          .eq('id', progress.id);

        if (updateError) throw updateError;
      } else {
        payload.current_streak = 1;

        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            ...payload,
            total_xp: 0,
            longest_streak: 1,
          });

        if (insertError) throw insertError;
      }

      // Update user state
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
      const payload = {
        user_id: user.id,
        total_xp: newPoints,
        updated_at: new Date().toISOString(),
      };

      if (progress) {
        const { error: updateError } = await supabase
          .from('user_progress')
          .update(payload)
          .eq('id', progress.id);

        if (updateError) throw updateError;
      } else {
        const { error: insertError } = await supabase
          .from('user_progress')
          .insert({
            ...payload,
            current_streak: 0,
            longest_streak: 0,
            average_mastery: 0,
          });

        if (insertError) throw insertError;
      }

      // Update user state
      setUser({ ...user, points: newPoints });
    } catch (error) {
      console.error('Error adding points:', error);
    }
  };

  const refreshUser = async () => {
    if (!session) return null;
    console.log('[AuthContext] refreshUser() called, fetching fresh profile');
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', session.user.id)
      .single();
    console.log('[AuthContext] refreshUser profile result:', { hasProfile: !!profile, error });
    if (profile && !error) {
      const refreshedUser: UserProfile = {
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
        onboarding_completed: profile.onboarding_completed || false
      };
      setUser(refreshedUser);
      return refreshedUser;
    }
    return null;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
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