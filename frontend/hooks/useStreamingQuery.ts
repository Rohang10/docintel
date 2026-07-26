import { useState, useCallback, useRef } from 'react';

export interface SourceCitation {
  document_id: string;
  document_name: string;
  page_number?: number;
  content_snippet: string;
  similarity: number;
}

export interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  sources?: SourceCitation[];
  isStreaming?: boolean;
  timestamp: string;
}

export function useStreamingQuery() {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const abortControllerRef = useRef<AbortController | null>(null);

  const sendMessage = useCallback(async (content: string, documentIds?: string[]) => {
    if (!content.trim() || isStreaming) return;

    setError(null);
    const userMsgId = Date.now().toString();
    const userMessage: ChatMessage = {
      id: userMsgId,
      role: 'user',
      content,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const assistantMsgId = (Date.now() + 1).toString();
    const assistantMessage: ChatMessage = {
      id: assistantMsgId,
      role: 'assistant',
      content: '',
      isStreaming: true,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, userMessage, assistantMessage]);
    setIsStreaming(true);

    abortControllerRef.current = new AbortController();

    const token = typeof window !== 'undefined' ? localStorage.getItem('token') : null;
    const tenantId = typeof window !== 'undefined' ? localStorage.getItem('tenant_id') : null;

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL || '/api/v1'}/query/stream`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
          ...(tenantId ? { 'X-Tenant-ID': tenantId } : {})
        },
        body: JSON.stringify({
          content,
          document_ids: documentIds
        }),
        signal: abortControllerRef.current.signal
      });

      if (!response.ok) {
        const errJson = await response.json().catch(() => ({ detail: 'Query failed' }));
        throw new Error(errJson.detail || `Query request failed with status ${response.status}`);
      }

      const reader = response.body?.getReader();
      if (!reader) throw new Error('Response stream not readable');

      const decoder = new TextDecoder();
      let buffer = '';

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        buffer += decoder.decode(value, { stream: true });
        const lines = buffer.split('\n');
        buffer = lines.pop() ?? '';

        for (const line of lines) {
          if (!line.startsWith('data: ')) continue;
          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') break;

          try {
            const event = JSON.parse(jsonStr);

            if (event.type === 'start') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, sources: event.sources } : m
              ));
            } else if (event.type === 'token') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, content: m.content + event.content } : m
              ));
            } else if (event.type === 'end') {
              setMessages(prev => prev.map(m =>
                m.id === assistantMsgId ? { ...m, isStreaming: false, sources: event.sources } : m
              ));
            }
          } catch (e) {
            // Ignore parse errors for partial chunks
          }
        }
      }
    } catch (err: any) {
      if (err.name !== 'AbortError') {
        const errMsg = err.message || 'Stream processing error';
        setError(errMsg);
        setMessages(prev => prev.map(m =>
          m.id === assistantMsgId ? {
            ...m,
            content: `⚠️ **Error**: ${errMsg}`,
            isStreaming: false
          } : m
        ));
      }
    } finally {
      setIsStreaming(false);
    }
  }, [isStreaming]);

  const clearMessages = useCallback(() => {
    setMessages([]);
  }, []);

  return { messages, isStreaming, error, sendMessage, clearMessages };
}
