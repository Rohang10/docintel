'use client';

import React, { useState, useEffect, useRef } from 'react';
import { MessageSquare, Send, Sparkles, Shield, Trash2, FileText, CheckSquare, Square, Bot, User } from 'lucide-react';
import { useStreamingQuery } from '@/hooks/useStreamingQuery';
import { fetchDocuments, DocumentItem } from '@/lib/api/documents';
import { StreamingText } from '@/components/query/StreamingText';
import { SourceCitations } from '@/components/query/SourceCitations';

export default function QueryPage() {
  const { messages, isStreaming, error, sendMessage, clearMessages } = useStreamingQuery();
  const [input, setInput] = useState('');
  const [documents, setDocuments] = useState<DocumentItem[]>([]);
  const [selectedDocIds, setSelectedDocIds] = useState<string[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchDocuments().then(docs => {
      setDocuments(docs);
    }).catch(() => {
      // Demo fallback docs
      setDocuments([
        {
          id: 'demo-doc-1',
          tenant_id: 'tenant-demo',
          uploaded_by: 'user-1',
          name: 'pdf1_nda_service_contract.pdf',
          original_name: 'pdf1_nda_service_contract.pdf',
          file_type: 'pdf',
          file_size: 6628,
          status: 'ready',
          pii_entities: ['PERSON', 'EMAIL_ADDRESS'],
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        },
        {
          id: 'demo-doc-2',
          tenant_id: 'tenant-demo',
          uploaded_by: 'user-1',
          name: 'pdf2_invoice_financial_summary.pdf',
          original_name: 'pdf2_invoice_financial_summary.pdf',
          file_type: 'pdf',
          file_size: 4177,
          status: 'ready',
          pii_entities: ['CREDIT_CARD'],
          metadata: {},
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      ]);
    });
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isStreaming) return;
    sendMessage(input, selectedDocIds.length > 0 ? selectedDocIds : undefined);
    setInput('');
  };

  const toggleDocSelection = (id: string) => {
    setSelectedDocIds(prev =>
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  return (
    <div className="h-[calc(100vh-7.5rem)] flex flex-col md:flex-row gap-6 max-w-7xl mx-auto">
      {/* Left: Document Scope Selector */}
      <div className="w-full md:w-80 dark:bg-[#0B1C2D]/95 bg-white/95 backdrop-blur-xl border dark:border-slate-800/80 border-slate-200/90 p-5 rounded-2xl flex flex-col justify-between shrink-0 shadow-xl transition-colors duration-300">
        <div>
          <h3 className="font-display text-base font-bold dark:text-white text-slate-900 mb-1 flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> Document Scope
          </h3>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mb-4 font-mono">
            Select specific documents or query all vault files (768-dim Gemini dense search).
          </p>

          <div className="space-y-2 max-h-64 md:max-h-[calc(100vh-18rem)] overflow-y-auto pr-1">
            <button
              onClick={() => setSelectedDocIds([])}
              className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left transition-all ${
                selectedDocIds.length === 0
                  ? 'bg-blue-600/15 text-blue-600 dark:text-cyan-400 border border-blue-500/40 font-semibold shadow-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
              }`}
            >
              {selectedDocIds.length === 0 ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-400 shrink-0" />}
              <span className="truncate font-semibold">All Vault Documents ({documents.length})</span>
            </button>

            <div className="h-px dark:bg-slate-800 bg-slate-200 my-2"></div>

            {documents.map((doc) => {
              const isSelected = selectedDocIds.includes(doc.id);
              return (
                <button
                  key={doc.id}
                  onClick={() => toggleDocSelection(doc.id)}
                  className={`w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-xs font-medium text-left truncate transition-all ${
                    isSelected
                      ? 'bg-blue-600/15 text-blue-600 dark:text-cyan-400 border border-blue-500/40 font-semibold shadow-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800/60 border border-transparent'
                  }`}
                >
                  {isSelected ? <CheckSquare className="w-4 h-4 text-blue-600 dark:text-cyan-400 shrink-0" /> : <Square className="w-4 h-4 text-slate-400 shrink-0" />}
                  <span className="truncate">{doc.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4 pt-3.5 dark:border-slate-800 border-slate-200 border-t text-[10px] text-teal-600 dark:text-teal-400 font-mono flex items-center gap-2 font-semibold">
          <Shield className="w-3.5 h-3.5 text-teal-500 animate-pulse" /> Prompt Injection Guard Active
        </div>
      </div>

      {/* Right: Streaming Chat Interface */}
      <div className="flex-1 dark:bg-[#0B1C2D]/95 bg-white/95 backdrop-blur-xl border dark:border-slate-800/80 border-slate-200/90 rounded-2xl flex flex-col justify-between overflow-hidden relative shadow-2xl transition-colors duration-300">
        {/* Chat Header */}
        <div className="h-16 px-6 border-b dark:border-slate-800/80 border-slate-200/80 flex items-center justify-between dark:bg-[#071626]/90 bg-slate-50/90 backdrop-blur-md">
          <div className="flex items-center gap-2 text-xs font-bold dark:text-white text-slate-900 font-mono">
            <Sparkles className="w-4 h-4 text-blue-600 dark:text-cyan-400" /> RAG Streaming AI Chat
          </div>
          {messages.length > 0 && (
            <button
              onClick={clearMessages}
              className="text-xs text-slate-500 dark:text-slate-400 hover:text-rose-500 flex items-center gap-1.5 transition-colors font-mono font-medium"
            >
              <Trash2 className="w-3.5 h-3.5" /> Clear History
            </button>
          )}
        </div>

        {/* Message Stream List */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6 dark:bg-[#061423]/95 bg-[#F8FAFC]/95 transition-colors duration-300">
          {messages.length === 0 ? (
            <div className="h-full flex flex-col items-center justify-center text-center p-6">
              <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-4 shadow-xl shadow-blue-500/20">
                <MessageSquare className="w-8 h-8" />
              </div>
              <h3 className="font-display text-lg font-bold dark:text-white text-slate-900 mb-2">
                Ask anything about your uploaded documents
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-sm mb-8 leading-relaxed font-sans">
                Queries are processed with 768-dim Gemini text-embedding-004 dense retrieval and Google Gemini / Groq streaming responses.
              </p>

              {/* Sample Queries */}
              <div className="flex flex-col sm:flex-row flex-wrap gap-3 justify-center max-w-lg">
                {[
                  'What are the payment terms in the NDA service contract?',
                  'Summarize the key financial line items from the invoice.',
                  'List all key compliance obligations specified in the documents.'
                ].map((sample, idx) => (
                  <button
                    key={idx}
                    onClick={() => setInput(sample)}
                    className="text-left text-xs p-3.5 rounded-xl dark:bg-slate-800/90 bg-white dark:border-slate-700 border-slate-200 hover:border-blue-500 dark:hover:border-cyan-400 dark:text-slate-200 text-slate-800 transition-all hover:scale-[1.02] shadow-sm hover:shadow-md font-sans"
                  >
                    "{sample}"
                  </button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3.5 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'assistant' && (
                  <div className="w-9 h-9 rounded-xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 shrink-0 shadow-md">
                    <Bot className="w-5 h-5" />
                  </div>
                )}

                <div
                  className={`max-w-2xl p-4 rounded-2xl text-sm leading-relaxed ${
                    msg.role === 'user'
                      ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white rounded-br-none shadow-lg font-medium'
                      : 'dark:bg-[#0E2338] bg-white dark:border-slate-700/80 border-slate-200/90 dark:text-slate-100 text-slate-900 rounded-bl-none shadow-md border font-sans'
                  }`}
                >
                  {msg.role === 'user' ? (
                    <p className="text-sm font-medium text-white leading-relaxed">{msg.content}</p>
                  ) : (
                    <>
                      <StreamingText content={msg.content} isStreaming={msg.isStreaming} />
                      {msg.sources && <SourceCitations sources={msg.sources} />}
                    </>
                  )}
                </div>

                {msg.role === 'user' && (
                  <div className="w-9 h-9 rounded-xl bg-blue-600 text-white border border-blue-400 flex items-center justify-center shrink-0 font-mono text-xs font-bold shadow-md">
                    <User className="w-4 h-4" />
                  </div>
                )}
              </div>
            ))
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Bar */}
        <form onSubmit={handleSubmit} className="p-4 border-t dark:border-slate-800/80 border-slate-200/80 dark:bg-[#071626]/95 bg-white/95 backdrop-blur-md transition-colors duration-300">
          <div className="relative flex items-center">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask a question about selected documents..."
              className="w-full dark:bg-[#071726] bg-slate-50 border dark:border-slate-700 border-slate-300 rounded-xl pl-4 pr-14 py-3 text-sm dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 transition-all font-sans"
            />
            <button
              type="submit"
              disabled={!input.trim() || isStreaming}
              className="absolute right-2 p-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white transition-all disabled:opacity-40 shadow-md shadow-blue-600/30 hover:scale-105 active:scale-95"
            >
              <Send className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
