"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { checkUserSession, logoutUser } from '@/app/actions/user';

type User = { id: string; name: string | null; email: string; address?: string | null };

type AuthContextType = {
  user: User | null;
  setUser: (user: User | null) => void;
  isAuthModalOpen: boolean;
  openAuthModal: (view?: 'login' | 'signup' | 'forgot') => void;
  closeAuthModal: () => void;
  authView: 'login' | 'signup' | 'forgot';
  setAuthView: (view: 'login' | 'signup' | 'forgot') => void;
  logout: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    checkUserSession().then((session) => {
      if (session) setUser(session);
    });
  }, []);

  const openAuthModal = (view: 'login' | 'signup' | 'forgot' = 'login') => {
    setAuthView(view);
    setIsAuthModalOpen(true);
  };

  const closeAuthModal = () => {
    setIsAuthModalOpen(false);
  };

  const logout = async () => {
    await logoutUser();
    setUser(null);
  };

  if (!mounted) return null;

  return (
    <AuthContext.Provider value={{ user, setUser, isAuthModalOpen, openAuthModal, closeAuthModal, authView, setAuthView, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
