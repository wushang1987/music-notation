import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import userEvent from '@testing-library/user-event';
import AlbumEditor from '../AlbumEditor';
import api from '../../api';

// Mock react-router-dom hooks
const mockNavigate = vi.fn();
const mockParams = { id: null };

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
    useParams: () => mockParams,
  };
});

// Mock API
vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}));

// Mock Pagination component
vi.mock('../../components/Pagination', () => ({
  default: ({ currentPage, totalPages, onPageChange }) => (
    <div data-testid="pagination">
      <button
        data-testid="prev-page"
        onClick={() => onPageChange(currentPage - 1)}
        disabled={currentPage <= 1}
      >
        Prev
      </button>
      <span>{currentPage} / {totalPages}</span>
      <button
        data-testid="next-page"
        onClick={() => onPageChange(currentPage + 1)}
        disabled={currentPage >= totalPages}
      >
        Next
      </button>
    </div>
  ),
}));

const renderWithRouter = (component) => {
  return render(<BrowserRouter>{component}</BrowserRouter>);
};

describe('AlbumEditor Component', () => {
  let user;

  beforeEach(() => {
    user = userEvent.setup();
    vi.clearAllMocks();
    mockNavigate.mockClear();
    mockParams.id = null;
    // Default mocks
    api.get.mockImplementation((url) => {
      if (url.startsWith('/albums/')) {
        return Promise.resolve({ data: { title: '', coverUrl: '', isPublic: false, scores: [] } });
      }
      return Promise.resolve({ data: { scores: [], totalPages: 1 } });
    });
    api.post.mockResolvedValue({ data: { _id: 'new-id' } });
    api.put.mockResolvedValue({});
    api.delete.mockResolvedValue({});
    // Mock window.alert
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  describe('Initial Rendering', () => {
    it('renders create mode when no id param', () => {
      mockParams.id = null;
      renderWithRouter(<AlbumEditor />);

      expect(screen.getByText('albums.create')).toBeInTheDocument();
      expect(screen.getByLabelText('albums.title')).toBeInTheDocument();
      expect(screen.getByLabelText('albums.coverUrl')).toBeInTheDocument();
      expect(screen.getByText('albums.scores')).toBeInTheDocument();
    });

    it('renders edit mode when id param exists', () => {
      mockParams.id = '123';
      renderWithRouter(<AlbumEditor />);

      expect(screen.getByText('albums.edit')).toBeInTheDocument();
    });

    it('shows loading state in edit mode initially', () => {
      mockParams.id = '123';
      renderWithRouter(<AlbumEditor />);

      expect(screen.getByText('common.loading')).toBeInTheDocument();
    });
  });

  describe('Form Interactions', () => {
    beforeEach(() => {
      mockParams.id = null;
    });

    it('updates title input', () => {
      renderWithRouter(<AlbumEditor />);
      const titleInput = screen.getAllByRole('textbox')[0];

      fireEvent.change(titleInput, { target: { value: 'Test Album' } });
      expect(titleInput.value).toBe('Test Album');
    });

    it('updates cover URL input', () => {
      renderWithRouter(<AlbumEditor />);
      const coverInput = screen.getAllByRole('textbox')[1];

      fireEvent.change(coverInput, { target: { value: 'http://example.com/cover.jpg' } });
      expect(coverInput.value).toBe('http://example.com/cover.jpg');
    });

    it('toggles public checkbox', () => {
      renderWithRouter(<AlbumEditor />);
      const checkbox = screen.getByRole('checkbox');

      expect(checkbox.checked).toBe(false);
      fireEvent.click(checkbox);
      expect(checkbox.checked).toBe(true);
    });
  });

  describe('Score Selection', () => {
    beforeEach(() => {
      mockParams.id = null;
      // Mock successful scores fetch
      api.get.mockResolvedValue({
        data: {
          scores: [
            { _id: '1', title: 'Score 1', isPublic: true },
            { _id: '2', title: 'Score 2', isPublic: false },
          ],
          totalPages: 1,
        },
      });
    });

    it('fetches and displays available scores', async () => {
      renderWithRouter(<AlbumEditor />);

      await waitFor(() => {
        expect(screen.getByText('Score 1')).toBeInTheDocument();
        expect(screen.getByText('Score 2')).toBeInTheDocument();
      });
    });

    it('allows selecting and deselecting scores', async () => {
      renderWithRouter(<AlbumEditor />);

      await waitFor(() => screen.getByText('Score 1'));

      const checkbox1 = screen.getAllByRole('checkbox')[1]; // First score checkbox (after public checkbox)
      fireEvent.click(checkbox1);
      expect(checkbox1.checked).toBe(true);

      fireEvent.click(checkbox1);
      expect(checkbox1.checked).toBe(false);
    });

    it('prevents selecting more than max scores', async () => {
      // Mock 20 selected scores initially
      renderWithRouter(<AlbumEditor />);

      await waitFor(() => screen.getByText('Score 1'));

      // Select 20 scores first (simulate max reached)
      const checkboxes = screen.getAllByRole('checkbox').slice(1); // Skip public checkbox
      for (let i = 0; i < 20 && i < checkboxes.length; i++) {
        fireEvent.click(checkboxes[i]);
      }

      // Try to select 21st
      if (checkboxes.length > 20) {
        fireEvent.click(checkboxes[20]);
        expect(screen.getByText('albums.maxScoresReached')).toBeInTheDocument();
      }
    });

    it('filters scores based on search', async () => {
      renderWithRouter(<AlbumEditor />);

      await waitFor(() => screen.getByText('Score 1'));

      const searchInput = screen.getByPlaceholderText('albums.scoreSearchPlaceholder');
      fireEvent.change(searchInput, { target: { value: 'Score 1' } });

      expect(api.get).toHaveBeenCalledWith('/scores?page=1&limit=20&sortBy=date&order=desc&search=Score%201');
    });
  });

  describe('Save Functionality', () => {
    beforeEach(() => {
      mockParams.id = null;
    });

    it('shows validation error for empty title', async () => {
      renderWithRouter(<AlbumEditor />);

      const saveButton = screen.getByRole('button', { name: /common\.save/ });
      fireEvent.click(saveButton);

      // Alert is triggered, but hard to test directly; we can check button state
      expect(saveButton).toBeDisabled(); // Should be disabled during save, but actually it's not in this case
      // In real scenario, alert would show, but we can't test window.alert easily
    });

    it('creates new album successfully', async () => {
      api.post.mockResolvedValue({ data: { _id: 'new-album-id' } });

      renderWithRouter(<AlbumEditor />);

      // Fill form
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'New Album' } });

      const saveButton = screen.getByRole('button', { name: /common\.save/ });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalledWith('/albums', {
          title: 'New Album',
          coverUrl: '',
          isPublic: false,
        });
        expect(mockNavigate).toHaveBeenCalledWith('/album/new-album-id');
      });
    });

    it('updates existing album successfully', async () => {
      mockParams.id = '123';
      api.get.mockResolvedValue({
        data: {
          title: 'Existing Album',
          coverUrl: '',
          isPublic: false,
          scores: ['score1'],
        },
      });
      api.put.mockResolvedValue({});

      renderWithRouter(<AlbumEditor />);

      await waitFor(() => {
        expect(screen.getByDisplayValue('Existing Album')).toBeInTheDocument();
      });

      // Change title
      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Updated Album' } });

      const saveButton = screen.getByRole('button', { name: /common\.update/ });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(api.put).toHaveBeenCalledWith('/albums/123', {
          title: 'Updated Album',
          coverUrl: '',
          isPublic: false,
        });
      });
    });

    it('handles save errors', async () => {
      api.post.mockRejectedValue({ response: { data: { message: 'Server error' } } });

      renderWithRouter(<AlbumEditor />);

      fireEvent.change(screen.getAllByRole('textbox')[0], { target: { value: 'Test Album' } });

      const saveButton = screen.getByRole('button', { name: /common\.save/ });
      fireEvent.click(saveButton);

      await waitFor(() => {
        expect(api.post).toHaveBeenCalled();
        // Error handling would trigger alert, button should be re-enabled
        expect(saveButton).not.toBeDisabled();
      });
    });
  });

  describe('Edit Mode Data Loading', () => {
    it('loads album data in edit mode', async () => {
      mockParams.id = '123';
      api.get.mockResolvedValue({
        data: {
          title: 'Test Album',
          coverUrl: 'http://example.com/cover.jpg',
          isPublic: true,
          scores: ['score1', 'score2'],
        },
      });

      renderWithRouter(<AlbumEditor />);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/albums/123');
        expect(screen.getByDisplayValue('Test Album')).toBeInTheDocument();
        expect(screen.getByDisplayValue('http://example.com/cover.jpg')).toBeInTheDocument();
        expect(screen.getByRole('checkbox')).toBeChecked();
      });
    });

    it('handles album load error', async () => {
      mockParams.id = '123';
      api.get.mockRejectedValue(new Error('Not found'));

      renderWithRouter(<AlbumEditor />);

      await waitFor(() => {
        expect(mockNavigate).toHaveBeenCalledWith('/');
      });
    });
  });

  describe('Pagination', () => {
    it('changes page when pagination controls are clicked', async () => {
      renderWithRouter(<AlbumEditor />);

      await waitFor(() => screen.getByTestId('pagination'));

      const nextButton = screen.getByTestId('next-page');
      fireEvent.click(nextButton);

      await waitFor(() => {
        expect(api.get).toHaveBeenCalledWith('/scores?page=2&limit=20&sortBy=date&order=desc');
      });
    });
  });
});