import { describe, it, expect } from 'vitest';
import {
  parseNote,
  stringifyNote,
  modifyNoteInAbc,
  setNoteDuration,
  setNoteAccidental,
  shiftPitch,
} from '../abcModification';

describe('abcModification Utilities', () => {
  describe('parseNote', () => {
    it('parses simple note without accidental or octave', () => {
      const result = parseNote('c');
      expect(result).toEqual({
        accidental: '',
        note: 'c',
        octave: '',
        duration: '',
        original: 'c',
      });
    });

    it('parses note with accidental', () => {
      const result = parseNote('^c');
      expect(result.accidental).toBe('^');
      expect(result.note).toBe('c');
    });

    it('parses note with flat accidental', () => {
      const result = parseNote('_d');
      expect(result.accidental).toBe('_');
      expect(result.note).toBe('d');
    });

    it('parses note with natural accidental', () => {
      const result = parseNote('=e');
      expect(result.accidental).toBe('=');
      expect(result.note).toBe('e');
    });

    it('parses note with octave', () => {
      const result = parseNote("c'");
      expect(result.octave).toBe("'");
    });

    it('parses note with multiple octave markers', () => {
      const result = parseNote("c''");
      expect(result.octave).toBe("''");
    });

    it('parses note with duration', () => {
      const result = parseNote('c4');
      expect(result.duration).toBe('4');
    });

    it('parses note with dotted duration', () => {
      const result = parseNote('c4/2');
      expect(result.duration).toBe('4/2');
    });

    it('parses complete complex note', () => {
      const result = parseNote("^c''4");
      expect(result.accidental).toBe('^');
      expect(result.note).toBe('c');
      expect(result.octave).toBe("''");
      expect(result.duration).toBe('4');
    });

    it('parses uppercase note', () => {
      const result = parseNote('C');
      expect(result.note).toBe('C');
    });

    it('returns null for invalid input', () => {
      expect(parseNote('z')).toBeNull();
      expect(parseNote('1')).toBeNull();
      expect(parseNote('x')).toBeNull();
    });

    it('returns null for empty or invalid strings', () => {
      expect(parseNote('')).toBeNull();
      expect(parseNote(' ')).toBeNull();
    });
  });

  describe('stringifyNote', () => {
    it('reconstructs note from parsed object', () => {
      const noteObj = {
        accidental: '^',
        note: 'c',
        octave: "'",
        duration: '4',
      };
      expect(stringifyNote(noteObj)).toBe("^c'4");
    });

    it('handles note without accidental', () => {
      const noteObj = {
        accidental: '',
        note: 'c',
        octave: '',
        duration: '',
      };
      expect(stringifyNote(noteObj)).toBe('c');
    });

    it('preserves all components', () => {
      const noteObj = {
        accidental: '_',
        note: 'd',
        octave: "''",
        duration: '2/2',
      };
      expect(stringifyNote(noteObj)).toBe("_d''2/2");
    });
  });

  describe('modifyNoteInAbc', () => {
    it('modifies note at specified selection', () => {
      const abc = 'cdef';
      const selection = { start: 0, end: 1 };
      const result = modifyNoteInAbc(abc, selection, (n) => setNoteDuration(n, '2'));

      expect(result).toBe('c2def');
    });

    it('returns original when selection is invalid', () => {
      const abc = 'cdef';
      expect(modifyNoteInAbc(abc, null, () => {})).toBe(abc);
      expect(modifyNoteInAbc(abc, { start: -1, end: -1 }, () => {})).toBe(abc);
    });

    it('returns original for out-of-bounds selection', () => {
      const abc = 'cdef';
      const selection = { start: 0, end: 100 };
      expect(modifyNoteInAbc(abc, selection, () => {})).toBe(abc);
    });

    it('returns original for non-note content', () => {
      const abc = 'cdef';
      const selection = { start: 0, end: 1 };
      // Select 'c' but pass non-note text
      const result = modifyNoteInAbc('z234', selection, () => {});
      expect(result).toBe('z234');
    });

    it('modifies note in middle of string', () => {
      const abc = 'cdefga';
      const selection = { start: 2, end: 3 };
      const result = modifyNoteInAbc(abc, selection, (n) => setNoteDuration(n, '4'));

      expect(result).toBe('cde4fga');
    });
  });

  describe('setNoteDuration', () => {
    it('sets duration on note object', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '' };
      const result = setNoteDuration(noteObj, '2');

      expect(result.duration).toBe('2');
      expect(result.note).toBe('c');
    });

    it('replaces existing duration', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '4' };
      const result = setNoteDuration(noteObj, '8');

      expect(result.duration).toBe('8');
    });

    it('does not mutate original', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '' };
      const result = setNoteDuration(noteObj, '2');

      expect(noteObj.duration).toBe('');
      expect(result.duration).toBe('2');
    });
  });

  describe('setNoteAccidental', () => {
    it('adds accidental to note', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '' };
      const result = setNoteAccidental(noteObj, '^');

      expect(result.accidental).toBe('^');
    });

    it('removes accidental with empty string', () => {
      const noteObj = { accidental: '^', note: 'c', octave: '', duration: '' };
      const result = setNoteAccidental(noteObj, '');

      expect(result.accidental).toBe('');
    });

    it('replaces existing accidental', () => {
      const noteObj = { accidental: '^', note: 'c', octave: '', duration: '' };
      const result = setNoteAccidental(noteObj, '_');

      expect(result.accidental).toBe('_');
    });

    it('does not mutate original', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '' };
      const result = setNoteAccidental(noteObj, '^');

      expect(noteObj.accidental).toBe('');
      expect(result.accidental).toBe('^');
    });
  });

  describe('shiftPitch', () => {
    it('shifts pitch up', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '' };
      const result = shiftPitch(noteObj, 1);

      expect(result.note).toBe('d');
    });

    it('shifts pitch down', () => {
      const noteObj = { accidental: '', note: 'd', octave: '', duration: '' };
      const result = shiftPitch(noteObj, -1);

      expect(result.note).toBe('c');
    });

    it('wraps around octave when shifting up from b', () => {
      const noteObj = { accidental: '', note: 'b', octave: '', duration: '' };
      const result = shiftPitch(noteObj, 1);

      expect(result.note).toBe('c');
    });

    it('wraps around octave when shifting down from c', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '' };
      const result = shiftPitch(noteObj, -1);

      expect(result.note).toBe('b');
    });

    it('preserves uppercase', () => {
      const noteObj = { accidental: '', note: 'C', octave: '', duration: '' };
      const result = shiftPitch(noteObj, 1);

      expect(result.note).toBe('D');
    });

    it('shifts by multiple steps', () => {
      const noteObj = { accidental: '', note: 'c', octave: '', duration: '' };
      const result = shiftPitch(noteObj, 5);

      expect(result.note).toBe('a');
    });

    it('returns original on invalid note', () => {
      const noteObj = { accidental: '', note: 'z', octave: '', duration: '' };
      const result = shiftPitch(noteObj, 1);

      expect(result).toEqual(noteObj);
    });
  });
});
