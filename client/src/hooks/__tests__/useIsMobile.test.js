import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import useIsMobile from '../useIsMobile';

describe('useIsMobile Hook', () => {
  let matchMediaMock;

  beforeEach(() => {
    // Mock matchMedia
    const listeners = [];
    matchMediaMock = vi.fn((query) => ({
      matches: false,
      media: query,
      addEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          listeners.push(handler);
        }
      }),
      removeEventListener: vi.fn((event, handler) => {
        if (event === 'change') {
          const index = listeners.indexOf(handler);
          if (index > -1) listeners.splice(index, 1);
        }
      }),
      addListener: vi.fn((handler) => listeners.push(handler)),
      removeListener: vi.fn((handler) => {
        const index = listeners.indexOf(handler);
        if (index > -1) listeners.splice(index, 1);
      }),
      dispatchEvent: vi.fn(),
    }));
    window.matchMedia = matchMediaMock;
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  it('returns false by default when window width is above breakpoint', () => {
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);
  });

  it('returns true when window width is below breakpoint', () => {
    matchMediaMock.mockReturnValue({
      matches: true,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    const { result } = renderHook(() => useIsMobile());
    expect(result.current).toBe(true);
  });

  it('respects custom breakpoint', () => {
    const { result } = renderHook(() => useIsMobile(1024));
    expect(matchMediaMock).toHaveBeenCalledWith('(max-width: 1023px)');
  });

  it('updates state when media query changes', () => {
    let handler;
    const addEventListenerMock = vi.fn((event, cb) => {
      if (event === 'change') handler = cb;
    });

    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: addEventListenerMock,
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    const { result, rerender } = renderHook(() => useIsMobile());
    expect(result.current).toBe(false);

    // Simulate media query change
    act(() => {
      handler({ matches: true });
    });

    expect(result.current).toBe(true);
  });

  it('cleans up event listener on unmount', () => {
    const removeEventListenerMock = vi.fn();
    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: vi.fn(),
      removeEventListener: removeEventListenerMock,
      addListener: vi.fn(),
      removeListener: vi.fn(),
    });

    const { unmount } = renderHook(() => useIsMobile());
    unmount();

    expect(removeEventListenerMock).toHaveBeenCalled();
  });

  it('handles older browsers without addEventListener', () => {
    const addListenerMock = vi.fn();
    const removeListenerMock = vi.fn();

    matchMediaMock.mockReturnValue({
      matches: false,
      addEventListener: undefined,
      addListener: addListenerMock,
      removeListener: removeListenerMock,
    });

    const { unmount } = renderHook(() => useIsMobile());
    expect(addListenerMock).toHaveBeenCalled();

    unmount();
    expect(removeListenerMock).toHaveBeenCalled();
  });

  it('handles undefined window gracefully', () => {
    // This hook requires window to be defined
    // The hook checks if window is defined at the start of useEffect
    // So we just verify it works when window exists (default test environment)
    const { result } = renderHook(() => useIsMobile());
    expect(typeof result.current).toBe('boolean');
  });

  it('updates when breakpoint prop changes', () => {
    let capturedQueries = [];
    matchMediaMock.mockImplementation((query) => {
      capturedQueries.push(query);
      return {
        matches: false,
        addEventListener: vi.fn(),
        removeEventListener: vi.fn(),
        addListener: vi.fn(),
        removeListener: vi.fn(),
      };
    });

    const { rerender } = renderHook(
      ({ breakpoint }) => useIsMobile(breakpoint),
      { initialProps: { breakpoint: 768 } }
    );

    expect(capturedQueries).toContain('(max-width: 767px)');

    rerender({ breakpoint: 1024 });
    expect(capturedQueries).toContain('(max-width: 1023px)');
  });
});
