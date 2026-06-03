from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.newsletter import NewsletterSubscriber
from models.user import User
from models.wallet import WalletTransaction
from schemas.newsletter import NewsletterSubscribeRequest
from pydantic import EmailStr
import uuid
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
import os

router = APIRouter(prefix="/newsletter", tags=["Newsletter"])

def send_subscription_email(recipient_email: str):
    sender_email = "mososhop2020@gmail.com"
    app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    
    if not app_password:
        print("Error: GMAIL_APP_PASSWORD is not set. Cannot send email.")
        return False

    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = recipient_email
    message['Subject'] = '【Mososhop】訂閱電子報成功通知'

    body = '''
    親愛的顧客您好，
    
    感謝您訂閱 Mososhop 電子報！
    未來我們將不定期寄送最新優惠與活動資訊給您。
    
    若您已經是我們的註冊會員，系統已為您的帳號自動發放 100 Moso 幣作為感謝！
    
    祝您購物愉快！
    Mososhop 團隊 敬上
    '''
    message.attach(MIMEText(body, 'plain', 'utf-8'))

    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, recipient_email, message.as_string())
        server.quit()
        return True
    except Exception as e:
        print(f'SMTP Email send error: {e}')
        return False

@router.post("/subscribe")
def subscribe_newsletter(req: NewsletterSubscribeRequest, db: Session = Depends(get_db)):
    # 檢查是否已訂閱
    existing = db.query(NewsletterSubscriber).filter(NewsletterSubscriber.email == req.email).first()
    if existing:
        return {"message": "您已經訂閱過電子報了喔！", "status": "already_subscribed"}
    
    # 新增訂閱
    new_sub = NewsletterSubscriber(email=req.email)
    db.add(new_sub)
    
    # 檢查是否為註冊會員，如果是則發放 100 Moso 幣
    user = db.query(User).filter(User.email == req.email).first()
    rewarded = False
    if user:
        # 新增 Moso 幣交易紀錄
        tx = WalletTransaction(
            user_id=user.id,
            amount=100,
            transaction_type="reward",
            description="訂閱電子報獎勵",
            related_order_id=None
        )
        db.add(tx)
        rewarded = True
        
    db.commit()
    
    msg = "訂閱成功！"
    if rewarded:
        msg += " 已為您的帳號發放 100 Moso 幣獎勵！"
        
    # 發送通知信
    send_subscription_email(req.email)
        
    return {"message": msg, "status": "success", "rewarded": rewarded}
