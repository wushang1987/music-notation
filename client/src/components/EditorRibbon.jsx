import React, { useState } from "react";

const SECTIONS = [
    {
        id: "notes",
        title: "Notes",
        groups: [
            {
                label: "Duration",
                items: [
                    { label: "Whole", value: "4", icon: "𝅝", action: "duration" },
                    { label: "Half", value: "2", icon: "𝅗𝅥", action: "duration" },
                    { label: "Quarter", value: "", icon: "𝅘𝅥", action: "duration" },
                    { label: "Eighth", value: "/2", icon: "𝅘𝅥𝅮", action: "duration" },
                    { label: "Sixteenth", value: "/4", icon: "𝅘𝅥𝅯", action: "duration" },
                ],
            },
            {
                label: "Rests",
                items: [
                    { label: "Whole Rest", value: "z4", icon: "𝄻", action: "insert" },
                    { label: "Half Rest", value: "z2", icon: "𝄼", action: "insert" },
                    { label: "Quarter Rest", value: "z", icon: "𝄽", action: "insert" },
                    { label: "Eighth Rest", value: "z/2", icon: "𝄾", action: "insert" },
                    { label: "Sixteenth Rest", value: "z/4", icon: "𝄿", action: "insert" },
                ],
            },
            {
                label: "Accidentals",
                items: [
                    { label: "Sharp", value: "^", icon: "♯", action: "accidental" },
                    { label: "Flat", value: "_", icon: "♭", action: "accidental" },
                    { label: "Natural", value: "=", icon: "♮", action: "accidental" },
                    { label: "None", value: "", icon: "○", action: "accidental" },
                ],
            },
            {
                label: "Octave",
                items: [
                    { label: "Up", value: "up", icon: "↑", action: "octave" },
                    { label: "Down", value: "down", icon: "↓", action: "octave" },
                ]
            }
        ],
    },
    {
        id: "measures",
        title: "Measures",
        groups: [
            {
                label: "Bar Lines",
                items: [
                    { label: "Single Bar", value: "|", icon: "|", action: "insert_spaced" },
                    { label: "Double Bar", value: "||", icon: "||", action: "insert_spaced" },
                    { label: "Repeat Start", value: "|:", icon: "|:", action: "insert_spaced" },
                    { label: "Repeat End", value: ":|", icon: ":|", action: "insert_spaced" },
                    { label: "Final Bar", value: "|]", icon: "|]", action: "insert_spaced" },
                ],
            },
        ],
    },
    {
        id: "dynamics",
        title: "Dynamics",
        groups: [
            {
                label: "Dynamics",
                items: [
                    { label: "ppp", value: "!ppp!", icon: "ppp", action: "insert" },
                    { label: "pp", value: "!pp!", icon: "pp", action: "insert" },
                    { label: "p", value: "!p!", icon: "p", action: "insert" },
                    { label: "mp", value: "!mp!", icon: "mp", action: "insert" },
                    { label: "mf", value: "!mf!", icon: "mf", action: "insert" },
                    { label: "f", value: "!f!", icon: "f", action: "insert" },
                    { label: "ff", value: "!ff!", icon: "ff", action: "insert" },
                    { label: "fff", value: "!fff!", icon: "fff", action: "insert" },
                ],
            },
        ],
    },
    {
        id: "articulations",
        title: "Articulations",
        groups: [
            {
                label: "Decorations",
                items: [
                    { label: "Staccato", value: ".", icon: "•", action: "insert" },
                    { label: "Trill", value: "!trill!", icon: "tr", action: "insert" },
                    { label: "Fermata", value: "!fermata!", icon: "𝄐", action: "insert" },
                    { label: "Accent", value: ">", icon: ">", action: "insert" },
                    { label: "Tenuto", value: "!tenuto!", icon: "-", action: "insert" },
                ],
            },
        ],
    },
];

const EditorRibbon = ({ onDurationChange, onAccidentalChange, onInsert, onOctaveShift }) => {
    const [activeTab, setActiveTab] = useState("notes");

    const handleClick = (item) => {
        switch (item.action) {
            case "duration":
                onDurationChange && onDurationChange(item.value);
                break;
            case "accidental":
                onAccidentalChange && onAccidentalChange(item.value);
                break;
            case "insert":
                onInsert && onInsert(item.value);
                break;
            case "insert_spaced":
                onInsert && onInsert(" " + item.value + " ");
                break;
            case "octave":
                onOctaveShift && onOctaveShift(item.value === 'up' ? 1 : -1);
                break;
            default:
                break;
        }
    };

    const activeSection = SECTIONS.find((s) => s.id === activeTab);

    return (
        <div className="flex flex-col bg-white border-b shadow-sm w-full z-20">
            {/* Tabs Row */}
            <div className="flex px-4 border-b bg-gray-50 overflow-x-auto no-scrollbar">
                {SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`
              px-6 py-2 text-sm font-medium whitespace-nowrap transition-colors relative
              ${activeTab === section.id
                                ? "text-blue-600 bg-white border-t-2 border-t-blue-600 border-x border-b-white -mb-px rounded-t"
                                : "text-gray-600 hover:text-gray-800 hover:bg-gray-100"
                            }
            `}
                    >
                        {section.title}
                    </button>
                ))}
            </div>

            {/* Toolbar Content */}
            <div className="p-2 h-16 flex items-center gap-6 overflow-x-auto no-scrollbar bg-white">
                {activeSection &&
                    activeSection.groups.map((group, gIdx) => (
                        <div key={gIdx} className="flex items-center gap-3 border-r pr-6 last:border-0">
                            <div className="flex gap-1">
                                {group.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleClick(item)}
                                        className={`
                      flex flex-col items-center justify-center w-10 h-10 rounded 
                      hover:bg-blue-50 hover:text-blue-600 text-gray-700 transition-all
                      border border-transparent hover:border-blue-200
                    `}
                                        title={item.label}
                                    >
                                        <span
                                            className={`leading-none ${item.icon.length > 2 ? "font-serif italic font-bold text-lg" : "text-2xl"
                                                }`}
                                        >
                                            {item.icon}
                                        </span>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
            </div>
        </div>
    );
};

export default EditorRibbon;
