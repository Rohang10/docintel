'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Shield, FileText, MessageSquare, Settings, Lock, Upload } from 'lucide-react';
import { cn } from '@/lib/utils';

const navItems = [
  { label: 'Document Vault', href: '/documents', icon: FileText },
  { label: 'Upload Files', href: '/documents/upload', icon: Upload },
  { label: 'AI Query Chat', href: '/query', icon: MessageSquare },
  { label: 'Security & PII', href: '/settings/security', icon: Shield },
  { label: 'Audit & Settings', href: '/settings', icon: Settings },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-64 dark:bg-[#091827]/95 bg-white/95 backdrop-blur-xl dark:border-slate-800/80 border-slate-200/90 border-r flex flex-col justify-between shrink-0 min-h-screen z-20 transition-colors duration-300">
      <div>
        {/* Brand Header */}
        <div className="h-20 px-6 flex items-center gap-3 dark:border-slate-800/80 border-slate-200/90 border-b">
          <div className="w-10 h-10 rounded-xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-center text-blue-500 shadow-md shadow-blue-500/20">
            <Lock className="w-5 h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-xl tracking-tight dark:text-white text-slate-900 block">Docintel</span>
            <span className="text-[10px] uppercase font-mono tracking-widest text-cyan-500 font-semibold block">Secure RAG Engine</span>
          </div>
        </div>

        {/* Navigation Links */}
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;

            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-medium transition-all duration-300",
                  isActive
                    ? "bg-blue-600/15 text-blue-600 dark:text-cyan-400 border border-blue-500/30 font-semibold shadow-md shadow-blue-500/10"
                    : "text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent"
                )}
              >
                <Icon className={cn("w-4 h-4", isActive ? "text-blue-600 dark:text-cyan-400" : "text-slate-500 dark:text-slate-400")} />
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
      </div>

      {/* Security Status Footprint */}
      <div className="p-4 dark:border-slate-800/80 border-slate-200/90 border-t">
        <div className="dark:bg-[#071524]/90 bg-slate-50/90 p-3.5 rounded-xl border dark:border-slate-800/80 border-slate-200/90 space-y-2 shadow-sm">
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-2 text-xs font-semibold dark:text-slate-200 text-slate-800 truncate">
              <span className="w-2 h-2 rounded-full bg-teal-400 animate-pulse shrink-0"></span>
              <span className="truncate">Tenant Boundary</span>
            </div>
            <span className="text-[9px] font-mono font-bold text-teal-600 dark:text-teal-400 bg-teal-500/10 px-2 py-0.5 rounded-md border border-teal-500/30 shrink-0 tracking-wider">
              RLS ACTIVE
            </span>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed font-sans">
            Gemini text-embedding-004 dense vectors & Presidio PII anonymization active.
          </p>
        </div>
      </div>
    </aside>
  );
}
