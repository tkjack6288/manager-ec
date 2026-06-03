import os
import re

target_dir = r'd:\jay\ai\antigravity\manager-ec\frontend\src'

def process_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    new_content = content
    # Replace "http://localhost:8000/..." with `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/...`
    new_content = re.sub(r'\"http://localhost:8000([^\"]*)\"', r'`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}\1`', new_content)
    # Replace 'http://localhost:8000/...' with `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/...`
    new_content = re.sub(r'\'http://localhost:8000([^\']*)\'', r'`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}\1`', new_content)
    # Replace `http://localhost:8000/...` with `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}/...`
    new_content = re.sub(r'`http://localhost:8000([^`]*)`', r'`${process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000"}\1`', new_content)

    if new_content != content:
        with open(filepath, 'w', encoding='utf-8') as f:
            f.write(new_content)
        print(f'Updated {filepath}')

for root, _, files in os.walk(target_dir):
    for f in files:
        if f.endswith(('.ts', '.tsx')):
            process_file(os.path.join(root, f))
