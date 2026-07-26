import hashlib
from typing import List, Dict, Any

class SemanticDocumentChunker:
    """
    Splits page text into semantic paragraphs and context chunks.
    """

    def __init__(self, chunk_size: int = 500, overlap: int = 50):
        self.chunk_size = chunk_size
        self.overlap = overlap

    def chunk_pages(self, pages: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
        chunks = []
        global_chunk_idx = 0

        for page in pages:
            page_num = page["page"]
            text = page["text"]

            # Split into paragraphs
            paragraphs = [p.strip() for p in text.split("\n\n") if p.strip()]
            if not paragraphs:
                paragraphs = [text]

            current_chunk = ""
            for p in paragraphs:
                if len(current_chunk) + len(p) <= self.chunk_size:
                    current_chunk += ("\n\n" if current_chunk else "") + p
                else:
                    if current_chunk:
                        content_hash = hashlib.sha256(current_chunk.encode("utf-8")).hexdigest()
                        chunks.append({
                            "chunk_index": global_chunk_idx,
                            "content": current_chunk,
                            "content_hash": content_hash,
                            "page_number": page_num,
                            "token_count": len(current_chunk.split())
                        })
                        global_chunk_idx += 1
                    current_chunk = p

            if current_chunk:
                content_hash = hashlib.sha256(current_chunk.encode("utf-8")).hexdigest()
                chunks.append({
                    "chunk_index": global_chunk_idx,
                    "content": current_chunk,
                    "content_hash": content_hash,
                    "page_number": page_num,
                    "token_count": len(current_chunk.split())
                })
                global_chunk_idx += 1

        return chunks

chunker = SemanticDocumentChunker()
