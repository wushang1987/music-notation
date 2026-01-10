import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import api from "../api";
import { useTranslation } from "react-i18next";
import VirtualPiano, { NOTES } from "../components/VirtualPiano";
import EditorRibbon from "../components/EditorRibbon";
import {
  ensureMidiProgram,
  generateMultiPartAbc,
  INSTRUMENT_OPTIONS,
} from "../utils/abcMidi";
import { parsePianoAbc, generatePianoAbc } from "../utils/pianoHelpers";
import { PIANO_KEYS } from "../utils/pianoUtils";
import {
  modifyNoteInAbc,
  setNoteDuration,
  setNoteAccidental,
  shiftPitch,
} from "../utils/abcModification";

const ScoreEditor = () => {
  const { id } = useParams();
  const { t } = useTranslation();
  const isEdit = !!id;

  // State
  const [title, setTitle] = useState("");
  // Parts state replaces single content/instrumentProgram
  const [parts, setParts] = useState([
    {
      name: "Main",
      program: 0,
      content: "X: 1\nT: Title\nM: 4/4\nL: 1/4\nK: C\nC D E F | G A B c |",
      voiceId: "1",
    },
  ]);
  const [activePartIndex, setActivePartIndex] = useState(0);

  const [isPublic, setIsPublic] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(isEdit);

  // Selection State
  const [selection, setSelection] = useState({ start: -1, end: -1 });
  const sourceRef = useRef(null);
  const [activeHand, setActiveHand] = useState("right");
  const [abcTypingEnabled, setAbcTypingEnabled] = useState(false);

  const navigate = useNavigate();

  // --- Data Fetching ---
  useEffect(() => {
    if (isEdit) {
      const fetchScore = async () => {
        try {
          const { data } = await api.get(`/scores/${id}`, {
            params: { noCount: 1 },
          });
          setTitle(data.title);
          setIsPublic(data.isPublic);
          setTagsInput(Array.isArray(data.tags) ? data.tags.join(", ") : "");

          // Handle parts (backend should normalize, but double check)
          if (data.parts && data.parts.length > 0) {
            setParts(data.parts);
          } else {
            // Fallback for legacy if backend didn't normalize (shouldn't happen with my backend changes)
            setParts([
              {
                name: "Main",
                program: data.instrumentProgram || 0,
                content: data.content,
                voiceId: "1",
              },
            ]);
          }
        } catch (err) {
          console.error("Failed to fetch score", err);
          navigate("/");
        } finally {
          setLoading(false);
        }
      };
      fetchScore();
    }
  }, [id, isEdit, navigate]);

  // Set cursor to end of content when editor loads
  useEffect(() => {
    if (!loading && sourceRef.current) {
      const length = sourceRef.current.value.length;
      sourceRef.current.setSelectionRange(length, length);
      sourceRef.current.scrollTop = sourceRef.current.scrollHeight;
    }
  }, [loading]);

  // Helper to update content of active part
  const updateActivePartContent = (newContent) => {
    setParts((prev) => {
      const next = [...prev];
      next[activePartIndex] = { ...next[activePartIndex], content: newContent };
      return next;
    });
  };

  // --- Rendering & Audio ---
  useEffect(() => {
    if (!loading) {
      // Generate combined ABC for all parts
      const effectiveAbc = generateMultiPartAbc(parts);

      const renderOptions = {
        responsive: "resize",
        add_classes: true,
        oneSvgPerLine: true,
        clickListener: (abcElem) => {
          // Capture selection when a note is clicked
          // Note: This selection is global to the rendered ABC.
          // Mapping back to specific part content is tricky.
          // For now, we might only support click-selection if we can determine which part it belongs to.
          // Or we just disable click-selection for multi-part for now, or assume it maps to active part if simple.
          // Given the complexity, let's keep it but be aware it might be buggy for multi-part.
          if (
            abcElem &&
            abcElem.startChar !== undefined &&
            abcElem.endChar !== undefined
          ) {
            setSelection({ start: abcElem.startChar, end: abcElem.endChar });
          }
        },
      };

      const visualObj = abcjs.renderAbc(
        "abc-staging",
        effectiveAbc,
        renderOptions
      )[0];

      // Pagination Logic
      const staging = document.getElementById("abc-staging");
      const container = document.getElementById("paper-container");

      if (staging && container) {
        container.innerHTML = "";
        const svgs = Array.from(staging.querySelectorAll("svg"));

        const createPage = () => {
          const page = document.createElement("div");
          page.className =
            "bg-white shadow-lg p-8 w-full min-h-[1123px] flex flex-col";
          return page;
        };

        let currentPage = createPage();
        container.appendChild(currentPage);

        let currentHeight = 0;
        const MAX_HEIGHT = 1000;

        svgs.forEach((svg) => {
          currentPage.appendChild(svg);
          const height = svg.getBoundingClientRect().height;

          if (currentHeight + height > MAX_HEIGHT && currentHeight > 0) {
            currentPage.removeChild(svg);
            currentPage = createPage();
            container.appendChild(currentPage);
            currentPage.appendChild(svg);
            currentHeight = svg.getBoundingClientRect().height;
          } else {
            currentHeight += height;
          }
        });
      }

      if (abcjs.synth.supportsAudio()) {
        const synthControl = new abcjs.synth.SynthController();

        const cursorControl = {
          onStart: () => {
            const els = document.querySelectorAll(".highlight");
            els.forEach((el) => el.classList.remove("highlight"));
          },
          onEvent: (ev) => {
            const els = document.querySelectorAll(".highlight");
            els.forEach((el) => el.classList.remove("highlight"));

            if (ev && ev.elements) {
              ev.elements.forEach((item) => {
                if (Array.isArray(item) || item instanceof NodeList) {
                  Array.from(item).forEach((subEl) => {
                    if (subEl && subEl.classList) {
                      subEl.classList.add("highlight");
                    }
                  });
                } else if (item && item.classList) {
                  item.classList.add("highlight");
                }
              });
            }
          },
          onFinished: () => {
            const els = document.querySelectorAll(".highlight");
            els.forEach((el) => el.classList.remove("highlight"));
          },
        };

        synthControl.load("#audio", cursorControl, {
          displayLoop: true,
          displayRestart: true,
          displayPlay: true,
          displayProgress: true,
          displayWarp: true,
        });

        const createSynth = new abcjs.synth.CreateSynth();
        createSynth
          .init({ visualObj: visualObj })
          .then(() => {
            synthControl.setTune(visualObj, false);
          })
          .catch((error) => {
            console.warn("Audio problem:", error);
          });
      } else {
        const audioEl = document.querySelector("#audio");
        if (audioEl)
          audioEl.innerHTML = `<div class='text-red-500'>${t(
            "score.notSupported"
          )}</div>`;
      }
    }
  }, [parts, loading, selection]); // Re-render on parts change

  // --- Modification Handlers ---
  const handleDurationChange = (newDuration) => {
    const currentContent = parts[activePartIndex].content;
    const newContent = modifyNoteInAbc(currentContent, selection, (note) =>
      setNoteDuration(note, newDuration)
    );
    updateActivePartContent(newContent);
  };

  const handleAccidentalChange = (newAccidental) => {
    const currentContent = parts[activePartIndex].content;
    const newContent = modifyNoteInAbc(currentContent, selection, (note) =>
      setNoteAccidental(note, newAccidental)
    );
    updateActivePartContent(newContent);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (selection.start === -1) return;

      const currentContent = parts[activePartIndex].content;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const newContent = modifyNoteInAbc(currentContent, selection, (note) =>
          shiftPitch(note, 1)
        );
        updateActivePartContent(newContent);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newContent = modifyNoteInAbc(currentContent, selection, (note) =>
          shiftPitch(note, -1)
        );
        updateActivePartContent(newContent);
      }
    },
    [parts, activePartIndex, selection]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // --- Line Break Helpers (insert at caret in source textarea) ---
  const insertAtSource = useCallback(
    (text) => {
      const ta = sourceRef.current;
      const currentContent = parts[activePartIndex].content;
      const isPiano = parts[activePartIndex].program === 0;

      if (!ta) {
        // Fallback: append to end
        updateActivePartContent(currentContent + text);
        return;
      }

      // Get value from the textarea directly to ensure we are editing what the user sees
      const taValue = ta.value;
      const start = ta.selectionStart ?? taValue.length;
      const end = ta.selectionEnd ?? start;

      const before = taValue.slice(0, start);
      const after = taValue.slice(end);
      const nextVal = before + text + after;

      if (isPiano) {
        const { headers, rightHand, leftHand } = parsePianoAbc(currentContent);
        if (activeHand === "right") {
          updateActivePartContent(generatePianoAbc(headers, nextVal, leftHand));
        } else {
          updateActivePartContent(
            generatePianoAbc(headers, rightHand, nextVal)
          );
        }
      } else {
        updateActivePartContent(nextVal);
      }

      // Restore caret after React updates DOM
      requestAnimationFrame(() => {
        try {
          ta.focus();
          const pos = start + text.length;
          ta.selectionStart = pos;
          ta.selectionEnd = pos;
          ta.scrollTop = ta.scrollTop; // keep scroll position
        } catch { }
      });
    },
    [parts, activePartIndex, activeHand]
  );

  const insertLineBreak = useCallback(
    () => insertAtSource("\n"),
    [insertAtSource]
  );
  const insertBarLineBreak = useCallback(
    () => insertAtSource(" |"),
    [insertAtSource]
  );

  // Map keyboard keys to ABC notes for quick entry
  const KEY_TO_ABC = NOTES.reduce((acc, curr) => {
    acc[curr.key] = curr.abc;
    return acc;
  }, {});

  const handleTextareaKeyDown = (e) => {
    // Ctrl+Enter inserts a measure break
    if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
      e.preventDefault();
      e.stopPropagation();
      insertBarLineBreak();
      return;
    }
    // ABC typing: map letter keys to notes when enabled
    if (abcTypingEnabled && !e.ctrlKey && !e.metaKey && !e.altKey) {
      const k = e.key.toLowerCase();
      const abc = KEY_TO_ABC[k];
      if (abc) {
        e.preventDefault();
        insertAtSource(abc);
        return;
      }
    }
  };

  const handlePlayNote = useCallback(
    (midiPitch) => {
      if (abcjs.synth.supportsAudio()) {
        const noteObj = PIANO_KEYS.find((n) => n.midi === midiPitch);
        const abcNote = noteObj ? noteObj.abc : "C";
        // Construct a tiny tune with the current instrument
        const currentProgram = parts[activePartIndex].program;
        const tune = `X:1\nK:C\nL:1/4\n%%MIDI program ${currentProgram}\n${abcNote}`;

        const dummyDiv = document.createElement("div");
        const visualObj = abcjs.renderAbc(dummyDiv, tune, {})[0];

        const synth = new abcjs.synth.CreateSynth();
        synth
          .init({ visualObj: visualObj })
          .then(() => {
            synth.prime().then(() => {
              synth.start();
            });
          })
          .catch((e) => console.warn("Note playback failed", e));
      }
    },
    [parts, activePartIndex]
  );

  const handleSave = async () => {
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = {
        title,
        parts, // Send parts
        isPublic,
        tags,
        // Legacy fields are handled by backend, but we can send them if we want to be explicit
        // content: parts[0].content,
        // instrumentProgram: parts[0].program
      };

      if (isEdit) await api.put(`/scores/${id}`, payload);
      else await api.post("/scores", payload);

      navigate(isEdit ? `/score/${id}` : "/");
    } catch (err) {
      alert(t("score.saveFailed"));
    }
  };

  // --- Part Management ---
  const handleAddPart = () => {
    setParts((prev) => [
      ...prev,
      {
        name: `Part ${prev.length + 1}`,
        program: 0,
        content: "",
        voiceId: `${prev.length + 1}`,
      },
    ]);
    setActivePartIndex(parts.length);
  };

  const handleRemovePart = (index) => {
    if (parts.length <= 1) return;
    const newParts = parts.filter((_, i) => i !== index);
    setParts(newParts);
    if (activePartIndex >= index && activePartIndex > 0) {
      setActivePartIndex(activePartIndex - 1);
    } else if (activePartIndex >= newParts.length) {
      setActivePartIndex(newParts.length - 1);
    }
  };

  const handlePartNameChange = (name) => {
    setParts((prev) => {
      const next = [...prev];
      next[activePartIndex] = { ...next[activePartIndex], name };
      return next;
    });
  };

  const handlePartProgramChange = (program) => {
    setParts((prev) => {
      const next = [...prev];
      next[activePartIndex] = { ...next[activePartIndex], program };
      return next;
    });
  };

  if (loading) return <div>{t("common.loading")}</div>;

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-gray-50 text-slate-800">
      {/* Header */}
      <div className="bg-white border-b px-4 h-14 flex justify-between items-center shadow-sm z-30 no-print">
        <div className="flex gap-4 items-center flex-1">
          <button onClick={() => navigate('/')} className="text-gray-500 hover:text-gray-800">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
            </svg>
          </button>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border-none text-lg font-bold bg-transparent focus:ring-0 placeholder-gray-400"
            placeholder="Untitled Score"
          />
          <div id="audio" className="flex-1 max-w-md ml-4"></div>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => window.print()}
            className="text-gray-600 hover:bg-gray-100 px-3 py-1.5 rounded-md text-sm font-medium transition-colors flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" /></svg>
            {t("common.print") || "Print"}
          </button>
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-5 py-1.5 rounded-full font-medium text-sm hover:bg-blue-700 shadow-md transition-all active:scale-95"
          >
            {t("common.save")}
          </button>
        </div>
      </div>

      {/* Ribbon Toolbar */}
      <div className="shrink-0 z-20 no-print">
        <EditorRibbon
          onDurationChange={handleDurationChange}
          onAccidentalChange={handleAccidentalChange}
          onInsert={insertAtSource}
          onOctaveShift={(shift) => {
            const currentContent = parts[activePartIndex].content;
            const newContent = modifyNoteInAbc(currentContent, selection, (note) => shiftPitch(note, shift * 7)); // Shift by octave (7 steps)
            updateActivePartContent(newContent);
          }}
        />
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden relative">

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-100 overflow-auto p-8 flex flex-col items-center shadow-inner">
          <div
            id="paper-container"
            className="w-full max-w-[850px] flex flex-col gap-8 pb-32 transition-all duration-300"
          ></div>
          {/* Staging area */}
          <div
            id="abc-staging"
            className="absolute opacity-0 pointer-events-none w-[850px]"
          ></div>
        </div>

        {/* Right Source Panel */}
        <div className="w-80 bg-white border-l shadow-xl z-20 flex flex-col font-sans no-print">

          {/* Parts Header */}
          <div className="px-4 py-3 bg-gray-50 border-b flex justify-between items-center">
            <h3 className="text-xs font-bold text-gray-500 uppercase tracking-wider">Parts</h3>
            <button
              onClick={handleAddPart}
              className="text-xs bg-white border border-gray-300 hover:border-blue-400 hover:text-blue-500 text-gray-600 px-2 py-1 rounded transition-colors"
            >
              + New Part
            </button>
          </div>

          {/* Part List */}
          <div className="flex flex-col max-h-40 overflow-y-auto border-b">
            {parts.map((part, idx) => (
              <div
                key={idx}
                onClick={() => setActivePartIndex(idx)}
                className={`px-4 py-3 cursor-pointer text-sm border-l-4 transition-colors flex justify-between items-center group ${activePartIndex === idx
                  ? "border-l-blue-500 bg-blue-50 text-blue-700 font-medium"
                  : "border-l-transparent hover:bg-gray-50 text-gray-600"
                  }`}
              >
                <div className="truncate pr-2">{part.name}</div>
                {parts.length > 1 && (
                  <button
                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      if (confirm("Delete this part?")) handleRemovePart(idx);
                    }}
                  >
                    ×
                  </button>
                )}
              </div>
            ))}
          </div>

          {/* Active Part Config */}
          <div className="p-4 bg-gray-50 border-b space-y-3">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Name</label>
              <input
                type="text"
                value={parts[activePartIndex].name}
                onChange={(e) => handlePartNameChange(e.target.value)}
                className="w-full border-gray-300 rounded text-sm px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
              />
            </div>
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Instrument</label>
              <select
                className="w-full border-gray-300 rounded text-sm px-2 py-1 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                value={parts[activePartIndex].program}
                onChange={(e) => handlePartProgramChange(parseInt(e.target.value))}
              >
                {INSTRUMENT_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>{t(opt.i18nKey)}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Source Code Editor */}
          <div className="flex-1 flex flex-col min-h-0 bg-gray-900 text-gray-300">
            <div className="px-4 py-2 bg-gray-800 text-[10px] font-bold text-gray-400 uppercase border-b border-gray-700 flex justify-between items-center">
              <span>Source Code</span>
              {parts[activePartIndex].program === 0 && <span className="text-xs normal-case opacity-70">Piano Mode</span>}
            </div>

            {parts[activePartIndex].program === 0 ? (
              (() => {
                const { headers, rightHand, leftHand } = parsePianoAbc(parts[activePartIndex].content);
                return (
                  <div className="flex-1 flex flex-col min-h-0 divide-y divide-gray-700">
                    {/* Right Hand */}
                    <div className="flex-1 flex flex-col relative group">
                      <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] bg-gray-700 text-gray-400 rounded-bl opacity-50 group-hover:opacity-100 pointer-events-none">Treble</div>
                      <textarea
                        className="flex-1 w-full p-3 font-mono text-sm bg-transparent resize-none focus:outline-none focus:bg-gray-800 transition-colors"
                        value={rightHand}
                        spellCheck="false"
                        onChange={(e) => updateActivePartContent(generatePianoAbc(headers, e.target.value, leftHand))}
                        onFocus={(e) => { setActiveHand("right"); sourceRef.current = e.target; }}
                        ref={(el) => { if (activeHand === "right") sourceRef.current = el; }}
                        onKeyDown={handleTextareaKeyDown}
                      />
                    </div>
                    {/* Left Hand */}
                    <div className="flex-1 flex flex-col relative group">
                      <div className="absolute top-0 right-0 px-2 py-0.5 text-[9px] bg-gray-700 text-gray-400 rounded-bl opacity-50 group-hover:opacity-100 pointer-events-none">Bass</div>
                      <textarea
                        className="flex-1 w-full p-3 font-mono text-sm bg-transparent resize-none focus:outline-none focus:bg-gray-800 transition-colors"
                        value={leftHand}
                        spellCheck="false"
                        onChange={(e) => updateActivePartContent(generatePianoAbc(headers, rightHand, e.target.value))}
                        onFocus={(e) => { setActiveHand("left"); sourceRef.current = e.target; }}
                        ref={(el) => { if (activeHand === "left") sourceRef.current = el; }}
                        onKeyDown={handleTextareaKeyDown}
                      />
                    </div>
                  </div>
                );
              })()
            ) : (
              <textarea
                className="flex-1 w-full p-3 font-mono text-sm bg-transparent resize-none focus:outline-none focus:bg-gray-800 transition-colors"
                value={parts[activePartIndex].content}
                spellCheck="false"
                onChange={(e) => updateActivePartContent(e.target.value)}
                ref={sourceRef}
                onFocus={(e) => { setActiveHand("right"); sourceRef.current = e.target; }}
                onKeyDown={handleTextareaKeyDown}
              />
            )}
          </div>

          {/* Quick Actions */}
          <div className="p-2 bg-gray-100 border-t flex gap-2 overflow-x-auto no-scrollbar">
            <button onClick={insertLineBreak} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50 whitespace-nowrap">Insert Line</button>
            <button onClick={insertBarLineBreak} className="px-2 py-1 text-xs border rounded bg-white hover:bg-gray-50 whitespace-nowrap">Insert Bar</button>
            <label className="flex items-center gap-1.5 text-xs text-gray-600 ml-auto whitespace-nowrap px-1 cursor-pointer select-none">
              <input type="checkbox" checked={abcTypingEnabled} onChange={(e) => setAbcTypingEnabled(e.target.checked)} />
              <span>Type ABC</span>
            </label>
          </div>

        </div>
      </div>

      {/* Piano (Fixed Bottom) */}
      <div className="shrink-0 z-30 no-print">
        <VirtualPiano
          initialKeyboardEnabled={true}
          captureInTextarea={!abcTypingEnabled}
          onNoteClick={(n) => insertAtSource(n)}
          onPlayNote={handlePlayNote}
        />
      </div>
    </div>
  );
};

export default ScoreEditor;
