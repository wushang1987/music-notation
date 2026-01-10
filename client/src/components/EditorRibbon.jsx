import React, { useState } from "react";
import { useTranslation } from "react-i18next";

const EditorRibbon = ({ onDurationChange, onAccidentalChange, onInsert, onOctaveShift }) => {
    const [activeTab, setActiveTab] = useState("notes");
    const { t } = useTranslation();

    const SECTIONS = [
        {
            id: "notes",
            titleKey: "editor.ribbon.notes",
            groups: [
                {
                    label: "Duration",
                    items: [
                        { label: "Whole", value: "4", icon: "𝅝", action: "duration" },
                        { label: "Half", value: "2", icon: "𝅗𝅥", action: "duration" },
                        { label: "Quarter", value: "", icon: "𝅘𝅥", action: "duration" },
                        { label: "Eighth", value: "/2", icon: "𝅘𝅥𝅮", action: "duration" },
                        { label: "Sixteenth", value: "/4", icon: "𝅘𝅥𝅯", action: "duration" },
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
            titleKey: "editor.ribbon.measures",
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
            titleKey: "editor.ribbon.dynamics",
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
            titleKey: "editor.ribbon.articulations",
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
        <div className="flex flex-col bg-white border-b border-gray-200 w-full z-20">
            {/* Tabs Row - Compact */}
            <div className="flex px-3 bg-gray-50/50 overflow-x-auto no-scrollbar border-b border-gray-100">
                {SECTIONS.map((section) => (
                    <button
                        key={section.id}
                        onClick={() => setActiveTab(section.id)}
                        className={`
                            px-4 py-1.5 text-xs font-medium whitespace-nowrap transition-all relative
                            ${activeTab === section.id
                                ? "text-blue-600 bg-white/80"
                                : "text-gray-500 hover:text-gray-700 hover:bg-white/40"
                            }
                        `}
                    >
                        {t(section.titleKey)}
                        {activeTab === section.id && (
                            <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-500"></div>
                        )}
                    </button>
                ))}
            </div>

            {/* Toolbar Content - Compact */}
            <div className="px-3 py-1.5 h-12 flex items-center gap-4 overflow-x-auto no-scrollbar bg-white">
                {activeSection &&
                    activeSection.groups.map((group, gIdx) => (
                        <div key={gIdx} className="flex items-center gap-2 border-r border-gray-100 pr-4 last:border-0">
                            <div className="flex gap-0.5">
                                {group.items.map((item) => (
                                    <button
                                        key={item.label}
                                        onClick={() => handleClick(item)}
                                        className={`
                                            flex flex-col items-center justify-center w-8 h-8 rounded 
                                            hover:bg-blue-50 hover:text-blue-600 text-gray-600 transition-all
                                            border border-transparent hover:border-blue-100
                                        `}
                                        title={item.label}
                                    >
                                        <span
                                            className={`leading-none ${item.icon.length > 2 ? "font-serif italic font-bold text-base" : "text-xl"
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
