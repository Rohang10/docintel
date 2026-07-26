'use client';

import React from 'react';
import { CheckCircle, Clock, ShieldAlert, Cpu, Database, FileText } from 'lucide-react';

interface ProcessingStatusProps {
  status: 'pending' | 'extracting' | 'masking' | 'chunking' | 'embedding' | 'ready' | 'failed';
  chunkCount?: number;
  piiEntities?: string[];
}

const steps = [
  { id: 'extracting', label: 'Extraction', icon: FileText },
  { id: 'masking', label: 'PII Masking', icon: ShieldAlert },
  { id: 'chunking', label: 'Semantic Chunks', icon: Cpu },
  { id: 'embedding', label: 'Gemini Embed', icon: Database },
];

export function ProcessingStatus({ status, chunkCount, piiEntities }: ProcessingStatusProps) {
  const getStepState = (stepId: string) => {
    const order = ['pending', 'extracting', 'masking', 'chunking', 'embedding', 'ready'];
    const currentIndex = order.indexOf(status);
    const stepIndex = order.indexOf(stepId);

    if (status === 'failed') return 'failed';
    if (currentIndex > stepIndex || status === 'ready') return 'completed';
    if (currentIndex === stepIndex) return 'current';
    return 'pending';
  };

  return (
    <div className="glass p-4 rounded-xl border border-white/10">
      <div className="flex items-center justify-between mb-3">
        <span className="text-xs font-semibold text-white font-mono">Processing Pipeline</span>
        <span className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
          status === 'ready'
            ? 'bg-teal/10 text-teal border-teal/30'
            : status === 'failed'
            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
            : 'bg-cyber/10 text-cyber-accent border-cyber/30 animate-pulse'
        }`}>
          {status.toUpperCase()}
        </span>
      </div>

      {/* 4-Step Pipeline Node Visualizer */}
      <div className="grid grid-cols-4 gap-2 relative">
        {steps.map((step) => {
          const state = getStepState(step.id);
          const Icon = step.icon;

          return (
            <div
              key={step.id}
              className={`p-2 rounded-lg border text-center transition-all ${
                state === 'completed'
                  ? 'bg-teal/10 border-teal/30 text-teal'
                  : state === 'current'
                  ? 'bg-cyber/20 border-cyber/50 text-cyber-accent shadow-md shadow-cyber/20 animate-pulse'
                  : 'bg-navy-dark/60 border-white/5 text-neutral-text'
              }`}
            >
              <Icon className="w-3.5 h-3.5 mx-auto mb-1" />
              <span className="text-[9px] font-mono block leading-tight">{step.label}</span>
            </div>
          );
        })}
      </div>

      {status === 'ready' && (
        <div className="mt-3 pt-3 border-t border-white/10 flex flex-wrap items-center justify-between gap-1 text-xs text-neutral-text">
          <span className="font-mono text-[11px]">Vectors: <strong className="text-white font-mono">{chunkCount || 0} chunks</strong> (768-dim)</span>
          {piiEntities && piiEntities.length > 0 && (
            <span className="text-[10px] text-cyber-accent bg-cyber/10 px-1.5 py-0.5 rounded border border-cyber/30 font-mono">
              Masked: {piiEntities.join(', ')}
            </span>
          )}
        </div>
      )}
    </div>
  );
}

