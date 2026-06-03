from fastapi import APIRouter, Depends, HTTPException, Query, UploadFile, File
from sqlalchemy.orm import Session
from sqlalchemy import func
from typing import List, Optional
from dotenv import load_dotenv
import os

env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
load_dotenv(env_path, override=True)

import uuid
import shutil
from database import get_db
from models.user import User
from models.order import Order, OrderItem
from models.product import Product
from models.wallet import Wallet, WalletTransaction
from schemas.order import OrderResponse, OrderCreate
from routers.payment import cancel_ecpay_authorization
from schemas.product import ProductResponse, ProductCreate
from schemas.user import UserResponse
from models.wallet import Wallet, WalletTransaction
from core.dependencies import get_current_user, get_current_admin

# 驗證管理員身份
router = APIRouter(
    prefix="/admin", 
    tags=["後台管理"],
    dependencies=[Depends(get_current_admin)]
)

# --- 檔案上傳 ---

@router.post("/upload")
async def upload_image(file: UploadFile = File(...)):
    ALLOWED_EXTENSIONS = {'.jpg', '.jpeg', '.png', '.webp', '.gif'}
    ext = os.path.splitext(file.filename)[1].lower()
    
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(status_code=400, detail="不允許的檔案格式，僅支援圖片上傳 (.jpg, .png, .webp, .gif)")
        
    bucket_name = os.getenv("GCP_BUCKET_NAME")
    
    # 將圖片集中存放在 products/ 資料夾下
    gcp_filename = f"products/{uuid.uuid4().hex}{ext}"
    local_filename = f"{uuid.uuid4().hex}{ext}"
    
    # 讀取檔案內容
    content = await file.read()

    # 嘗試進行 GCP 上傳
    if bucket_name and bucket_name != "your-bucket-name":
        try:
            from google.cloud import storage
            client = storage.Client()
            bucket = client.bucket(bucket_name)
            blob = bucket.blob(gcp_filename)
            
            blob.upload_from_string(content, content_type=file.content_type)
            
            # 嘗試將該物件設為公開，若 bucket 啟用 Uniform Bucket-Level Access 則會失敗
            try:
                blob.make_public()
            except Exception as e:
                print(f"【警告】無法設定公開權限 ({e})，請確認 GCP Bucket 已開放公用讀取權限")

            # 由於已上傳到GCP bucket, 請使用 bucket 公開路徑
            public_url = f"https://storage.googleapis.com/{bucket_name}/{gcp_filename}"
            return {"url": public_url}
        except ImportError as e:
            print(f"【警告】尚未安裝 google-cloud-storage ({e})，自動退回本機儲存機制")
        except Exception as e:
            print(f"【警告】GCP 上傳失敗 ({e})，自動退回本機儲存機制")

    # Fallback：若未設定 GCP 或 GCP 上傳失敗，則存入本機 uploads/ 目錄
    os.makedirs("uploads", exist_ok=True)
    file_path = os.path.join("uploads", local_filename)
    
    with open(file_path, "wb") as buffer:
        buffer.write(content)
        
    return {"url": f"http://localhost:8000/uploads/{local_filename}"}

# --- 通路管理 ---
from models.channel import Channel
from schemas.channel import ChannelCreate, ChannelResponse

@router.get("/channels", response_model=List[ChannelResponse])
def admin_get_channels(channel_type: Optional[str] = None, db: Session = Depends(get_db)):
    """取得所有通路 (可依 channel_type 過濾 'supply' 或 'sales')"""
    query = db.query(Channel)
    if channel_type:
        query = query.filter(Channel.channel_type == channel_type)
    return query.order_by(Channel.created_at.desc()).all()

@router.post("/channels", response_model=ChannelResponse)
def admin_create_channel(channel_in: ChannelCreate, db: Session = Depends(get_db)):
    """新增通路"""
    new_channel = Channel(**channel_in.model_dump())
    db.add(new_channel)
    db.commit()
    db.refresh(new_channel)
    return new_channel

@router.delete("/channels/{channel_id}")
def admin_delete_channel(channel_id: str, db: Session = Depends(get_db)):
    """刪除通路"""
    channel = db.query(Channel).filter(Channel.id == channel_id).first()
    if not channel:
        raise HTTPException(status_code=404, detail="找不到該通路")
    db.delete(channel)
    db.commit()
    return {"message": "通路已刪除"}

# --- 商品管理 ---


