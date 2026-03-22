import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Auth from '../Auth';

// Mock react-router-dom
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useLocation: () => ({ pathname: '/login' }),
  };
});

// Mock BrandLogo
vi.mock('../../components/BrandLogo', () => ({
  default: ({ className }) => <div data-testid="brand-logo" className={className}>Logo</div>,
}));

const renderWithAuthProvider = (component, authContextValue = {}) => {
  const defaultAuthContext = {
    user: null,
    login: vi.fn(),
    register: vi.fn(),
    ...authContextValue,
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={defaultAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Auth Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Initial Rendering', () => {
    it('renders login form by default', () => {
      renderWithAuthProvider(<Auth />);

      expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('you@example.com')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('••••••••')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /auth\.login/ })).toBeInTheDocument();
      expect(screen.queryByPlaceholderText('maestro_johann')).not.toBeInTheDocument();
    });

    it('renders register form when pathname is /register', () => {
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({ pathname: '/register' });

      renderWithAuthProvider(<Auth />);

      expect(screen.getByText('auth.startJourney')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('maestro_johann')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /auth\.register/ })).toBeInTheDocument();
    });

    it('renders brand logo and name', () => {
      renderWithAuthProvider(<Auth />);

      expect(screen.getByTestId('brand-logo')).toBeInTheDocument();
      expect(screen.getByText('brand.name')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    it('updates email input', () => {
      renderWithAuthProvider(<Auth />);

      const emailInput = screen.getByPlaceholderText('you@example.com');
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });

      expect(emailInput.value).toBe('test@example.com');
    });

    it('updates password input', () => {
      renderWithAuthProvider(<Auth />);

      const passwordInput = screen.getByPlaceholderText('••••••••');
      fireEvent.change(passwordInput, { target: { value: 'password123' } });

      expect(passwordInput.value).toBe('password123');
    });

    it('updates username input in register mode', () => {
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({ pathname: '/register' });

      renderWithAuthProvider(<Auth />);

      const usernameInput = screen.getByPlaceholderText('maestro_johann');
      fireEvent.change(usernameInput, { target: { value: 'testuser' } });

      expect(usernameInput.value).toBe('testuser');
    });

    it('toggles between login and register modes', () => {
      renderWithAuthProvider(<Auth />);

      // Initially login mode
      expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();

      // Click register link
      const registerLink = screen.getByText('auth.needAccount');
      fireEvent.click(registerLink);

      expect(screen.getByText('auth.startJourney')).toBeInTheDocument();
      expect(screen.getByPlaceholderText('maestro_johann')).toBeInTheDocument();

      // Click login link
      const loginLink = screen.getByText('auth.haveAccount');
      fireEvent.click(loginLink);

      expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
    });
  });

  describe('Form Submission', () => {
    it('calls login on form submit in login mode', async () => {
      const mockLogin = vi.fn().mockResolvedValue({});
      renderWithAuthProvider(<Auth />, { login: mockLogin });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /auth\.login/ });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockLogin).toHaveBeenCalledWith('test@example.com', 'password123');
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });

    it('calls register on form submit in register mode', async () => {
      const mockRegister = vi.fn().mockResolvedValue({ message: 'Registration successful' });
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({ pathname: '/register' });

      renderWithAuthProvider(<Auth />, { register: mockRegister });

      const usernameInput = screen.getByPlaceholderText('maestro_johann');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /auth\.register/ });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockRegister).toHaveBeenCalledWith('testuser', 'test@example.com', 'password123');
        expect(screen.getByText('Registration successful')).toBeInTheDocument();
      });
    });

    it('switches to login mode after successful registration', async () => {
      const mockRegister = vi.fn().mockResolvedValue({});
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({ pathname: '/register' });

      renderWithAuthProvider(<Auth />, { register: mockRegister });

      const usernameInput = screen.getByPlaceholderText('maestro_johann');
      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /auth\.register/ });

      fireEvent.change(usernameInput, { target: { value: 'testuser' } });
      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('auth.welcomeBack')).toBeInTheDocument();
      });
    });

    it('displays error on login failure', async () => {
      const mockLogin = vi.fn().mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } }
      });
      renderWithAuthProvider(<Auth />, { login: mockLogin });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /auth\.login/ });

      fireEvent.change(emailInput, { target: { value: 'wrong@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'wrongpass' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Invalid credentials')).toBeInTheDocument();
      });
    });

    it('displays generic error when no response message', async () => {
      const mockLogin = vi.fn().mockRejectedValue(new Error('Network error'));
      renderWithAuthProvider(<Auth />, { login: mockLogin });

      const emailInput = screen.getByPlaceholderText('you@example.com');
      const passwordInput = screen.getByPlaceholderText('••••••••');
      const submitButton = screen.getByRole('button', { name: /auth\.login/ });

      fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
      fireEvent.change(passwordInput, { target: { value: 'password123' } });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Login failed')).toBeInTheDocument();
      });
    });

    it('shows loading state during submission', async () => {
      const mockLogin = vi.fn().mockImplementation(() => new Promise(resolve => setTimeout(resolve, 100)));
      renderWithAuthProvider(<Auth />, { login: mockLogin });

      const submitButton = screen.getByRole('button', { name: /auth\.login/ });
      fireEvent.click(submitButton);

      expect(submitButton).toBeDisabled();
      expect(submitButton).toHaveTextContent('auth.processing');

      await waitFor(() => {
        expect(submitButton).not.toBeDisabled();
      });
    });
  });

  describe('User Authentication State', () => {
    it('redirects to home if user is already logged in', () => {
      const user = { id: '1', username: 'existinguser' };
      renderWithAuthProvider(<Auth />, { user });

      expect(mockNavigate).toHaveBeenCalledWith('/');
    });
  });

  describe('Error Display', () => {
    it('displays success message in green for registration success', async () => {
      const mockRegister = vi.fn().mockResolvedValue({ message: 'Registration successful' });
      vi.mocked(require('react-router-dom').useLocation).mockReturnValue({ pathname: '/register' });

      renderWithAuthProvider(<Auth />, { register: mockRegister });

      const submitButton = screen.getByRole('button', { name: /auth\.register/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorDiv = screen.getByText('Registration successful');
        expect(errorDiv).toHaveClass('bg-green-50', 'text-green-600');
      });
    });

    it('displays error message in red for failures', async () => {
      const mockLogin = vi.fn().mockRejectedValue({
        response: { data: { message: 'Invalid credentials' } }
      });
      renderWithAuthProvider(<Auth />, { login: mockLogin });

      const submitButton = screen.getByRole('button', { name: /auth\.login/ });
      fireEvent.click(submitButton);

      await waitFor(() => {
        const errorDiv = screen.getByText('Invalid credentials');
        expect(errorDiv).toHaveClass('bg-red-50', 'text-red-600');
      });
    });
  });
});