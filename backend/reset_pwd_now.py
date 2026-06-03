from database import engine
from sqlalchemy import text
from core.security import get_password_hash

def run():
    with engine.connect() as conn:
        result = conn.execute(text("SELECT email, password, is_admin FROM users WHERE email = 'tkjack6288@gmail.com'")).mappings().first()
        if not result:
            print("User not found!")
            return
        
        print(f"Current record: email={result['email']}, is_admin={result['is_admin']}")
        
        new_hash = get_password_hash("123456")
        conn.execute(text("UPDATE users SET password = :hash WHERE email = 'tkjack6288@gmail.com'"), {"hash": new_hash})
        conn.commit()
        print("Password reset to 123456 successfully in remote database.")

if __name__ == "__main__":
    run()
