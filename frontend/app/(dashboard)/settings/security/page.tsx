'use client';

import React from 'react';
import { ShieldCheck, EyeOff, Lock, AlertTriangle, ArrowLeft } from 'lucide-react';
import Link from 'next/link';

export default function SecurityPage() {
  const piiEntities = [
    { name: 'PERSON', desc: 'Full names and personal identifiers', status: 'MASKED' },
    { name: 'EMAIL_ADDRESS', desc: 'Email communications and contact addresses', status: 'MASKED' },
    { name: 'PHONE_NUMBER', desc: 'Mobile and landline numbers', status: 'MASKED' },
    { name: 'CREDIT_CARD', desc: 'Visa, Mastercard, Amex 16-digit numbers', status: 'MASKED' },
    { name: 'US_SSN', desc: 'United States Social Security Numbers', status: 'MASKED' },
    { name: 'IN_PAN', desc: 'Indian Income Tax Permanent Account Numbers', status: 'MASKED' },
    { name: 'IN_AADHAAR', desc: 'Indian 12-digit Aadhaar Identity Numbers', status: 'MASKED' },
    { name: 'PASSWORD', desc: 'Exposed plain-text credentials', status: 'MASKED' },
  ];

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      <div>
        <Link href="/settings" className="inline-flex items-center gap-1.5 text-xs text-blue-600 dark:text-cyan-400 hover:underline font-mono mb-4 font-semibold">
          <ArrowLeft className="w-3.5 h-3.5" /> Back to Settings
        </Link>
        <h1 className="font-display text-3xl font-bold dark:text-white text-slate-900 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-600 dark:text-cyan-400">
            <ShieldCheck className="w-6 h-6" />
          </div>
          <span>Security & Threat Model</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
          Review Presidio PII Masking recognizers, tenant boundary enforcement, and prompt injection defense heuristics.
        </p>
      </div>

      {/* Threat Mitigation Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-teal-500/15 text-teal-600 dark:text-teal-400 border border-teal-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <h3 className="font-display text-base font-bold dark:text-white text-slate-900">Tenant Isolation Boundary</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            All database queries enforce <code className="font-mono text-teal-600 dark:text-teal-400 dark:bg-slate-900 bg-slate-100 px-1.5 py-0.5 rounded border border-teal-500/30">tenant_id</code> via PostgreSQL Row-Level Security (RLS) policies and vector search functions.
          </p>
        </div>

        <div className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 shadow-sm">
          <div className="flex items-center gap-3 mb-3">
            <div className="p-2 rounded-xl bg-blue-600/15 text-blue-600 dark:text-cyan-400 border border-blue-500/30">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <h3 className="font-display text-base font-bold dark:text-white text-slate-900">Prompt Injection Guard</h3>
          </div>
          <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed font-sans">
            Scans all incoming user prompts and document chunks to intercept adversarial injection attempts (such as embedded prompt hijack instructions).
          </p>
        </div>
      </div>

      {/* Active PII Entity Recognizers */}
      <div className="glass-card border dark:border-slate-800 border-slate-200/90 p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold dark:text-white text-slate-900 mb-5 flex items-center gap-2">
          <EyeOff className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> Presidio Active PII Recognizers
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {piiEntities.map((entity) => (
            <div key={entity.name} className="glass p-4 rounded-xl border dark:border-slate-800 border-slate-200 flex items-center justify-between shadow-sm">
              <div>
                <span className="font-mono text-xs font-bold text-blue-600 dark:text-cyan-400 block">{entity.name}</span>
                <span className="text-[11px] text-slate-500 dark:text-slate-400 block font-sans mt-0.5">{entity.desc}</span>
              </div>
              <span className="text-[10px] font-mono px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 font-bold">
                {entity.status}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
