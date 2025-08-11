'use client';

import { createContext, useContext, useState } from 'react';

const SimpleAuthContext = createContext({});

export const useAuth = () => {
  const context = useContext(SimpleAuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
};

export function SimpleAuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(false); // Set to false to avoid loading states

  // Simple mock functions that don't cause errors
  const signUp = async () => {
    throw new Error('Demo mode - authentication disabled');
  };

  const signIn = async () => {
    throw new Error('Demo mode - authentication disabled');
  };

  const signOut = async () => {
    setUser(null);
    setProfile(null);
  };

  const updateProfile = async () => {
    throw new Error('Demo mode - database disabled');
  };

  const resetPassword = async () => {
    throw new Error('Demo mode - authentication disabled');
  };

  const hasAccess = () => true; // Allow all features in demo mode

  const isInTrial = () => false;

  const getTrialDaysLeft = () => 0;

  const incrementDocumentCount = async () => {
    // No-op in demo mode
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
    <SimpleAuthContext.Provider value={value}>
      {children}
    </SimpleAuthContext.Provider>
  );
}