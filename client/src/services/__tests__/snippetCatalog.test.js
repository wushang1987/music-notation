import { describe, it, expect } from 'vitest';
import { SNIPPET_GROUPS } from '../snippetCatalog';

describe('snippetCatalog Service', () => {
  describe('SNIPPET_GROUPS structure', () => {
    it('exports an array of groups', () => {
      expect(Array.isArray(SNIPPET_GROUPS)).toBe(true);
      expect(SNIPPET_GROUPS.length).toBeGreaterThan(0);
    });

    it('each group has required properties', () => {
      SNIPPET_GROUPS.forEach((group) => {
        expect(group).toHaveProperty('id');
        expect(group).toHaveProperty('label');
        expect(group).toHaveProperty('description');
        expect(group).toHaveProperty('snippets');
        expect(Array.isArray(group.snippets)).toBe(true);
      });
    });

    it('each snippet has required properties', () => {
      SNIPPET_GROUPS.forEach((group) => {
        group.snippets.forEach((snippet) => {
          expect(snippet).toHaveProperty('id');
          expect(snippet).toHaveProperty('label');
          expect(snippet).toHaveProperty('caption');
          expect(snippet).toHaveProperty('badge');
          expect(snippet).toHaveProperty('icon');
          expect(snippet).toHaveProperty('mode');
          expect(snippet).toHaveProperty('target');
          expect(snippet).toHaveProperty('keywords');
          expect(snippet).toHaveProperty('code');
        });
      });
    });

    it('all group IDs are unique', () => {
      const ids = SNIPPET_GROUPS.map((g) => g.id);
      const uniqueIds = new Set(ids);
      expect(uniqueIds.size).toBe(ids.length);
    });

    it('all snippet IDs within a group are unique', () => {
      SNIPPET_GROUPS.forEach((group) => {
        const snippetIds = group.snippets.map((s) => s.id);
        const uniqueIds = new Set(snippetIds);
        expect(uniqueIds.size).toBe(snippetIds.length);
      });
    });

    it('snippet code is non-empty string', () => {
      SNIPPET_GROUPS.forEach((group) => {
        group.snippets.forEach((snippet) => {
          expect(typeof snippet.code).toBe('string');
          expect(snippet.code.length).toBeGreaterThan(0);
        });
      });
    });

    it('snippet keywords is an array', () => {
      SNIPPET_GROUPS.forEach((group) => {
        group.snippets.forEach((snippet) => {
          expect(Array.isArray(snippet.keywords)).toBe(true);
          snippet.keywords.forEach((k) => {
            expect(typeof k).toBe('string');
          });
        });
      });
    });

    it('snippet mode is mei or valid format', () => {
      const validModes = ['mei', 'abc'];
      SNIPPET_GROUPS.forEach((group) => {
        group.snippets.forEach((snippet) => {
          expect(['mei', 'abc']).toContain(snippet.mode);
        });
      });
    });

    it('snippet target is valid', () => {
      const validTargets = ['section', 'measure', 'm', 'layer', 'staff', 'scoreDef'];
      SNIPPET_GROUPS.forEach((group) => {
        group.snippets.forEach((snippet) => {
          expect(validTargets).toContain(snippet.target);
        });
      });
    });

    it('has at least one snippet group with structure', () => {
      const hasStructureGroup = SNIPPET_GROUPS.some((g) => g.id === 'structure');
      expect(hasStructureGroup).toBe(true);
    });

    it('structure group contains measure-related snippets', () => {
      const structureGroup = SNIPPET_GROUPS.find((g) => g.id === 'structure');
      expect(structureGroup).toBeDefined();
      expect(structureGroup.snippets.length).toBeGreaterThan(0);
    });
  });

  describe('snippet options', () => {
    it('snippets with autoNumber have options property', () => {
      SNIPPET_GROUPS.forEach((group) => {
        group.snippets.forEach((snippet) => {
          if (snippet.options?.autoNumber) {
            expect(snippet).toHaveProperty('options');
            expect(typeof snippet.options.autoNumber).toBe('boolean');
          }
        });
      });
    });
  });
});
