'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Lock, Mail, Key, ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { ThemeToggle } from '@/components/layout/ThemeToggle';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const data = await response.json().catch(() => ({ detail: 'Login failed' }));
        throw new Error(data.detail || 'Invalid email or password');
      }

      const tokenData = await response.json();
      localStorage.setItem('token', tokenData.access_token);
      localStorage.setItem('tenant_id', tokenData.tenant_id);
      localStorage.setItem('user_id', tokenData.user_id);
      localStorage.setItem('email', tokenData.email || email);
      localStorage.setItem('role', tokenData.role || 'admin');
      localStorage.setItem('display_name', tokenData.display_name || email.split('@')[0]);
      localStorage.setItem('tenant_name', tokenData.tenant_name || 'Workspace');

      router.push('/documents');
    } catch (err: any) {
      setError(err.message || 'Failed to authenticate');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen dark:text-slate-200 text-slate-800 flex items-center justify-center p-4 relative overflow-hidden transition-colors duration-300">
      {/* Background glowing orb */}
      <div className="absolute top-1/3 left-1/2 -translate-x-1/2 w-96 h-96 bg-blue-500/10 rounded-full blur-[128px] pointer-events-none"></div>

      <div className="absolute top-6 right-6 z-20">
        <ThemeToggle />
      </div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-md glass-card p-8 border dark:border-slate-800 border-slate-200/90 shadow-2xl relative z-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-11 h-11 rounded-xl bg-blue-600/15 border border-blue-500/40 flex items-center justify-center text-blue-600 dark:text-cyan-400 font-bold shadow-lg shadow-blue-500/20">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <h2 className="font-display text-2xl font-bold dark:text-white text-slate-900 tracking-tight">Sign In to Docintel</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Tenant-Isolated Secure RAG Platform</p>
          </div>
        </div>

        {error && (
          <div className="mb-4 p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-xs text-rose-600 dark:text-rose-300 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-rose-500"></span>
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">Work Email</label>
            <div className="relative">
              <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="user@enterprise.com"
                className="w-full dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 dark:text-slate-300 mb-1.5 font-mono">Password</label>
            <div className="relative">
              <Key className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••••••"
                className="w-full dark:bg-slate-900 bg-white border dark:border-slate-700 border-slate-300 rounded-xl pl-10 pr-4 py-2.5 text-sm dark:text-white text-slate-900 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all font-sans"
              />
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/40 transition-all flex items-center justify-center gap-2 mt-6 disabled:opacity-50 hover:scale-[1.02] active:scale-[0.98]"
          >
            {loading ? 'Authenticating...' : 'Sign In'} <ArrowRight className="w-4 h-4" />
          </button>
        </form>

        <div className="mt-6 pt-4 border-t dark:border-slate-800 border-slate-200 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400 font-mono">
          <span>Don't have a workspace?</span>
          <Link href="/register" className="text-blue-600 dark:text-cyan-400 font-semibold hover:underline">
            Register User
          </Link>
        </div>
      </motion.div>
    </div>
  );
}
