'use client';

import React from 'react';
import { Sparkles } from 'lucide-react';

interface StreamingTextProps {
  content: string;
  isStreaming?: boolean;
}

export function StreamingText({ content, isStreaming }: StreamingTextProps) {
  if (!content && isStreaming) {
    return (
      <div className="flex items-center gap-3 py-1">
        {/* WhatsApp style bouncing typing dots bubble */}
        <div className="flex items-center gap-1.5 px-3.5 py-2.5 bg-slate-200/90 dark:bg-slate-800/90 rounded-2xl rounded-bl-sm border border-slate-300/50 dark:border-slate-700/50 shadow-sm w-fit">
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-bounce [animation-delay:-0.3s]"></span>
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-bounce [animation-delay:-0.15s]"></span>
          <span className="w-2 h-2 rounded-full bg-blue-600 dark:bg-cyan-400 animate-bounce"></span>
        </div>
        <span className="text-xs font-mono text-slate-500 dark:text-slate-400 animate-pulse flex items-center gap-1.5 font-medium">
          <Sparkles className="w-3.5 h-3.5 text-blue-500 dark:text-cyan-400 shrink-0" />
          AI is searching secure vault & typing...
        </span>
      </div>
    );
  }

  // Format markdown paragraphs, bullet points, and code snippets cleanly
  const formattedContent = content
    .split('\n')
    .map((line, idx) => {
      if (!line.trim()) return <div key={idx} className="h-2" />;
      
      const isBullet = line.trim().startsWith('- ') || line.trim().startsWith('* ');
      const cleanLine = isBullet ? line.trim().substring(2) : line;

      return (
        <p
          key={idx}
          className={`leading-relaxed text-sm dark:text-slate-100 text-slate-800 font-sans ${
            isBullet ? 'pl-4 relative before:content-["•"] before:absolute before:left-0 before:text-blue-500 font-medium mb-1.5' : 'mb-2'
          }`}
        >
          {cleanLine}
        </p>
      );
    });

  return (
    <div className="relative">
      <div className="prose dark:prose-invert max-w-none">
        {formattedContent}
      </div>
      {isStreaming && (
        <span className="inline-block w-2 h-4 bg-cyan-400 ml-1 animate-pulse align-middle rounded-sm shadow-sm shadow-cyan-400"></span>
      )}
    </div>
  );
}
