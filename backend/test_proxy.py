import requests

# Assuming the backend server is running on localhost:8000
url = "http://localhost:8000/products/image/test_upload.txt"
print(f"Fetching {url}")
try:
    response = requests.get(url, allow_redirects=False)
    print(f"Status Code: {response.status_code}")
    if response.status_code in [301, 302, 303, 307, 308]:
        print(f"Redirect Location: {response.headers.get('Location')}")
    else:
        print(f"Response Body: {response.text}")
except Exception as e:
    print(f"Error: {e}")
