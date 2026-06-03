import os
import re

def main():
    admin_dir = r"d:\jay\ai\antigravity\manager-ec\frontend\src\app\admin"
    bad_string = r'${ headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },API_BASE}'
    good_string = r'${API_BASE}'
    
    for root, dirs, files in os.walk(admin_dir):
        for file in files:
            if file.endswith('.tsx'):
                filepath = os.path.join(root, file)
                with open(filepath, 'r', encoding='utf-8') as f:
                    content = f.read()
                
                new_content = content.replace(bad_string, good_string)
                
                if new_content != content:
                    print(f"Removed bad syntax in {filepath}")
                    
                    # Now we need to properly inject the header if it's missing!
                    # For products/add/page.tsx line 64 upload, it had method: "POST", body: uploadData
                    # For products/edit/[id]/page.tsx line 131, it had method: "POST", body: uploadData
                    # For products/page.tsx line 50, it had { method: "DELETE" }
                    # For users/page.tsx line 36, it had method: "PUT"
                    
                    # Instead of regex, let's just do targeted replace for those known lines
                    if 'upload`' in new_content:
                        new_content = new_content.replace('const res = await fetch(`${API_BASE}/admin/upload`, {\n                    method: "POST",\n                    body: uploadData,\n                });', 'const res = await fetch(`${API_BASE}/admin/upload`, {\n                    method: "POST",\n                    headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` },\n                    body: uploadData,\n                });')

                    if 'products/${id}`' in new_content:
                        new_content = new_content.replace('const res = await fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE" });', 'const res = await fetch(`${API_BASE}/admin/products/${id}`, { method: "DELETE", headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` } });')
                        
                    if 'users/${userId}' in new_content:
                        new_content = new_content.replace('const res = await fetch(`${API_BASE}/admin/users/${userId}/vip?is_vip=${isVip}`, {\n                method: "PUT"\n            });', 'const res = await fetch(`${API_BASE}/admin/users/${userId}/vip?is_vip=${isVip}`, {\n                method: "PUT",\n                headers: { "Authorization": `Bearer ${localStorage.getItem("adminToken")}` }\n            });')

                    with open(filepath, 'w', encoding='utf-8') as f:
                        f.write(new_content)

if __name__ == "__main__":
    main()
