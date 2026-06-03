import sys
from database import SessionLocal
from models.user import User

def set_admin(email: str):
    db = SessionLocal()
    try:
        user = db.query(User).filter(User.email == email).first()
        if not user:
            print(f"User with email {email} not found.")
            return
        
        user.is_admin = True
        db.commit()
        print(f"User {email} has been successfully promoted to admin.")
    finally:
        db.close()

if __name__ == "__main__":
    if len(sys.argv) < 2:
        # Default to the user's email if not provided
        default_email = "tkjack6288@gmail.com"
        print(f"No email provided, defaulting to {default_email}")
        set_admin(default_email)
    else:
        set_admin(sys.argv[1])
