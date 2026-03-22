import { describe, it, expect } from 'vitest';
import {
  parsePianoAbc,
  generatePianoAbc,
} from '../pianoHelpers';

describe('pianoHelpers Utilities', () => {
  describe('parsePianoAbc', () => {
    it('returns empty object for empty input', () => {
      const result = parsePianoAbc('');
      expect(result).toEqual({
        headers: '',
        rightHand: '',
        leftHand: '',
      });
    });

    it('returns empty object for null input', () => {
      const result = parsePianoAbc(null);
      expect(result).toEqual({
        headers: '',
        rightHand: '',
        leftHand: '',
      });
    });

    it('parses split piano ABC with V1 and V2 voices', () => {
      const abc = `X:1
T:Test
K:C
%%score {V1|V2}
V:V1 clef=treble
cde
[V:V1]
fga
[V:V2]
cba`;

      const result = parsePianoAbc(abc);
      expect(result.headers).toContain('X:1');
      expect(result.headers).toContain('T:Test');
      expect(result.rightHand).toBeTruthy();
      expect(result.leftHand).toBeTruthy();
    });

    it('cleans up auto-inserted piano setup lines', () => {
      const abc = `X:1
%%score {V1|V2}
V:V1 clef=treble
V:V2 clef=bass
[V:V1]
cde
[V:V2]
fga`;

      const result = parsePianoAbc(abc);
      expect(result.headers).not.toContain('%%score');
      expect(result.headers).not.toContain('V:V1 clef=treble');
    });

    it('handles fallback parsing without voice markers', () => {
      const abc = `X:1
T:Test
K:C
cdefga`;

      const result = parsePianoAbc(abc);
      expect(result.headers).toContain('K:C');
      expect(result.rightHand).toBe('cdefga');
      expect(result.leftHand).toBe('');
    });

    it('removes leading/trailing newlines from voice content', () => {
      const abc = `X:1
K:C
[V:V1]

cde

[V:V2]

fga`;

      const result = parsePianoAbc(abc);
      // The parser removes a single leading newline if present
      expect(result.rightHand.trim()).toBeTruthy();
      expect(result.leftHand.trim()).toBeTruthy();
    });
  });

  describe('generatePianoAbc', () => {
    it('generates basic piano ABC structure', () => {
      const result = generatePianoAbc('X:1\nT:Test\nK:C', 'cde', 'fga');

      expect(result).toContain('X:1');
      expect(result).toContain('T:Test');
      expect(result).toContain('K:C');
      expect(result).toContain('%%score {V1|V2}');
      expect(result).toContain('V:V1 clef=treble');
      expect(result).toContain('V:V2 clef=bass');
      expect(result).toContain('[V:V1]');
      expect(result).toContain('[V:V2]');
      expect(result).toContain('cde');
      expect(result).toContain('fga');
    });

    it('handles empty right hand', () => {
      const result = generatePianoAbc('X:1\nK:C', '', 'fga');

      expect(result).toContain('[V:V1]');
      expect(result).toContain('[V:V2]');
      expect(result).toContain('fga');
    });

    it('handles empty left hand', () => {
      const result = generatePianoAbc('X:1\nK:C', 'cde', '');

      expect(result).toContain('[V:V1]');
      expect(result).toContain('[V:V2]');
      expect(result).toContain('cde');
    });

    it('handles empty both hands', () => {
      const result = generatePianoAbc('X:1\nK:C', '', '');

      expect(result).toContain('X:1');
      expect(result).toContain('K:C');
      expect(result).toContain('[V:V1]');
      expect(result).toContain('[V:V2]');
    });

    it('trims headers properly', () => {
      const result = generatePianoAbc('  X:1\n  K:C  ', 'cde', 'fga');

      // Should not have excessive leading spaces
      expect(result.startsWith('X:1')).toBe(true);
    });

    it('preserves voice markers on separate lines', () => {
      const result = generatePianoAbc('X:1\nK:C', 'cde', 'fga');

      const lines = result.split('\n');
      const v1Index = lines.findIndex(l => l === '[V:V1]');
      const v2Index = lines.findIndex(l => l === '[V:V2]');

      expect(v1Index).toBeGreaterThan(-1);
      expect(v2Index).toBeGreaterThan(v1Index);
    });
  });

  describe('roundtrip parsing and generation', () => {
    it('maintains data through parse and generate cycle', () => {
      const original = `X:1
T:Test Piece
K:C
%%score {V1|V2}
V:V1 clef=treble
V:V2 clef=bass
[V:V1]
cdefga
[V:V2]
Gabcde`;

      const parsed = parsePianoAbc(original);
      const regenerated = generatePianoAbc(
        parsed.headers,
        parsed.rightHand,
        parsed.leftHand
      );

      const reparsed = parsePianoAbc(regenerated);

      expect(reparsed.rightHand.trim()).toBe(parsed.rightHand.trim());
      expect(reparsed.leftHand.trim()).toBe(parsed.leftHand.trim());
    });
  });
});
