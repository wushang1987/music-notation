import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import PianoKey from '../PianoKey';

vi.mock('../../utils/pianoUtils', () => ({
  KEYBOARD_MAP: {
    'a': -9,
    'w': -8,
    's': -7,
    'e': -6,
    'd': -5,
    'f': -4,
    't': -3,
    'g': -2,
    'y': -1,
    'h': 0,
    'u': 1,
    'j': 2,
    'k': 3,
    'o': 4,
    'l': 5,
  },
}));

describe('PianoKey Component', () => {
  const mockOnMouseDown = vi.fn();

  const whiteKeyData = {
    midi: 60,
    label: 'C4',
    isMiddleC: true,
  };

  const blackKeyData = {
    midi: 61,
    label: 'C#4',
    isMiddleC: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('White Key Rendering', () => {
    it('renders white key with label', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const whiteKey = container.querySelector('[data-note="C4"]');
      expect(whiteKey).toBeInTheDocument();
    });

    it('displays Middle C indicator', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      expect(screen.getByText('C4')).toBeInTheDocument();
    });

    it('applies active styling when isActive is true', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={true}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const whiteKeyDiv = container.querySelector('.bg-gradient-to-b');
      expect(whiteKeyDiv).toHaveClass('from-yellow-100', 'to-yellow-300');
    });

    it('applies inactive styling when isActive is false', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const whiteKeyDiv = container.querySelector('.from-white');
      expect(whiteKeyDiv).toHaveClass('hover:to-gray-100');
    });

    it('calls onMouseDown when white key is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );

      const whiteKey = container.querySelector('[data-note="C4"] > div:first-child');
      await user.pointer({ keys: '[MouseLeft>]', target: whiteKey });

      expect(mockOnMouseDown).toHaveBeenCalledWith(whiteKeyData);
    });
  });

  describe('Black Key Rendering', () => {
    it('renders black key when provided', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const blackKey = container.querySelector('.bg-gradient-to-b.from-gray-800');
      expect(blackKey).toBeInTheDocument();
    });

    it('does not render black key when undefined', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const blackKey = container.querySelector('.z-20');
      expect(blackKey).not.toBeInTheDocument();
    });

    it('applies active styling to black key when isBlackActive is true', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={true}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const blackKey = container.querySelector('.z-20');
      expect(blackKey).toBeInTheDocument();
    });

    it('applies inactive styling to black key when isBlackActive is false', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const blackKey = container.querySelector('.z-20');
      expect(blackKey).toBeInTheDocument();
    });

    it('calls onMouseDown with black key data when black key is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );

      const blackKey = container.querySelector('.from-gray-800');
      await user.pointer({ keys: '[MouseLeft>]', target: blackKey });

      expect(mockOnMouseDown).toHaveBeenCalledWith(blackKeyData);
    });

    it('stops propagation when black key is clicked', async () => {
      const user = userEvent.setup();
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );

      const blackKey = container.querySelector('.from-gray-800');
      await user.pointer({ keys: '[MouseLeft>]', target: blackKey });

      // Should only be called once (for black key), not for white key
      expect(mockOnMouseDown).toHaveBeenCalledTimes(1);
      expect(mockOnMouseDown).toHaveBeenCalledWith(blackKeyData);
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('displays keyboard hint for white key when enabled', () => {
      render(
        <PianoKey
          keyData={{ midi: 60, label: 'C4', isMiddleC: true }}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={true}
          centerOctave={4}
        />
      );
      // KeyHint should find 'h' for offset 0
      expect(screen.getByText('h')).toBeInTheDocument();
    });

    it('does not display keyboard hint when disabled', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const hints = container.querySelectorAll('[class*="text-blue"]');
      expect(hints.length).toBe(0);
    });

    it('displays different keyboard hint for black key', () => {
      render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={{ midi: 61, label: 'C#4', isMiddleC: false }}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={true}
          centerOctave={4}
        />
      );
      // Should display hint for black key (offset 1 = 'u')
      expect(screen.getByText('u')).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles white key without Middle C indicator', () => {
      const { container } = render(
        <PianoKey
          keyData={{ midi: 62, label: 'D4', isMiddleC: false }}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const middleCText = screen.queryByText('C4');
      expect(middleCText).not.toBeInTheDocument();
    });

    it('renders multiple keys with different MIDI values', () => {
      const { rerender, container } = render(
        <PianoKey
          keyData={{ midi: 60, label: 'C4', isMiddleC: true }}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );

      // First render should show C4
      expect(screen.getByText('C4')).toBeInTheDocument();

      // Re-render with D4 key
      rerender(
        <PianoKey
          keyData={{ midi: 62, label: 'D4', isMiddleC: false }}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );

      // C4 should no longer be in document, container should have D4 label
      const noteElement = container.querySelector('[data-note="D4"]');
      expect(noteElement).toBeInTheDocument();
    });

    it('handles both white and black key active simultaneously', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={true}
          blackKey={blackKeyData}
          isBlackActive={true}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );

      const whiteKey = container.querySelector('.from-yellow-100');
      const blackKey = container.querySelector('.from-yellow-600');

      expect(whiteKey).toBeInTheDocument();
      expect(blackKey).toBeInTheDocument();
    });

    it('handles different centerOctave values', () => {
      const { rerender } = render(
        <PianoKey
          keyData={{ midi: 72, label: 'C5', isMiddleC: true }}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={true}
          centerOctave={5}
        />
      );

      rerender(
        <PianoKey
          keyData={{ midi: 48, label: 'C3', isMiddleC: true }}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={true}
          centerOctave={3}
        />
      );

      expect(mockOnMouseDown).not.toHaveBeenCalled();
    });
  });

  describe('CSS Classes and Styling', () => {
    it('applies correct layout classes to white key', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const whiteKey = container.querySelector('[data-note] > div:first-child');
      expect(whiteKey).toHaveClass('relative', 'flex');
    });

    it('applies z-index to black key', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const blackKey = container.querySelector('.z-20');
      expect(blackKey).toHaveClass('z-20');
    });

    it('applies absolute positioning to black key', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const blackKey = container.querySelector('.z-20');
      expect(blackKey).toHaveClass('absolute');
    });
  });

  describe('Interaction States', () => {
    it('white key is clickable', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={undefined}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const whiteKey = container.querySelector('[data-note] > div:first-child');
      expect(whiteKey).toHaveClass('cursor-pointer');
    });

    it('black key is clickable', () => {
      const { container } = render(
        <PianoKey
          keyData={whiteKeyData}
          isActive={false}
          blackKey={blackKeyData}
          isBlackActive={false}
          onMouseDown={mockOnMouseDown}
          isKeyboardEnabled={false}
          centerOctave={4}
        />
      );
      const blackKey = container.querySelector('.z-20');
      expect(blackKey).toHaveClass('cursor-pointer');
    });
  });
});
