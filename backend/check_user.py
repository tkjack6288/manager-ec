import os
import json
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    result = conn.execute(text("SELECT email, password FROM users WHERE email = 'tkjack6288@gmail.com'")).mappings().all()
    out = [dict(row) for row in result]
    with open('out5.json', 'w') as f:
        json.dump(out, f)