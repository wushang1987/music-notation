import React from "react";

const PianoControls = ({
  isKeyboardEnabled,
  setIsKeyboardEnabled,
  centerOctave,
  setCenterOctave,
}) => {
  return (
    <div className="flex justify-between w-full mb-4 px-2 text-gray-200">
      <div className="flex items-center gap-4">
        <h3 className="font-bold text-lg tracking-wide text-white">
          88-Key Piano
        </h3>
        <label className="flex items-center text-sm cursor-pointer select-none hover:text-white transition-colors">
          <input
            type="checkbox"
            checked={isKeyboardEnabled}
            onChange={(e) => setIsKeyboardEnabled(e.target.checked)}
            className="mr-2 accent-blue-500 h-4 w-4"
          />
          Keyboard Mode
        </label>
      </div>

      <div className="flex items-center gap-3 bg-gray-900 p-1 rounded-lg border border-gray-700">
        <span className="text-xs text-gray-400 px-2 uppercase tracking-wider hidden sm:inline">
          Keyboard Octave (0-8)
        </span>
        <button
          onClick={() => setCenterOctave((o) => Math.max(0, o - 1))}
          className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
          title="Shift Keyboard Range Down"
        >
          -
        </button>
        <span className="w-8 text-center font-mono font-bold text-blue-400 select-none">
          C{centerOctave}
        </span>
        <button
          onClick={() => setCenterOctave((o) => Math.min(7, o + 1))}
          className="w-8 h-8 flex items-center justify-center bg-gray-700 hover:bg-gray-600 rounded text-white transition-colors"
          title="Shift Keyboard Range Up"
        >
          +
        </button>
      </div>
    </div>
  );
};

export default PianoControls;
