import React from 'react';
import { PlusCircle, Music, Hash, Layout, Copy, FilePlus } from 'lucide-react';
import { Button } from '../ui/button';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../ui/tooltip';

const SNIPPETS = [
  {
    name: 'New Measure',
    icon: <Layout className="w-4 h-4" />,
    code: '<measure n="2">\n  <staff n="1">\n    <layer n="1">\n      <note pname="g" oct="4" dur="2"/>\n      <note pname="a" oct="4" dur="2"/>\n    </layer>\n  </staff>\n</measure>'
  },
  {
    name: 'Quarter Note',
    icon: <Music className="w-4 h-4" />,
    code: '<note pname="c" oct="4" dur="4"/>'
  },
  {
    name: 'Rest',
    icon: <Hash className="w-4 h-4" />,
    code: '<rest dur="4"/>'
  },
  {
    name: 'Clef Change',
    icon: <PlusCircle className="w-4 h-4" />,
    code: '<staffDef n="2" lines="5" clef.shape="F" clef.line="4" key.sig="0" meter.count="4" meter.unit="4"/>'
  }
];

const SnippetPanel = ({ onInsert }) => {
  return (
    <div className="flex flex-col gap-3 p-3 bg-slate-900/40 backdrop-blur-xl border-r border-slate-800 w-14 hover:w-48 transition-all duration-500 group overflow-hidden z-30 shadow-2xl">
      <div className="flex items-center gap-4 text-slate-500 mb-6 px-1">
        <FilePlus className="w-5 h-5 min-w-[20px] text-blue-500" />
        <span className="text-[10px] font-black uppercase tracking-[0.2em] opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">Composer Palette</span>
      </div>
      
      <TooltipProvider delayDuration={0}>
        <div className="flex flex-col gap-2">
          {SNIPPETS.map((snippet, idx) => (
            <Tooltip key={idx}>
              <TooltipTrigger asChild>
                <button
                  onClick={() => onInsert(snippet.code)}
                  className="flex items-center gap-4 p-2.5 rounded-xl hover:bg-blue-600/10 hover:text-blue-400 text-slate-400 transition-all group/btn active:scale-90"
                >
                  <div className="min-w-[20px] flex justify-center">{snippet.icon}</div>
                  <span className="text-[11px] font-bold opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap tracking-tight">{snippet.name}</span>
                </button>
              </TooltipTrigger>
              <TooltipContent side="right" className="bg-slate-900 border-slate-800 text-[10px] font-bold uppercase tracking-widest">{snippet.name}</TooltipContent>
            </Tooltip>
          ))}
        </div>
      </TooltipProvider>

      <div className="mt-auto pt-6 border-t border-slate-800/50">
         <div className="flex items-center gap-4 px-1 opacity-40 group-hover:opacity-100 transition-opacity">
            <div className="w-5 h-5 min-w-[20px] rounded-full bg-slate-800 flex items-center justify-center text-[10px] font-black text-slate-500">?</div>
            <span className="text-[9px] font-medium text-slate-500 whitespace-nowrap">Insert at cursor</span>
         </div>
      </div>
    </div>
  );
};

export default SnippetPanel;
