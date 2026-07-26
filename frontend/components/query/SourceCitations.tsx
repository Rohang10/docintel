'use client';

import React, { useState } from 'react';
import { FileText, ChevronDown, ChevronUp, ShieldCheck } from 'lucide-react';
import { SourceCitation } from '@/hooks/useStreamingQuery';

interface SourceCitationsProps {
  sources: SourceCitation[];
}

export function SourceCitations({ sources }: SourceCitationsProps) {
  const [isOpen, setIsOpen] = useState(false);

  if (!sources || sources.length === 0) return null;

  return (
    <div className="mt-3 pt-3 dark:border-slate-700/60 border-slate-300/80 border-t">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 text-xs text-blue-600 dark:text-cyan-400 font-mono hover:underline transition-colors font-semibold"
      >
        <ShieldCheck className="w-4 h-4 text-teal-500" />
        <span>Verified Sources ({sources.length} document chunks)</span>
        {isOpen ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
      </button>

      {isOpen && (
        <div className="mt-3 space-y-2.5">
          {sources.map((src, idx) => (
            <div
              key={idx}
              className="p-3.5 rounded-xl dark:bg-slate-900/90 bg-white dark:border-slate-700/80 border-slate-300 shadow-sm border text-xs transition-all"
            >
              <div className="flex items-center justify-between font-medium mb-1.5">
                <span className="flex items-center gap-1.5 font-mono text-[11px] text-blue-600 dark:text-cyan-400 font-semibold">
                  <FileText className="w-3.5 h-3.5 shrink-0" />
                  {src.document_name} (Page {src.page_number || 1})
                </span>
                <span className="text-[10px] font-mono text-teal-700 dark:text-teal-300 bg-teal-500/10 px-2 py-0.5 rounded border border-teal-500/30 font-bold">
                  Similarity: {(src.similarity * 100).toFixed(1)}%
                </span>
              </div>
              <p className="dark:text-slate-300 text-slate-700 text-[11px] leading-relaxed italic border-l-2 border-blue-500/60 pl-2.5 mt-1.5 font-sans">
                "{src.content_snippet}"
              </p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
