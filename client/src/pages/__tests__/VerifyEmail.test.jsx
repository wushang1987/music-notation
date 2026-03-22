import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import VerifyEmail from '../VerifyEmail';
import api from '../../api';

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
  },
}));

describe('VerifyEmail Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('shows verifying state initially', () => {
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );
    expect(screen.getByText(/Verifying your email/i)).toBeInTheDocument();
  });

  it('shows success state after verification', async () => {
    api.get.mockResolvedValue({ data: { message: 'Verified!' } });
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Success!')).toBeInTheDocument();
      expect(screen.getByText('Verified!')).toBeInTheDocument();
    });
  });

  it('shows error state on verification failure', async () => {
    api.get.mockRejectedValue({ response: { data: { message: 'Invalid token' } } });
    render(
      <BrowserRouter>
        <VerifyEmail />
      </BrowserRouter>
    );
    await waitFor(() => {
      expect(screen.getByText('Verification Failed')).toBeInTheDocument();
      expect(screen.getByText('Invalid token')).toBeInTheDocument();
    });
  });
});
