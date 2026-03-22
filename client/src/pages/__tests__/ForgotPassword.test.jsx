import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import ForgotPassword from '../ForgotPassword';

vi.mock('../../components/BrandLogo', () => ({
  default: () => <div data-testid="brand-logo">Logo</div>,
}));

describe('ForgotPassword Page', () => {
  const mockForgotPassword = vi.fn();

  const renderPage = () => {
    return render(
      <BrowserRouter>
        <AuthContext.Provider value={{ forgotPassword: mockForgotPassword }}>
          <ForgotPassword />
        </AuthContext.Provider>
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders the forgot password form', () => {
    renderPage();

    expect(screen.getByText('brand.name')).toBeInTheDocument();
    expect(screen.getByText('Reset your password')).toBeInTheDocument();
  });

  it('renders email input field', () => {
    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    expect(emailInput).toBeInTheDocument();
    expect(emailInput).toHaveAttribute('type', 'email');
    expect(emailInput).toHaveAttribute('required');
  });

  it('renders submit button', () => {
    renderPage();

    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });
    expect(submitButton).toBeInTheDocument();
  });

  it('submits form with email', async () => {
    mockForgotPassword.mockResolvedValue({ message: 'Reset link sent' });

    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockForgotPassword).toHaveBeenCalledWith('test@example.com');
    });
  });

  it('displays success message on successful submission', async () => {
    mockForgotPassword.mockResolvedValue({ message: 'Reset link sent to your email.' });

    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Reset link sent to your email.')).toBeInTheDocument();
    });
  });

  it('displays error message on failure', async () => {
    const errorMessage = 'Email not found in our system';
    mockForgotPassword.mockRejectedValue({
      response: {
        data: {
          message: errorMessage,
        },
      },
    });

    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await fireEvent.change(emailInput, { target: { value: 'nonexistent@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });
  });

  it('disables button while loading', async () => {
    mockForgotPassword.mockImplementation(
      () => new Promise((resolve) => setTimeout(resolve, 1000))
    );

    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    expect(submitButton).toBeDisabled();
    expect(submitButton).toHaveTextContent('common.processing');
  });

  it('shows confirmation message after successful submission', async () => {
    mockForgotPassword.mockResolvedValue({ message: 'Reset link sent' });

    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText(/Please check your email/i)).toBeInTheDocument();
    });
  });

  it('hides email input after successful submission', async () => {
    mockForgotPassword.mockResolvedValue({ message: 'Reset link sent' });

    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.queryByPlaceholderText('you@example.com')).not.toBeInTheDocument();
      expect(screen.queryByRole('button', { name: /Send Reset Link/i })).not.toBeInTheDocument();
    });
  });

  it('provides back to sign in link', () => {
    renderPage();

    const backLink = screen.getByRole('link', { name: /Back to Sign In/i });
    expect(backLink).toBeInTheDocument();
    expect(backLink).toHaveAttribute('href', '/auth');
  });

  it('clears error message when user starts typing', async () => {
    mockForgotPassword.mockRejectedValue({
      response: {
        data: {
          message: 'Error message',
        },
      },
    });

    renderPage();

    const emailInput = screen.getByPlaceholderText('you@example.com');
    const submitButton = screen.getByRole('button', { name: /Send Reset Link/i });

    await fireEvent.change(emailInput, { target: { value: 'test@example.com' } });
    await fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Error message')).toBeInTheDocument();
    });

    await fireEvent.change(emailInput, { target: { value: 'new@example.com' } });

    await waitFor(() => {
      expect(screen.queryByText('Error message')).not.toBeInTheDocument();
    });
  });
});
