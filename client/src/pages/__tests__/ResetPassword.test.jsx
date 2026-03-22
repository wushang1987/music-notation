import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ResetPassword from '../ResetPassword';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => ({ token: 'test-reset-token' }),
  };
});

vi.mock('../../components/BrandLogo', () => ({
  default: () => <div data-testid="brand-logo">Logo</div>,
}));

describe('ResetPassword Page', () => {
  const mockResetPassword = vi.fn();

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ resetPassword: mockResetPassword }}>
          <ResetPassword />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the reset password form', () => {
    renderPage();

    expect(screen.getByText('brand.name')).toBeInTheDocument();
    expect(screen.getByText('Create new password')).toBeInTheDocument();
  });

  it('renders password input fields', () => {
    renderPage();

    const passwordInputs = screen.getAllByPlaceholderText('••••••••');
    expect(passwordInputs).toHaveLength(2);
    expect(passwordInputs[0]).toHaveAttribute('type', 'password');
    expect(passwordInputs[1]).toHaveAttribute('type', 'password');
  });

  it('renders submit button', () => {
    renderPage();

    expect(screen.getByRole('button', { name: /Reset Password/i })).toBeInTheDocument();
  });

  it('validates password match', async () => {
    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmInput, { target: { value: 'different' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('validates minimum password length', async () => {
    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: '123' } });
    await fireEvent.change(confirmInput, { target: { value: '123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password must be at least 6 characters')).toBeInTheDocument();
    });

    expect(mockResetPassword).not.toHaveBeenCalled();
  });

  it('submits form with valid passwords', async () => {
    mockResetPassword.mockResolvedValue({ message: 'Password reset successful' });

    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    await fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockResetPassword).toHaveBeenCalledWith('test-reset-token', 'newpassword123');
    });
  });

  it('displays success message on successful reset', async () => {
    mockResetPassword.mockResolvedValue({ message: 'Password reset successful!' });

    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    await fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Password reset successful!')).toBeInTheDocument();
    });
  });

  it('navigates to auth page after successful reset', async () => {
    mockResetPassword.mockResolvedValue({ message: 'Password reset successful' });

    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    await fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    await fireEvent.click(submitButton);

    await waitFor(
      () => {
        expect(mockNavigate).toHaveBeenCalledWith('/auth');
      },
      { timeout: 4000 }
    );
  });

  it('displays error message on reset failure', async () => {
    const errorMessage = 'Invalid or expired token';
    mockResetPassword.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    await fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    expect(mockNavigate).not.toHaveBeenCalled();
  });

  it('disables button while loading', async () => {
    mockResetPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });
    await fireEvent.change(confirmInput, { target: { value: 'newpassword123' } });
    await fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
  });

  it('provides back to sign in link', () => {
    renderPage();

    const backLink = screen.getByRole('link', { name: /Back to Sign In/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/auth');
  });

  it('clears error message when user makes changes', async () => {
    mockResetPassword.mockRejectedValue({
      response: {
        data: {
          message: 'Error message',
        },
      },
    });

    renderPage();

    const [passwordInput, confirmInput] = screen.getAllByPlaceholderText('••••••••');
    const submitButton = screen.getByRole('button', { name: /Reset Password/i });

    await fireEvent.change(passwordInput, { target: { value: 'password123' } });
    await fireEvent.change(confirmInput, { target: { value: 'different' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Passwords do not match')).toBeInTheDocument();
    });

    await fireEvent.change(passwordInput, { target: { value: 'newpassword123' } });

    await waitFor(() => {
      expect(screen.queryByText('Passwords do not match')).not.toBeInTheDocument();
    });
  });
});
