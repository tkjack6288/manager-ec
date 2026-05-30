import os
import sys

sys.path.append(os.path.join(os.getcwd(), 'backend'))

import smtplib
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from dotenv import load_dotenv

load_dotenv(os.path.join(os.getcwd(), 'backend', '.env'))

def test_send():
    sender_email = "tkjack6288@gmail.com"
    recipient_email = "tkjack2013@gmail.com"
    app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
    print(f"app_password loaded: {bool(app_password)}")
    
    if not app_password:
        return
        
    message = MIMEMultipart()
    message['From'] = sender_email
    message['To'] = recipient_email
    message['Subject'] = f'【Moso Shop】退貨收件確認及退款通知 (訂單編號: 260509309K212)'
    
    body = "Test email body"
    message.attach(MIMEText(body, 'plain', 'utf-8'))
    try:
        server = smtplib.SMTP('smtp.gmail.com', 587)
        server.starttls()
        server.login(sender_email, app_password)
        server.sendmail(sender_email, recipient_email, message.as_string())
        server.quit()
        print("Success")
    except Exception as e:
        print(f"Error: {e}")

test_send()
