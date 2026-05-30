import urllib.request
import urllib.error

url = "http://localhost:8000/"
try:
    req = urllib.request.Request(url)
    with urllib.request.urlopen(req) as response:
        print(f"GET {url}: {response.status} - {response.read().decode('utf-8')}")
except urllib.error.HTTPError as e:
    print(f"GET {url}: {e.code} {e.reason} - {e.read().decode('utf-8')}")
except Exception as e:
    print(f"Error GET {url}: {e}")
