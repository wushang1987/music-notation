import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { AuthProvider, AuthContext } from '../AuthContext';
import api from '../../api';

// Mock the api module
vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

// Mock jwt-decode
vi.mock('jwt-decode', () => ({
  jwtDecode: vi.fn((token) => {
    if (token === 'valid-token') {
      return {
        id: 'user123',
        username: 'testuser',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) + 3600, // 1 hour from now
      };
    }
    if (token === 'expired-token') {
      return {
        id: 'user123',
        username: 'testuser',
        role: 'user',
        exp: Math.floor(Date.now() / 1000) - 3600, // 1 hour ago
      };
    }
    throw new Error('Invalid token');
  }),
}));

describe('AuthContext', () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
  });

  afterEach(() => {
    localStorage.clear();
  });

  describe('AuthProvider initialization', () => {
    it('initializes with no user when no token in localStorage', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current.user).toBeNull();
      expect(result.current.loading).toBe(false);
    });

    it('loads user from valid token in localStorage', async () => {
      localStorage.setItem('token', 'valid-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeDefined();
      expect(result.current.user.id).toBe('user123');
      expect(result.current.user.username).toBe('testuser');
      expect(result.current.user.role).toBe('user');
    });

    it('clears expired token on initialization', async () => {
      localStorage.setItem('token', 'expired-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });

    it('handles invalid token gracefully', async () => {
      localStorage.setItem('token', 'invalid-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.loading).toBe(false);
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('login method', () => {
    it('logs in user with email and password', async () => {
      api.post.mockResolvedValue({
        data: {
          token: 'valid-token',
        },
      });

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await act(async () => {
        await result.current.login('test@example.com', 'password123');
      });

      expect(api.post).toHaveBeenCalledWith('/auth/login', {
        email: 'test@example.com',
        password: 'password123',
      });

      expect(localStorage.getItem('token')).toBe('valid-token');
      expect(result.current.user).toBeDefined();
      expect(result.current.user.id).toBe('user123');
    });

    it('handles login error', async () => {
      api.post.mockRejectedValue(new Error('Login failed'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(
        act(async () => {
          await result.current.login('test@example.com', 'wrongpassword');
        })
      ).rejects.toThrow('Login failed');

      expect(localStorage.getItem('token')).toBeNull();
      expect(result.current.user).toBeNull();
    });
  });

  describe('register method', () => {
    it('registers new user', async () => {
      const mockResponse = {
        data: {
          message: 'Registration successful',
          user: { username: 'newuser', email: 'new@example.com' },
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let response;
      await act(async () => {
        response = await result.current.register('newuser', 'new@example.com', 'password123');
      });

      expect(api.post).toHaveBeenCalledWith('/auth/register', {
        username: 'newuser',
        email: 'new@example.com',
        password: 'password123',
      });

      expect(response).toEqual(mockResponse.data);
    });

    it('handles registration error', async () => {
      api.post.mockRejectedValue(new Error('User already exists'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(
        act(async () => {
          await result.current.register('existinguser', 'existing@example.com', 'password');
        })
      ).rejects.toThrow('User already exists');
    });
  });

  describe('logout method', () => {
    it('clears user and token on logout', async () => {
      localStorage.setItem('token', 'valid-token');

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await waitFor(() => {
        expect(result.current.user).toBeDefined();
      });

      act(() => {
        result.current.logout();
      });

      expect(result.current.user).toBeNull();
      expect(localStorage.getItem('token')).toBeNull();
    });
  });

  describe('forgotPassword method', () => {
    it('sends password reset request', async () => {
      const mockResponse = {
        data: {
          message: 'Reset link sent',
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let response;
      await act(async () => {
        response = await result.current.forgotPassword('test@example.com');
      });

      expect(api.post).toHaveBeenCalledWith('/auth/forgot-password', {
        email: 'test@example.com',
      });

      expect(response.message).toBe('Reset link sent');
    });

    it('handles forgot password error', async () => {
      api.post.mockRejectedValue(new Error('Email not found'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(
        act(async () => {
          await result.current.forgotPassword('nonexistent@example.com');
        })
      ).rejects.toThrow('Email not found');
    });
  });

  describe('resetPassword method', () => {
    it('resets password with token', async () => {
      const mockResponse = {
        data: {
          message: 'Password reset successful',
        },
      };
      api.post.mockResolvedValue(mockResponse);

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      let response;
      await act(async () => {
        response = await result.current.resetPassword('reset-token-123', 'newpassword123');
      });

      expect(api.post).toHaveBeenCalledWith('/auth/reset-password/reset-token-123', {
        password: 'newpassword123',
      });

      expect(response.message).toBe('Password reset successful');
    });

    it('handles reset password error', async () => {
      api.post.mockRejectedValue(new Error('Invalid or expired token'));

      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      await expect(
        act(async () => {
          await result.current.resetPassword('invalid-token', 'newpassword');
        })
      ).rejects.toThrow('Invalid or expired token');
    });
  });

  describe('context provider', () => {
    it('provides all auth methods to children', () => {
      const { result } = renderHook(() => useAuth(), {
        wrapper: AuthProvider,
      });

      expect(result.current).toHaveProperty('user');
      expect(result.current).toHaveProperty('login');
      expect(result.current).toHaveProperty('register');
      expect(result.current).toHaveProperty('logout');
      expect(result.current).toHaveProperty('loading');
      expect(result.current).toHaveProperty('forgotPassword');
      expect(result.current).toHaveProperty('resetPassword');
    });
  });
});

// Helper hook to use AuthContext in tests
function useAuth() {
  const context = React.useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

import React from 'react';
