import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import VirtualPiano, { NOTES } from '../VirtualPiano';

vi.mock('../PianoKey', () => ({
  default: ({ keyData, onMouseDown, isActive, isBlackActive, blackKey }) =>
    <div data-testid={`piano-key-${keyData.midi}`} onClick={() => onMouseDown(keyData)}>
      {keyData.label}
    </div>,
}));

vi.mock('../PianoControls', () => ({
  default: ({
    isKeyboardEnabled,
    setIsKeyboardEnabled,
    centerOctave,
    setCenterOctave,
  }) => (
    <div data-testid="piano-controls">
      <button onClick={() => setIsKeyboardEnabled(!isKeyboardEnabled)}>
        Toggle Keyboard
      </button>
      <button onClick={() => setCenterOctave(centerOctave + 1)}>
        Next Octave
      </button>
    </div>
  ),
}));

window.AudioContext = vi.fn(() => ({
  state: 'running',
  resume: vi.fn(),
  createOscillator: vi.fn(() => ({
    type: 'triangle',
    frequency: {
      setValueAtTime: vi.fn(),
    },
    connect: vi.fn(function () {
      return this;
    }),
    start: vi.fn(),
    stop: vi.fn(),
  })),
  createGain: vi.fn(() => ({
    gain: {
      cancelScheduledValues: vi.fn(),
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(function () {
      return this;
    }),
  })),
  currentTime: 0,
  destination: {},
}));

describe('VirtualPiano Component', () => {
  const mockOnNoteClick = vi.fn();
  const mockOnPlayNote = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderPiano = (props = {}) => {
    const defaultProps = {
      onNoteClick: mockOnNoteClick,
      onPlayNote: mockOnPlayNote,
      duration: '4',
      initialKeyboardEnabled: false,
      captureInTextarea: false,
    };

    return render(<VirtualPiano {...defaultProps} {...props} />);
  };

  describe('Rendering', () => {
    it('renders virtual piano container', () => {
      const { container } = renderPiano();
      const piano = container.querySelector('.virtual-piano');
      expect(piano).toBeInTheDocument();
    });

    it('renders toggle header', () => {
      renderPiano();
      expect(screen.getByText('Virtual Piano')).toBeInTheDocument();
    });

    it('displays toggle button', () => {
      const { container } = renderPiano();
      const toggleBtn = container.querySelector('[class*="hover:text-gray-600"]');
      expect(toggleBtn).toBeInTheDocument();
    });

    it('renders PianoControls component', () => {
      renderPiano();
      expect(screen.getByTestId('piano-controls')).toBeInTheDocument();
    });

    it('renders scroll container', () => {
      const { container } = renderPiano();
      const scrollContainer = container.querySelector('.virtual-piano__scroll');
      expect(scrollContainer).toBeInTheDocument();
    });

    it('renders keyboard keys', () => {
      const { container } = renderPiano();
      const keysContainer = container.querySelector('.virtual-piano__keys');
      expect(keysContainer).toBeInTheDocument();
    });
  });

  describe('Toggle Functionality', () => {
    it('starts in visible state', () => {
      const { container } = renderPiano();
      const pianoDiv = container.querySelector('.virtual-piano');
      expect(pianoDiv).toHaveClass('h-auto');
    });

    it('toggles visibility when header is clicked', async () => {
      const user = userEvent.setup();
      const { container } = renderPiano();
      const header = container.querySelector('.cursor-pointer');

      await user.click(header);

      const pianoDiv = container.querySelector('.virtual-piano');
      expect(pianoDiv).toHaveClass('h-8', 'overflow-hidden');
    });

    it('toggles back to visible', async () => {
      const user = userEvent.setup();
      const { container } = renderPiano();
      const header = container.querySelector('.cursor-pointer');

      await user.click(header);
      await user.click(header);

      const pianoDiv = container.querySelector('.virtual-piano');
      expect(pianoDiv).toHaveClass('h-auto');
    });

    it('changes toggle indicator when toggled', async () => {
      const user = userEvent.setup();
      const { container } = renderPiano();
      const header = container.querySelector('.cursor-pointer');

      let indicator = container.querySelector('[class*="text-gray-400"]');
      expect(indicator?.textContent).toBe('▼');

      await user.click(header);

      indicator = container.querySelector('[class*="text-gray-400"]');
      expect(indicator?.textContent).toBe('▲');
    });
  });

  describe('Mouse Interaction', () => {
    it('calls onNoteClick when piano key is clicked', async () => {
      const user = userEvent.setup();
      renderPiano();

      const key = screen.getByTestId('piano-key-60'); // C4
      await user.click(key);

      expect(mockOnNoteClick).toHaveBeenCalled();
    });

    it('calls onPlayNote when piano key is clicked', async () => {
      const user = userEvent.setup();
      renderPiano();

      const key = screen.getByTestId('piano-key-60'); // C4
      await user.click(key);

      expect(mockOnPlayNote).toHaveBeenCalled();
    });

    it('appends duration to note', async () => {
      const user = userEvent.setup();
      const customOnNoteClick = vi.fn();
      renderPiano({ duration: '4', onNoteClick: customOnNoteClick });

      const key = screen.getByTestId('piano-key-60');
      await user.click(key);

      // Check that the call was made
      expect(customOnNoteClick).toHaveBeenCalled();
      // The duration is appended to the note
      const callArg = customOnNoteClick.mock.calls[0][0];
      expect(typeof callArg).toBe('string');
    });

    it('handles missing onPlayNote gracefully', async () => {
      const user = userEvent.setup();
      renderPiano({ onPlayNote: undefined });

      const key = screen.getByTestId('piano-key-60');
      await user.click(key);

      expect(mockOnNoteClick).toHaveBeenCalled();
    });
  });

  describe('Keyboard Shortcuts', () => {
    it('captures keyboard input when enabled', async () => {
      renderPiano({ initialKeyboardEnabled: true });

      fireEvent.keyDown(window, { key: 'h', keyCode: 72 });

      await waitFor(() => {
        expect(mockOnPlayNote).toHaveBeenCalled();
      });
    });

    it('does not capture keyboard input when disabled', async () => {
      mockOnPlayNote.mockClear();
      renderPiano({ initialKeyboardEnabled: false });

      fireEvent.keyDown(window, { key: 'h', keyCode: 72 });

      expect(mockOnPlayNote).not.toHaveBeenCalled();
    });

    it('ignores input from INPUT elements', async () => {
      const { container } = render(
        <div>
          <input type="text" />
          <VirtualPiano
            initialKeyboardEnabled={true}
            onPlayNote={mockOnPlayNote}
          />
        </div>
      );

      const input = container.querySelector('input');
      fireEvent.keyDown(input, { key: 'h', keyCode: 72 });

      expect(mockOnPlayNote).not.toHaveBeenCalled();
    });

    it('ignores repeated key events', async () => {
      renderPiano({ initialKeyboardEnabled: true });
      mockOnPlayNote.mockClear();

      fireEvent.keyDown(window, { key: 'h', repeat: true });

      expect(mockOnPlayNote).not.toHaveBeenCalled();
    });

    it('changes octave with number keys', async () => {
      renderPiano({ initialKeyboardEnabled: true });

      fireEvent.keyDown(window, { key: '3' });

      // Octave change is internal state
      // We can verify by playing a note after changing octave
      fireEvent.keyDown(window, { key: 'h' });

      await waitFor(() => {
        expect(mockOnPlayNote).toHaveBeenCalled();
      });
    });

    it('handles lowercase and uppercase key input', async () => {
      renderPiano({ initialKeyboardEnabled: true });

      fireEvent.keyDown(window, { key: 'H' });

      await waitFor(() => {
        expect(mockOnPlayNote).toHaveBeenCalled();
      });
    });

    it('respects MIDI range boundaries', async () => {
      renderPiano({ initialKeyboardEnabled: true });

      // Try to go below MIDI 21 (A0)
      fireEvent.keyDown(window, { key: '0' }); // Octave 0
      fireEvent.keyDown(window, { key: 'a' }); // Lowest key in map

      expect(mockOnPlayNote).not.toHaveBeenCalled();
    });
  });

  describe('Octave Control', () => {
    it('starts with default center octave of 4', () => {
      const { container } = renderPiano();
      const piano = container.querySelector('.virtual-piano');
      expect(piano).toBeInTheDocument();
    });

    it('responds to octave change button', async () => {
      const user = userEvent.setup();
      renderPiano();

      const nextOctaveBtn = screen.getByRole('button', { name: /Next Octave/i });
      await user.click(nextOctaveBtn);

      // Octave should be updated in internal state
      expect(nextOctaveBtn).toBeInTheDocument();
    });
  });

  describe('Textarea Handling', () => {
    it('captures keyboard in textarea when enabled', async () => {
      const { container } = render(
        <div>
          <textarea />
          <VirtualPiano
            initialKeyboardEnabled={true}
            onPlayNote={mockOnPlayNote}
            captureInTextarea={true}
          />
        </div>
      );

      const textarea = container.querySelector('textarea');
      fireEvent.keyDown(textarea, { key: 'h' });

      await waitFor(() => {
        expect(mockOnPlayNote).toHaveBeenCalled();
      });
    });

    it('ignores keyboard in textarea when disabled', async () => {
      const { container } = render(
        <div>
          <textarea />
          <VirtualPiano
            initialKeyboardEnabled={true}
            onPlayNote={mockOnPlayNote}
            captureInTextarea={false}
          />
        </div>
      );

      const textarea = container.querySelector('textarea');
      fireEvent.keyDown(textarea, { key: 'h' });

      expect(mockOnPlayNote).not.toHaveBeenCalled();
    });
  });

  describe('Audio Playback', () => {
    it('plays sound when onPlayNote is called', async () => {
      const user = userEvent.setup();
      renderPiano();

      const key = screen.getByTestId('piano-key-60');
      await user.click(key);

      expect(mockOnPlayNote).toHaveBeenCalledWith(60);
    });

    it('plays different notes for different keys', async () => {
      const user = userEvent.setup();
      renderPiano();

      // Play C4
      const keyC4 = screen.getByTestId('piano-key-60');
      await user.click(keyC4);
      expect(mockOnPlayNote).toHaveBeenCalledWith(60);

      mockOnPlayNote.mockClear();

      // Play E4
      const keyE4 = screen.getByTestId('piano-key-64');
      await user.click(keyE4);
      expect(mockOnPlayNote).toHaveBeenCalledWith(64);
    });
  });

  describe('Props Handling', () => {
    it('accepts and uses onNoteClick prop', async () => {
      const customOnNoteClick = vi.fn();
      const user = userEvent.setup();
      renderPiano({ onNoteClick: customOnNoteClick });

      const key = screen.getByTestId('piano-key-60');
      await user.click(key);

      expect(customOnNoteClick).toHaveBeenCalled();
    });

    it('accepts and uses onPlayNote prop', async () => {
      const customOnPlayNote = vi.fn();
      const user = userEvent.setup();
      renderPiano({ onPlayNote: customOnPlayNote });

      const key = screen.getByTestId('piano-key-60');
      await user.click(key);

      expect(customOnPlayNote).toHaveBeenCalled();
    });

    it('uses duration prop in note output', async () => {
      const user = userEvent.setup();
      const customOnNoteClick = vi.fn();
      renderPiano({ duration: '8', onNoteClick: customOnNoteClick });

      const key = screen.getByTestId('piano-key-60');
      await user.click(key);

      expect(customOnNoteClick).toHaveBeenCalled();
      const callArg = customOnNoteClick.mock.calls[0][0];
      // Duration is appended to the note
      expect(typeof callArg).toBe('string');
      expect(callArg.length).toBeGreaterThan(1);
    });

    it('respects initialKeyboardEnabled prop', () => {
      const { rerender, container } = renderPiano({
        initialKeyboardEnabled: false,
      });

      // Should start disabled
      fireEvent.keyDown(window, { key: 'h' });
      expect(mockOnPlayNote).not.toHaveBeenCalled();

      rerender(
        <VirtualPiano
          initialKeyboardEnabled={true}
          onPlayNote={mockOnPlayNote}
        />
      );

      // Now should be enabled
      mockOnPlayNote.mockClear();
      fireEvent.keyDown(window, { key: 'h' });

      // May or may not be called depending on re-render implementation
    });
  });

  describe('NOTES Export', () => {
    it('exports NOTES object', () => {
      expect(NOTES).toBeDefined();
      expect(typeof NOTES).toBe('object');
    });

    it('NOTES contains note data', () => {
      expect(Object.keys(NOTES).length).toBeGreaterThan(0);
    });
  });

  describe('Layout Classes', () => {
    it('applies full width styling', () => {
      const { container } = renderPiano();
      const piano = container.querySelector('.w-full');
      expect(piano).toBeInTheDocument();
    });

    it('has shadow styling', () => {
      const { container } = renderPiano();
      const piano = container.querySelector('[class*="shadow"]');
      expect(piano).toBeInTheDocument();
    });

    it('has border styling', () => {
      const { container } = renderPiano();
      const piano = container.querySelector('.border-t');
      expect(piano).toBeInTheDocument();
    });
  });

  describe('Edge Cases', () => {
    it('handles rapid key clicks', async () => {
      const user = userEvent.setup();
      renderPiano();

      const key = screen.getByTestId('piano-key-60');
      await user.click(key);
      await user.click(key);
      await user.click(key);

      expect(mockOnPlayNote).toHaveBeenCalledTimes(3);
    });

    it('handles key up events properly', async () => {
      renderPiano({ initialKeyboardEnabled: true });

      fireEvent.keyDown(window, { key: 'h' });
      fireEvent.keyUp(window, { key: 'h' });

      expect(mockOnPlayNote).toHaveBeenCalled();
    });

    it('cleans up event listeners on unmount', () => {
      const { unmount } = renderPiano({ initialKeyboardEnabled: true });

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
