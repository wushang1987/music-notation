const USER_MIDI_PROGRAM_REGEX =
  /^\s*(?:%%\s*MIDI\s+program\b|I:\s*MIDI\s+program\b)/im;

export const hasUserMidiProgramDirective = (abcText) => {
  if (!abcText || typeof abcText !== "string") return false;
  return USER_MIDI_PROGRAM_REGEX.test(abcText);
};

const normalizeProgram = (program) => {
  if (program === undefined || program === null || program === "") return 0;
  const n = Number.parseInt(program, 10);
  if (Number.isNaN(n) || n < 0 || n > 127) return 0;
  return n;
};

export const ensureMidiProgram = (abcText, program) => {
  if (!abcText || typeof abcText !== "string") return abcText;
  if (hasUserMidiProgramDirective(abcText)) return abcText;

  const midiProgram = normalizeProgram(program);
  const directive = `%%MIDI program ${midiProgram}`;

  const lines = abcText.split(/\r?\n/);
  const keyIndex = lines.findIndex((l) => /^\s*K\s*:/i.test(l));
  if (keyIndex !== -1) {
    return [
      ...lines.slice(0, keyIndex + 1),
      directive,
      ...lines.slice(keyIndex + 1),
    ].join("\n");
  }

  // Fallback: insert after initial header/info block (lines like "X:", "T:", "M:", "L:", "%%...").
  let lastHeaderIndex = -1;
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    if (/^\s*(?:[A-Za-z]:|%%)/.test(line)) {
      lastHeaderIndex = i;
      continue;
    }
    break;
  }

  const insertAt = lastHeaderIndex + 1;
  return [
    ...lines.slice(0, insertAt),
    directive,
    ...lines.slice(insertAt),
  ].join("\n");
};

export const INSTRUMENT_OPTIONS = [
  { value: 0, i18nKey: "score.instruments.piano" },
  { value: 24, i18nKey: "score.instruments.guitarNylon" },
  { value: 25, i18nKey: "score.instruments.guitarSteel" },
  { value: 40, i18nKey: "score.instruments.violin" },
  { value: 42, i18nKey: "score.instruments.cello" },
  { value: 73, i18nKey: "score.instruments.flute" },
];

export const getInstrumentOption = (program) => {
  const n = Number.parseInt(program, 10);
  if (!Number.isFinite(n)) return INSTRUMENT_OPTIONS[0];
  return INSTRUMENT_OPTIONS.find((o) => o.value === n) || INSTRUMENT_OPTIONS[0];
};
