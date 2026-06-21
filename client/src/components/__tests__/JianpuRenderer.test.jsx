import { render, screen, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import JianpuRenderer from '../JianpuRenderer';

vi.mock('../../utils/abc2svg', () => ({
  renderJianpu: vi.fn((containerId, abc) => {
    const container = document.getElementById(containerId);
    if (container) {
      container.innerHTML = '<svg><text>Jianpu Output</text></svg>';
    }
  }),
}));

import { renderJianpu } from '../../utils/abc2svg';

describe('JianpuRenderer Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Rendering', () => {
    it('renders container with correct classes', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const wrapper = container.querySelector(
        '.w-full.overflow-x-auto.min-h-100.bg-white.p-4'
      );
      expect(wrapper).toBeInTheDocument();
    });

    it('renders jianpu output div', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const output = container.querySelector('.jianpu-output');
      expect(output).toBeInTheDocument();
    });

    it('generates unique container IDs on mount', () => {
      const { container: container1 } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test1" />
      );
      const id1 = container1.querySelector('.jianpu-output')?.id;
      expect(id1).toBeTruthy();
      expect(id1).toMatch(/^jianpu-container-/);
    });

    it('applies responsive styling classes', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const wrapper = container.querySelector('.w-full');
      expect(wrapper).toHaveClass('md:rounded-md', 'md:shadow-sm', 'md:border');
    });
  });

  describe('ABC Notation Rendering', () => {
    it('calls renderJianpu with ABC notation when provided', async () => {
      const abcNotation = '1 2 3 4';
      render(<JianpuRenderer abcNotation={abcNotation} title="Test" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          abcNotation
        );
      });
    });

    it('does not call renderJianpu when abcNotation is empty', async () => {
      render(<JianpuRenderer abcNotation="" title="Test" />);

      await waitFor(() => {
        expect(renderJianpu).not.toHaveBeenCalled();
      });
    });

    it('does not call renderJianpu when abcNotation is null', async () => {
      render(<JianpuRenderer abcNotation={null} title="Test" />);

      await waitFor(() => {
        expect(renderJianpu).not.toHaveBeenCalled();
      });
    });

    it('re-renders when abcNotation changes', async () => {
      const { rerender } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          '1 2 3'
        );
      });

      vi.clearAllMocks();

      rerender(<JianpuRenderer abcNotation="4 5 6" title="Test" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          '4 5 6'
        );
      });
    });
  });

  describe('Props Handling', () => {
    it('accepts abcNotation prop', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      expect(container.querySelector('.jianpu-output')).toBeInTheDocument();
    });

    it('accepts title prop', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="My Test Title" />
      );
      expect(container.querySelector('.jianpu-output')).toBeInTheDocument();
    });

    it('handles complex ABC notation', async () => {
      const complexAbc = `X:1
T:Test Title
M:4/4
L:1/8
K:G
G4 A2 B2|c4 d4|`;

      render(<JianpuRenderer abcNotation={complexAbc} title="Complex" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          complexAbc
        );
      });
    });

    it('handles multiline ABC notation', async () => {
      const multilineAbc = `1 2 3
4 5 6
7 8 9`;

      render(<JianpuRenderer abcNotation={multilineAbc} title="Multiline" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          multilineAbc
        );
      });
    });
  });

  describe('Global Styles', () => {
    it('renders global style tag', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const styleTag = container.querySelector('style');
      expect(styleTag).toBeInTheDocument();
    });

    it('style includes jianpu-output SVG rules', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const styleTag = container.querySelector('style');
      expect(styleTag?.textContent).toContain('.jianpu-output svg');
      expect(styleTag?.textContent).toContain('width: 100%');
      expect(styleTag?.textContent).toContain('height: auto');
    });
  });

  describe('Edge Cases', () => {
    it('handles undefined abcNotation gracefully', () => {
      const { container } = render(
        <JianpuRenderer abcNotation={undefined} title="Test" />
      );
      expect(container.querySelector('.jianpu-output')).toBeInTheDocument();
      expect(renderJianpu).not.toHaveBeenCalled();
    });

    it('handles long ABC notation', async () => {
      const longAbc = '1 2 3 '.repeat(100);
      render(<JianpuRenderer abcNotation={longAbc} title="Long" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          longAbc
        );
      });
    });

    it('handles special characters in notation', async () => {
      const specialAbc = '1/2 3|4.5 (6 7)';
      render(<JianpuRenderer abcNotation={specialAbc} title="Special" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          specialAbc
        );
      });
    });

    it('handles whitespace in notation', async () => {
      const whitespaceAbc = '  1 2 3  \n\n  4 5 6  ';
      render(<JianpuRenderer abcNotation={whitespaceAbc} title="Whitespace" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledWith(
          expect.stringContaining('jianpu-container'),
          whitespaceAbc
        );
      });
    });

    it('handles rapid notation updates', async () => {
      const { rerender } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );

      for (let i = 0; i < 5; i++) {
        rerender(
          <JianpuRenderer abcNotation={`${i} ${i + 1} ${i + 2}`} title="Test" />
        );
      }

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalledTimes(6); // Initial + 5 rerenders
      });
    });
  });

  describe('Layout and Styling', () => {
    it('has horizontal scroll overflow', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const wrapper = container.querySelector('.overflow-x-auto');
      expect(wrapper).toBeInTheDocument();
    });

    it('has white background', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const wrapper = container.querySelector('.bg-white');
      expect(wrapper).toBeInTheDocument();
    });

    it('has padding', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const wrapper = container.querySelector('.p-4');
      expect(wrapper).toBeInTheDocument();
    });

    it('has minimum height set', () => {
      const { container } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );
      const wrapper = container.querySelector('.min-h-100');
      expect(wrapper).toBeInTheDocument();
    });
  });

  describe('Component Lifecycle', () => {
    it('calls renderJianpu on mount with valid notation', async () => {
      render(<JianpuRenderer abcNotation="1 2 3" title="Test" />);

      await waitFor(() => {
        expect(renderJianpu).toHaveBeenCalled();
      });
    });

    it('updates container ID on component reuse', async () => {
      const { container: c1, unmount } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test1" />
      );
      const id1 = c1.querySelector('.jianpu-output')?.id;

      unmount();

      const { container: c2 } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test2" />
      );
      const id2 = c2.querySelector('.jianpu-output')?.id;

      expect(id1).not.toBe(id2);
    });

    it('cleans up on unmount', () => {
      const { unmount } = render(
        <JianpuRenderer abcNotation="1 2 3" title="Test" />
      );

      expect(() => {
        unmount();
      }).not.toThrow();
    });
  });
});
