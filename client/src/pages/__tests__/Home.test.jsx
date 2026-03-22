import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import Home from '../Home';
import api from '../../api';

// Mock react-router-dom
const mockLocation = { hash: '' };
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useLocation: () => mockLocation,
  };
});

// Mock API
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock components
vi.mock('../../components/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button data-testid="prev-page" onClick={() => onPageChange(currentPage - 1)}>Prev</button>
      <span>{currentPage} / {totalPages}</span>
      <button data-testid="next-page" onClick={() => onPageChange(currentPage + 1)}>Next</button>
    </div>
  ),
}));

vi.mock('../../components/ScoreCard', () => ({
  default: ({ score, onDelete }) => (
    <div data-testid={`score-card-${score._id}`}>
      <span>{score.title}</span>
      <button onClick={() => onDelete(score._id)}>Delete</button>
    </div>
  ),
}));

vi.mock('../../components/AlbumCard', () => ({
  default: ({ album }) => (
    <div data-testid={`album-card-${album._id}`}>{album.title}</div>
  ),
}));

vi.mock('../../components/HeroSection', () => ({
  default: () => <div data-testid="hero-section">Hero</div>,
}));

const renderWithProviders = (component, user = null) => {
  const mockAuthContext = {
    user,
    login: vi.fn(),
    register: vi.fn(),
    logout: vi.fn(),
  };

  return render(
    <BrowserRouter>
      <AuthContext.Provider value={mockAuthContext}>
        {component}
      </AuthContext.Provider>
    </BrowserRouter>
  );
};

describe('Home Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Mock window.confirm
    vi.spyOn(window, 'confirm').mockImplementation(() => true);
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
    // Default API mocks
    api.get.mockImplementation((url) => {
      if (url.includes('/scores')) {
        return Promise.resolve({
          data: {
            scores: [
              { _id: '1', title: 'Score 1' },
              { _id: '2', title: 'Score 2' },
            ],
            totalPages: 1,
            page: 1,
          },
        });
      }
      if (url.includes('/albums')) {
        return Promise.resolve({
          data: {
            albums: [
              { _id: '1', title: 'Album 1' },
            ],
          },
        });
      }
      return Promise.resolve({ data: [] });
    });
  });

  describe('Initial Rendering', () => {
    it('renders hero section for non-logged-in users', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('hero-section')).toBeInTheDocument();
      });
    });

    it('does not render hero section for logged-in users', async () => {
      const user = { id: '1', username: 'test' };
      renderWithProviders(<Home />, user);

      await waitFor(() => {
        expect(screen.queryByTestId('hero-section')).not.toBeInTheDocument();
      });
    });

    it('displays loading state initially', () => {
      renderWithProviders(<Home />);

      expect(screen.getByText('common.loading')).toBeInTheDocument();
    });

    it('renders title correctly', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByText('home.title')).toBeInTheDocument();
      });
    });

    it('renders custom title when provided', async () => {
      renderWithProviders(<Home title="custom.title" />);

      await waitFor(() => {
        expect(screen.getByText('custom.title')).toBeInTheDocument();
      });
    });
  });

  describe('Data Fetching', () => {
    it('fetches and displays scores', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('score-card-1')).toBeInTheDocument();
        expect(screen.getByTestId('score-card-2')).toBeInTheDocument();
      });
    });

    it('fetches and displays albums when showAlbums is true', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => {
        expect(screen.getByTestId('album-card-1')).toBeInTheDocument();
      });
    });

    it('does not fetch albums when endpoint is not /scores', async () => {
      renderWithProviders(<Home endpoint="/other" />);

      await waitFor(() => {
        expect(api.get).not.toHaveBeenCalledWith(expect.stringContaining('/albums'));
      });
    });
  });

  describe('Search Functionality', () => {
    it('updates search input and triggers API call', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByPlaceholderText('common.search'));

      const searchInput = screen.getByPlaceholderText('common.search');
      fireEvent.change(searchInput, { target: { value: 'test search' } });

      // Wait for debounced API call
      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('search=test%20search')
        );
      }, { timeout: 500 });
    });

    it('resets page to 1 when search changes', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByPlaceholderText('common.search'));

      const searchInput = screen.getByPlaceholderText('common.search');
      fireEvent.change(searchInput, { target: { value: 'new search' } });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('page=1')
        );
      });
    });
  });

  describe('Tags Filtering', () => {
    it('applies tags filter on Enter key', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByTitle('Tags'));

      const tagsInput = screen.getByTitle('Tags');
      fireEvent.change(tagsInput, { target: { value: 'jazz, classical' } });
      fireEvent.keyDown(tagsInput, { key: 'Enter' });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('tags=jazz%2C%20classical')
        );
      });
    });

    it('applies tags filter on button click', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByTitle('Tags'));

      const tagsInput = screen.getByTitle('Tags');
      fireEvent.change(tagsInput, { target: { value: 'rock' } });

      const applyButton = screen.getByTitle('Apply');
      fireEvent.click(applyButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('tags=rock')
        );
      });
    });

    it('clears tags filter', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByTitle('Tags'));

      const tagsInput = screen.getByTitle('Tags');
      fireEvent.change(tagsInput, { target: { value: 'pop' } });

      const clearButton = screen.getByTitle('Clear');
      fireEvent.click(clearButton);

      expect(tagsInput.value).toBe('');
    });
  });

  describe('Score Deletion', () => {
    it('deletes score successfully', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByTestId('score-card-1'));

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      await waitFor(() => {
        expect(api.delete).toHaveBeenCalledWith('/scores/1');
        expect(screen.queryByTestId('score-card-1')).not.toBeInTheDocument();
      });
    });

    it('does not delete if user cancels confirmation', async () => {
      vi.spyOn(window, 'confirm').mockImplementation(() => false);

      renderWithProviders(<Home />);

      await waitFor(() => screen.getByTestId('score-card-1'));

      const deleteButton = screen.getByText('Delete');
      fireEvent.click(deleteButton);

      expect(api.delete).not.toHaveBeenCalled();
    });
  });

  describe('Sorting', () => {
    it('changes sort order', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByDisplayValue('date'));

      const sortSelect = screen.getByDisplayValue('date');
      fireEvent.change(sortSelect, { target: { value: 'title' } });

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('sortBy=title')
        );
      });
    });
  });

  describe('Pagination', () => {
    it('changes page via pagination controls', async () => {
      renderWithProviders(<Home />);

      await waitFor(() => screen.getByTestId('pagination'));

      const nextButton = screen.getByTestId('next-page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith(
          expect.stringContaining('page=2')
        );
      });
    });
  });

  describe('Error Handling', () => {
    it('handles API errors gracefully', async () => {
      api.get.mockRejectedValue(new Error('API Error'));

      renderWithProviders(<Home />);

      // Should not crash, loading should finish
      await waitFor(() => {
        expect(screen.queryByText('common.loading')).not.toBeInTheDocument();
      });
    });
  });
});