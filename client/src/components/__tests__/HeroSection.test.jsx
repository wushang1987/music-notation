import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import HeroSection from '../HeroSection';

const mockNavigate = vi.fn();

vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

describe('HeroSection Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderHeroSection = () => {
    return render(
      <BrowserRouter>
        <HeroSection />
      </BrowserRouter>
    );
  };

  describe('Rendering', () => {
    it('renders hero title', () => {
      renderHeroSection();
      expect(screen.getByText('hero.title')).toBeInTheDocument();
    });

    it('renders hero subtitle', () => {
      renderHeroSection();
      expect(screen.getByText('hero.subtitle')).toBeInTheDocument();
    });

    it('renders AI generation section', () => {
      renderHeroSection();
      expect(screen.getByText('hero.ai.title')).toBeInTheDocument();
    });

    it('displays AI beta badge', () => {
      renderHeroSection();
      expect(screen.getByText('hero.ai.beta')).toBeInTheDocument();
    });

    it('shows step-by-step instructions', () => {
      renderHeroSection();
      expect(screen.getByText('hero.ai.step1.title')).toBeInTheDocument();
      expect(screen.getByText('hero.ai.step2.title')).toBeInTheDocument();
      expect(screen.getByText('hero.ai.step3.title')).toBeInTheDocument();
    });
  });

  describe('AI Prompt Input', () => {
    it('renders textarea for AI prompt', () => {
      renderHeroSection();
      const textarea = screen.getByPlaceholderText('hero.ai.placeholder');
      expect(textarea).toBeInTheDocument();
    });

    it('updates prompt state on input change', () => {
      renderHeroSection();
      const textarea = screen.getByPlaceholderText('hero.ai.placeholder');
      fireEvent.change(textarea, { target: { value: 'Generate a waltz' } });
      expect(textarea).toHaveValue('Generate a waltz');
    });

    it('accepts multiline input', () => {
      renderHeroSection();
      const textarea = screen.getByPlaceholderText('hero.ai.placeholder');
      fireEvent.change(textarea, { target: { value: 'Line 1\nLine 2' } });
      expect(textarea).toHaveValue('Line 1\nLine 2');
    });
  });

  describe('Generate Button', () => {
    it('renders generate button', () => {
      renderHeroSection();
      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find((btn) => btn.querySelector('svg'));
      expect(generateButton).toBeInTheDocument();
    });

    it('navigates with prompt when generate button is clicked', async () => {
      const user = userEvent.setup();
      renderHeroSection();
      const textarea = screen.getByPlaceholderText('hero.ai.placeholder');
      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find((btn) => btn.querySelector('svg'));

      fireEvent.change(textarea, { target: { value: 'Generate a folk tune' } });
      await user.click(generateButton);

      expect(mockNavigate).toHaveBeenCalledWith('/create/abcjs', {
        state: { prompt: 'Generate a folk tune' },
      });
    });

    it('does not navigate with empty prompt', async () => {
      const user = userEvent.setup();
      renderHeroSection();
      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find((btn) => btn.querySelector('svg'));

      await user.click(generateButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });

    it('does not navigate with whitespace-only prompt', async () => {
      const user = userEvent.setup();
      renderHeroSection();
      const textarea = screen.getByPlaceholderText('hero.ai.placeholder');
      const buttons = screen.getAllByRole('button');
      const generateButton = buttons.find((btn) => btn.querySelector('svg'));

      fireEvent.change(textarea, { target: { value: '   ' } });
      await user.click(generateButton);

      expect(mockNavigate).not.toHaveBeenCalled();
    });
  });

  describe('Quick Start Links', () => {
    it('displays get started link', () => {
      renderHeroSection();
      const getStartedLink = screen.getByRole('link', { name: /hero.getStarted/i });
      expect(getStartedLink).toBeInTheDocument();
    });

    it('get started link has correct href', () => {
      renderHeroSection();
      const getStartedLink = screen.getByRole('link', { name: /hero.getStarted/i });
      expect(getStartedLink).toHaveAttribute('href', '/create');
    });

    it('displays explore trending button', () => {
      renderHeroSection();
      const buttons = screen.getAllByRole('button');
      const exploreTrendingBtn = buttons.find((btn) =>
        btn.textContent.includes('hero.exploreTrending')
      );
      expect(exploreTrendingBtn).toBeInTheDocument();
    });
  });

  describe('Visual Elements', () => {
    it('includes animated gradient background', () => {
      const { container } = renderHeroSection();
      const gradient = container.querySelector('.hero-gradient');
      expect(gradient).toBeInTheDocument();
    });

    it('includes floating orbs', () => {
      const { container } = renderHeroSection();
      const orbs = container.querySelectorAll('.orb');
      expect(orbs.length).toBeGreaterThan(0);
    });

    it('includes music notes animation', () => {
      const { container } = renderHeroSection();
      const notes = container.querySelectorAll('.music-note');
      expect(notes.length).toBeGreaterThan(0);
    });

    it('includes wave animations', () => {
      const { container } = renderHeroSection();
      const waves = container.querySelectorAll('.wave');
      expect(waves.length).toBeGreaterThan(0);
    });
  });

  describe('Accessibility', () => {
    it('has proper semantic structure', () => {
      const { container } = renderHeroSection();
      const headings = container.querySelectorAll('h1, h2');
      expect(headings.length).toBeGreaterThan(0);
    });

    it('textarea is accessible', () => {
      renderHeroSection();
      const textarea = screen.getByPlaceholderText('hero.ai.placeholder');
      expect(textarea).toBeInTheDocument();
    });

    it('buttons are present and accessible', () => {
      renderHeroSection();
      const buttons = screen.getAllByRole('button');
      expect(buttons.length).toBeGreaterThan(0);
    });
  });

  describe('Responsive Design', () => {
    it('has responsive layout classes', () => {
      const { container } = renderHeroSection();
      const responsiveElement = container.querySelector('.md\\:text-7xl');
      expect(responsiveElement).toBeTruthy();
    });
  });

  describe('State Management', () => {
    it('maintains prompt state independently from navigation', () => {
      renderHeroSection();
      const input = screen.getByPlaceholderText(/hero.ai.placeholder/i);

      fireEvent.change(input, { target: { value: 'First prompt' } });
      expect(input).toHaveValue('First prompt');

      fireEvent.change(input, { target: { value: 'Second prompt' } });
      expect(input).toHaveValue('Second prompt');
    });
  });
});
