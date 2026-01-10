import React from "react";
import {
  Drumstick,
  Layout,
  Music2,
  Piano,
  Pin,
  PinOff,
  Redo2,
  Repeat2,
  ScrollText,
  Search,
  Sparkles,
  Undo2,
  Waves,
} from "lucide-react";
import { Button } from "../ui/button";
import { cn } from "../../lib/utils";

const ICON_LIBRARY = {
  Layout,
  Repeat2,
  Music2,
  Drumstick,
  Piano,
  ScrollText,
  Waves,
};

const RibbonSnippetButton = ({ snippet, active, onSelect }) => {
  const Icon = ICON_LIBRARY[snippet.icon] || Sparkles;
  return (
    <button
      type="button"
      onClick={() => onSelect(snippet.id)}
      className={cn(
        "group flex items-center gap-3 rounded-2xl border border-white/5 bg-slate-900/60 px-3 py-3 text-left text-slate-200 transition hover:-translate-y-0.5 hover:border-blue-400/40 hover:bg-slate-900/80 hover:text-white",
        active && "border-blue-400/70 bg-slate-900 text-white shadow-[0_10px_30px_rgba(59,130,246,0.25)]"
      )}
    >
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-slate-800/60 text-blue-300 group-hover:bg-blue-500/15">
        <Icon className="h-4 w-4" />
      </div>
      <div className="flex flex-1 flex-col">
        <span className="text-xs font-semibold tracking-wide">{snippet.label}</span>
        <span className="text-[11px] text-slate-400 group-hover:text-slate-200">
          {snippet.caption}
        </span>
      </div>
      {snippet.badge && (
        <span className="rounded-full border border-white/10 px-2 py-0.5 text-[10px] font-bold uppercase tracking-widest text-slate-300">
          {snippet.badge}
        </span>
      )}
    </button>
  );
};

const RibbonPalette = ({
  groups,
  activeGroup,
  onGroupChange,
  pinned,
  onTogglePin,
  searchValue,
  onSearchChange,
  snippets,
  onSnippetSelect,
  activeTool,
  recentSnippets = [],
  feedback,
  historySummary,
  onUndo,
  onRedo,
  canUndo,
  canRedo,
}) => {
  return (
    <section
      className={cn(
        "sticky top-14 z-30 w-full border-b border-slate-800/60 bg-slate-950/85 backdrop-blur",
        pinned ? "shadow-[0_25px_70px_rgba(15,23,42,0.65)]" : "shadow-[0_10px_30px_rgba(15,23,42,0.4)]"
      )}
    >
      <div className="flex flex-col gap-3 px-6 py-4">
        <div className="flex flex-wrap items-center gap-3 text-[11px] uppercase tracking-[0.3em] text-slate-500">
          <span className="text-slate-300">Composer Palette</span>
          {feedback && (
            <span
              className={cn(
                "rounded-full px-3 py-1 tracking-[0.2em]",
                feedback.type === "error"
                  ? "bg-red-500/15 text-red-200"
                  : feedback.type === "info"
                  ? "bg-amber-500/15 text-amber-200"
                  : "bg-emerald-500/15 text-emerald-200"
              )}
            >
              {feedback.message}
            </span>
          )}
          <span className="ml-auto flex items-center gap-2 normal-case tracking-normal text-slate-400">
            <span className="text-[10px] uppercase tracking-[0.25em] text-slate-600">History</span>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 rounded-xl border border-white/5 px-3 text-[11px] text-slate-300"
              onClick={onUndo}
              disabled={!canUndo}
            >
              <Undo2 className="h-3.5 w-3.5" /> {historySummary?.undo || 0}
            </Button>
            <Button
              variant="ghost"
              size="sm"
              className="h-7 gap-1 rounded-xl border border-white/5 px-3 text-[11px] text-slate-300"
              onClick={onRedo}
              disabled={!canRedo}
            >
              <Redo2 className="h-3.5 w-3.5" /> {historySummary?.redo || 0}
            </Button>
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex flex-wrap items-center gap-2">
            {groups.map((group) => (
              <button
                key={group.id}
                type="button"
                onClick={() => onGroupChange(group.id)}
                className={cn(
                  "rounded-full px-4 py-1 text-xs font-semibold uppercase tracking-widest transition",
                  group.id === activeGroup
                    ? "bg-gradient-to-r from-blue-500 to-cyan-400 text-white shadow-lg"
                    : "bg-slate-900/60 text-slate-300 hover:bg-slate-900"
                )}
              >
                {group.label}
              </button>
            ))}
          </div>
          <div className="ml-auto flex items-center gap-2">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                value={searchValue}
                onChange={(event) => onSearchChange(event.target.value)}
                placeholder="搜索片段或关键词"
                className="h-9 w-48 rounded-full border border-white/10 bg-slate-900/70 pl-9 pr-3 text-sm text-slate-200 placeholder:text-slate-500 focus:border-blue-400 focus:outline-none"
              />
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onTogglePin}
              className="h-9 w-9 rounded-full border border-white/5 text-slate-200"
            >
              {pinned ? <Pin className="h-4 w-4" /> : <PinOff className="h-4 w-4" />}
            </Button>
          </div>
        </div>

        {snippets.length === 0 ? (
          <div className="rounded-2xl border border-dashed border-white/10 bg-slate-900/40 px-4 py-6 text-center text-sm text-slate-400">
            没有符合搜索条件的片段。
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {snippets.map((snippet) => (
              <RibbonSnippetButton
                key={snippet.id}
                snippet={snippet}
                active={activeTool === snippet.id}
                onSelect={onSnippetSelect}
              />
            ))}
          </div>
        )}

        {recentSnippets.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 text-[11px] uppercase tracking-[0.3em] text-slate-500">
            <span>最近使用</span>
            <div className="flex flex-wrap gap-2 normal-case tracking-normal">
              {recentSnippets.map((snippet) => (
                <button
                  key={snippet.id}
                  type="button"
                  className="rounded-full border border-white/5 px-3 py-1 text-[11px] text-slate-200 hover:border-blue-400/60"
                  onClick={() => onSnippetSelect(snippet.id)}
                >
                  {snippet.label}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
};

export default RibbonPalette;
