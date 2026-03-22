import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import Albums from '../Albums';
import api from '../../api';

// Mock API
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
  },
}));

vi.mock('../../components/AlbumCard', () => ({
  default: ({ album }) => <div data-testid={`album-card-${album._id}`}>{album.title}</div>,
}));

vi.mock('../../components/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button data-testid="prev-page" onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      <span>{currentPage} / {totalPages}</span>
      <button data-testid="next-page" onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}));

describe('Albums Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    api.get.mockResolvedValue({ data: { albums: [
      { _id: '1', title: 'Album 1' },
      { _id: '2', title: 'Album 2' },
    ], totalPages: 1, page: 1 } });
  });

  it('renders loading state initially', () => {
    render(<Albums />);
    expect(screen.getByText(/albums.sectionTitle/i)).toBeInTheDocument();
  });

  it('fetches and displays albums', async () => {
    render(<Albums />);
    await waitFor(() => {
      expect(screen.getByTestId('album-card-1')).toBeInTheDocument();
      expect(screen.getByTestId('album-card-2')).toBeInTheDocument();
    });
  });

  it('handles search input and triggers API call', async () => {
    render(<Albums />);
    const searchInput = screen.getByPlaceholderText('albums.searchPlaceholder');
    fireEvent.change(searchInput, { target: { value: 'test' } });
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('search=test'));
    });
  });

  it('changes page via pagination', async () => {
    render(<Albums />);
    await waitFor(() => screen.getByTestId('pagination'));
    const nextButton = screen.getByTestId('next-page');
    fireEvent.click(nextButton);
    await waitFor(() => {
      expect(api.get).toHaveBeenCalledWith(expect.stringContaining('page=2'));
    });
  });
});
