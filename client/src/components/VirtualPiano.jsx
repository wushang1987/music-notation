import React, { useState, useEffect, useCallback, useRef } from "react";

export const NOTES = [
  { note: "C", type: "white", abc: "C", key: "a" },
  { note: "C#", type: "black", abc: "^C", key: "w" },
  { note: "D", type: "white", abc: "D", key: "s" },
  { note: "D#", type: "black", abc: "^D", key: "e" },
  { note: "E", type: "white", abc: "E", key: "d" },
  { note: "F", type: "white", abc: "F", key: "f" },
  { note: "F#", type: "black", abc: "^F", key: "t" },
  { note: "G", type: "white", abc: "G", key: "g" },
  { note: "G#", type: "black", abc: "^G", key: "y" },
  { note: "A", type: "white", abc: "A", key: "h" },
  { note: "A#", type: "black", abc: "^A", key: "u" },
  { note: "B", type: "white", abc: "B", key: "j" },
  { note: "c", type: "white", abc: "c", key: "k" }, // Next octave C
  { note: "c#", type: "black", abc: "^c", key: "o" },
  { note: "d", type: "white", abc: "d", key: "l" },
  { note: "d#", type: "black", abc: "^d", key: "p" },
  { note: "e", type: "white", abc: "e", key: ";" },
  { note: "f", type: "white", abc: "f", key: "'" },
];

