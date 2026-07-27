'use client';

import React from 'react';
import Link from 'next/link';
import { Shield, Lock, ArrowRight, Database, EyeOff, ShieldCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function LandingPage() {
  return (
    <div className="min-h-screen dark:text-slate-200 text-slate-800 flex flex-col justify-between selection:bg-blue-600 selection:text-white transition-colors duration-300">
      {/* Navigation Topbar */}
      <header className="h-20 dark:border-slate-800/80 border-slate-200/90 border-b px-4 sm:px-8 flex items-center justify-between sticky top-0 z-30 dark:bg-[#091827]/80 bg-white/80 backdrop-blur-xl">
        <div className="flex items-center gap-2 sm:gap-3">
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shadow-lg shadow-blue-500/20 shrink-0">
            <Lock className="w-4 h-4 sm:w-5 sm:h-5" />
          </div>
          <div>
            <span className="font-display font-bold text-lg sm:text-xl tracking-tight dark:text-white text-slate-900 block leading-tight">Docintel</span>
            <span className="text-[9px] sm:text-[10px] uppercase font-mono tracking-widest text-cyan-500 font-semibold block leading-tight">Enterprise RAG Engine</span>
          </div>
        </div>

        <div className="flex items-center gap-2 sm:gap-4">
          <ThemeToggle />
          <Link href="/login" className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white transition-colors px-2 sm:px-4 py-2 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800">
            Sign In
          </Link>
          <Link href="/register" className="px-3 sm:px-5 py-2 sm:py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 transition-all flex items-center gap-1.5 sm:gap-2 border border-blue-400/40 hover:scale-105 shrink-0">
            <span>Get Started</span> <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1">
        <section className="py-16 sm:py-28 px-4 sm:px-6 max-w-6xl mx-auto text-center relative overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[380px] bg-blue-500/10 blur-[140px] rounded-full pointer-events-none"></div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-2 px-3 sm:px-4 py-2 rounded-full glass border border-slate-300 dark:border-slate-700 text-blue-600 dark:text-cyan-400 text-[11px] sm:text-xs font-mono mb-6 sm:mb-8 shadow-sm">
              <ShieldCheck className="w-4 h-4 text-teal-500 animate-pulse shrink-0" /> <span className="truncate">3072-dim gemini-embedding-001 Vectors + Presidio PII Masking</span>
            </div>

            <h1 className="font-display text-3xl sm:text-5xl md:text-6xl font-bold tracking-tight dark:text-white text-slate-900 max-w-4xl mx-auto leading-[1.15] mb-6">
              Query Confidential Enterprise Documents with <span className="text-gradient">Zero Data Leakage</span>
            </h1>

            <p className="text-sm sm:text-lg text-slate-600 dark:text-slate-300 max-w-2xl mx-auto mb-8 sm:mb-10 leading-relaxed font-sans">
              Multi-tenant document intelligence platform powered by RAG. Enforces strict PostgreSQL Row-Level Security, automated PII anonymization, and prompt injection defense.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/documents" className="w-full sm:w-auto px-8 py-4 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-xl shadow-blue-600/30 transition-all flex items-center justify-center gap-2 border border-blue-400/40 hover:scale-105">
                Open Document Vault <ArrowRight className="w-4 h-4" />
              </Link>
            </div>
          </motion.div>
        </section>

        {/* Feature Grid */}
        <section className="py-12 sm:py-16 px-4 sm:px-6 max-w-6xl mx-auto">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 hover:border-blue-500/60 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-4 group-hover:bg-blue-600/20 transition-colors">
                <EyeOff className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold dark:text-white text-slate-900 mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                Presidio PII Masking
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                Automatically anonymizes SSN, PAN, Aadhaar, credit cards, passwords, emails, and phone numbers before vector embedding.
              </p>
              <div className="flex items-center text-blue-600 dark:text-cyan-400 font-medium text-xs font-mono group-hover:translate-x-1 transition-transform">
                <span>VERIFIED ENCRYPTION</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 hover:border-teal-500/60 transition-all group shadow-sm hover:shadow-md"
            >
              <div className="w-12 h-12 rounded-xl bg-teal-500/10 border border-teal-500/30 flex items-center justify-center text-teal-600 dark:text-teal-400 mb-4 group-hover:bg-teal-500/20 transition-colors">
                <Database className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold dark:text-white text-slate-900 mb-2 group-hover:text-teal-600 dark:group-hover:text-teal-400 transition-colors">
                gemini-embedding-001 Vector RAG
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                Uses 3072-dimensional dense embeddings for high precision document chunk retrieval and token streaming.
              </p>
              <div className="flex items-center text-teal-600 dark:text-teal-400 font-medium text-xs font-mono group-hover:translate-x-1 transition-transform">
                <span>3072-DIM VECTORS</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </motion.div>

            <motion.div
              whileHover={{ y: -6, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 hover:border-blue-500/60 transition-all group shadow-sm hover:shadow-md sm:col-span-2 md:col-span-1"
            >
              <div className="w-12 h-12 rounded-xl bg-blue-600/10 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-cyan-400 mb-4 group-hover:bg-blue-600/20 transition-colors">
                <Shield className="w-6 h-6" />
              </div>
              <h3 className="font-display text-xl font-bold dark:text-white text-slate-900 mb-2 group-hover:text-blue-600 dark:group-hover:text-cyan-400 transition-colors">
                Prompt Injection Guard
              </h3>
              <p className="text-slate-600 dark:text-slate-300 text-sm leading-relaxed mb-4">
                Pre-LLM heuristic scanner intercepts adversarial prompt injection patterns embedded inside malicious documents.
              </p>
              <div className="flex items-center text-blue-600 dark:text-cyan-400 font-medium text-xs font-mono group-hover:translate-x-1 transition-transform">
                <span>ACTIVE SHIELD</span>
                <ArrowRight className="w-3.5 h-3.5 ml-1" />
              </div>
            </motion.div>
          </div>
        </section>

        {/* 3-Step Visual Flow */}
        <section className="py-16 sm:py-20 px-4 sm:px-6 max-w-5xl mx-auto border-t dark:border-slate-800 border-slate-200">
          <h2 className="font-display text-2xl sm:text-3xl font-bold text-center dark:text-white text-slate-900 mb-10 sm:mb-12">
            How <span className="text-gradient">Docintel</span> Safeguards Your Pipeline
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 sm:gap-8 relative">
            <div className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 text-center relative shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 font-mono shadow-md shadow-blue-500/40 border border-blue-400">1</div>
              <h4 className="font-display font-bold dark:text-white text-slate-900 text-base mb-2">Ingest & Mask PII</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Extracts PDF/DOCX text and replaces entity values with anonymized tags automatically.</p>
            </div>

            <div className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 text-center relative shadow-sm">
              <div className="w-10 h-10 rounded-full bg-teal-500 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 font-mono shadow-md shadow-teal-500/40 border border-teal-400">2</div>
              <h4 className="font-display font-bold dark:text-white text-slate-900 text-base mb-2">gemini-embedding-001 API</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Stores 3072-dim dense vectors via gemini-embedding-001 API in pgvector under PostgreSQL Row-Level Security boundaries.</p>
            </div>

            <div className="glass-card p-6 border dark:border-slate-800 border-slate-200/90 text-center relative shadow-sm">
              <div className="w-10 h-10 rounded-full bg-blue-600 text-white font-bold text-sm flex items-center justify-center mx-auto mb-4 font-mono shadow-md shadow-blue-500/40 border border-blue-400">3</div>
              <h4 className="font-display font-bold dark:text-white text-slate-900 text-base mb-2">Stream Verified Answer</h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">Gemini/Groq LLM streams answers token-by-token with precise page citation source cards.</p>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="py-8 border-t dark:border-slate-800 border-slate-200 px-8 text-center text-xs text-slate-500 dark:text-slate-400 font-mono">
        Docintel Secure RAG Platform © 2026 — Multi-Tenant Architecture with 3072-dim gemini-embedding-001 & Presidio PII Masking
      </footer>
    </div>
  );
}
