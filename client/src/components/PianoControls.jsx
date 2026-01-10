import React from "react";

const PianoControls = ({
  isKeyboardEnabled,
  setIsKeyboardEnabled,
  centerOctave,
  setCenterOctave,
}) => {
  return (
    <div className="flex items-center gap-6 text-sm">
      <label className="flex items-center cursor-pointer select-none text-gray-600 hover:text-gray-800 transition-colors">
        <input
          type="checkbox"
          checked={isKeyboardEnabled}
          onChange={(e) => setIsKeyboardEnabled(e.target.checked)}
          className="mr-2 accent-blue-600 h-3.5 w-3.5 rounded border-gray-300"
        />
        <span>Keyboard Mode</span>
      </label>

      <div className="flex items-center gap-2 text-xs">
        <span className="text-gray-400 uppercase tracking-wide">Octave</span>
        <div className="flex items-center bg-white border border-gray-300 rounded overflow-hidden">
          <button
            onClick={() => setCenterOctave((o) => Math.max(0, o - 1))}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
            title="Shift Down"
          >
            -
          </button>
          <span className="w-8 h-6 flex items-center justify-center font-mono font-bold text-blue-600 bg-gray-50 border-x border-gray-200">
            C{centerOctave}
          </span>
          <button
            onClick={() => setCenterOctave((o) => Math.min(7, o + 1))}
            className="w-6 h-6 flex items-center justify-center hover:bg-gray-100 text-gray-600 transition-colors"
            title="Shift Up"
          >
            +
          </button>
        </div>
      </div>
    </div>
  );
};

export default PianoControls;
