import React from "react";

const SECTIONS = [
  {
    title: "Note Duration",
    items: [
      { label: "Whole", value: "4", icon: "𝅝" },
      { label: "Half", value: "2", icon: "𝅗𝅥" },
      { label: "Quarter", value: "", icon: "𝅘𝅥" },
      { label: "Eighth", value: "/2", icon: "𝅘𝅥𝅮" },
      { label: "Sixteenth", value: "/4", icon: "𝅘𝅥𝅯" },
    ],
    action: "duration",
  },
  {
    title: "Rests",
    items: [
      { label: "Whole Rest", value: "z4", icon: "𝄻" },
      { label: "Half Rest", value: "z2", icon: "𝄼" },
      { label: "Quarter Rest", value: "z", icon: "𝄽" },
      { label: "Eighth Rest", value: "z/2", icon: "𝄾" },
      { label: "Sixteenth Rest", value: "z/4", icon: "𝄿" },
    ],
    action: "insert",
  },
  {
    title: "Accidentals",
    items: [
      { label: "Sharp", value: "^", icon: "♯" },
      { label: "Flat", value: "_", icon: "♭" },
      { label: "Natural", value: "=", icon: "♮" },
      { label: "None", value: "", icon: "○" },
    ],
    action: "accidental",
  },
  {
    title: "Bar Lines",
    items: [
      { label: "Single Bar", value: "|", icon: "|" },
      { label: "Double Bar", value: "||", icon: "||" },
      { label: "Repeat Start", value: "|:", icon: "|:" },
      { label: "Repeat End", value: ":|", icon: ":|" },
      { label: "Final Bar", value: "|]", icon: "|]" },
    ],
    action: "insert_spaced",
  },
  {
    title: "Dynamics",
    items: [
      { label: "Pianississimo", value: "!ppp!", icon: "ppp" },
      { label: "Pianissimo", value: "!pp!", icon: "pp" },
      { label: "Piano", value: "!p!", icon: "p" },
      { label: "Mezzo Piano", value: "!mp!", icon: "mp" },
      { label: "Mezzo Forte", value: "!mf!", icon: "mf" },
      { label: "Forte", value: "!f!", icon: "f" },
      { label: "Fortissimo", value: "!ff!", icon: "ff" },
      { label: "Fortississimo", value: "!fff!", icon: "fff" },
    ],
    action: "insert",
  },
  {
    title: "Decorations",
    items: [
      { label: "Staccato", value: ".", icon: "•" },
      { label: "Trill", value: "!trill!", icon: "tr" },
      { label: "Fermata", value: "!fermata!", icon: "𝄐" },
      { label: "Accent", value: ">", icon: ">" },
    ],
    action: "insert",
  },
];

const EditorSidebar = ({ onDurationChange, onAccidentalChange, onInsert }) => {
  const handleClick = (section, item) => {
    switch (section.action) {
      case "duration":
        onDurationChange(item.value);
        break;
      case "accidental":
        onAccidentalChange(item.value);
        break;
      case "insert":
        onInsert(item.value);
        break;
      case "insert_spaced":
        onInsert(" " + item.value + " ");
        break;
      default:
        break;
    }
  };

  return (
    <div className="w-24 bg-gray-50 border-r border-gray-200 flex flex-col items-center py-4 gap-4 h-full overflow-y-auto no-scrollbar">
      {SECTIONS.map((section, idx) => (
        <React.Fragment key={section.title}>
          {idx > 0 && <div className="w-16 border-b border-gray-300 my-1"></div>}

          <div className="flex flex-col gap-2 w-full px-2 items-center">
            <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider text-center mb-1">
              {section.title}
            </span>
            <div className="flex flex-wrap justify-center gap-2">
              {section.items.map((item) => (
                <button
                  key={item.label}
                  onClick={() => handleClick(section, item)}
                  className="flex items-center justify-center w-8 h-8 rounded bg-white border border-gray-200 hover:bg-blue-50 hover:border-blue-300 hover:text-blue-600 text-gray-700 transition-all shadow-sm"
                  title={item.label}
                >
                  <span className={`leading-none ${section.title === 'Dynamics' ? 'font-serif italic font-bold' : 'text-lg'}`}>
                    {item.icon}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </React.Fragment>
      ))}
    </div>
  );
};

export default EditorSidebar;
