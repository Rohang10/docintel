'use client';

import React, { useState, useEffect } from 'react';
import { Search, FileText, Shield, MessageSquare, Upload, X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export function CommandPalette() {
  const [isOpen, setIsOpen] = useState(false);
  const [query, setQuery] = useState('');
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (!isOpen) return null;

  const actions = [
    { label: 'Go to Document Vault', href: '/documents', icon: FileText },
    { label: 'Upload New Document', href: '/documents/upload', icon: Upload },
    { label: 'Open AI Query Chat', href: '/query', icon: MessageSquare },
    { label: 'Security & PII Dashboard', href: '/settings/security', icon: Shield },
  ];

  const filtered = actions.filter((a) => a.label.toLowerCase().includes(query.toLowerCase()));

  const handleSelect = (href: string) => {
    setIsOpen(false);
    router.push(href);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-start justify-center pt-24 px-4">
      <div className="w-full max-w-lg bg-navy-900 border border-navy-800 rounded-xl shadow-2xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        <div className="p-3 border-b border-navy-800 flex items-center gap-3">
          <Search className="w-4 h-4 text-slate-400" />
          <input
            autoFocus
            type="text"
            placeholder="Type a command or search..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
          />
          <button onClick={() => setIsOpen(false)} className="text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-2 max-h-64 overflow-y-auto">
          {filtered.length === 0 ? (
            <p className="p-4 text-xs text-center text-slate-500">No matching commands found.</p>
          ) : (
            filtered.map((action) => {
              const Icon = action.icon;
              return (
                <button
                  key={action.href}
                  onClick={() => handleSelect(action.href)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-slate-300 hover:text-white hover:bg-brand-500/20 hover:border-brand-500/30 border border-transparent transition-colors text-left"
                >
                  <Icon className="w-4 h-4 text-brand-400" />
                  <span>{action.label}</span>
                </button>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
