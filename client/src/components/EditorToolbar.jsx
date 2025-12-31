import React from "react";

const DURATIONS = [
  { label: "Whole", value: "4", icon: "𝅝" },
  { label: "Half", value: "2", icon: "𝅗𝅥" },
  { label: "Quarter", value: "", icon: "𝅘𝅥" },
  { label: "Eighth", value: "/2", icon: "𝅘𝅥𝅮" },
  { label: "Sixteenth", value: "/4", icon: "𝅘𝅥𝅯" },
];

const SYMBOLS = [
  { label: "Bar", value: " | " },
  { label: "Repeat Start", value: " |: " },
  { label: "Repeat End", value: " :| " },
];

const EditorToolbar = ({ currentDuration, onDurationChange, onInsert }) => {
  return (
    <div className="flex flex-wrap gap-2 p-2 bg-gray-50 border-b border-gray-200">
      <div className="flex items-center gap-1 border-r border-gray-300 pr-2 mr-2">
        <span className="text-xs font-semibold text-gray-500 mr-1">
          Duration:
        </span>
        {DURATIONS.map((d) => (
          <button
            key={d.label}
            onClick={() => onDurationChange(d.value)}
            className={`
              px-2 py-1 rounded text-lg leading-none min-w-[32px]
              ${
                currentDuration === d.value
                  ? "bg-blue-500 text-white shadow-sm"
                  : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
              }
            `}
            title={d.label}
          >
            {d.icon}
          </button>
        ))}
      </div>

      <div className="flex items-center gap-1">
        <span className="text-xs font-semibold text-gray-500 mr-1">Tools:</span>
        {SYMBOLS.map((s) => (
          <button
            key={s.label}
            onClick={() => onInsert(s.value)}
            className="px-2 py-1 text-sm bg-white text-gray-700 hover:bg-gray-100 border border-gray-200 rounded"
          >
            {s.label}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EditorToolbar;
