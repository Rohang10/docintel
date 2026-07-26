import os
import shutil
from pathlib import Path
from typing import Tuple

STORAGE_DIR = Path("./storage_vault")
STORAGE_DIR.mkdir(parents=True, exist_ok=True)

class StorageService:
    async def save_file(self, tenant_id: str, document_id: str, file_name: str, content: bytes) -> Tuple[str, str]:
        tenant_dir = STORAGE_DIR / tenant_id
        tenant_dir.mkdir(parents=True, exist_ok=True)
        
        safe_name = f"{document_id}_{file_name}"
        file_path = tenant_dir / safe_name
        
        with open(file_path, "wb") as f:
            f.write(content)
            
        return str(file_path), safe_name

    async def delete_file(self, file_path_str: str):
        path = Path(file_path_str)
        if path.exists():
            os.remove(path)

storage = StorageService()
