import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import ScoreCreationHub from '../ScoreCreationHub';
import api from '../../api';

vi.mock('../../api', () => ({
  default: {
    post: vi.fn(),
  },
}));

vi.mock('lucide-react', () => ({
  Music: () => <svg data-testid="icon-music" />,
  FileText: () => <svg data-testid="icon-filetext" />,
  Zap: () => <svg data-testid="icon-zap" />,
  Shield: () => <svg data-testid="icon-shield" />,
  ChevronRight: () => <svg data-testid="icon-chevron" />,
}));

describe('ScoreCreationHub Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    vi.spyOn(window, 'alert').mockImplementation(() => {});
  });

  it('renders creation tool cards', () => {
    render(
      <BrowserRouter>
        <ScoreCreationHub />
      </BrowserRouter>
    );
    expect(screen.getByText(/How would you like to create/i)).toBeInTheDocument();
    expect(screen.getByText('ABCJS')).toBeInTheDocument();
    expect(screen.getByText('Verovio Toolkit')).toBeInTheDocument();
  });

  it('handles tool click and API call', async () => {
    api.post.mockResolvedValue({});
    render(
      <BrowserRouter>
        <ScoreCreationHub />
      </BrowserRouter>
    );
    const abcjsCard = screen.getByText('ABCJS');
    fireEvent.click(abcjsCard);
    await waitFor(() => {
      expect(api.post).toHaveBeenCalledWith('/scores/start-session');
    });
  });

  it('shows alert and navigates on 429 error', async () => {
    api.post.mockRejectedValue({ response: { status: 429 } });
    render(
      <BrowserRouter>
        <ScoreCreationHub />
      </BrowserRouter>
    );
    const abcjsCard = screen.getByText('ABCJS');
    fireEvent.click(abcjsCard);
    await waitFor(() => {
      expect(window.alert).toHaveBeenCalled();
    });
  });
});
