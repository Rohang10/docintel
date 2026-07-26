from pathlib import Path
from typing import List, Dict, Any

class DocumentExtractor:
    """
    Extracts text from PDF, DOCX, and TXT files while preserving page boundaries.
    """

    async def extract(self, file_path: Path, file_type: str) -> List[Dict[str, Any]]:
        match file_type.lower():
            case "pdf":
                return await self._extract_pdf(file_path)
            case "docx":
                return await self._extract_docx(file_path)
            case "txt":
                return await self._extract_txt(file_path)
            case _:
                raise ValueError(f"Unsupported file format: {file_type}")

    async def _extract_pdf(self, path: Path) -> List[Dict[str, Any]]:
        import fitz  # PyMuPDF
        pages = []
        with fitz.open(path) as doc:
            for page_num, page in enumerate(doc, start=1):
                text = page.get_text("text", flags=fitz.TEXT_PRESERVE_WHITESPACE)
                if text and text.strip():
                    pages.append({"page": page_num, "text": text.strip()})
        return pages

    async def _extract_docx(self, path: Path) -> List[Dict[str, Any]]:
        from docx import Document as DocxDocument
        doc = DocxDocument(path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n".join(paragraphs)
        return [{"page": 1, "text": full_text}]

    async def _extract_txt(self, path: Path) -> List[Dict[str, Any]]:
        with open(path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
        return [{"page": 1, "text": text.strip()}]

extractor = DocumentExtractor()
