from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.wallet import Wallet
from pydantic import BaseModel
import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv()

from schemas.user import UserCreate, UserResponse, Token, UserLogin
from core.security import get_password_hash, verify_password, create_access_token
from core.dependencies import get_current_user
from datetime import timedelta

router = APIRouter(prefix="/users", tags=["會員"])

class ForgotPasswordRequest(BaseModel):
    email: str

def send_reset_password_email(recipient_email: str):
    sender_email = "mososhop2020@gmail.com"
    # 從環境變數讀取應用程式密碼，若未設定則先預設為空字串（需設定環境變數 GMAIL_APP_PASSWORD）
    app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    
    if not app_password:
        print("Error: GMAIL_APP_PASSWORD is not set. Cannot send email.")
        return False

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = recipient_email
    message['Subject'] = '【Moso】密碼重設通知'

    body = '這是一封 Moso 密碼重設信件。請點擊連結重設密碼：http://localhost:3000/member/reset-password'
    message.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        # 連接 Gmail SMTP 伺服器
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()  # 啟用安全連線
        server.login(sender_email, app_password)
        
        text = message.as_string()
        server.sendmail(sender_email, recipient_email, text)
        server.quit()
        return True
    except Exception as e:
        print(f'SMTP Email send error: {e}')
        return False

@router.post("/forgot-password")
def forgot_password(request: ForgotPasswordRequest, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == request.email).first()
    if not db_user:
        # 基於安全性，不應該明確告知信箱不存在，但這裡為了測試可以回傳成功
        pass
    
    # 呼叫 GCP Gmail API 寄送重設信件
    success = send_reset_password_email(request.email)
    
    if not success:
        # 如果失敗，依然回傳 200，但可以讓前端知道或是記錄在 log
        # 實務上也可以拋出 500
        pass

    return {"message": "如果該信箱存在，密碼重設信件已寄出"}

@router.post("/register", response_model=UserResponse)
def register_user(user_in: UserCreate, db: Session = Depends(get_db)):
    # 檢查信箱是否已註冊
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if db_user:
        raise HTTPException(status_code=400, detail="此信箱已經註冊過")
    
    # 建立新會員
    hashed_password = get_password_hash(user_in.password) if user_in.password else None
    new_user = User(
        email=user_in.email,
        name=user_in.name,
        password=hashed_password,
        auth_provider=user_in.auth_provider if hasattr(user_in, 'auth_provider') else "local"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # 同時為新會員建立專屬的 Moso 數位錢包
    new_wallet = Wallet(user_id=new_user.id)
    db.add(new_wallet)
    db.commit()

    return new_user

@router.post("/login", response_model=Token)
def login(user_in: UserLogin, db: Session = Depends(get_db)):
    db_user = db.query(User).filter(User.email == user_in.email).first()
    if not db_user or not db_user.password:
        raise HTTPException(status_code=400, detail="帳號或密碼錯誤")
    
    if not verify_password(user_in.password, db_user.password):
        raise HTTPException(status_code=400, detail="帳號或密碼錯誤")
    
    access_token = create_access_token(
        data={"sub": db_user.id},
    )
    return {"access_token": access_token, "token_type": "bearer"}

@router.get("/me", response_model=UserResponse)
def read_users_me(current_user: User = Depends(get_current_user)):
    return current_user

class UserUpdateMe(BaseModel):
    name: str

@router.put("/me", response_model=UserResponse)
def update_users_me(user_in: UserUpdateMe, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    current_user.name = user_in.name
    db.commit()
    db.refresh(current_user)
    return current_user

class ChangePasswordRequest(BaseModel):
    current_password: str
    new_password: str

@router.put("/change-password")
def change_password(request: ChangePasswordRequest, db: Session = Depends(get_db), current_user: User = Depends(get_current_user)):
    if not current_user.password or not verify_password(request.current_password, current_user.password):
        raise HTTPException(status_code=400, detail="目前密碼錯誤")
    
    current_user.password = get_password_hash(request.new_password)
    db.commit()
    
    return {"message": "密碼更新成功"}
