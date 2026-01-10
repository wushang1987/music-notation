import React from "react";
import { KEYBOARD_MAP } from "../utils/pianoUtils";

// Helper to show keyboard shortcut on the key
const KeyHint = ({ midi, centerOctave, isBlack }) => {
  // Reverse lookup from map
  const baseMidi = (centerOctave + 1) * 12;
  const offset = midi - baseMidi;

  // Find key char for this offset
  const char = Object.keys(KEYBOARD_MAP).find(
    (k) => KEYBOARD_MAP[k] === offset
  );

  if (!char) return null;

  return (
    <span
      className={`absolute ${isBlack ? "bottom-2 text-gray-400" : "bottom-8 text-blue-400"
        } text-[10px] font-mono uppercase pointer-events-none select-none`}
    >
      {char}
    </span>
  );
};

const PianoKey = ({
  keyData,
  isActive,
  blackKey,
  isBlackActive,
  onMouseDown,
  isKeyboardEnabled,
  centerOctave,
}) => {
  return (
    <div
      data-note={keyData.label}
      className="relative" // Container for white key + optional black key
    >
      {/* White Key */}
      <div
        onMouseDown={() => onMouseDown(keyData)}
        className={`
          relative w-12 h-full border-l border-b border-r border-gray-400 rounded-b-md cursor-pointer
          flex items-end justify-center pb-2 z-0
          transition-all duration-75 active:scale-[0.99] origin-top
          ${isActive
            ? "bg-gradient-to-b from-yellow-100 to-yellow-300 shadow-inner"
            : "bg-gradient-to-b from-white to-gray-200 hover:to-gray-100"
          }
        `}
        style={{
          marginRight: "-1px", // Overlap borders
          boxShadow: isActive ? "none" : "inset 0 -5px 10px rgba(0,0,0,0.1)",
        }}
      >
        {keyData.isMiddleC && (
          <span className="absolute bottom-4 text-[10px] font-bold text-gray-400 pointer-events-none select-none">
            C4
          </span>
        )}
        {isKeyboardEnabled && (
          <KeyHint midi={keyData.midi} centerOctave={centerOctave} />
        )}
      </div>

      {/* Black Key (if exists) */}
      {blackKey && (
        <div
          onMouseDown={(e) => {
            e.stopPropagation(); // Prevent clicking white key underneath
            onMouseDown(blackKey);
          }}
          className={`
            absolute top-0 -right-4 w-8 h-[65%] rounded-b-lg cursor-pointer z-20
            border-l border-b border-r border-black
            transition-all duration-75 active:scale-[0.99] origin-top
            ${isBlackActive
              ? "bg-gradient-to-b from-yellow-600 to-yellow-800 shadow-inner"
              : "bg-gradient-to-b from-gray-800 to-black hover:from-gray-700"
            }
          `}
          style={{
            boxShadow: isBlackActive
              ? "none"
              : "2px 5px 5px rgba(0,0,0,0.4), inset 1px 0 2px rgba(255,255,255,0.2)",
          }}
        >
          {isKeyboardEnabled && (
            <KeyHint midi={blackKey.midi} centerOctave={centerOctave} isBlack />
          )}
        </div>
      )}
    </div>
  );
};

export default PianoKey;
