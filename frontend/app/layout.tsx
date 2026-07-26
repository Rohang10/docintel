import React from 'react';
import '@/app/globals.css';
import { Providers } from './providers';

export const metadata = {
  title: 'Docintel — Secure Document Intelligence System',
  description: 'Enterprise RAG platform with strict tenant isolation, PII masking, and prompt injection defense.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen font-sans antialiased selection:bg-blue-600 selection:text-white relative overflow-x-hidden transition-colors duration-300">
        <Providers>
          {/* Cyberpunk & Blueprint Grid Overlay - Strictly in Background */}
          <div className="fixed inset-0 pointer-events-none cyber-grid z-0"></div>

          {/* Ambient Glowing Orbs */}
          <div className="fixed top-0 left-1/4 w-96 h-96 bg-[var(--orb-1)] rounded-full blur-[128px] pointer-events-none z-0 mix-blend-normal animate-pulse-slow"></div>
          <div className="fixed bottom-0 right-1/4 w-96 h-96 bg-[var(--orb-2)] rounded-full blur-[128px] pointer-events-none z-0 mix-blend-normal animate-pulse-slow"></div>

          <div className="relative z-10">
            {children}
          </div>
        </Providers>
      </body>
    </html>
  );
}
