import React from "react";
import { useEditorStore } from "../../store/editorStore";
import { motion, AnimatePresence } from "framer-motion";
import { Trash2, ArrowUp, ArrowDown, Clock, Music, ChevronRight } from "lucide-react";
import { Button } from "../ui/button";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "../ui/tooltip";

const FloatingToolbar = ({ onEdit }) => {
  const { selectedId, setSelectedId } = useEditorStore();

  if (!selectedId) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 10, scale: 0.95 }}
        className="fixed bottom-12 left-1/2 -translate-x-1/2 bg-slate-900/90 backdrop-blur-xl border border-slate-800 p-2 rounded-2xl shadow-2xl z-50 flex items-center gap-2"
      >
        <div className="px-3 border-r border-slate-800 mr-1">
          <span className="text-[10px] font-black text-blue-400 uppercase tracking-tighter block">Selected</span>
          <span className="text-[9px] font-mono text-slate-500 block truncate max-w-[80px]">{selectedId}</span>
        </div>

        <TooltipProvider>
          <div className="flex items-center gap-1">
            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl hover:bg-red-500/20 hover:text-red-400 text-slate-400"
                  onClick={() => onEdit({ action: 'delete', param: { elementId: selectedId } })}
                >
                  <Trash2 className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Delete Element</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                  onClick={() => onEdit({ action: 'step', param: { elementId: selectedId, step: 1 } })}
                >
                  <ArrowUp className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Up</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl hover:bg-blue-500/20 hover:text-blue-400 text-slate-400"
                  onClick={() => onEdit({ action: 'step', param: { elementId: selectedId, step: -1 } })}
                >
                  <ArrowDown className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Move Down</TooltipContent>
            </Tooltip>

            <div className="w-px h-6 bg-slate-800 mx-1" />

            <Tooltip>
              <TooltipTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-9 w-9 rounded-xl hover:bg-amber-500/20 hover:text-amber-400 text-slate-400"
                >
                  <Clock className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Change Duration</TooltipContent>
            </Tooltip>
          </div>
        </TooltipProvider>

        <Button 
          variant="ghost" 
          size="icon" 
          className="h-9 w-9 rounded-xl text-slate-500 hover:text-white"
          onClick={() => setSelectedId(null)}
        >
          <ChevronRight className="w-4 h-4" />
        </Button>
      </motion.div>
    </AnimatePresence>
  );
};

export default FloatingToolbar;
