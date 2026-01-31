import React, { useState, useEffect, useRef, useCallback, useMemo } from "react";

import { useParams, useNavigate } from "react-router-dom";
import { useTranslation } from "react-i18next";
import Editor, { useMonaco } from "@monaco-editor/react";
import api from "../api";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

import VerovioService from "../services/VerovioService";
import { Save, ArrowLeft, Printer, ZoomIn, ZoomOut, FileCode, Settings, Terminal, Layout } from "lucide-react";



import RibbonPalette from "../components/Verovio/RibbonPalette";

import MetadataPanel from "../components/Verovio/MetadataPanel";

import ScoreViewer from "../components/Verovio/ScoreViewer";
import FloatingToolbar from "../components/Verovio/FloatingToolbar";
import { Button } from "../components/ui/button";
import { useEditorStore } from "../store/editorStore";
import { cn } from "../lib/utils";
import { usePaletteState } from "../hooks/usePaletteState";
import { SNIPPET_GROUPS, getSnippetById } from "../services/snippetCatalog";
import { applySnippetInsert } from "../controllers/insertController";




const DEFAULT_MEI = `<?xml version="1.0" encoding="UTF-8"?>
<mei xmlns="http://www.music-encoding.org/ns/mei" meiversion="5.0">
  <meiHead>
    <fileDesc>
      <titleStmt>
        <title>New Verovio Score</title>
      </titleStmt>
      <pubStmt/>
    </fileDesc>
  </meiHead>
  <music>
    <body>
      <mdiv>
        <score>
          <scoreDef>
            <staffGrp>
              <staffDef n="1" lines="5" clef.shape="G" clef.line="2" key.sig="0" meter.count="4" meter.unit="4"/>
            </staffGrp>
          </scoreDef>
          <section>
            <measure n="1">
              <staff n="1">
                <layer n="1">
                  <note pname="c" oct="4" dur="4"/>
                  <note pname="d" oct="4" dur="4"/>
                  <note pname="e" oct="4" dur="4"/>
                  <note pname="f" oct="4" dur="4"/>
                </layer>
              </staff>
            </measure>
          </section>
        </score>
      </mdiv>
    </body>
  </music>
</mei>`;

