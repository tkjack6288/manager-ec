from core.security import get_password_hash
from database import engine
from sqlalchemy import text

with engine.connect() as conn:
    new_hash = get_password_hash("123456")
    conn.execute(text("UPDATE users SET password = :hash WHERE email = 'tkjack6288@gmail.com'"), {"hash": new_hash})
    conn.commit()
    print("Password updated to '123456'")
