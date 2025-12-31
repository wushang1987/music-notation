import React, { useState, useEffect, useCallback } from "react";

const NOTES = [
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
];

const VirtualPiano = ({ onNoteClick, duration = "" }) => {
  const [octave, setOctave] = useState(0);
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(false);

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

      // Special handling for the high 'c' in the array which is already next octave
      let currentOctave = octave;
      if (baseAbc === "c") {
        note = "C"; // Treat as base C for calculation, then add octave + 1
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
      onNoteClick(abc);
    },
    [getAbcNote, onNoteClick]
  );

  useEffect(() => {
    const handleKeyDown = (e) => {
      // Always ignore inputs that are NOT the main textarea (e.g. Title input)
      if (e.target.tagName === "INPUT") return;

      // If typing in textarea, only intercept if keyboard mode is enabled
      if (e.target.tagName === "TEXTAREA" && !isKeyboardEnabled) return;

      const key = e.key.toLowerCase();
      const noteDef = NOTES.find((n) => n.key === key);
      if (noteDef) {
        e.preventDefault(); // Prevent typing the character
        handleNoteClick(noteDef);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleNoteClick, isKeyboardEnabled]);

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
          <span className="px-2 py-1 bg-white rounded border min-w-[30px] text-center">
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
                  ? "w-10 h-32 bg-white hover:bg-gray-100 z-0"
                  : "w-6 h-20 bg-black hover:bg-gray-800 z-10 -mx-3 text-white"
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
        Use keyboard keys (A-K) or click to play
      </div>
    </div>
  );
};

export default VirtualPiano;
