'use client';

import React from 'react';
import { Settings, Shield, Database, Activity, Server } from 'lucide-react';
import Link from 'next/link';

export default function SettingsPage() {
  const auditLogs = [
    { id: '1', action: 'query.execute', resource: 'pdf1_nda_service_contract.pdf', user: 'admin@docintel.com', time: '10 mins ago', status: 'SAFE' },
    { id: '2', action: 'document.upload', resource: 'pdf2_invoice_financial_summary.pdf', user: 'admin@docintel.com', time: '25 mins ago', status: 'MASKED' },
    { id: '3', action: 'auth.login', resource: 'Tenant Session', user: 'admin@docintel.com', time: '1 hour ago', status: 'SUCCESS' },
    { id: '4', action: 'prompt_guard.scan', resource: 'Query Stream', user: 'system', time: '2 hours ago', status: 'PASSED' },
  ];

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div>
        <h1 className="font-display text-2xl sm:text-3xl font-bold dark:text-white text-slate-900 flex items-center gap-3">
          <div className="p-2 rounded-xl bg-blue-600/15 border border-blue-500/40 text-blue-600 dark:text-cyan-400 shrink-0">
            <Settings className="w-6 h-6" />
          </div>
          <span>Audit & Workspace Settings</span>
        </h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 font-mono">
          Monitor tenant activities, security compliance logs, and API provider connections.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
        <Link href="/settings/security" className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 hover:border-blue-500/60 transition-all group shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-4 group-hover:scale-110 transition-transform">
            <Shield className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold dark:text-white text-slate-900 mb-1 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">Threat Model & Security</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">View Presidio PII rules and Prompt Injection Guard status.</p>
        </Link>

        <div className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-teal-500/15 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4">
            <Database className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold dark:text-white text-slate-900 mb-1">Vector DB (3072-dim)</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">gemini-embedding-001 API vector store active with tenant-scoped pgvector index.</p>
        </div>

        <div className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 shadow-sm">
          <div className="w-12 h-12 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-4">
            <Server className="w-6 h-6" />
          </div>
          <h3 className="font-display text-lg font-bold dark:text-white text-slate-900 mb-1">LLM Engines</h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed font-sans">Google Gemini & Groq fallback SSE streaming configured.</p>
        </div>
      </div>

      {/* Audit Log Table */}
      <div className="glass-card border dark:border-slate-800 border-slate-200/90 p-6 shadow-sm">
        <h3 className="font-display text-lg font-bold dark:text-white text-slate-900 mb-5 flex items-center gap-2">
          <Activity className="w-5 h-5 text-blue-600 dark:text-cyan-400" /> Live Audit Log
        </h3>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b dark:border-slate-800 border-slate-200 text-slate-500 dark:text-slate-400 text-[11px]">
                <th className="pb-3">TIMESTAMP</th>
                <th className="pb-3">ACTION</th>
                <th className="pb-3">RESOURCE</th>
                <th className="pb-3">USER</th>
                <th className="pb-3 text-right">SECURITY RESULT</th>
              </tr>
            </thead>
            <tbody className="divide-y dark:divide-slate-800 divide-slate-200">
              {auditLogs.map((log) => (
                <tr key={log.id} className="dark:text-slate-200 text-slate-800 hover:bg-slate-100/50 dark:hover:bg-slate-800/40 transition-colors">
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">{log.time}</td>
                  <td className="py-3.5 font-bold text-blue-600 dark:text-cyan-400">{log.action}</td>
                  <td className="py-3.5 dark:text-slate-200 text-slate-800">{log.resource}</td>
                  <td className="py-3.5 text-slate-500 dark:text-slate-400">{log.user}</td>
                  <td className="py-3.5 text-right">
                    <span className="px-2.5 py-1 rounded-lg bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/30 text-[10px] font-bold">
                      {log.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
