import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import AdminDashboard from '../AdminDashboard';
import api from '../../api';

// Mock API
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

const renderWithAuth = (component, user = { id: '1', username: 'admin', role: 'admin' }) => {
  return render(
    <AuthContext.Provider value={{ user }}>
      {component}
    </AuthContext.Provider>
  );
};

describe('AdminDashboard Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    api.get.mockResolvedValue({ data: [
      { _id: '1', username: 'user1', email: 'u1@mail.com', role: 'user', createdAt: new Date().toISOString() },
      { _id: '2', username: 'admin', email: 'admin@mail.com', role: 'admin', createdAt: new Date().toISOString() },
    ] });
    api.delete.mockResolvedValue({});
  });

  it('renders loading state initially', () => {
    renderWithAuth(<AdminDashboard />);
    expect(screen.getByText(/Loading Admin Dashboard/i)).toBeInTheDocument();
  });

  it('renders user table after loading', async () => {
    renderWithAuth(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText('Admin Dashboard')).toBeInTheDocument();
      expect(screen.getByText('user1')).toBeInTheDocument();
      expect(screen.getByText('admin')).toBeInTheDocument();
    });
  });

  it('shows error if API fails', async () => {
    api.get.mockRejectedValueOnce(new Error('fail'));
    renderWithAuth(<AdminDashboard />);
    await waitFor(() => {
      expect(screen.getByText(/Failed to fetch users/i)).toBeInTheDocument();
    });
  });

  it('deletes a user when delete is confirmed', async () => {
    renderWithAuth(<AdminDashboard />);
    await waitFor(() => screen.getByText('user1'));
    const deleteButton = screen.getAllByText('Delete')[0];
    fireEvent.click(deleteButton);
    await waitFor(() => {
      expect(api.delete).toHaveBeenCalledWith('/users/1');
    });
  });

  it('does not delete admin user', async () => {
    renderWithAuth(<AdminDashboard />);
    await waitFor(() => screen.getByText('admin'));
    expect(screen.queryAllByText('Delete').length).toBe(1); // Only one delete button for non-admin
  });
});
