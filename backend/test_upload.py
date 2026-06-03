import requests

# 測試用假管理員 Token，或不帶 Token（根據後端驗證設定）
# 這裡先測試不帶 Token 是否被拒絕，或是如果被授權拒絕至少會顯示。我們主要關注檔案格式錯誤的回傳。
headers = {
    'Authorization': 'Bearer mososhop_super_secret_dev_key'
}

url = 'http://localhost:8000/admin/upload'

# 1. 測試上傳惡意腳本 (副檔名 .py)
files_py = {'file': ('test.py', 'print("malicious")', 'text/x-python')}
print("Testing .py upload...")
try:
    res_py = requests.post(url, headers=headers, files=files_py)
    print(f"Status: {res_py.status_code}, Response: {res_py.text}")
except Exception as e:
    print(f"Error: {e}")

print("-" * 30)

# 2. 測試上傳正常圖片 (副檔名 .png)
files_png = {'file': ('test.png', b'fake image data', 'image/png')}
print("Testing .png upload...")
try:
    res_png = requests.post(url, headers=headers, files=files_png)
    print(f"Status: {res_png.status_code}, Response: {res_png.text}")
except Exception as e:
    print(f"Error: {e}")
