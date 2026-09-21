'use client';

import { useState, useEffect } from 'react';

interface User {
  id: number;
  name: string;
  email: string;
  phone?: string;
  role: 'STUDENT' | 'ADMIN';
}

interface AuthState {
  isAuthenticated: boolean;
  user: User | null;
  isLoading: boolean;
}

const STUDENT_AUTH_STORAGE_KEY = 'nursing_level_up_student_auth';
const STUDENT_TOKEN_KEY = 'nursing_level_up_student_token';

export function useAuth() {
  const [authState, setAuthState] = useState<AuthState>({
    isAuthenticated: false,
    user: null,
    isLoading: true
  });

  useEffect(() => {
    // Check localStorage on mount
    const storedAuth = localStorage.getItem(STUDENT_AUTH_STORAGE_KEY);
    const storedToken = localStorage.getItem(STUDENT_TOKEN_KEY);

    if (storedAuth && storedToken) {
      try {
        const parsed = JSON.parse(storedAuth);
        setAuthState({
          isAuthenticated: true,
          user: parsed,
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

  const login = async (email: string): Promise<{ user: User; needsPhone: boolean }> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('http://localhost:5000/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Login failed');
      }

      const data = await response.json();

      // Store in student-specific localStorage keys
      localStorage.setItem(STUDENT_TOKEN_KEY, data.authToken);
      localStorage.setItem(STUDENT_AUTH_STORAGE_KEY, JSON.stringify(data.user));

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false
      });

      return {
        user: data.user,
        needsPhone: data.needsPhone
      };
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const completeProfile = async (phone: string): Promise<User> => {
    setAuthState(prev => ({ ...prev, isLoading: true }));

    try {
      const response = await fetch('http://localhost:5000/api/auth/complete-profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userId: authState.user?.id, phone })
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to complete profile');
      }

      const data = await response.json();

      // Update localStorage
      localStorage.setItem(STUDENT_AUTH_STORAGE_KEY, JSON.stringify(data.user));

      setAuthState({
        isAuthenticated: true,
        user: data.user,
        isLoading: false
      });

      return data.user;
    } catch (error) {
      setAuthState(prev => ({ ...prev, isLoading: false }));
      throw error;
    }
  };

  const logout = (): void => {
    const newAuthState: AuthState = {
      isAuthenticated: false,
      user: null,
      isLoading: false
    };

    localStorage.removeItem(STUDENT_AUTH_STORAGE_KEY);
    localStorage.removeItem(STUDENT_TOKEN_KEY);
    setAuthState(newAuthState);
  };

  return {
    ...authState,
    login,
    completeProfile,
    logout
  };
}