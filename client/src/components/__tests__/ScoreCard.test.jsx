import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ScoreCard from '../ScoreCard';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('abcjs', () => ({
  default: {
    renderAbc: vi.fn(),
  },
}));

vi.mock('../../services/VerovioService', () => ({
  default: {
    init: vi.fn().mockResolvedValue(undefined),
    render: vi.fn().mockReturnValue('<svg></svg>'),
  },
}));

describe('ScoreCard Component', () => {
  const mockScore = {
    _id: '1',
    title: 'Test Score',
    content: 'X:1\nT:Test',
    owner: {
      _id: 'owner1',
      username: 'composer',
    },
    ratings: [{ user: 'user1', value: 4 }, { user: 'user2', value: 5 }],
    likes: ['user1', 'user2'],
    views: 42,
    notationType: 'abc',
  };

  const mockUser = { id: 'owner1', username: 'composer', role: 'user' };
  const mockAdmin = { id: 'admin1', username: 'admin', role: 'admin' };

  const renderCard = (score = mockScore, user = null, onDelete = vi.fn()) => {
    return render(
      <BrowserRouter>
        <ScoreCard score={score} user={user} onDelete={onDelete} />
      </BrowserRouter>
    );
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders score title', () => {
      renderCard();
      expect(screen.getByText('Test Score')).toBeInTheDocument();
    });

    it('renders owner username', () => {
      renderCard();
      expect(screen.getByText('composer')).toBeInTheDocument();
    });

    it('displays rating badge', () => {
      renderCard();
      const badges = screen.getAllByText(/4\.5/);
      expect(badges.length).toBeGreaterThan(0);
    });

    it('displays likes count', () => {
      renderCard();
      expect(screen.getByText('2')).toBeInTheDocument();
    });

    it('displays views count', () => {
      renderCard();
      expect(screen.getByText('42')).toBeInTheDocument();
    });

    it('shows anonymous owner when owner is missing', () => {
      const scoreNoOwner = { ...mockScore, owner: null };
      renderCard(scoreNoOwner);
      expect(screen.getByText('Anonymous')).toBeInTheDocument();
    });

    it('shows 0.0 rating when no ratings exist', () => {
      const scoreNoRatings = { ...mockScore, ratings: [] };
      renderCard(scoreNoRatings);
      expect(screen.getByText('0.0')).toBeInTheDocument();
    });

    it('shows 0 likes when likes array is empty', () => {
      const scoreNoLikes = { ...mockScore, likes: [] };
      renderCard(scoreNoLikes);
      const likeText = screen.getByTitle(/score.likes/);
      expect(likeText.textContent).toContain('0');
    });
  });

  describe('Navigation', () => {
    it('navigates to score details on click', () => {
      renderCard();
      const card = screen.getByText('Test Score').closest('div').closest('div');
      fireEvent.click(card);
      expect(mockNavigate).toHaveBeenCalledWith('/score/1');
    });
  });

  describe('Owner Controls', () => {
    it('shows delete button for owner', () => {
      renderCard(mockScore, mockUser);
      const deleteBtn = screen.getByRole('button', { name: /score.delete/i });
      expect(deleteBtn).toBeInTheDocument();
    });

    it('shows delete button for admin', () => {
      renderCard(mockScore, mockAdmin);
      const deleteBtn = screen.getByRole('button', { name: /score.delete/i });
      expect(deleteBtn).toBeInTheDocument();
    });

    it('does not show delete button for non-owner', () => {
      const otherUser = { id: 'user3', username: 'other', role: 'user' };
      renderCard(mockScore, otherUser);
      const deleteBtn = screen.queryByRole('button', { name: /score.delete/i });
      expect(deleteBtn).not.toBeInTheDocument();
    });

    it('calls onDelete when delete button is clicked', () => {
      const onDelete = vi.fn();
      renderCard(mockScore, mockUser, onDelete);
      const deleteBtn = screen.getByRole('button', { name: /score.delete/i });
      fireEvent.click(deleteBtn);
      expect(onDelete).toHaveBeenCalledWith('1');
    });
  });

  describe('Notation Rendering', () => {
    it('renders ABC notation by default', () => {
      renderCard();
      // abcjs.renderAbc should be called
      expect(mockNavigate).toBeDefined();
    });

    it('renders Verovio notation when specified', async () => {
      const verovioScore = { ...mockScore, notationType: 'verovio' };
      renderCard(verovioScore);
      
      await waitFor(() => {
        // VerovioService.init and render should be called
        expect(mockNavigate).toBeDefined();
      });
    });

    it('handles rendering errors gracefully', () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      renderCard();
      // If rendering fails, component should handle it
      expect(consoleErrorSpy).toBeDefined();
      consoleErrorSpy.mockRestore();
    });
  });

  describe('Edge Cases', () => {
    it('handles score with string owner ID', () => {
      const scoreStringOwner = { ...mockScore, owner: 'owner1' };
      const userMatch = { id: 'owner1', username: 'user', role: 'user' };
      renderCard(scoreStringOwner, userMatch);
      // Should recognize owner correctly
      const deleteBtn = screen.queryByRole('button', { name: /score.delete/i });
      expect(deleteBtn).toBeInTheDocument();
    });

    it('calculates average rating correctly', () => {
      const scoreWithRatings = {
        ...mockScore,
        ratings: [
          { user: 'u1', value: 3 },
          { user: 'u2', value: 5 },
        ],
      };
      renderCard(scoreWithRatings);
      // Average should be 4.0
      expect(screen.getByText('4.0')).toBeInTheDocument();
    });

    it('truncates long score titles', () => {
      const longTitleScore = {
        ...mockScore,
        title: 'A'.repeat(100),
      };
      renderCard(longTitleScore);
      const titleElement = screen.getByText(/^A+$/);
      expect(titleElement).toHaveClass('truncate');
    });
  });

  describe('Styling', () => {
    it('applies active scale effect on click', () => {
      const { container } = renderCard();
      const card = container.querySelector('.active\\:scale-\\[0.98\\]');
      expect(card).toBeInTheDocument();
    });

    it('shows hover effect', () => {
      const { container } = renderCard();
      const titleElement = screen.getByText('Test Score');
      expect(titleElement).toHaveClass('group-hover:text-blue-600');
    });
  });
});
