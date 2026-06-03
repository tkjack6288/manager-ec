import os
import re

def fix_fetch(content):
    # Regex 1: match `fetch(url)` or `fetch(\`url\`)` without any options
    # We replace it with `fetch(..., { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })`
    content = re.sub(r'fetch\(([`\'"]?.*?[`\'"]?)\)', lambda m: f'fetch({m.group(1)}, {{ headers: {{ "Authorization": `Bearer ${{localStorage.getItem("adminToken")}}` }} }})' if 'headers:' not in m.group(0) and 'method:' not in m.group(0) and 'cache:' not in m.group(0) and m.group(1) != 'url' else m.group(0), content)
    
    # Actually `fetch(url)` needs special handling:
    content = re.sub(r'fetch\(url\)', r'fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })', content)

    # Regex 2: match `fetch(..., { ... })` and inject headers if it doesn't have it
    def inject_header(m):
        full = m.group(0)
        if 'Authorization' in full:
            return full
        # Insert Authorization into headers if headers exist
        if 'headers: {' in full:
            return full.replace('headers: {', 'headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}`,')
        # Otherwise insert headers
        return full.replace('{', '{ headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },', 1)

    content = re.sub(r'fetch\([^,]+,\s*\{[\s\S]*?\}\)', inject_header, content)
    return content

def main():
    admin_dir = r"d:\jay\ai\antigravity\manager-ec\frontend\src\app\admin"
    for root, dirs, files in os.walk(admin_dir):
        if 'login' in root: continue
        for file in files:
            if file.endswith('.tsx') and file != 'layout.tsx' and file != 'AdminSidebar.tsx':
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = fix_fetch(content)
                if new_content != content:
                    print(f"Fixed {filepath}")
                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    main()
