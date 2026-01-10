import { create } from "zustand";

export const useEditorStore = create((set) => ({
  selectedId: null,
  setSelectedId: (id) => set({ selectedId: id }),
  
  zoom: 40,
  setZoom: (zoom) => set({ zoom }),
  
  viewMode: "split",
  setViewMode: (viewMode) => set({ viewMode }),
  
  rendering: false,
  setRendering: (rendering) => set({ rendering }),
  
  content: "",
  setContent: (content) => set({ content }),
  
  // Interaction tools
  activeTool: "select", // 'select', 'note-4', 'note-2', etc.
  setActiveTool: (tool) => set({ activeTool: tool }),
}));
