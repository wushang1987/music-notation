import React, { useRef, useEffect, useState } from "react";

import { useEditorStore } from "../../store/editorStore";
import { cn } from "../../lib/utils";
import {
  ContextMenu,
  ContextMenuContent,
  ContextMenuItem,
  ContextMenuTrigger,
  ContextMenuSeparator,
} from "../ui/context-menu";
import { Trash2, Copy, MoveUp, MoveDown, Music } from "lucide-react";

const escapeCssId = (id = "") => {
  if (typeof window !== "undefined" && window.CSS && window.CSS.escape) {
    return window.CSS.escape(id);
  }
  return id.replace(/(["'`~!@#$%^&*()=+{}\[\]|\\:;"<>?,.\/])/g, "\\$1");
};

const ScoreViewer = ({ svg, rendering, onEdit }) => {
  const containerRef = useRef(null);
  const previewRef = useRef(null);
  const { setSelectedId, selectedId } = useEditorStore();
  const [highlightBox, setHighlightBox] = useState(null);

  const updateHighlightOverlay = (element) => {
    if (!previewRef.current || !element) {
      setHighlightBox(null);
      return;
    }
    const elementRect = element.getBoundingClientRect();
    const containerRect = previewRef.current.getBoundingClientRect();
    setHighlightBox({
      x: elementRect.left - containerRect.left + previewRef.current.scrollLeft,
      y: elementRect.top - containerRect.top + previewRef.current.scrollTop,
      width: elementRect.width,
      height: elementRect.height,
    });
  };

  const handleSvgClick = (e) => {
    const target = e.target.closest("[id]");
    if (target) {
      const id = target.getAttribute("id");
      if (id) {
        setSelectedId(id);
        updateHighlightOverlay(target);
      }
    } else {
      setSelectedId(null);
      setHighlightBox(null);
    }
  };

  useEffect(() => {
    if (!selectedId) {
      setHighlightBox(null);
      return;
    }
    const selector = `#${escapeCssId(selectedId)}`;
    const node = previewRef.current?.querySelector(selector);
    if (node) {
      updateHighlightOverlay(node);
    } else {
      setHighlightBox(null);
    }
  }, [selectedId, svg]);

  useEffect(() => {
    const handleResize = () => {
      if (!selectedId) return;
      const selector = `#${escapeCssId(selectedId)}`;
      const node = previewRef.current?.querySelector(selector);
      if (node) updateHighlightOverlay(node);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [selectedId]);


  return (
    <div 
      ref={containerRef}
      className={cn(
        "flex-1 overflow-auto p-8 lg:p-16 flex justify-center scrollbar-thin scrollbar-thumb-slate-300 relative bg-[#f8fafc]",
        rendering && "opacity-80 grayscale-[0.2] transition-opacity duration-500"
      )}
      onClick={handleSvgClick}
    >
      <ContextMenu>
        <ContextMenuTrigger>
          <div
            ref={previewRef}
            className="bg-white shadow-[0_20px_50px_rgba(0,0,0,0.08)] border border-slate-200/60 p-8 lg:p-20 min-h-[1122px] w-[794px] verovio-preview transition-all duration-500 ease-out origin-top relative rounded-sm"
          >
            <div
              className="verovio-svg"
              dangerouslySetInnerHTML={{ __html: svg }}
            />
            {highlightBox && (
              <div
                className="pointer-events-none absolute rounded-2xl border-2 border-blue-500/80 shadow-[0_15px_35px_rgba(37,99,235,0.35)] bg-blue-500/5"
                style={{
                  left: highlightBox.x,
                  top: highlightBox.y,
                  width: highlightBox.width,
                  height: highlightBox.height,
                }}
              >
                <div className="absolute inset-1 rounded-2xl border border-white/70 opacity-70 animate-pulse" />
              </div>
            )}
          </div>
        </ContextMenuTrigger>

        <ContextMenuContent className="w-56 bg-white/95 backdrop-blur-md border-slate-200 shadow-2xl rounded-xl p-1.5">
          {selectedId ? (
            <>
              <div className="px-2 py-1.5 text-[10px] font-black text-slate-400 uppercase tracking-widest">Element: {selectedId.slice(0, 8)}...</div>
              <ContextMenuSeparator className="bg-slate-100" />
              <ContextMenuItem className="rounded-lg gap-3 py-2 text-slate-600 focus:bg-blue-50 focus:text-blue-600" onClick={() => onEdit({ action: 'step', param: { elementId: selectedId, step: 1 } })}>
                <MoveUp className="w-4 h-4" />
                <span>Shift Up</span>
              </ContextMenuItem>
              <ContextMenuItem className="rounded-lg gap-3 py-2 text-slate-600 focus:bg-blue-50 focus:text-blue-600" onClick={() => onEdit({ action: 'step', param: { elementId: selectedId, step: -1 } })}>
                <MoveDown className="w-4 h-4" />
                <span>Shift Down</span>
              </ContextMenuItem>
              <ContextMenuSeparator className="bg-slate-100" />
              <ContextMenuItem className="rounded-lg gap-3 py-2 text-red-500 focus:bg-red-50 focus:text-red-600" onClick={() => onEdit({ action: 'delete', param: { elementId: selectedId } })}>
                <Trash2 className="w-4 h-4" />
                <span>Delete</span>
              </ContextMenuItem>
            </>
          ) : (
            <>
              <ContextMenuItem className="rounded-lg gap-3 py-2 text-slate-600 focus:bg-blue-50 focus:text-blue-600">
                <Music className="w-4 h-4" />
                <span>Add Measure</span>
              </ContextMenuItem>
              <ContextMenuItem className="rounded-lg gap-3 py-2 text-slate-600 focus:bg-blue-50 focus:text-blue-600">
                <Copy className="w-4 h-4" />
                <span>Paste</span>
              </ContextMenuItem>
            </>
          )}
        </ContextMenuContent>
      </ContextMenu>
      
      {rendering && (
        <div className="fixed bottom-10 right-10 bg-slate-900 text-white px-6 py-3 rounded-full shadow-2xl flex items-center gap-3 z-50 border border-slate-800 animate-in fade-in slide-in-from-bottom-4">
           <div className="w-4 h-4 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
           <span className="text-xs font-black uppercase tracking-widest">Syncing Canvas...</span>
        </div>
      )}
    </div>
  );
};

export default ScoreViewer;
