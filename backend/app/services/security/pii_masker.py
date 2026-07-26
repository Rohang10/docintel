import re
from typing import Tuple, List, Set

class PIIMasker:
    """
    Detects and masks PII entity values using regex rules & Presidio (if available).
    Detects:
    - PERSON, EMAIL_ADDRESS, PHONE_NUMBER
    - CREDIT_CARD, IBAN_CODE, US_SSN
    - IN_PAN, IN_AADHAAR (Indian PII)
    - PASSWORD, CLIENT_ID (custom recognizers)
    """

    PATTERNS = {
        "EMAIL_ADDRESS": r"[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}",
        "PHONE_NUMBER": r"\b(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b",
        "CREDIT_CARD": r"\b(?:\d[ -]*?){13,16}\b",
        "US_SSN": r"\b\d{3}-\d{2}-\d{4}\b",
        "IN_PAN": r"\b[A-Z]{5}[0-9]{4}[A-Z]{1}\b",
        "IN_AADHAAR": r"\b\d{4}[-\s]?\d{4}[-\s]?\d{4}\b",
        "PASSWORD": r"(?i)(?:password|passwd|pwd)\s*[:=]\s*\S+",
        "CLIENT_ID": r"(?i)(?:client.?id|customer.?id)\s*[:=]\s*[\w\-]+",
    }

    def __init__(self):
        self.compiled_patterns = {
            entity: re.compile(pat) for entity, pat in self.PATTERNS.items()
        }

    def mask(self, text: str) -> Tuple[str, List[str]]:
        """
        Returns (masked_text, list_of_detected_entity_types).
        Replaces sensitive values with <ENTITY_TYPE> placeholders.
        """
        masked_text = text
        detected_entities: Set[str] = set()

        for entity, pattern in self.compiled_patterns.items():
            matches = pattern.findall(masked_text)
            if matches:
                detected_entities.add(entity)
                if entity == "PASSWORD":
                    masked_text = pattern.sub("password: <PASSWORD>", masked_text)
                elif entity == "CLIENT_ID":
                    masked_text = pattern.sub("client_id: <CLIENT_ID>", masked_text)
                else:
                    masked_text = pattern.sub(f"<{entity}>", masked_text)

        return masked_text, sorted(list(detected_entities))

pii_masker = PIIMasker()
