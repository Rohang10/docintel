import { apiFetch } from './client';

export interface DocumentItem {
  id: string;
  tenant_id: string;
  uploaded_by: string;
  name: string;
  original_name: string;
  file_type: string;
  file_size: number;
  status: 'pending' | 'extracting' | 'masking' | 'chunking' | 'embedding' | 'ready' | 'failed';
  page_count?: number;
  chunk_count?: number;
  pii_entities: string[];
  metadata: Record<string, any>;
  error_message?: string;
  created_at: string;
  updated_at: string;
}

export interface DocumentStatus {
  id: string;
  status: string;
  progress: number;
  current_step: string;
  chunk_count?: number;
  pii_entities: string[];
  error_message?: string;
}

export async function fetchDocuments(): Promise<DocumentItem[]> {
  return apiFetch<DocumentItem[]>('/documents/');
}

export async function fetchDocumentStatus(id: string): Promise<DocumentStatus> {
  return apiFetch<DocumentStatus>(`/documents/${id}/status`);
}

export async function uploadDocument(file: File): Promise<DocumentItem> {
  const formData = new FormData();
  formData.append('file', file);

  const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
  const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;

  const headers: Record<string, string> = {};
  if (token) headers['Authorization'] = `Bearer ${token}`;
  if (tenantId) headers['X-Tenant-ID'] = tenantId;

  const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/documents/`, {
    method: 'POST',
    headers,
    body: formData,
  });

  if (!response.ok) {
    const err = await response.json().catch(() => ({ detail: 'Upload failed' }));
    throw new Error(err.detail || 'Failed to upload document');
  }

  return response.json();
}

export async function deleteDocument(id: string): Promise<void> {
  await apiFetch(`/documents/${id}`, { method: 'DELETE' });
}
