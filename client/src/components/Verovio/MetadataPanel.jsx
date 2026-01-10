import React, { useState, useEffect } from 'react';
import { Settings, User, Tag, Globe, Lock, Info } from 'lucide-react';

const MetadataPanel = ({ title, setTitle, isPublic, setIsPublic, tagsInput, setTagsInput }) => {
  return (
    <div className="w-64 bg-slate-900 border-l border-slate-800 flex flex-col p-6 overflow-y-auto">
      <div className="flex items-center gap-2 text-slate-500 mb-8">
        <Settings className="w-5 h-5" />
        <span className="text-xs font-bold uppercase tracking-widest">Score Settings</span>
      </div>

      <div className="space-y-6">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Info className="w-3 h-3" />
            Score Title
          </label>
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            placeholder="Untitled Score"
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-2 flex items-center gap-2">
            <Tag className="w-3 h-3" />
            Tags (Comma separated)
          </label>
          <input
            type="text"
            value={tagsInput}
            onChange={(e) => setTagsInput(e.target.value)}
            className="w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:ring-1 focus:ring-blue-500/50"
            placeholder="classical, piano..."
          />
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-widest mb-3 flex items-center gap-2">
            <Globe className="w-3 h-3" />
            Visibility
          </label>
          <div className="flex bg-slate-800 p-1 rounded-xl">
            <button
              onClick={() => setIsPublic(true)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${isPublic ? 'bg-blue-600 text-white shadow-lg shadow-blue-900/20' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Globe className="w-3.5 h-3.5" />
              Public
            </button>
            <button
              onClick={() => setIsPublic(false)}
              className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-lg text-xs font-bold transition-all ${!isPublic ? 'bg-slate-700 text-white' : 'text-slate-500 hover:text-slate-300'}`}
            >
              <Lock className="w-3.5 h-3.5" />
              Private
            </button>
          </div>
          <p className="mt-2 text-[10px] text-slate-600 leading-relaxed px-1">
            {isPublic ? 'Anyone can view and fork this score.' : 'Only you can see and edit this score.'}
          </p>
        </div>
      </div>

      <div className="mt-auto pt-8">
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-4">
          <h4 className="text-[10px] font-bold text-slate-500 uppercase mb-2 tracking-widest">Editor Info</h4>
          <div className="space-y-2">
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-600">Engine</span>
              <span className="text-slate-400">Verovio 5.7.0</span>
            </div>
            <div className="flex justify-between text-[10px]">
              <span className="text-slate-600">Format</span>
              <span className="text-slate-400">MEI 5.0</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MetadataPanel;
