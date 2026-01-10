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

export const generateMultiPartAbc = (parts) => {
  if (!parts || parts.length === 0) return "";

  // If only one part, return its content with MIDI program
  if (parts.length === 1) {
    const part = parts[0];
    const content = part.content || "X:1\nT:Untitled\nM:4/4\nL:1/4\nK:C\nz4|";
    return ensureMidiProgram(content, part.program);
  }

  // Multiple parts - need to combine them properly
  const firstPart = parts[0];
  const firstContent = firstPart.content || "X:1\nT:Untitled\nM:4/4\nL:1/4\nK:C\nz4|";

  // Extract headers from first part (X:, T:, M:, L:, K:, etc.)
  const lines = firstContent.split(/\r?\n/);
  const headers = [];
  let foundKey = false;

  for (const line of lines) {
    if (/^[A-Za-z]:/.test(line) || /^%%/.test(line)) {
      headers.push(line);
      if (/^K:/.test(line)) {
        foundKey = true;
        break;
      }
    }
  }

  // Build the %%score directive to group voices
  // Piano parts need {V1 V2} grouping, single-staff parts just V3, V4, etc.
  let scoreDirective = "%%score ";
  const voiceGroups = [];
  let currentVoiceNum = 1;

  parts.forEach((part, index) => {
    const isPiano = normalizeProgram(part.program) === 0;
    if (isPiano) {
      // Piano gets two voices in a brace
      voiceGroups.push(`{V${currentVoiceNum} V${currentVoiceNum + 1}}`);
      currentVoiceNum += 2;
    } else {
      // Single staff instrument
      voiceGroups.push(`V${currentVoiceNum}`);
      currentVoiceNum += 1;
    }
  });

  scoreDirective += voiceGroups.join(" ");

  // Start building combined ABC
  let combined = headers.join("\n") + "\n";
  combined += scoreDirective + "\n";

  // Now add each part's voice definitions and content
  currentVoiceNum = 1;

  parts.forEach((part, index) => {
    const program = normalizeProgram(part.program);
    const isPiano = program === 0;
    const programDirective = `%%MIDI program ${program}`;

    let partContent = part.content;
    if (!partContent || partContent.trim() === "") {
      partContent = "z4|";
    }

    if (isPiano) {
      // Piano part - extract V:V1 and V:V2 sections
      const partLines = partContent.split(/\r?\n/);
      let v1Lines = [];
      let v2Lines = [];
      let currentVoice = null;
      let inBody = false;

      for (const line of partLines) {
        // Skip headers
        if (!inBody && /^[A-Za-z]:/.test(line) && !/^V:/.test(line)) {
          continue;
        }

        inBody = true;

        if (line.includes("V:V1") || line.includes("clef=treble")) {
          currentVoice = "v1";
          // Add renamed voice declaration
          combined += `V:V${currentVoiceNum} clef=treble name="${part.name}"\n`;
          combined += programDirective + "\n";
          continue;
        } else if (line.includes("V:V2") || line.includes("clef=bass")) {
          currentVoice = "v2";
          combined += `V:V${currentVoiceNum + 1} clef=bass\n`;
          combined += programDirective + "\n";
          continue;
        }

        // Add content to current voice
        if (currentVoice === "v1") {
          v1Lines.push(line);
        } else if (currentVoice === "v2") {
          v2Lines.push(line);
        }
      }

      // Write V1 content
      if (v1Lines.length > 0) {
        combined += v1Lines.join("\n") + "\n";
      } else {
        combined += "z4|\n";
      }

      // Write V2 content  
      if (v2Lines.length > 0) {
        combined += v2Lines.join("\n") + "\n";
      } else {
        combined += "z4|\n";
      }

      currentVoiceNum += 2;
    } else {
      // Single-staff instrument
      // Extract only the body content (skip headers)
      const partLines = partContent.split(/\r?\n/);
      const body = [];
      let foundBody = false;

      for (const line of partLines) {
        if (foundBody || !/^[A-Za-z]:/.test(line)) {
          foundBody = true;
          if (line.trim() && !/^V:/.test(line)) {
            body.push(line);
          }
        }
      }

      const bodyContent = body.length > 0 ? body.join("\n") : "z4|";

      // Add voice declaration
      combined += `V:V${currentVoiceNum} clef=treble name="${part.name}"\n`;
      combined += programDirective + "\n";
      combined += bodyContent + "\n";

      currentVoiceNum += 1;
    }
  });

  return combined;
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
