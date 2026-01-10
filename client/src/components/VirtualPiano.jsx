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
      if (ctx.state === "suspended") ctx.resume().catch(() => { });

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
      if (Object.prototype.hasOwnProperty.call(KEYBOARD_MAP, keyChar)) {
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
      if (Object.prototype.hasOwnProperty.call(KEYBOARD_MAP, keyChar)) {
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


  const [isVisible, setIsVisible] = useState(true);

  return (
    <div className={`virtual-piano flex flex-col items-center bg-white shadow-[0_-4px_6px_-1px_rgba(0,0,0,0.1)] border-t border-gray-200 transition-all duration-300 ${isVisible ? 'h-auto pb-4' : 'h-8 overflow-hidden'}`}>

      {/* Toggle Header */}
      <div
        className="w-full flex justify-between items-center px-4 py-1 bg-gray-50 border-b border-gray-200 cursor-pointer hover:bg-gray-100"
        onClick={() => setIsVisible(!isVisible)}
      >
        <div className="flex items-center gap-2">
          <button className="text-gray-400 hover:text-gray-600 focus:outline-none">
            {isVisible ? '▼' : '▲'}
          </button>
          <span className="text-gray-500 font-bold text-xs uppercase tracking-wider">Virtual Piano</span>
        </div>

        <div onClick={e => e.stopPropagation()}>
          <PianoControls
            isKeyboardEnabled={isKeyboardEnabled}
            setIsKeyboardEnabled={setIsKeyboardEnabled}
            centerOctave={centerOctave}
            setCenterOctave={setCenterOctave}
          />
        </div>
      </div>

      {/* Piano Scroll Container */}
      <div
        ref={scrollContainerRef}
        className={`virtual-piano__scroll relative w-full overflow-x-auto select-none no-scrollbar transition-opacity duration-300 ${isVisible ? 'opacity-100 mt-2' : 'opacity-0'}`}
        style={{ boxShadow: "inset 0 0 10px rgba(0,0,0,0.05)" }}
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
        <div className="virtual-piano__keys inline-flex h-28 relative px-10 min-w-max bg-gray-100 pt-1 border-t border-gray-300">
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
    </div>
  );
};

export default VirtualPiano;
