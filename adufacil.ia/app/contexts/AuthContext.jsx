'use client';

import { createContext, useContext, useEffect, useState } from 'react';
import { supabase } from '@/lib/supabase/client';
import { useRouter } from 'next/navigation';

const AuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Obtener sesión inicial
    const getInitialSession = async () => {
      const { data: { session }, error } = await supabase.auth.getSession();
      
      if (error) {
        console.error('Error getting session:', error);
      }

      if (session?.user) {
        setUser(session.user);
        await loadUserProfile(session.user.id);
      }

      setLoading(false);
    };

    getInitialSession();

    // Escuchar cambios de autenticación
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth event:', event);

        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          setUser(session?.user || null);
          if (session?.user) {
            await loadUserProfile(session.user.id);
          }
        }

        if (event === 'SIGNED_OUT') {
          setUser(null);
          setProfile(null);
          router.push('/auth');
        }

        setLoading(false);
      }
    );

    return () => subscription.unsubscribe();
  }, [router]);

  const loadUserProfile = async (userId) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        if (error.code === 'DEMO_MODE') {
          // Running in demo mode, set mock profile
          setProfile({
            id: userId,
            email: 'demo@adufacil.ia',
            subscription_plan: 'starter',
            subscription_status: 'active',
            documents_processed_this_month: 0,
            monthly_limit: 50,
            created_at: new Date().toISOString()
          });
        } else if (error.code === 'PGRST116') {
          // Profile doesn't exist, create it
          const { data: newProfile, error: createError } = await supabase
            .from('profiles')
            .insert([{
              id: userId,
              email: user?.email || '',
              created_at: new Date().toISOString()
            }])
            .select()
            .single();

          if (createError && createError.code !== 'DEMO_MODE') {
            console.error('Error creating profile:', createError);
          } else if (newProfile) {
            setProfile(newProfile);
          }
        } else {
          console.error('Error loading profile:', error);
        }
      } else {
        setProfile(data);
      }
    } catch (error) {
      console.error('Error in loadUserProfile:', error);
    }
  };

  const signUp = async (email, password, metadata = {}) => {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: metadata
      }
    });

    if (error) throw error;
    return data;
  };

  const signIn = async (email, password) => {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (error) throw error;
    return data;
  };

  const signOut = async () => {
    const { error } = await supabase.auth.signOut();
    if (error) throw error;
  };

  const updateProfile = async (updates) => {
    if (!user) throw new Error('No user logged in');

    const { data, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', user.id)
      .select()
      .single();

    if (error) throw error;

    setProfile(data);
    return data;
  };

  const resetPassword = async (email) => {
    const origin = typeof window !== 'undefined' 
      ? window.location.origin 
      : 'https://adufacilia.vercel.app';
    
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${origin}/auth/reset-password`
    });

    if (error) throw error;
  };

  // Función para verificar si el usuario tiene acceso a una feature
  const hasAccess = (feature) => {
    if (!profile) return false;

    const planLimits = {
      starter: {
        monthly_documents: 50,
        api_access: false,
        priority_support: false,
        custom_integrations: false
      },
      professional: {
        monthly_documents: 500,
        api_access: true,
        priority_support: true,
        custom_integrations: false
      },
      enterprise: {
        monthly_documents: 5000,
        api_access: true,
        priority_support: true,
        custom_integrations: true
      }
    };

    const currentPlan = profile.subscription_plan || 'starter';
    const limits = planLimits[currentPlan];

    switch (feature) {
      case 'process_document':
        return profile.documents_processed_this_month < (profile.monthly_limit || limits.monthly_documents);
      case 'api_access':
        return limits.api_access;
      case 'priority_support':
        return limits.priority_support;
      case 'custom_integrations':
        return limits.custom_integrations;
      default:
        return true;
    }
  };

  // Función para verificar si está en trial
  const isInTrial = () => {
    if (!profile) return false;
    return profile.subscription_status === 'trial' && 
           new Date(profile.trial_ends_at) > new Date();
  };

  // Días restantes de trial
  const getTrialDaysLeft = () => {
    if (!profile || !profile.trial_ends_at) return 0;
    const endDate = new Date(profile.trial_ends_at);
    const today = new Date();
    const diffTime = endDate - today;
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return Math.max(0, diffDays);
  };

  // Incrementar contador de documentos procesados
  const incrementDocumentCount = async () => {
    if (!user || !profile) return;

    const newCount = (profile.documents_processed_this_month || 0) + 1;
    
    await updateProfile({
      documents_processed_this_month: newCount
    });
  };

  const value = {
    user,
    profile,
    loading,
    signUp,
    signIn,
    signOut,
    updateProfile,
    resetPassword,
    hasAccess,
    isInTrial,
    getTrialDaysLeft,
    incrementDocumentCount
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}