import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import React from 'react';
import { BrowserRouter } from 'react-router-dom';
import VerovioEditor from '../VerovioEditor';
import api from '../../api';

vi.mock('../../api', () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
  },
}));

vi.mock('../../services/VerovioService', () => ({
  default: {
    render: vi.fn().mockReturnValue('<svg></svg>'),
  },
}));

vi.mock('../../components/Verovio/RibbonPalette', () => ({
  default: () => <div data-testid="ribbon-palette">RibbonPalette</div>,
}));
vi.mock('../../components/Verovio/MetadataPanel', () => ({
  default: () => <div data-testid="metadata-panel">MetadataPanel</div>,
}));
vi.mock('../../components/Verovio/ScoreViewer', () => ({
  default: () => <div data-testid="score-viewer">ScoreViewer</div>,
}));
vi.mock('../../components/Verovio/FloatingToolbar', () => ({
  default: () => <div data-testid="floating-toolbar">FloatingToolbar</div>,
}));

const renderWithRouter = (component) => {
  return render(
    <BrowserRouter>
      {component}
    </BrowserRouter>
  );
};

describe('VerovioEditor Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('renders editor UI elements', () => {
    renderWithRouter(<VerovioEditor />);
    expect(screen.getByTestId('ribbon-palette')).toBeInTheDocument();
    expect(screen.getByTestId('metadata-panel')).toBeInTheDocument();
    expect(screen.getByTestId('score-viewer')).toBeInTheDocument();
    expect(screen.getByTestId('floating-toolbar')).toBeInTheDocument();
  });

  it('handles title input', () => {
    renderWithRouter(<VerovioEditor />);
    const titleInput = screen.getByDisplayValue('Untitled Score');
    fireEvent.change(titleInput, { target: { value: 'Symphony No. 1' } });
    expect(titleInput.value).toBe('Symphony No. 1');
  });

  it('shows loading state if isEdit', () => {
    // Simulate edit mode by setting id param
    window.history.pushState({}, '', '/edit/123');
    renderWithRouter(<VerovioEditor />);
    // Should show loading spinner or similar (if implemented)
    // This is a placeholder, adjust as needed
    // expect(screen.getByText(/loading/i)).toBeInTheDocument();
  });
});