@router.get("/products", response_model=List[ProductResponse])
def admin_get_products(search: str = Query(None), skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """後台取得所有商品，包含下架的商品"""
    query = db.query(Product)
    if search:
        # 簡單支援對 name 或 sku 進行模糊查詢
        query = query.filter(Product.name.ilike(f"%{search}%") | Product.sku.ilike(f"%{search}%") | Product.category.ilike(f"%{search}%"))
    return query.order_by(Product.updated_at.desc()).offset(skip).limit(limit).all()

@router.get("/products/{product_id}", response_model=ProductResponse)
def admin_get_product(product_id: str, db: Session = Depends(get_db)):
    """後台取得單一商品，包含下架的商品"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到該商品")
    return product

@router.post("/products", response_model=ProductResponse)
def admin_create_product(prod_in: ProductCreate, db: Session = Depends(get_db)):
    """後台新增商品"""
    # 若沒有提供 sku，則自動產生一個唯一 SKU
    if not prod_in.sku:
        import time
        import random
        prod_in.sku = f"SKU-{int(time.time())}-{random.randint(1000, 9999)}"

    existing_product = db.query(Product).filter(Product.sku == prod_in.sku).first()
    if existing_product:
        raise HTTPException(status_code=400, detail="已經有相同 SKU 的商品存在")
        
    new_product = Product(**prod_in.model_dump())
    db.add(new_product)
    db.commit()
    db.refresh(new_product)
    return new_product

@router.put("/products/{product_id}", response_model=ProductResponse)
def admin_update_product(product_id: str, prod_in: dict, db: Session = Depends(get_db)):
    """後台更新商品"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到該商品")
        
    for key, value in prod_in.items():
        if hasattr(product, key):
            setattr(product, key, value)
            
    db.commit()
    db.refresh(product)
    return product

@router.delete("/products/{product_id}")
def admin_delete_product(product_id: str, db: Session = Depends(get_db)):
    """後台刪除商品"""
    product = db.query(Product).filter(Product.id == product_id).first()
    if not product:
        raise HTTPException(status_code=404, detail="找不到該商品")
        
    # 通常會用軟刪除 is_active = False，這裡示範實體刪除或軟刪除
    db.delete(product)
    db.commit()
    return {"message": "商品已刪除"}

# --- 訂單管理 ---