const VerovioEditor = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { t } = useTranslation();
  const { user } = useContext(AuthContext);
  const isEdit = !!id;

  const {
    selectedId,
    setSelectedId,
    zoom,
    setZoom,
    viewMode,
    setViewMode,
    rendering,
    setRendering,
    content,
    setContent,
    activeTool,
    setActiveTool,
  } = useEditorStore();


  const [title, setTitle] = useState("Untitled Score");
  const [loading, setLoading] = useState(isEdit);
  const [saving, setSaving] = useState(false);
  const [svg, setSvg] = useState("");
  const [isPublic, setIsPublic] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [showMetadata, setShowMetadata] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const paletteState = usePaletteState(SNIPPET_GROUPS);
  const [ribbonFeedback, setRibbonFeedback] = useState(null);
  const [historyStack, setHistoryStack] = useState({ past: [], future: [] });

  const {
    groups,
    activeGroup,
    setActiveGroup,
    pinned,
    togglePinned,
    searchValue,
    setSearchValue,
    snippets: paletteSnippets = [],
    recentIds,
    markRecent,
  } = paletteState;


  const monaco = useMonaco();

  const editorRef = useRef(null);
  const renderTimeoutRef = useRef(null);
  const contentRef = useRef("");

  const renderScore = useCallback((mei) => {
    setRendering(true);
    if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);

    renderTimeoutRef.current = setTimeout(() => {
      try {
        const renderedSvg = VerovioService.render(mei, { scale: zoom });
        if (renderedSvg) setSvg(renderedSvg);
      } catch (err) {
        console.warn("Verovio render failed", err);
      } finally {
        setRendering(false);
      }
    }, 300); // Debounce rendering
  }, [zoom, setRendering]);

  useEffect(() => {
    const initVerovio = async (initialMei) => {
      try {
        await VerovioService.init();
        const baseMei = initialMei ?? contentRef.current ?? DEFAULT_MEI;
        renderScore(baseMei);
      } catch (err) {
        console.error("Verovio initialization failed", err);
      }
    };

    if (isEdit) {
      const fetchScore = async () => {
        try {
          const { data } = await api.get(`/scores/${id}`);
          setTitle(data.title);
          setContent(data.content);
          setIsPublic(data.isPublic);
          setTagsInput(data.tags?.join(", ") || "");
          setLoading(false);
          initVerovio(data.content);
        } catch (err) {
          console.error("Failed to fetch score", err);
          setLoading(false);
        }
      };
      fetchScore();
    } else {
      setContent(DEFAULT_MEI);
      setLoading(false);
      initVerovio(DEFAULT_MEI);
    }

    return () => {
      if (renderTimeoutRef.current) clearTimeout(renderTimeoutRef.current);
    };
  }, [id, isEdit, renderScore, setContent]);

  useEffect(() => {
    if (!loading) {
      renderScore(content);
    }
  }, [content, loading, renderScore]);

  useEffect(() => {
    contentRef.current = content || "";
  }, [content]);

  useEffect(() => {
    if (!ribbonFeedback || typeof window === "undefined") return undefined;
    const timer = window.setTimeout(() => setRibbonFeedback(null), 3200);
    return () => window.clearTimeout(timer);
  }, [ribbonFeedback]);


  const handleEditorDidMount = (editor) => {

    editorRef.current = editor;
  };

  const insertSnippet = (snippet) => {
    if (editorRef.current && monaco) {
      const selection = editorRef.current.getSelection();
      const range = new monaco.Range(
        selection.startLineNumber,
        selection.startColumn,
        selection.endLineNumber,
        selection.endColumn
      );
      const id = { major: 1, minor: 1 };
      const text = snippet;
      const op = { identifier: id, range: range, text: text, forceMoveMarkers: true };
      editorRef.current.executeEdits("snippet", [op]);
      editorRef.current.focus();
    }
  };

  const pushSnapshot = useCallback((snapshot) => {
    if (!snapshot) return;
    setHistoryStack((prev) => ({
      past: [...prev.past, snapshot].slice(-15),
      future: [],
    }));
  }, []);

  const handleUndo = useCallback(() => {
    setHistoryStack((prev) => {
      if (!prev.past.length) return prev;
      const previous = prev.past[prev.past.length - 1];
      setContent(previous);
      setRibbonFeedback({ type: "info", message: "已撤销上一步" });
      return {
        past: prev.past.slice(0, -1),
        future: [contentRef.current || DEFAULT_MEI, ...prev.future].slice(0, 15),
      };
    });
  }, [setContent]);

  const handleRedo = useCallback(() => {
    setHistoryStack((prev) => {
      if (!prev.future.length) return prev;
      const next = prev.future[0];
      setContent(next);
      setRibbonFeedback({ type: "info", message: "已恢复插入" });
      return {
        past: [...prev.past, contentRef.current || DEFAULT_MEI].slice(-15),
        future: prev.future.slice(1),
      };
    });
  }, [setContent]);

  const handleSnippetCommand = (snippetId) => {
    const snippet = getSnippetById(snippetId);
    if (!snippet) {
      setRibbonFeedback({ type: "error", message: "片段不存在" });
      return;
    }

    const baseMei = contentRef.current?.trim() ? contentRef.current : DEFAULT_MEI;
    const result = applySnippetInsert(baseMei, snippet);
    if (!result.success) {
      setRibbonFeedback({ type: "error", message: result.error });
      return;
    }

    pushSnapshot(baseMei);
    setContent(result.mei);
    setRibbonFeedback({ type: "success", message: `已添加 ${snippet.label}` });
    markRecent(snippet.id);
    setActiveTool(snippet.id);
  };

  const recentSnippets = useMemo(
    () => recentIds.map((id) => getSnippetById(id)).filter(Boolean),
    [recentIds]
  );

  const historySummary = useMemo(
    () => ({ undo: historyStack.past.length, redo: historyStack.future.length }),
    [historyStack]
  );

  const handleVisualEdit = (command) => {

    setRendering(true);
    // Verovio toolkit edit commands expect a specific format
    const newMei = VerovioService.edit(command);
    if (newMei) {
      setContent(newMei);
      // Small delay to ensure state update before re-render
      setTimeout(() => {
        renderScore(newMei);
      }, 50);
    } else {
      setRendering(false);
    }
  };

  const handleSave = async () => {
    if (!user) {
      alert(t("auth.loginRequiredToSave", "You must be logged in to save your music."));
      navigate("/auth");
      return;
    }

    setSaving(true);
    try {
      const tags = tagsInput
        .split(",")
        .map((t) => t.trim())
        .filter(Boolean);

      const payload = {
        title,
        content,
        notationType: "verovio",
        isPublic,
        tags
      };

      if (isEdit) await api.put(`/scores/${id}`, payload);
      else await api.post("/scores", payload);

      navigate(isEdit ? `/score/${id}` : "/");
    } catch (err) {
      alert(t("score.saveFailed", "Failed to save score"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div className="h-screen flex items-center justify-center bg-slate-900">
      <div className="flex flex-col items-center gap-4">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        <span className="text-slate-400 font-medium animate-pulse">Initializing Verovio Engine...</span>
      </div>
    </div>
  );

  return (
    <div className="flex flex-col h-screen overflow-hidden bg-slate-950 text-slate-200">
      {/* Header */}
      <header className="h-14 border-b border-slate-800 bg-slate-900/80 backdrop-blur-xl flex items-center justify-between px-6 z-40 shadow-2xl">
        <div className="flex items-center gap-6">
          <button onClick={() => navigate('/')} className="p-2 hover:bg-slate-800 rounded-xl transition-all text-slate-500 hover:text-white active:scale-90">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex flex-col">
            <h1 className="text-sm font-bold text-slate-100 tracking-tight">{title}</h1>
            <div className="flex items-center gap-2">
              <span className="text-[9px] bg-blue-500/10 text-blue-400 px-1.5 py-0.5 rounded border border-blue-500/20 font-bold tracking-widest uppercase">Canvas Mode</span>
              <span className="text-[9px] text-slate-500 font-medium uppercase tracking-widest">{rendering ? 'Syncing...' : 'Ready'}</span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="flex bg-slate-800/50 p-1 rounded-xl border border-slate-800">
            <button onClick={() => setShowSource(!showSource)} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${showSource ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
              <FileCode className="w-3 h-3 inline mr-2" />
              Source
            </button>
            <button onClick={() => { setShowSource(false); setViewMode("preview"); }} className={`px-4 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all ${!showSource ? 'bg-slate-700 text-white shadow-xl' : 'text-slate-500 hover:text-slate-300'}`}>
              <Layout className="w-3 h-3 inline mr-2" />
              Canvas
            </button>
          </div>

          <div className="h-6 w-px bg-slate-800 mx-2" />

          <button onClick={() => setShowMetadata(!showMetadata)} className={`p-2 rounded-xl transition-all ${showMetadata ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' : 'text-slate-500 hover:text-white border border-transparent'}`}>
            <Settings className="w-5 h-5" />
          </button>

          <button
            onClick={handleSave}
            disabled={saving}
            className="bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-500 hover:to-blue-400 text-white px-6 py-2 rounded-xl font-bold text-xs shadow-2xl shadow-blue-500/20 transition-all flex items-center gap-2 active:scale-95 disabled:opacity-50"
          >
            {saving ? <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <Save className="w-3.5 h-3.5" />}
            {t("common.save")}
          </button>
        </div>
      </header>

      <RibbonPalette
        groups={groups}
        activeGroup={activeGroup}
        onGroupChange={setActiveGroup}
        pinned={pinned}
        onTogglePin={togglePinned}
        searchValue={searchValue}
        onSearchChange={setSearchValue}
        snippets={paletteSnippets}
        onSnippetSelect={handleSnippetCommand}
        activeTool={activeTool}
        recentSnippets={recentSnippets}
        feedback={ribbonFeedback}
        historySummary={historySummary}
        onUndo={handleUndo}
        onRedo={handleRedo}
        canUndo={historySummary.undo > 0}
        canRedo={historySummary.redo > 0}
      />

      {/* Main Container */}
      <div className="flex-1 flex overflow-hidden">
        {/* Content Area */}
        <main className="flex-1 flex overflow-hidden relative">

          {/* Source Editor (Monaco) - Always mounted but toggleable visibility */}
          <div className={cn(
            "h-full border-r border-slate-800/50 flex flex-col bg-slate-950 transition-all duration-500",
            showSource ? "w-1/2" : "w-0 opacity-0 pointer-events-none border-none"
          )}>
            <div className="h-8 bg-slate-900/50 px-4 flex items-center justify-between border-b border-slate-800/50">
              <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                <Terminal className="w-3 h-3" />
                MEI Source Inspector
              </span>
            </div>
            <Editor
              height="100%"
              defaultLanguage="xml"
              theme="vs-dark"
              value={content}
              onChange={(value) => setContent(value || "")}
              onMount={handleEditorDidMount}
              options={{
                minimap: { enabled: false },
                fontSize: 13,
                lineNumbers: "on",
                scrollBeyondLastLine: false,
                automaticLayout: true,
                wordWrap: "on",
              }}
            />
          </div>

          {/* Canvas Preview Area */}
          <div className={cn("h-full flex flex-col relative overflow-hidden transition-all duration-500", showSource ? "w-1/2" : "w-full")}>

            {/* Toolbar overlay for the canvas */}
            <div className="absolute top-4 left-1/2 -translate-x-1/2 z-20 flex items-center gap-2 bg-white/80 backdrop-blur border border-slate-200 p-1.5 rounded-2xl shadow-xl">
              <div className="flex items-center gap-1 border-r border-slate-200 pr-2 mr-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setZoom(Math.max(10, zoom - 5))}><ZoomOut className="w-4 h-4" /></Button>
                <span className="text-[10px] font-bold text-slate-500 w-8 text-center">{zoom}%</span>
                <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => setZoom(Math.min(100, zoom + 5))}><ZoomIn className="w-4 h-4" /></Button>
              </div>
              <Button variant="ghost" size="icon" className="h-8 w-8 rounded-xl" onClick={() => window.print()}><Printer className="w-4 h-4" /></Button>

            </div>

            <ScoreViewer svg={svg} rendering={rendering} onEdit={handleVisualEdit} />


            <FloatingToolbar onEdit={handleVisualEdit} />
          </div>
        </main>

        {/* Right Side: Metadata */}
        {showMetadata && (
          <MetadataPanel
            title={title} setTitle={setTitle}
            isPublic={isPublic} setIsPublic={setIsPublic}
            tagsInput={tagsInput} setTagsInput={setTagsInput}
          />
        )}
      </div>

      {/* Footer Status */}
      <footer className="h-6 bg-slate-950 border-t border-slate-900 flex items-center px-4 justify-between text-[8px] font-bold text-slate-600 uppercase tracking-[0.2em] z-50">
        <div className="flex items-center gap-6">
          <span className="flex items-center gap-2">
            <div className={`w-1.5 h-1.5 rounded-full ${rendering ? 'bg-amber-500 animate-pulse' : 'bg-green-500'}`} />
            WYSIWYG Mode: Active
          </span>
          {selectedId && <span className="text-blue-400">Target: {selectedId}</span>}
        </div>
        <div className="flex items-center gap-4">
          <span>{saving ? 'Saving...' : 'Cloud Sync Active'}</span>
        </div>
      </footer>
    </div>
  );
};

export default VerovioEditor;

