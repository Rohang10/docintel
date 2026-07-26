import logging
import sys

class ConsoleFormatter(logging.Formatter):
    def format(self, record):
        level = f"{record.levelname}:".ljust(10)
        msg = record.getMessage()
        if hasattr(record, "tenant_id") and record.tenant_id and record.tenant_id != "anonymous":
            msg = f"[tenant: {record.tenant_id}] {msg}"
        return f"{level}{msg}"

def setup_logging():
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(ConsoleFormatter())
    
    root_logger = logging.getLogger()
    root_logger.setLevel(logging.INFO)
    root_logger.handlers = [handler]
    
    # Silence noisy third-party loggers from cluttering the console
    logging.getLogger("sentence_transformers").setLevel(logging.WARNING)
    logging.getLogger("transformers").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)

logger = logging.getLogger("docintel")