@router.get("/orders", response_model=List[OrderResponse])
def admin_get_orders(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """後台取得所有訂單"""
    orders = db.query(Order).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    # 手動載入 items 以符合 OrderResponse
    for order in orders:
        order.user_name = order.user.name if order.user else "未知顧客"
        order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in order.items:
            item.product_name = item.product.name if item.product else "未知商品"
    return orders

@router.put("/orders/{order_id}/return_confirm", response_model=OrderResponse)
def admin_confirm_return(order_id: str, db: Session = Depends(get_db)):
    """管理員確認收貨無誤，並執行退貨退款作業"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到該訂單")
        
    if order.status != "returning":
        raise HTTPException(status_code=400, detail="訂單非申請退貨中狀態")
        
    # 1. 更新訂單狀態
    order.status = "returned"
    
    # 2. 恢復庫存
    order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in order_items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if prod:
            prod.stock = (prod.stock or 0) + item.quantity
            db.add(prod)
            
    # 3. 處理退款與回饋扣回
    moso_refund = float(order.moso_coin_used)
    cash_refund = float(order.final_paid)
    reward_deduct = float(order.reward_moso_coin)
    
    # 3.1 處理 Moso 幣退還與扣回贈送的回饋金
    if moso_refund > 0 or reward_deduct > 0:
        from models.wallet import Wallet, WalletTransaction
        wallet = db.query(Wallet).filter(Wallet.user_id == order.user_id).first()
        if wallet:
            net_amount = moso_refund - reward_deduct
            wallet.moso_coin = float(wallet.moso_coin) + net_amount
            
            if moso_refund > 0:
                db.add(WalletTransaction(
                    wallet_id=wallet.id,
                    transaction_type="refund",
                    currency="moso_coin",
                    amount=moso_refund,
                    reference_id=f"RETURN_{order.id}"
                ))
            if reward_deduct > 0:
                db.add(WalletTransaction(
                    wallet_id=wallet.id,
                    transaction_type="reward_revert", # 扣回發送的回饋
                    currency="moso_coin",
                    amount=-reward_deduct,
                    reference_id=f"REVERT_{order.id}"
                ))
            db.add(wallet)
            
    # 3.2 呼叫綠界 API 進行刷退作業
    if cash_refund > 0 and order.payment_method in ["ecpay", "綠界"]:
        if getattr(order, "merchant_trade_no", None) or getattr(order, "trade_no", None):
            success = cancel_ecpay_authorization(order.merchant_trade_no, order.trade_no, int(order.final_paid))
            if not success:
                print(f"Failed to cancel ECPay auth for order {order.id}")
        else:
            print(f"Skipping ECPay cancel for order {order.id} due to missing trade numbers")
            
    db.commit()
    db.refresh(order)
    
    order.user_name = order.user.name if order.user else "未知顧客"
    order.items = order_items
    for item in order.items:
        item.product_name = item.product.name if item.product else "未知商品"
        item.product_image = None

    # 發送退款完成通知信
    user_email = order.user.email if order.user else None
    user_name = order.user.name if order.user else "未知顧客"
    
    if user_email:
        import os
        import smtplib
        import threading
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        from dotenv import load_dotenv
        
        # 確保明確載入 backend 目錄下的 .env
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
        load_dotenv(env_path)

        def send_return_confirm_email():
            sender_email = "mososhop2020@gmail.com"
            recipient_email = user_email
            app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
            
            if not app_password:
                print("GMAIL_APP_PASSWORD 未設定，無法寄送退貨確認信件")
                return
                
            message = MIMEMultipart()
            message['From'] = sender_email
            message['To'] = recipient_email
            message['Subject'] = f'【Moso Shop】退貨收件確認及退款完成通知 (訂單編號: {order.id})'
            
            body = f"""親愛的 {user_name} 您好，
            
我們已順利收到您退回的商品（訂單編號：{order.id}），並經人員核對無誤。
感謝您的耐心等候，我們已為您完成退款作業，詳細處理進度如下：

- 若您有使用 Moso 幣折抵，該筆 Moso 幣已全數退還至您的會員錢包。
- 若您使用信用卡付款，我們已向綠界金流發起刷退作業（退款實際入帳時間將依各發卡銀行作業流程而異，通常需要 7-14 個工作日）。

感謝您的支持與配合，期待未來還有機會為您服務！
若有任何問題，歡迎隨時聯繫客服。

Moso Shop 團隊 敬上"""

            message.attach(MIMEText(body, 'plain', 'utf-8'))
            try:
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.starttls()
                server.login(sender_email, app_password)
                server.sendmail(sender_email, recipient_email, message.as_string())
                server.quit()
                print(f"已成功發送退款確認信至 {recipient_email}")
            except Exception as e:
                print(f"SMTP Email send error: {e}")

        threading.Thread(target=send_return_confirm_email).start()

    return order

@router.put("/orders/{order_id}/status", response_model=OrderResponse)
def admin_update_order_status(order_id: str, status: str, db: Session = Depends(get_db)):
    """後台更新訂單狀態"""
    order = db.query(Order).filter(Order.id == order_id).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到該訂單")
        
    # 若原本不是已取消，但現在要改為已取消，則執行退款作業
    if status == "cancelled" and order.status != "cancelled":
        # 1. 恢復庫存
        order_items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in order_items:
            prod = db.query(Product).filter(Product.id == item.product_id).first()
            if prod:
                prod.stock = (prod.stock or 0) + item.quantity
                db.add(prod)
                
        # 2. 處理 Moso 幣與現金退款
        moso_refund = float(order.moso_coin_used)
        cash_refund = float(order.final_paid)
        reward_deduct = float(order.reward_moso_coin)
        
        # 2.1 退還 Moso 幣與扣回回饋
        if moso_refund > 0 or reward_deduct > 0:
            wallet = db.query(Wallet).filter(Wallet.user_id == order.user_id).first()
            if wallet:
                net_amount = moso_refund - reward_deduct
                wallet.moso_coin = float(wallet.moso_coin) + net_amount
                
                if moso_refund > 0:
                    db.add(WalletTransaction(
                        wallet_id=wallet.id,
                        transaction_type="refund",
                        currency="moso_coin",
                        amount=moso_refund,
                        reference_id=f"CANCEL_{order.id}"
                    ))
                if reward_deduct > 0:
                    db.add(WalletTransaction(
                        wallet_id=wallet.id,
                        transaction_type="reward_revert",
                        currency="moso_coin",
                        amount=-reward_deduct,
                        reference_id=f"REVERT_{order.id}"
                    ))
                db.add(wallet)
                
        # 2.2 處理信用卡取消授權
        if order.payment_method == "ecpay" and order.final_paid > 0:
            if getattr(order, "merchant_trade_no", None) or getattr(order, "trade_no", None):
                success = cancel_ecpay_authorization(order.merchant_trade_no, order.trade_no, int(order.final_paid))
                if not success:
                    print(f"Failed to cancel ECPay auth for order {order.id}")
            else:
                print(f"Skipping ECPay cancel for order {order.id} due to missing trade numbers")

    order.status = status
    db.commit()
    db.refresh(order)

    # 發送邀請評價 Email
    if status == "completed":
        user_email = order.user.email if order.user else None
        user_name = order.user.name if order.user else "未知顧客"
        if user_email:
            import os
            import smtplib
            import threading
            from email.mime.text import MIMEText
            from email.mime.multipart import MIMEMultipart
            from dotenv import load_dotenv
            import json

            env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
            load_dotenv(env_path)
            
            # 讀取設定檔取得動態回饋幣數
            reward_coin = 50
            settings_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), 'settings.json')
            if os.path.exists(settings_path):
                try:
                    with open(settings_path, "r", encoding="utf-8") as f:
                        settings = json.load(f)
                        reward_coin = settings.get("review_reward_coin", 50)
                except:
                    pass

            def send_review_invite_email():
                sender_email = "mososhop2020@gmail.com"
                recipient_email = user_email
                app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
                
                if not app_password:
                    print("GMAIL_APP_PASSWORD 未設定，無法寄送評價邀請信件")
                    return
                    
                message = MIMEMultipart()
                message['From'] = sender_email
                message['To'] = recipient_email
                message['Subject'] = f'【Moso Shop】您的訂單已完成！邀請您留下評價賺取回饋！ (訂單編號: {order.id})'
                
                body = f"""親愛的 {user_name} 您好，
                
您的訂單（訂單編號：{order.id}）已順利完成！希望您會喜歡我們的商品。

我們非常重視您的意見，邀請您前往會員中心對本次購買的商品留下評價。
只要成功提交商品評價，每個商品評價即可獲得 {reward_coin} Moso 幣回饋喔！

立即前往評價：http://localhost:3000/member/orders

感謝您的支持，期待未來再次為您服務！

Moso Shop 團隊 敬上"""

                message.attach(MIMEText(body, 'plain', 'utf-8'))
                try:
                    server = smtplib.SMTP('smtp.gmail.com', 587)
                    server.starttls()
                    server.login(sender_email, app_password)
                    server.sendmail(sender_email, recipient_email, message.as_string())
                    server.quit()
                    print(f"已成功發送評價邀請信至 {recipient_email}")
                except Exception as e:
                    print(f"SMTP Email send error: {e}")

            threading.Thread(target=send_review_invite_email).start()
    order.user_name = order.user.name if order.user else "未知顧客"
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in order.items:
        item.product_name = item.product.name if item.product else "未知商品"
    return order

# --- 會員管理 ---

@router.get("/users", response_model=List[UserResponse])
def admin_get_users(search: str = Query(None), skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """後台取得所有會員"""
    query = db.query(User)
    if search:
        query = query.filter(User.name.ilike(f"%{search}%") | User.email.ilike(f"%{search}%"))
    return query.order_by(User.created_at.desc()).offset(skip).limit(limit).all()

@router.put("/users/{user_id}/vip")
def admin_toggle_user_vip(user_id: str, is_vip: bool, db: Session = Depends(get_db)):
    """後台設定會員是否為 VIP"""
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(status_code=404, detail="找不到該會員")
        
    user.is_vip = is_vip
    db.commit()
    db.refresh(user)
    return {"message": "會員 VIP 狀態已更新", "is_vip": user.is_vip}

# --- 評價管理 ---
from models.review import ProductReview

@router.get("/reviews")
def admin_get_reviews(skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """後台取得所有評價"""
    reviews = db.query(ProductReview).order_by(ProductReview.created_at.desc()).offset(skip).limit(limit).all()
    result = []
    for r in reviews:
        result.append({
            "id": r.id,
            "product_id": r.product_id,
            "product_name": r.product.name if r.product else "未知商品",
            "user_id": r.user_id,
            "user_email": r.user.email if r.user else "未知",
            "rating": r.rating,
            "comment": r.comment,
            "status": r.status,
            "created_at": r.created_at
        })
    return result

@router.delete("/reviews/{review_id}")
def admin_delete_review(review_id: str, db: Session = Depends(get_db)):
    """後台刪除評價"""
    review = db.query(ProductReview).filter(ProductReview.id == review_id).first()
    if not review:
        raise HTTPException(status_code=404, detail="找不到該評價")
    db.delete(review)
    db.commit()
    return {"message": "評價已刪除"}

# --- 系統設定 ---
import json
SETTINGS_FILE = "settings.json"

@router.get("/settings")
def get_system_settings():
    """取得系統設定"""
    if os.path.exists(SETTINGS_FILE):
        with open(SETTINGS_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    return {
        "site_name": "Mososhop",
        "maintenance_mode": False,
        "reward_percentage": 10,
        "free_shipping_threshold": 1000,
        "free_shipping_threshold_normal": 79,
        "free_shipping_threshold_refrigerated": 150,
        "free_shipping_threshold_frozen": 150,
        "shipping_fee_normal": 100,
        "shipping_fee_refrigerated": 150,
        "shipping_fee_frozen": 150,
        "review_reward_coin": 50
    }

@router.post("/settings")
def update_system_settings(settings: dict):
    """更新系統設定"""
    with open(SETTINGS_FILE, "w", encoding="utf-8") as f:
        json.dump(settings, f, ensure_ascii=False, indent=2)
    return {"message": "系統設定已更新"}
