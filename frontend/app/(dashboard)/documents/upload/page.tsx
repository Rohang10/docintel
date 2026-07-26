'use client';

import React from 'react';
import { UploadDropzone } from '@/components/documents/UploadDropzone';
import { Shield, Upload, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function DocumentUploadPage() {
  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <Link href="/documents" className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-cyan-400 hover:underline font-mono mb-3 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Vault
        </Link>
        <h1 className="font-display text-3xl font-bold dark:text-white text-slate-900 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-600 dark:text-cyan-400">
            <Upload className="w-6 h-6" />
          </div>
          <span>Upload Document</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
          Files are virus-scanned, masked for PII entities, and embedded into Gemini text-embedding-004 768-dim vector chunks.
        </p>
      </div>

      <UploadDropzone />

      <div className="p-5 rounded-2xl glass-card border dark:border-slate-800 border-slate-200 text-xs dark:text-slate-300 text-slate-700 space-y-2.5 shadow-sm">
        <h4 className="font-semibold dark:text-white text-slate-900 flex items-center gap-2 text-sm font-display">
          <Shield className="w-4 h-4 text-teal-500" /> Automated Security Guarantee
        </h4>
        <ul className="list-disc list-inside space-y-1.5 dark:text-slate-400 text-slate-600 leading-relaxed text-xs">
          <li>PII Entity Masking replaces names, emails, phone numbers, cards, SSN, PAN, Aadhaar with placeholders automatically.</li>
          <li>Embeddings are calculated using <strong className="text-blue-600 dark:text-cyan-400">Gemini text-embedding-004</strong> API (768-dimensional vectors, zero local RAM usage).</li>
          <li>Original file content is stored encrypted at rest with strict PostgreSQL Row-Level Security boundaries.</li>
        </ul>
      </div>
    </div>
  );
}
