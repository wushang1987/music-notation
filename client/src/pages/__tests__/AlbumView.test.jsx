import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { AuthContext } from '../../context/AuthContext';
import { BrowserRouter } from 'react-router-dom';
import AlbumView from '../AlbumView';
import api from '../../api';

// Mock API
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
  },
}));

const renderWithAuth = (component, user = { id: '1', username: 'user', role: 'user' }) => {
  return render(
    <BrowserRouter>
      <AuthContext.Provider value={{ user }}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('AlbumView Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    api.get.mockResolvedValue({ data: {
      _id: '1',
      title: 'Test Album',
      owner: { _id: '1', username: 'user' },
      isPublic: true,
      coverUrl: '',
    } });
  });

  it('renders loading state initially', () => {
    renderWithAuth(<AlbumView />);
    expect(screen.getByText(/common.loading/i)).toBeInTheDocument();
  });

  it('fetches and displays album data', async () => {
    renderWithAuth(<AlbumView />);
    await waitFor(() => {
      expect(screen.getByText('Test Album')).toBeInTheDocument();
      expect(screen.getByText('score.by')).toBeInTheDocument();
    });
  });

  it('shows error and navigates home on fetch failure', async () => {
    api.get.mockRejectedValueOnce(new Error('fail'));
    renderWithAuth(<AlbumView />);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
