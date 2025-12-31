import { useState, useEffect, useRef, useCallback } from "react";
import { useNavigate, useParams } from "react-router-dom";
import abcjs from "abcjs";
import "abcjs/abcjs-audio.css";
import api from "../api";
import { useTranslation } from "react-i18next";
import VirtualPiano, { NOTES } from "../components/VirtualPiano";
import EditorSidebar from "../components/EditorSidebar";
import { ensureMidiProgram, INSTRUMENT_OPTIONS } from "../utils/abcMidi";
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
  const [content, setContent] = useState(
    "X: 1\nT: Title\nM: 4/4\nL: 1/4\nK: C\nC D E F | G A B c |"
  );
  const [isPublic, setIsPublic] = useState(false);
  const [instrumentProgram, setInstrumentProgram] = useState(0);
  const [tagsInput, setTagsInput] = useState("");
  const [loading, setLoading] = useState(isEdit);

  // Selection State
  const [selection, setSelection] = useState({ start: -1, end: -1 });
  const sourceRef = useRef(null);
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
          setContent(data.content);
          setIsPublic(data.isPublic);
          setInstrumentProgram(data.instrumentProgram || 0);
          setTagsInput(Array.isArray(data.tags) ? data.tags.join(", ") : "");
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

  // --- Rendering & Audio ---
  useEffect(() => {
    if (!loading) {
      const effectiveAbc = ensureMidiProgram(content, instrumentProgram);

      const renderOptions = {
        responsive: "resize",
        add_classes: true,
        clickListener: (abcElem) => {
          // Capture selection when a note is clicked
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
        "paper",
        effectiveAbc,
        renderOptions
      )[0];

      // Highlight selection
      if (selection.start !== -1) {
        // We can't easily find the SVG element by char index directly without traversing
        // But abcjs adds classes. For now, we rely on the visual feedback of the click
        // or we could implement a custom highlighter here.
        // A simple way is to re-render with a special class, but that's expensive.
        // Let's trust the user knows what they clicked for this iteration.
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
  }, [content, instrumentProgram, loading, selection]); // Re-render on selection change if we were highlighting

  // --- Modification Handlers ---
  const handleDurationChange = (newDuration) => {
    const newContent = modifyNoteInAbc(content, selection, (note) =>
      setNoteDuration(note, newDuration)
    );
    setContent(newContent);
  };

  const handleAccidentalChange = (newAccidental) => {
    const newContent = modifyNoteInAbc(content, selection, (note) =>
      setNoteAccidental(note, newAccidental)
    );
    setContent(newContent);
  };

  const handleKeyDown = useCallback(
    (e) => {
      if (selection.start === -1) return;

      if (e.key === "ArrowUp") {
        e.preventDefault();
        const newContent = modifyNoteInAbc(content, selection, (note) =>
          shiftPitch(note, 1)
        );
        setContent(newContent);
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        const newContent = modifyNoteInAbc(content, selection, (note) =>
          shiftPitch(note, -1)
        );
        setContent(newContent);
      }
    },
    [content, selection]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  // --- Line Break Helpers (insert at caret in source textarea) ---
  const insertAtSource = useCallback(
    (text) => {
      const ta = sourceRef.current;
      if (!ta) {
        // Fallback: append to end
        setContent((prev) => prev + text);
        return;
      }
      const start = ta.selectionStart ?? content.length;
      const end = ta.selectionEnd ?? start;
      const before = content.slice(0, start);
      const after = content.slice(end);
      const next = before + text + after;
      setContent(next);
      // Restore caret after React updates DOM
      requestAnimationFrame(() => {
        try {
          ta.focus();
          const pos = start + text.length;
          ta.selectionStart = pos;
          ta.selectionEnd = pos;
          ta.scrollTop = ta.scrollTop; // keep scroll position
        } catch {}
      });
    },
    [content]
  );

  const insertLineBreak = useCallback(
    () => insertAtSource("\n"),
    [insertAtSource]
  );
  const insertBarLineBreak = useCallback(
    () => insertAtSource(" |\n"),
    [insertAtSource]
  );

  // Map keyboard keys to ABC notes for quick entry
  const KEY_TO_ABC = NOTES.reduce((acc, curr) => {
    acc[curr.key] = curr.abc;
    return acc;
  }, {});

  const handleSave = async () => {
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);
      const payload = { title, content, isPublic, tags, instrumentProgram };

      if (isEdit) await api.put(`/scores/${id}`, payload);
      else await api.post("/scores", payload);

      navigate(isEdit ? `/score/${id}` : "/");
    } catch (err) {
      alert(t("score.saveFailed"));
    }
  };

  if (loading) return <div>{t("common.loading")}</div>;

  return (
    <div className="flex flex-col h-[calc(100vh-64px)]">
      {/* Top Toolbar */}
      <div className="bg-white border-b p-2 flex justify-between items-center shadow-sm z-10">
        <div className="flex gap-4 items-center">
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="border rounded px-2 py-1 font-bold"
            placeholder="Score Title"
          />
          <div id="audio" className="flex-1"></div>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleSave}
            className="bg-blue-600 text-white px-4 py-1 rounded hover:bg-blue-700"
          >
            {t("common.save")}
          </button>
        </div>
      </div>

      {/* Main Workspace */}
      <div className="flex flex-1 overflow-hidden">
        {/* Left Sidebar Palette */}
        <EditorSidebar
          onDurationChange={handleDurationChange}
          onAccidentalChange={handleAccidentalChange}
        />

        {/* Center Canvas */}
        <div className="flex-1 bg-gray-100 overflow-auto p-8 flex justify-center">
          <div className="bg-white shadow-lg p-8 min-h-200 w-full max-w-4xl">
            <div id="paper"></div>
          </div>
        </div>

        {/* Right Source Panel (Collapsible/Optional) */}
        <div className="w-80 bg-white border-l flex flex-col">
          <div className="p-2 bg-gray-50 border-b font-bold text-xs text-gray-500">
            SOURCE CODE
          </div>
          <textarea
            className="flex-1 w-full p-4 font-mono text-sm resize-none focus:outline-none"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            ref={sourceRef}
            onKeyDown={(e) => {
              // Ctrl+Enter inserts a measure break with newline
              if (e.key === "Enter" && (e.ctrlKey || e.metaKey)) {
                e.preventDefault();
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
            }}
          />
          <div className="p-4 border-t">
            <label className="block text-xs font-bold mb-1">Instrument</label>
            <select
              className="w-full border p-1 rounded"
              value={instrumentProgram}
              onChange={(e) => setInstrumentProgram(parseInt(e.target.value))}
            >
              {INSTRUMENT_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {t(opt.i18nKey)}
                </option>
              ))}
            </select>
            <div className="mt-3 flex gap-2">
              <button
                type="button"
                className="px-3 py-1 rounded border bg-white hover:bg-gray-50 text-gray-700"
                onClick={insertLineBreak}
                title="在光标处插入换行"
              >
                换行
              </button>
              <button
                type="button"
                className="px-3 py-1 rounded border bg-white hover:bg-gray-50 text-gray-700"
                onClick={insertBarLineBreak}
                title="在光标处插入小节线并换行 (Ctrl+Enter)"
              >
                小节换行
              </button>
              <label className="ml-auto flex items-center gap-2 text-xs text-gray-600">
                <input
                  type="checkbox"
                  checked={abcTypingEnabled}
                  onChange={(e) => setAbcTypingEnabled(e.target.checked)}
                />
                ABC键盘输入（默认虚拟键盘）
              </label>
            </div>
          </div>
        </div>
      </div>

      {/* Bottom: Virtual Piano (Optional, can be toggled) */}
      <div className="border-t bg-white">
        <VirtualPiano
          initialKeyboardEnabled={true}
          captureInTextarea={!abcTypingEnabled}
          onNoteClick={(n) => insertAtSource(n)}
        />
      </div>
    </div>
  );
};

export default ScoreEditor;
