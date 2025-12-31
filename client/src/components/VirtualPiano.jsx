import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  PIANO_KEYS,
  KEYBOARD_MAP,
  NOTES as LEGACY_NOTES,
} from "../utils/pianoUtils";
import PianoKey from "./PianoKey";
import PianoControls from "./PianoControls";

// Re-export for ScoreEditor compatibility
export const NOTES = LEGACY_NOTES;

const VirtualPiano = ({
  onNoteClick,
  onPlayNote,
  duration = "",
  initialKeyboardEnabled = false,
  captureInTextarea = false,
}) => {
  const [centerOctave, setCenterOctave] = useState(4); // The octave mapped to 'a' key (C4 by default)
  const [isKeyboardEnabled, setIsKeyboardEnabled] = useState(
    initialKeyboardEnabled
  );
  const [activeMidiNotes, setActiveMidiNotes] = useState(new Set());
  const audioCtxRef = useRef(null);
  const scrollContainerRef = useRef(null);

  // Scroll to Middle C on mount
  useEffect(() => {
    if (scrollContainerRef.current) {
      const middleC =
        scrollContainerRef.current.querySelector('[data-note="C4"]');
      if (middleC) {
        middleC.scrollIntoView({
          behavior: "auto",
          block: "nearest",
          inline: "center",
        });
      }
    }
  }, []);

  const ensureAudioContext = useCallback(() => {
    if (audioCtxRef.current) return audioCtxRef.current;
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    audioCtxRef.current = new Ctx();
    return audioCtxRef.current;
  }, []);

  const playFreq = useCallback(
    (freq) => {
      const ctx = ensureAudioContext();
      if (!ctx) return;
      if (ctx.state === "suspended") ctx.resume().catch(() => {});

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = "triangle";
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);

      const now = ctx.currentTime;
      const attack = 0.01;
      const decay = 0.1;
      const sustain = 0.2;
      const release = 0.3;

      gain.gain.cancelScheduledValues(now);
      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.6, now + attack);
      gain.gain.linearRampToValueAtTime(sustain, now + attack + decay);
      gain.gain.setValueAtTime(sustain, now + attack + decay);
      gain.gain.linearRampToValueAtTime(0, now + attack + decay + release);

      osc.start(now);
      osc.stop(now + attack + decay + release);
    },
    [ensureAudioContext]
  );

  const playNoteByMidi = useCallback(
    (midiNumber) => {
      const freq = 440 * Math.pow(2, (midiNumber - 69) / 12);
      playFreq(freq);
    },
    [playFreq]
  );

  const handleKeyInteraction = useCallback(
    (keyData) => {
      if (onPlayNote) {
        onPlayNote(keyData.midi);
      } else {
        playNoteByMidi(keyData.midi);
      }
      if (onNoteClick) {
        onNoteClick(keyData.abc + duration);
      }
    },
    [playNoteByMidi, onNoteClick, onPlayNote, duration]
  );

  // Computer Keyboard Handlers
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isKeyboardEnabled) return;
      if (e.repeat) return;

      const tag = e.target.tagName;
      if (tag === "INPUT") return;
      if (tag === "TEXTAREA" && !captureInTextarea) return;

      // Octave Shortcuts (0-8)
      // Disable shortcuts in text areas so users can type numbers (e.g. "E2" for duration)
      if (tag !== "TEXTAREA" && e.key >= "0" && e.key <= "8") {
        setCenterOctave(parseInt(e.key));
        return;
      }

      const keyChar = e.key.toLowerCase();
      if (KEYBOARD_MAP.hasOwnProperty(keyChar)) {
        e.preventDefault();
        const semitoneOffset = KEYBOARD_MAP[keyChar];
        const baseMidi = (centerOctave + 1) * 12;
        const targetMidi = baseMidi + semitoneOffset;

        if (targetMidi >= 21 && targetMidi <= 108) {
          setActiveMidiNotes((prev) => new Set(prev).add(targetMidi));
          const keyData = PIANO_KEYS.find((k) => k.midi === targetMidi);
          if (keyData) {
            handleKeyInteraction(keyData);
          }
        }
      }
    };

    const handleKeyUp = (e) => {
      const keyChar = e.key.toLowerCase();
      if (KEYBOARD_MAP.hasOwnProperty(keyChar)) {
        const semitoneOffset = KEYBOARD_MAP[keyChar];
        const baseMidi = (centerOctave + 1) * 12;
        const targetMidi = baseMidi + semitoneOffset;
        setActiveMidiNotes((prev) => {
          const next = new Set(prev);
          next.delete(targetMidi);
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
  }, [
    isKeyboardEnabled,
    captureInTextarea,
    centerOctave,
    handleKeyInteraction,
  ]);

  return (
    <div className="flex flex-col items-center p-4 bg-gray-800 rounded-xl shadow-2xl mt-6 border border-gray-700">
      <PianoControls
        isKeyboardEnabled={isKeyboardEnabled}
        setIsKeyboardEnabled={setIsKeyboardEnabled}
        centerOctave={centerOctave}
        setCenterOctave={setCenterOctave}
      />

      {/* Piano Scroll Container */}
      <div
        ref={scrollContainerRef}
        className="relative w-full overflow-x-auto pb-4 select-none no-scrollbar"
        style={{ boxShadow: "inset 0 0 20px rgba(0,0,0,0.5)" }}
      >
        <style>{`
          .no-scrollbar::-webkit-scrollbar {
            display: none;
          }
          .no-scrollbar {
            -ms-overflow-style: none;
            scrollbar-width: none;
          }
        `}</style>
        <div className="inline-flex h-48 relative px-10 min-w-max bg-gray-900 pt-1">
          {PIANO_KEYS.map((key, index) => {
            if (key.type !== "white") return null;

            const isActive = activeMidiNotes.has(key.midi);
            const nextKey = PIANO_KEYS[index + 1];
            const hasBlackKey = nextKey && nextKey.type === "black";
            const blackKey = hasBlackKey ? nextKey : null;
            const isBlackActive =
              blackKey && activeMidiNotes.has(blackKey.midi);

            return (
              <PianoKey
                key={key.midi}
                keyData={key}
                isActive={isActive}
                blackKey={blackKey}
                isBlackActive={isBlackActive}
                onMouseDown={handleKeyInteraction}
                isKeyboardEnabled={isKeyboardEnabled}
                centerOctave={centerOctave}
              />
            );
          })}
        </div>
      </div>

      <div className="mt-3 text-xs text-gray-400 flex gap-4">
        <span>• Scroll to navigate full range</span>
        <span>• Click or use keyboard to play</span>
        <span>• Press 0-8 to switch octaves</span>
      </div>
    </div>
  );
};

export default VirtualPiano;
