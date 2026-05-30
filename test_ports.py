import urllib.request
import urllib.error

ports = [8000, 8001, 8080, 5000, 3001]
for port in ports:
    url = f"http://localhost:{port}/"
    try:
        req = urllib.request.Request(url, method="GET")
        with urllib.request.urlopen(req, timeout=1) as response:
            body = response.read().decode('utf-8')
            print(f"Port {port}: {response.status} - {body[:100]}")
    except urllib.error.URLError as e:
        if isinstance(e.reason, ConnectionRefusedError):
            pass # Port not open
        else:
            try:
                print(f"Port {port}: {e.code} {e.reason}")
            except:
                pass
    except Exception as e:
        pass
