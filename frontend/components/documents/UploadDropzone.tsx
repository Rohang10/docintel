'use client';

import React, { useState, useCallback } from 'react';
import { useDropzone } from 'react-dropzone';
import { Upload, FileText, CheckCircle2, AlertCircle, Loader2 } from 'lucide-react';
import { uploadDocument } from '@/lib/api/documents';
import { formatBytes } from '@/lib/utils';
import { useRouter } from 'next/navigation';

export function UploadDropzone() {
  const [uploading, setUploading] = useState(false);
  const [uploadedFile, setUploadedFile] = useState<{ name: string; size: number; id: string } | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [toast, setToast] = useState<{ message: string; type: 'info' | 'success' } | null>(null);
  const router = useRouter();

  const onDrop = useCallback(async (acceptedFiles: File[]) => {
    if (acceptedFiles.length === 0) return;
    const file = acceptedFiles[0];

    setUploading(true);
    setError(null);
    setToast({
      message: "Processing in vault... Please wait, it will be available shortly!",
      type: 'info'
    });

    try {
      const doc = await uploadDocument(file);
      setUploadedFile({ name: doc.name, size: doc.file_size, id: doc.id });
      setToast({
        message: "Success! Document processed and 3072-dim gemini-embedding-001 vector pipeline ready!",
        type: 'success'
      });
      setTimeout(() => {
        router.push('/documents?toast=success');
      }, 1800);
    } catch (err: any) {
      setError(err.message || 'Upload failed');
      setToast(null);
    } finally {
      setUploading(false);
    }
  }, [router]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
      'text/plain': ['.txt']
    },
    maxFiles: 1,
    maxSize: 50 * 1024 * 1024
  });

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        {...getRootProps()}
        className={`glass-card border-2 border-dashed p-10 text-center cursor-pointer transition-all duration-300 ${
          isDragActive
            ? 'border-blue-500 bg-blue-500/10 scale-[1.02] shadow-2xl'
            : 'dark:border-slate-700 border-slate-300 hover:border-blue-500/60 dark:hover:bg-slate-800/40 hover:bg-slate-100/60'
        }`}
      >
        <input {...getInputProps()} />

        <div className="w-16 h-16 rounded-2xl bg-blue-600/15 border border-blue-500/30 flex items-center justify-center mx-auto mb-4 text-blue-600 dark:text-cyan-400 shadow-lg shadow-blue-500/20">
          {uploading ? (
            <Loader2 className="w-8 h-8 animate-spin text-blue-600 dark:text-cyan-400" />
          ) : uploadedFile ? (
            <CheckCircle2 className="w-8 h-8 text-teal-500" />
          ) : (
            <Upload className="w-8 h-8" />
          )}
        </div>

        {uploading ? (
          <div>
            <h4 className="text-lg font-bold dark:text-white text-slate-900 mb-1 font-display">Processing Document...</h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">Extracting text, masking PII, and generating 3072-dim gemini-embedding-001 embeddings</p>
          </div>
        ) : uploadedFile ? (
          <div>
            <h4 className="text-lg font-bold text-teal-600 dark:text-teal-400 mb-1 font-display">Upload Successful!</h4>
            <p className="text-xs dark:text-slate-200 text-slate-800 font-mono mb-2">{uploadedFile.name} ({formatBytes(uploadedFile.size)})</p>
            <p className="text-[11px] text-slate-500 dark:text-slate-400 font-mono">Redirecting to Document Vault...</p>
          </div>
        ) : (
          <div>
            <h4 className="text-xl font-display font-bold dark:text-white text-slate-900 mb-2">
              {isDragActive ? 'Drop your document here...' : 'Drag & drop document or click to browse'}
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6 font-mono">Supports PDF, DOCX, TXT (Max size: 50MB)</p>

            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-blue-600 hover:bg-blue-500 text-white text-xs font-semibold shadow-lg shadow-blue-600/30 border border-blue-400/40 transition-all hover:scale-105">
              <FileText className="w-4 h-4" /> Select File
            </div>
          </div>
        )}
      </div>

      {error && (
        <div className="mt-4 p-4 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center gap-3 text-rose-600 dark:text-rose-300 text-xs">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Floating Toaster Message */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 max-w-md animate-in fade-in slide-in-from-bottom-5 duration-300">
          <div className={`p-4 rounded-2xl shadow-2xl border backdrop-blur-xl flex items-center gap-3.5 text-xs font-semibold ${
            toast.type === 'success'
              ? 'bg-teal-600/95 dark:bg-teal-500/95 text-white border-teal-400 shadow-teal-500/30'
              : 'bg-blue-600/95 dark:bg-blue-500/95 text-white border-blue-400 shadow-blue-600/30'
          }`}>
            {toast.type === 'success' ? (
              <CheckCircle2 className="w-5 h-5 shrink-0" />
            ) : (
              <Loader2 className="w-5 h-5 animate-spin shrink-0" />
            )}
            <div className="flex-1">
              <p className="font-sans text-sm font-bold">{toast.type === 'success' ? 'Processing Success!' : 'Processing Pipeline...'}</p>
              <p className="font-mono text-xs opacity-95 font-normal mt-0.5 leading-relaxed">{toast.message}</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
