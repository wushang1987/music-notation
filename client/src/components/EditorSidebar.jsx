import React from "react";

const DURATIONS = [
  { label: "Whole", value: "4", icon: "𝅝" },
  { label: "Half", value: "2", icon: "𝅗𝅥" },
  { label: "Quarter", value: "", icon: "𝅘𝅥" },
  { label: "Eighth", value: "/2", icon: "𝅘𝅥𝅮" },
  { label: "Sixteenth", value: "/4", icon: "𝅘𝅥𝅯" },
];

const ACCIDENTALS = [
  { label: "Sharp", value: "^", icon: "♯" },
  { label: "Flat", value: "_", icon: "♭" },
  { label: "Natural", value: "=", icon: "♮" },
  { label: "None", value: "", icon: "○" },
];

const EditorSidebar = ({ onDurationChange, onAccidentalChange }) => {
  return (
    <div className="w-20 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-6 h-full overflow-y-auto">
      {/* Durations */}
      <div className="flex flex-col gap-2 w-full px-2">
        <span className="text-xs font-bold text-gray-500 text-center">
          Duration
        </span>
        {DURATIONS.map((d) => (
          <button
            key={d.label}
            onClick={() => onDurationChange(d.value)}
            className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-100 text-gray-700 transition-colors"
            title={d.label}
          >
            <span className="text-2xl leading-none">{d.icon}</span>
          </button>
        ))}
      </div>

      <div className="w-10 border-b border-gray-300"></div>

      {/* Accidentals */}
      <div className="flex flex-col gap-2 w-full px-2">
        <span className="text-xs font-bold text-gray-500 text-center">
          Pitch
        </span>
        {ACCIDENTALS.map((a) => (
          <button
            key={a.label}
            onClick={() => onAccidentalChange(a.value)}
            className="flex flex-col items-center justify-center p-2 rounded hover:bg-blue-100 text-gray-700 transition-colors"
            title={a.label}
          >
            <span className="text-xl leading-none">{a.icon}</span>
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditorSidebar;
