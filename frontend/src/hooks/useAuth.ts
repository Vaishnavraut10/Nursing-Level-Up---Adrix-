'use client';

import { useState, useEffect } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

const AUTH_STORAGE_KEY = 'nursing_level_up_auth';

const mockUser: User = {
  id: 'mock-user-1',
  name: 'Test User',
  email: 'test@example.com'
};

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    // Check localStorage on mount
    const storedAuth = localStorage.getItem(AUTH_STORAGE_KEY);
    if (storedAuth) {
      try {
        const parsed = JSON.parse(storedAuth);
        setAuthState({
          isAuthenticated: parsed.isAuthenticated,
          user: parsed.user,
          isLoading: false
        });
      } catch (error) {
        console.error('Error parsing auth state:', error);
        setAuthState({
          isAuthenticated: false,
          user: null,
          isLoading: false
        });
      }
    } else {
      setAuthState({
        isAuthenticated: false,
        user: null,
        isLoading: false
      });
    }
  }, []);

  const login = async (): Promise<void> => {
    return new Promise((resolve) => {
      setAuthState(prev => ({ ...prev, isLoading: true }));
      
      // Simulate API delay
      setTimeout(() => {
        const newAuthState: AuthState = {
          isAuthenticated: true,
          user: mockUser,
          isLoading: false
        };
        
        localStorage.setItem(AUTH_STORAGE_KEY, JSON.stringify(newAuthState));
        setAuthState(newAuthState);
        resolve();
      }, 1500);
    });
  };

  const logout = (): void => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      user: null,
      isLoading: false
    };
    
    localStorage.removeItem(AUTH_STORAGE_KEY);
    setAuthState(newAuthState);
  };

  return {
    ...authState,
    login,
    logout
  };
}