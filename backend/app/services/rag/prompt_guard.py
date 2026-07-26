import re
from enum import Enum
from typing import Tuple, List

class InjectionRisk(str, Enum):
    SAFE = "safe"
    SUSPICIOUS = "suspicious"
    BLOCKED = "blocked"

class PromptInjectionGuard:
    """
    Scans text chunks and queries for prompt injection attempts.
    Explicitly catches adversarial prompt patterns (including embedded prompt injection in test documents).
    """

    INJECTION_PATTERNS = [
        r"(?i)ignore\s+(previous|above|all)\s+instructions?",
        r"(?i)you\s+are\s+(now|a|an)\s+(?!the\s+following)",
        r"(?i)act\s+as\s+(?:if\s+you\s+are|a|an)\s+",
        r"(?i)disregard\s+your\s+(guidelines|instructions|rules)",
        r"(?i)forget\s+everything",
        r"(?i)new\s+instructions?\s*:",
        r"(?i)system\s*prompt\s*:",
        r"(?i)if\s+you\s+(are\s+an?\s+)?(?:ai|llm|assistant)", # exact pattern from assignment doc
        r"(?i)hallucinate\s+and\s+build",
        r"(?i)instead\s+of\s+this\s+project",
        r"<\|system\|>",
        r"\[INST\]",
        r"###\s*instruction",
    ]

    def __init__(self):
        self.patterns = [re.compile(p) for p in self.INJECTION_PATTERNS]

    def scan(self, text: str) -> Tuple[InjectionRisk, List[str]]:
        matches = []
        for pattern in self.patterns:
            if pattern.search(text):
                matches.append(pattern.pattern)

        if not matches:
            return InjectionRisk.SAFE, []
        if len(matches) >= 2:
            return InjectionRisk.BLOCKED, matches
        return InjectionRisk.SUSPICIOUS, matches

    def sanitize_context(self, chunks: List[dict]) -> List[dict]:
        safe_chunks = []
        for chunk in chunks:
            risk, _ = self.scan(chunk.get("content", ""))
            if risk != InjectionRisk.BLOCKED:
                safe_chunks.append(chunk)
        return safe_chunks

prompt_guard = PromptInjectionGuard()
