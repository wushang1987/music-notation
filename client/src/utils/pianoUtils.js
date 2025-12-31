// Full 88-key range: A0 to C8
// A0 is index 0. Middle C (C4) is index 39.
export const generatePianoKeys = () => {
  const keys = [];
  const notes = [
    "C",
    "C#",
    "D",
    "D#",
    "E",
    "F",
    "F#",
    "G",
    "G#",
    "A",
    "A#",
    "B",
  ];
  // A0 is the first key.
  // MIDI note numbers: A0 = 21, C8 = 108.
  for (let midi = 21; midi <= 108; midi++) {
    const octave = Math.floor(midi / 12) - 1;
    const noteIndex = midi % 12;
    const noteName = notes[noteIndex];
    const isBlack = noteName.includes("#");

    // Construct ABC notation string
    let abcBase = noteName.replace("#", "");
    if (isBlack) abcBase = "^" + abcBase;

    let abc = abcBase;
    if (octave === 4) {
      // Middle C octave: C D E...
    } else if (octave >= 5) {
      abc = abc.replace(/[A-G]/, (m) => m.toLowerCase());
      if (octave > 5) {
        abc += "'".repeat(octave - 5);
      }
    } else {
      abc += ",".repeat(4 - octave);
    }

    keys.push({
      midi,
      note: noteName,
      octave,
      type: isBlack ? "black" : "white",
      abc,
      label: noteName + octave, // e.g. C4
      isMiddleC: midi === 60, // C4 is MIDI 60
    });
  }
  return keys;
};

export const PIANO_KEYS = generatePianoKeys();

// Keyboard mapping (relative to current "center" octave)
export const KEYBOARD_MAP = {
  // Lower octave (starts at C)
  a: 0, // C
  w: 1, // C#
  s: 2, // D
  e: 3, // D#
  d: 4, // E
  f: 5, // F
  t: 6, // F#
  g: 7, // G
  y: 8, // G#
  h: 9, // A
  u: 10, // A#
  j: 11, // B
  // Upper octave (starts at c)
  k: 12, // C
  o: 13, // C#
  l: 14, // D
  p: 15, // D#
  ";": 16, // E
  "'": 17, // F
  "]": 18, // F#
};

// Legacy support for ScoreEditor
export const NOTES = [
  { abc: "C", key: "a" },
  { abc: "^C", key: "w" },
  { abc: "D", key: "s" },
  { abc: "^D", key: "e" },
  { abc: "E", key: "d" },
  { abc: "F", key: "f" },
  { abc: "^F", key: "t" },
  { abc: "G", key: "g" },
  { abc: "^G", key: "y" },
  { abc: "A", key: "h" },
  { abc: "^A", key: "u" },
  { abc: "B", key: "j" },
  { abc: "c", key: "k" },
  { abc: "^c", key: "o" },
  { abc: "d", key: "l" },
  { abc: "^d", key: "p" },
  { abc: "e", key: ";" },
  { abc: "f", key: "'" },
];
