import os
import re

def fix_file(filepath):
    with open(filepath, 'r', encoding='utf-8') as f:
        content = f.read()

    # Regex to find fetch calls without options
    # e.g. fetch(`${API_BASE}/admin/channels`);
    pattern1 = r'fetch\(([`\'"].*?[`\'"])\)'
    replacement1 = r'fetch(\1, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
    content = re.sub(pattern1, replacement1, content)
    
    # Regex to find fetch calls with options but no headers
    # e.g. fetch(url, { cache: "no-store" })
    # We will just inject headers if it's missing or update headers if it exists.
    # It's safer to just inject a wrapper function or use a custom hook, but for a quick script let's just do a simple replace on the known patterns.
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(content)

def main():
    admin_dir = r"d:\jay\ai\antigravity\manager-ec\frontend\src\app\admin"
    for root, dirs, files in os.walk(admin_dir):
        for file in files:
            if file.endswith('.tsx') and file != 'page.tsx' and 'login' not in root:
                # Wait, 'page.tsx' in login is excluded, what about others?
                filepath = os.path.join(root, file)
                # print(f"Processing {filepath}")
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                # Manual precise replacements based on grep
                
                # products/add/page.tsx
                if 'add' in root and file == 'page.tsx':
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/channels`)',
                        'fetch(`${API_BASE}/admin/channels`, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'const res = await fetch(`${API_BASE}/admin/upload`, {',
                        'const res = await fetch(`${API_BASE}/admin/upload`, {\n                    headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    content = content.replace(
                        'const res = await fetch(`${API_BASE}/admin/products`, {',
                        'const res = await fetch(`${API_BASE}/admin/products`, {\n                    headers: {\n                        "Content-Type": "application/json",\n                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`\n                    },'
                    )
                    # remove duplicate content-type if we just added it
                    content = content.replace(
                        'headers: {\n                        "Content-Type": "application/json",\n                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`\n                    },\n                    method: "POST",\n                    headers: { "Content-Type": "application/json" },',
                        'method: "POST",\n                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    
                # products/edit/[id]/page.tsx
                if 'edit' in root and file == 'page.tsx':
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/channels`)',
                        'fetch(`${API_BASE}/admin/channels`, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/products/${productId}`)',
                        'fetch(`${API_BASE}/admin/products/${productId}`, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'const res = await fetch(`${API_BASE}/admin/upload`, {',
                        'const res = await fetch(`${API_BASE}/admin/upload`, {\n                    headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    content = content.replace(
                        'const res = await fetch(`${API_BASE}/admin/products/${productId}`, {',
                        'const res = await fetch(`${API_BASE}/admin/products/${productId}`, {\n                    headers: {\n                        "Content-Type": "application/json",\n                        "Authorization": `Bearer ${localStorage.getItem("adminToken")}`\n                    },'
                    )
                    
                # products/page.tsx
                if 'products' in root and file == 'page.tsx' and 'add' not in root and 'edit' not in root:
                    content = content.replace(
                        'fetch(url)',
                        'fetch(url, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/channels`)',
                        'fetch(`${API_BASE}/admin/channels`, { headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE" })',
                        'fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/channels`, {',
                        'fetch(`${API_BASE}/admin/channels`, {\n                    headers: { "Content-Type": "application/json", "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/channels/${id}`, { method: "DELETE" })',
                        'fetch(`${API_BASE}/admin/channels/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    
                # orders/page.tsx
                if 'orders' in root and file == 'page.tsx':
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/orders?t=${Date.now()}`, {',
                        'fetch(`${API_BASE}/admin/orders?t=${Date.now()}`, {\n        headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/orders/${orderId}/status?status=${newStatus}`, {',
                        'fetch(`${API_BASE}/admin/orders/${orderId}/status?status=${newStatus}`, {\n        headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/orders/${orderId}/return_confirm`, {',
                        'fetch(`${API_BASE}/admin/orders/${orderId}/return_confirm`, {\n        headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    
                # users/page.tsx
                if 'users' in root and file == 'page.tsx':
                    content = content.replace(
                        'fetch(url, { cache: "no-store" })',
                        'fetch(url, { cache: "no-store", headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/users/${userId}/vip?is_vip=${isVip}`, {',
                        'fetch(`${API_BASE}/admin/users/${userId}/vip?is_vip=${isVip}`, {\n        headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },'
                    )
                    
                # reviews/page.tsx
                if 'reviews' in root and file == 'page.tsx':
                    content = content.replace(
                        'fetch(url, { cache: "no-store" })',
                        'fetch(url, { cache: "no-store", headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )
                    content = content.replace(
                        'fetch(`${API_BASE}/admin/reviews/${id}`, { method: "DELETE" })',
                        'fetch(`${API_BASE}/admin/reviews/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } })'
                    )

                with open(filepath, 'w', encoding='utf-8') as f:
                    f.write(content)

if __name__ == "__main__":
    main()
