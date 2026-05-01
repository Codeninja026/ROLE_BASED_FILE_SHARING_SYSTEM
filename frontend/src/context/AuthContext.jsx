import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { authService } from '../services/authService';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadUser = useCallback(async () => {
    try {
      if (authService.isAuthenticated()) {
        const stored = authService.getStoredUser();
        if (stored) {
          setUser(formatUser(stored));
        }
        // Verify with backend
        const freshUser = await authService.getCurrentUser();
        setUser(formatUser(freshUser));
      }
    } catch (err) {
      console.error('Failed to load user:', err);
      authService.logout();
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadUser();
  }, [loadUser]);

  const login = async (email, password) => {
    const result = await authService.login(email, password);
    if (result.success && result.data) {
      setUser(formatUser(result.data.user));
      return result.data.user;
    }
    throw new Error(result.message || 'Login failed');
  };

  const register = async (name, email, password, role) => {
    const result = await authService.register(name, email, password, role);
    if (result.success && result.data) {
      setUser(formatUser(result.data.user));
      return result.data.user;
    }
    throw new Error(result.message || 'Registration failed');
  };

  const googleLogin = async (googleId, email, name, avatarUrl) => {
    const result = await authService.googleLogin(googleId, email, name, avatarUrl);
    if (result.success && result.data) {
      setUser(formatUser(result.data.user));
      return result.data.user;
    }
    throw new Error(result.message || 'Google login failed');
  };

  const logout = () => {
    setUser(null);
    authService.logout();
  };

  const refreshUser = async () => {
    const freshUser = await authService.getCurrentUser();
    setUser(formatUser(freshUser));
  };

  return (
    <AuthContext.Provider value={{ user, isLoading, login, register, googleLogin, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};

function formatUser(u) {
  if (!u) return null;
  return {
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    teamId: u.teamId,
    teamName: u.teamName,
    active: u.active,
    provider: u.provider,
    avatar: u.avatarUrl ? (u.avatarUrl.startsWith('http') ? u.avatarUrl : `${(import.meta.env.VITE_API_URL || 'http://localhost:8080/api').replace('/api', '')}${u.avatarUrl}`) : `https://api.dicebear.com/7.x/initials/svg?seed=${u.name || 'User'}`,
    createdAt: u.createdAt,
    lastLoginAt: u.lastLoginAt,
  };
}
