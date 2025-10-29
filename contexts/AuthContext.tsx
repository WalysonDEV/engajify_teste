import React, { createContext, useState, useEffect, useContext, ReactNode, useCallback } from 'react';
import { supabase } from '../services/supabaseClient';
import type { Session } from '@supabase/supabase-js';
import type { Profile } from '../types'; // Import the Profile interface

interface AuthContextType {
  session: Session | null;
  loading: boolean;
  profile: Profile | null; // Add profile to the context type
  refetchProfile: () => Promise<void>; // Add a function to manually refetch profile
}

const AuthContext = createContext<AuthContextType>({ session: null, loading: true, profile: null, refetchProfile: async () => {} });

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [profile, setProfile] = useState<Profile | null>(null); // Add profile state
  const [loading, setLoading] = useState(true);

  const getProfile = useCallback(async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select(`id, updated_at, full_name, username, avatar_url, favorite_ideas`)
        .eq('id', userId)
        .single();

      if (error && error.code !== 'PGRST116') { // PGRST116 means no rows found, which is fine for new users
        throw error;
      }
      setProfile(data || null);
    } catch (error) {
      if (error instanceof Error) {
        console.error('Error fetching profile:', error.message);
      }
      setProfile(null);
    }
  }, []);

  const getSessionAndProfile = useCallback(async () => {
    setLoading(true);
    const { data: { session } } = await supabase.auth.getSession();
    setSession(session);
    if (session) {
      await getProfile(session.user.id);
    } else {
      setProfile(null);
    }
    setLoading(false);
  }, [getProfile]);

  useEffect(() => {
    getSessionAndProfile();

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      if (session) {
        getProfile(session.user.id); // Re-fetch profile on session change
      } else {
        setProfile(null);
      }
    });

    return () => subscription.unsubscribe();
  }, [getSessionAndProfile, getProfile]);

  const refetchProfile = useCallback(async () => {
    if (session) {
      await getProfile(session.user.id);
    }
  }, [session, getProfile]);


  return (
    <AuthContext.Provider value={{ session, loading, profile, refetchProfile }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  return useContext(AuthContext);
};