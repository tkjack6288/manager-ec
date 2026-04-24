import os
import base64
from email.message import EmailMessage
from google.oauth2 import service_account
from googleapiclient.discovery import build

def send_reset_password_email(recipient_email: str):
    SCOPES = ['https://www.googleapis.com/auth/gmail.send']
    SERVICE_ACCOUNT_FILE = '../service-account.json'
    
    # We impersonate tkjack6288@gmail.com.tw
    creds = service_account.Credentials.from_service_account_file(
        SERVICE_ACCOUNT_FILE, scopes=SCOPES)
    # creds = creds.with_subject('tkjack6288@gmail.com.tw')
    
    service = build('gmail', 'v1', credentials=creds)
    
    message = EmailMessage()
    message.set_content('這是一封測試密碼重設信件。請點擊連結重設密碼：https://example.com/reset')
    message['To'] = recipient_email
    message['From'] = 'tkjack6288@gmail.com.tw'
    message['Subject'] = '【Moso】密碼重設通知'
    
    # encoded message
    encoded_message = base64.urlsafe_b64encode(message.as_bytes()).decode()
    create_message = {'raw': encoded_message}
    
    try:
        send_message = service.users().messages().send(
            userId="me", body=create_message).execute()
        print(f'Message Id: {send_message["id"]}')
        return True
    except Exception as e:
        print(f'An error occurred: {e}')
        return False

if __name__ == '__main__':
    # Test sending to a dummy email
    send_reset_password_email('test@example.com')
