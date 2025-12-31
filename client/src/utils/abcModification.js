// Regex to parse a single note token
// Captures: 1: Accidental, 2: Note Name, 3: Octave, 4: Duration
const NOTE_REGEX = /^([_^=]*)([A-Ga-g])([,']*)(\d*(?:\/\d*)?)$/;

export const parseNote = (noteToken) => {
  const match = noteToken.match(NOTE_REGEX);
  if (!match) return null;

  return {
    accidental: match[1] || "",
    note: match[2],
    octave: match[3] || "",
    duration: match[4] || "",
    original: noteToken,
  };
};

export const stringifyNote = (noteObj) => {
  return `${noteObj.accidental}${noteObj.note}${noteObj.octave}${noteObj.duration}`;
};

export const modifyNoteInAbc = (abcContent, selection, modificationFn) => {
  if (!selection || selection.start === -1 || selection.end === -1)
    return abcContent;

  const { start, end } = selection;
  // Ensure we are within bounds
  if (start < 0 || end > abcContent.length) return abcContent;

  const selectedText = abcContent.substring(start, end);

  // Attempt to parse as a note
  const noteObj = parseNote(selectedText);

  if (!noteObj) {
    // If it's not a note (e.g. a rest 'z' or bar line), return as is for now
    return abcContent;
  }

  const newNoteObj = modificationFn(noteObj);
  const newText = stringifyNote(newNoteObj);

  return abcContent.substring(0, start) + newText + abcContent.substring(end);
};

export const setNoteDuration = (noteObj, newDuration) => {
  return { ...noteObj, duration: newDuration };
};

export const setNoteAccidental = (noteObj, newAccidental) => {
  // If newAccidental is empty string, it removes the accidental (natural by key signature)
  return { ...noteObj, accidental: newAccidental };
};

export const shiftPitch = (noteObj, steps) => {
  // Diatonic shift (steps up or down the staff)
  const notes = ["c", "d", "e", "f", "g", "a", "b"];
  const baseNoteLower = noteObj.note.toLowerCase();
  const isUpper = noteObj.note === noteObj.note.toUpperCase();

  let index = notes.indexOf(baseNoteLower);
  if (index === -1) return noteObj;

  let newIndex = index + steps;
  let octaveChange = 0;

  // Handle wrapping
  while (newIndex >= 7) {
    newIndex -= 7;
    octaveChange += 1;
  }
  while (newIndex < 0) {
    newIndex += 7;
    octaveChange -= 1;
  }

  const newNoteName = isUpper ? notes[newIndex].toUpperCase() : notes[newIndex];

  // Helper to adjust octave string
  const adjustOctave = (oct, change) => {
    let res = oct;
    if (change > 0) {
      for (let i = 0; i < change; i++) {
        if (res.includes(",")) {
          res = res.replace(",", "");
        } else {
          res += "'";
        }
      }
    } else if (change < 0) {
      for (let i = 0; i < Math.abs(change); i++) {
        if (res.includes("'")) {
          res = res.replace("'", "");
        } else {
          res += ",";
        }
      }
    }
    return res;
  };

  const newOctave = adjustOctave(noteObj.octave, octaveChange);

  return { ...noteObj, note: newNoteName, octave: newOctave };
};
