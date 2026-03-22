import { describe, it, expect, beforeEach, vi } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { usePaletteState } from '../usePaletteState';

// Mock the snippetCatalog module
vi.mock('../../services/snippetCatalog', () => ({
  resolveGroupById: vi.fn((id) => {
    const groups = {
      'group1': { id: 'group1', label: 'Group 1', snippets: [{ id: 'snippet1' }] },
      'group2': { id: 'group2', label: 'Group 2', snippets: [{ id: 'snippet2' }] },
    };
    return groups[id] || null;
  }),
  filterSnippets: vi.fn((groupId, searchValue) => {
    if (groupId === 'group1') {
      return searchValue 
        ? [{ id: 'snippet1', label: 'Test' }].filter(s => s.label.includes(searchValue))
        : [{ id: 'snippet1', label: 'Test' }];
    }
    return [];
  }),
}));

describe('usePaletteState Hook', () => {
  const mockGroups = [
    { id: 'group1', label: 'Group 1' },
    { id: 'group2', label: 'Group 2' },
  ];

  it('initializes with default values', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    expect(result.current.groups).toEqual(mockGroups);
    expect(result.current.activeGroup).toBe('group1');
    expect(result.current.pinned).toBe(true);
    expect(result.current.searchValue).toBe('');
    expect(result.current.recentIds).toEqual([]);
  });

  it('returns null groupMeta when no groups provided', () => {
    const { result } = renderHook(() => usePaletteState([]));

    expect(result.current.groupMeta).toBeNull();
    expect(result.current.activeGroup).toBeNull();
  });

  it('changes active group', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    act(() => {
      result.current.setActiveGroup('group2');
    });

    expect(result.current.activeGroup).toBe('group2');
  });

  it('toggles pinned state', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    expect(result.current.pinned).toBe(true);

    act(() => {
      result.current.togglePinned();
    });

    expect(result.current.pinned).toBe(false);

    act(() => {
      result.current.togglePinned();
    });

    expect(result.current.pinned).toBe(true);
  });

  it('updates search value', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    expect(result.current.searchValue).toBe('');

    act(() => {
      result.current.setSearchValue('test');
    });

    expect(result.current.searchValue).toBe('test');
  });

  it('filters snippets based on active group and search', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    act(() => {
      result.current.setSearchValue('Test');
    });

    expect(result.current.snippets).toHaveLength(1);
  });

  it('marks snippet as recent', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    act(() => {
      result.current.markRecent('snippet1');
    });

    expect(result.current.recentIds).toEqual(['snippet1']);

    act(() => {
      result.current.markRecent('snippet2');
    });

    expect(result.current.recentIds).toEqual(['snippet2', 'snippet1']);
  });

  it('limits recent snippets to 6 items', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    act(() => {
      for (let i = 1; i <= 10; i++) {
        result.current.markRecent(`snippet${i}`);
      }
    });

    expect(result.current.recentIds).toHaveLength(6);
    expect(result.current.recentIds[0]).toBe('snippet10');
  });

  it('prevents duplicate recent snippets', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    act(() => {
      result.current.markRecent('snippet1');
      result.current.markRecent('snippet2');
      result.current.markRecent('snippet1');
    });

    expect(result.current.recentIds).toEqual(['snippet1', 'snippet2']);
  });

  it('ignores null/undefined snippet in markRecent', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    act(() => {
      result.current.markRecent(null);
      result.current.markRecent(undefined);
    });

    expect(result.current.recentIds).toEqual([]);
  });

  it('resolves groupMeta for active group', () => {
    const { result } = renderHook(() => usePaletteState(mockGroups));

    expect(result.current.groupMeta).toEqual({
      id: 'group1',
      label: 'Group 1',
      snippets: [{ id: 'snippet1' }],
    });

    act(() => {
      result.current.setActiveGroup('group2');
    });

    expect(result.current.groupMeta).toEqual({
      id: 'group2',
      label: 'Group 2',
      snippets: [{ id: 'snippet2' }],
    });
  });
});
