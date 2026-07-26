import hashlib
import random
from typing import List
from app.core.config import settings
from app.core.logging import logger

DIMENSION = 3072  # gemini-embedding-001 produces 3072-dim vectors


class GeminiEmbedder:
    """
    Generates 3072-dimensional dense vector embeddings using Google's
    gemini-embedding-001 API via a lightweight HTTP call.

    - Zero local model RAM (no PyTorch, no sentence-transformers)
    - Render free-tier compatible (< 50MB RAM overhead)
    - Falls back to deterministic 3072-dim pseudo-vectors if API unavailable
    - Confirmed working: gemini-embedding-001 returns HTTP 200
    """

    MODEL_NAME = "gemini-embedding-001"

    def __init__(self):
        self.api_key = settings.GEMINI_API_KEY
        self.api_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.MODEL_NAME}:embedContent"
        )
        self.batch_url = (
            f"https://generativelanguage.googleapis.com/v1beta/models/"
            f"{self.MODEL_NAME}:batchEmbedContents"
        )

    def _fallback_vector(self, text: str) -> List[float]:
        hash_seed = int(hashlib.sha256(text.encode("utf-8")).hexdigest()[:8], 16)
        rng = random.Random(hash_seed)
        vec = [rng.uniform(-1.0, 1.0) for _ in range(DIMENSION)]
        norm = sum(x * x for x in vec) ** 0.5
        return [x / norm for x in vec]

    def _call_gemini_sync(self, text: str) -> List[float]:
        if not self.api_key:
            return self._fallback_vector(text)
        try:
            import httpx
            payload = {
                "model": f"models/{self.MODEL_NAME}",
                "content": {"parts": [{"text": text[:8000]}]}
            }
            response = httpx.post(
                f"{self.api_url}?key={self.api_key}",
                json=payload,
                timeout=15.0
            )
            response.raise_for_status()
            values = response.json()["embedding"]["values"]
            norm = sum(x * x for x in values) ** 0.5
            return [x / norm for x in values] if norm > 0 else values
        except Exception as e:
            logger.warning(f"Gemini embed API error, using fallback: {e}")
            return self._fallback_vector(text)

    def _call_gemini_batch_sync(self, texts: List[str]) -> List[List[float]]:
        if not self.api_key or not texts:
            return [self._fallback_vector(t) for t in texts]
        for attempt in range(2):
            try:
                import httpx
                import time
                batch_url = f"{self.batch_url}?key={self.api_key}"
                requests_payload = [
                    {
                        "model": f"models/{self.MODEL_NAME}",
                        "content": {"parts": [{"text": t[:8000]}]}
                    }
                    for t in texts
                ]
                response = httpx.post(
                    batch_url,
                    json={"requests": requests_payload},
                    timeout=25.0
                )
                response.raise_for_status()
                embeddings = response.json().get("embeddings", [])
                result = []
                for emb in embeddings:
                    values = emb.get("values", [])
                    norm = sum(x * x for x in values) ** 0.5
                    result.append([x / norm for x in values] if norm > 0 else values)
                return result
            except Exception as e:
                if attempt == 0:
                    time.sleep(1.0)
                    continue
                logger.warning(f"Gemini batch embed API error after retry, using fallback: {e}")
                return [self._fallback_vector(t) for t in texts]

    def embed_text(self, text: str) -> List[float]:
        return self._call_gemini_sync(text)

    def embed_documents(self, texts: List[str]) -> List[List[float]]:
        if not texts:
            return []
        import concurrent.futures
        batch_size = 50
        batches = [texts[i:i + batch_size] for i in range(0, len(texts), batch_size)]
        
        all_embeddings = []
        with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:
            results = list(executor.map(self._call_gemini_batch_sync, batches))
            for res in results:
                all_embeddings.extend(res)
        return all_embeddings


embedder = GeminiEmbedder()
