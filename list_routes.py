import sys
import os

sys.path.append(os.path.join(os.getcwd(), 'backend'))

from main import app

for route in app.routes:
    print(f"{getattr(route, 'methods', None)} {getattr(route, 'path', None)}")
