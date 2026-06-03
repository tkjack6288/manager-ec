import os
import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from datetime import datetime, timezone, timedelta
from database import SessionLocal
from models.order import Order
from models.user import User

def check_and_notify_returning_orders():
    """
    檢查是否有「申請退貨中 (returning)」狀態超過 7 天的訂單，
    並發送提醒 Email 給客戶。
    """
    db = SessionLocal()
    try:
        now = datetime.now(timezone.utc)
        # 尋找 returning 狀態的訂單
        orders = db.query(Order).filter(Order.status == "returning").all()
        
        sender_email = "mososhop2020@gmail.com"
        app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
        
        if not app_password:
            print("GMAIL_APP_PASSWORD 未設定，無法寄送信件")
            return
            
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        
        count = 0
        for order in orders:
            updated_at = order.updated_at
            if updated_at.tzinfo is None:
                updated_at = updated_at.replace(tzinfo=timezone.utc)
                
            diff_days = (now - updated_at).days
            
            # 若超過7天
            if diff_days >= 7:
                # 可以增加一個欄位紀錄已寄送，目前簡化為每次執行若超過 7 天就寄送 (實務上可以再加條件避免重複寄送)
                user = db.query(User).filter(User.id == order.user_id).first()
                if user and user.email:
                    recipient_email = user.email
                    
                    message = MIMEMultipart()
                    message['From'] = sender_email
                    message['To'] = recipient_email
                    message['Subject'] = f'【Moso Shop】退貨提醒通知 (訂單編號: {order.id})'
                    
                    body = f"""您好 {user.name}，
                    
您的訂單 {order.id} 申請退貨已超過 7 天，但我們尚未收到退回的商品。
請儘快將商品退回，以利我們後續為您進行退款作業。

【退貨方式】
7-11：請寄到 7-ELEVEN 富邦門市 翁秀姍收，電話:0988-944-774
全家：請寄到全家便利商店 新實店 翁秀姍收，電話:0988-944-774

若您已寄出或有其他問題，請忽略此信或聯繫客服。
謝謝！
"""
                    message.attach(MIMEText(body, 'plain', 'utf-8'))
                    try:
                        server.sendmail(sender_email, recipient_email, message.as_string())
                        print(f"已發送提醒信件至 {recipient_email} (訂單 {order.id})")
                        count += 1
                        
                        # 實務上可以在這裡更新一個 `is_return_reminded` 的欄位
                    except Exception as e:
                        print(f"發送信件失敗 {recipient_email}: {e}")
                        
        server.quit()
        print(f"檢查完畢，共發送 {count} 封提醒信件。")
    except Exception as e:
        print(f"發生錯誤: {e}")
    finally:
        db.close()

if __name__ == "__main__":
    check_and_notify_returning_orders()
