import os
import re

TARGET_DIR = 'frontend/src'
SEARCH_PATTERN = r'"https://manager-ec-backend-164815154526\.asia-east1\.run\.app'
REPLACE_STRING = '`https://manager-ec-backend-164815154526.asia-east1.run.app'

for root, _, files in os.walk(TARGET_DIR):
    for file in files:
        if file.endswith(('.tsx', '.ts')):
            filepath = os.path.join(root, file)
            with open(filepath, 'r', encoding='utf-8') as f:
                content = f.read()
            
            new_content = re.sub(SEARCH_PATTERN, REPLACE_STRING, content)
            
            if new_content != content:
                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(new_content)
                print(f"Fixed {filepath}")