const VirtualPiano = ({
  onNoteClick,
  duration = "",
  initialKeyboardEnabled = false,
  captureInTextarea = false,
}) => {
  const [octave, setOctave] = useState(0);
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(
    initialKeyboardEnabled
  );
  const [activeKeys, setActiveKeys] = useState(new Set());
  const audioCtxRef = useRef(null);

  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  }, []);

  const abcToFrequency = useCallback((abc) => {
    if (!abc) return null;
    // Strip duration parts like numbers or slashes
    const clean = abc.replace(/[0-9/]/g, "");
    // Accidentals
    let accidental = 0;
    let i = 0;
    while (clean[i] === "^" || clean[i] === "_" || clean[i] === "=") {
      if (clean[i] === "^") accidental += 1;
      else if (clean[i] === "_") accidental -= 1;
      // '=' keeps accidental at 0
      i++;
    }
    const letter = clean[i];
    if (!letter || !/[A-Ga-g]/.test(letter)) return null;
    i++;
    // Octave marks after the letter
    let up = 0;
    let down = 0;
    for (; i < clean.length; i++) {
      if (clean[i] === "'") up++;
      else if (clean[i] === ",") down++;
    }

    // Base octave: uppercase = 4 (middle C octave), lowercase = 5
    let octave = letter === letter.toLowerCase() ? 5 : 4;
    octave += up - down;

    // Semitone from C mapping
    const base = letter.toUpperCase();
    const SEMI_FROM_C = { C: 0, D: 2, E: 4, F: 5, G: 7, A: 9, B: 11 };
    let n = SEMI_FROM_C[base];
    if (n === undefined) return null;
    n += accidental; // apply sharp/flat

    // Convert to frequency relative to A4 = 440Hz
    const semitoneFromA4 = n - 9 + 12 * (octave - 4);
    const freq = 440 * Math.pow(2, semitoneFromA4 / 12);
    return freq;
  }, []);

  const playAbcNote = useCallback(
    (abc) => {
      const ctx = ensureAudioContext();
      if (!ctx) return;
      // Some browsers require user gesture; resume if suspended
      if (ctx.state === "suspended") {
        ctx.resume().catch(() => {});
      }
      const freq = abcToFrequency(abc);
      if (!freq) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle"; // softer than sine for piano-like feel
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      // Simple ADSR envelope
      const now = ctx.currentTime;
      const attack = 0.01;
      const decay = 0.1;
      const sustain = 0.2;
      const release = 0.15;

      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0.0, now);
      gain.gain.linearRampToValueAtTime(0.8, now + attack);
      gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      gain.gain.setValueAtTime(sustain, now + attack + decay);
      gain.gain.linearRampToValueAtTime(0.0, now + attack + decay + release);

      osc.start(now);
      osc.stop(now + attack + decay + release);
    },
    [ensureAudioContext, abcToFrequency]
  );

  const getAbcNote = useCallback(
    (baseAbc) => {
      // Handle octave shifting
      // Base mapping is Middle C octave (C D E F G A B)
      // Octave 0: C D ...
      // Octave 1: c d ...
      // Octave -1: C, D, ...
      // Octave 2: c' d' ...
      // Octave -2: C,, D,, ...

      let note = baseAbc;

      // Special handling for notes that are already in the next octave (lowercase)
      let currentOctave = octave;
      if (/[a-z]/.test(baseAbc)) {
        note = baseAbc.toUpperCase(); // Treat as base note for calculation, then add octave + 1
        currentOctave += 1;
      }

      // Apply octave transformation to base 'C'...'B'
      if (currentOctave > 0) {
        note = note.toLowerCase();
        if (currentOctave > 1) {
          note += "'".repeat(currentOctave - 1);
        }
      } else if (currentOctave < 0) {
        note += ",".repeat(Math.abs(currentOctave));
      }

      return note + duration;
    },
    [octave, duration]
  );

  const handleNoteClick = useCallback(
    (noteDef) => {
      const abc = getAbcNote(noteDef.abc);
      // Play sound locally
      playAbcNote(abc);
      onNoteClick(abc);
    },
    [getAbcNote, onNoteClick, playAbcNote]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isKeyboardEnabled) return;
      if (e.repeat) return;

      // Ignore typing inside inputs; textarea can be captured when desired
      const tag = e.target.tagName;
      if (tag === "INPUT") return;
      if (tag === "TEXTAREA" && !captureInTextarea) return;

      const key = e.key.toLowerCase();
      const noteDef = NOTES.find((n) => n.key === key);
      if (noteDef) {
        e.preventDefault(); // Prevent typing the character
        handleNoteClick(noteDef);
        setActiveKeys((prev) => new Set(prev).add(key));
      }
    };

    const handleKeyUp = (e) => {
      const key = e.key.toLowerCase();
      if (NOTES.find((n) => n.key === key)) {
        setActiveKeys((prev) => {
          const next = new Set(prev);
          next.delete(key);
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [handleNoteClick, isKeyboardEnabled, captureInTextarea]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-100 rounded-lg shadow-md mt-4">
      <div className="flex justify-between w-full mb-2 px-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-gray-700">Virtual Piano</span>
          <label className="flex items-center text-xs text-gray-600 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isKeyboardEnabled}
              onChange={(e) => setIsKeyboardEnabled(e.target.checked)}
              className="mr-1"
            />
            Keyboard Mode
          </label>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setOctave((o) => o - 1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Octave -
          </button>
          <span className="px-2 py-1 bg-white rounded border min-w-7.5 text-center">
            {octave}
          </span>
          <button
            onClick={() => setOctave((o) => o + 1)}
            className="px-2 py-1 bg-gray-200 rounded hover:bg-gray-300 text-sm"
          >
            Octave +
          </button>
        </div>
      </div>

      <div className="relative flex h-32 select-none">
        {NOTES.map((n, i) => (
          <div
            key={i}
            onClick={() => handleNoteClick(n)}
            className={`
              relative border border-gray-400 rounded-b-md cursor-pointer transition-colors
              ${
                n.type === "white"
                  ? `w-10 h-32 ${
                      activeKeys.has(n.key)
                        ? "bg-yellow-200"
                        : "bg-white hover:bg-gray-100"
                    } z-0`
                  : `w-6 h-20 ${
                      activeKeys.has(n.key)
                        ? "bg-yellow-600"
                        : "bg-black hover:bg-gray-800"
                    } z-10 -mx-3 text-white`
              }
              flex items-end justify-center pb-2
            `}
          >
            <span
              className={`text-xs ${
                n.type === "black" ? "text-gray-300" : "text-gray-500"
              }`}
            >
              {n.key.toUpperCase()}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2 text-xs text-gray-500">
        Use keyboard keys (A-') or click to play
      </div>
    </div>
  );
};

export default VirtualPiano;
