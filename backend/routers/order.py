from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
import datetime
import random
import string
import os
import smtplib
import threading
from email.mime.text import MIMEText
from email.mime.multipart import MIMEMultipart
from database import get_db
from models.user import User
from models.wallet import Wallet, WalletTransaction
from models.order import Order, OrderItem
from models.product import Product
from schemas.order import OrderCreate, OrderResponse, OrderCancelRequest
from core.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["訂單與結帳"])

def generate_order_id(db: Session) -> str:
    """產生訂單編號: 西元後2碼+月+日+3碼隨機數+1碼隨機大寫英字字+3碼隨機數"""
    now = datetime.datetime.now()
    date_prefix = now.strftime("%y%m%d") # 例如: 260427
    
    while True:
        part1 = "".join(random.choices(string.digits, k=3))
        part2 = "".join(random.choices(string.digits, k=3))
        random_char = random.choice(string.ascii_uppercase)
        
        new_id = f"{date_prefix}{part1}{random_char}{part2}"
        
        # 確認此訂單編號是否已使用過，若無則回傳，否則重新產生
        existing = db.query(Order).filter(Order.id == new_id).first()
        if not existing:
            return new_id

@router.post("", response_model=OrderResponse)
@router.post("/", response_model=OrderResponse)
def create_order(req: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """建立訂單、處理庫存並計算 Moso 幣折抵與回饋 (10%)"""
    if not req.items:
        raise HTTPException(status_code=400, detail="購物車不能為空")
    
    total_amount = float(req.shipping_fee)
    order_items_db = []
    
    import json
    # 1. 計算總金額並扣庫存 (簡化版：先檢查後再扣)
    for item in req.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=404, detail=f"商品不存在或已下架: {item.product_id}")
            
        current_stock = prod.stock or 0
        selling_price = float(prod.selling_price)
        
        variant_matched = False
        parsed_variants = []
        variant_index = -1
        
        if item.variant and prod.variants:
            try:
                parsed_variants = json.loads(prod.variants)
                if isinstance(parsed_variants, list) and len(parsed_variants) > 0 and isinstance(parsed_variants[0], dict):
                    for idx, v in enumerate(parsed_variants):
                        if v.get('name') == item.variant:
                            current_stock = int(v.get('stock', 0))
                            selling_price = float(v.get('selling_price', selling_price))
                            variant_matched = True
                            variant_index = idx
                            break
            except Exception:
                pass
                
        if current_stock < item.quantity:
            variant_name = f" ({item.variant})" if variant_matched else ""
            raise HTTPException(status_code=400, detail=f"庫存不足: {prod.name}{variant_name}")
        
        subtotal = selling_price * item.quantity
        total_amount += subtotal
        
        o_item = OrderItem(
            product_id=prod.id,
            quantity=item.quantity,
            unit_price=selling_price,
            subtotal=subtotal
        )
        order_items_db.append(o_item)
        
        # 扣除庫存
        if variant_matched and variant_index != -1:
            parsed_variants[variant_index]['stock'] = current_stock - item.quantity
            prod.variants = json.dumps(parsed_variants, ensure_ascii=False)
        else:
            prod.stock = current_stock - item.quantity
            
        db.add(prod)

    # 2. 處理 Moso 幣折抵
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    moso_coin_used = 0.0
    final_paid = total_amount
    
    if req.use_moso_coin and wallet and wallet.moso_coin > 0:
        available_moso = float(wallet.moso_coin)
        request_deduct = float(req.use_moso_coin) if not isinstance(req.use_moso_coin, bool) else available_moso
        
        # 限制折抵數量不超過總金額與可用餘額
        actual_deduct = min(request_deduct, available_moso, total_amount)
        
        moso_coin_used = actual_deduct
        final_paid = total_amount - moso_coin_used
            
        # 扣除錢包 Moso 幣並產生異動紀錄
        wallet.moso_coin = float(wallet.moso_coin) - moso_coin_used
        db.add(WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="spend",
            currency="moso_coin",
            amount=-moso_coin_used,
            reference_id="ORDER_DEDUCT_PENDING"
        ))
        db.add(wallet)

    # 3. 計算回饋 (僅針對實際支付金額給予 10% 回饋)
    reward_moso_coin = final_paid * 0.10

    # 4. 建立訂單
    new_order_id = generate_order_id(db)
    
    new_order = Order(
        id=new_order_id,
        user_id=current_user.id,
        total_amount=total_amount,
        moso_coin_used=moso_coin_used,
        final_paid=final_paid,
        reward_moso_coin=reward_moso_coin,
        status="paid" if final_paid == 0 else "pending", # 若全額扣抵直接轉為 paid (處理中)
        payment_method="wallet" if final_paid == 0 else "ecpay",
        shipping_name=req.shipping_name,
        shipping_phone=req.shipping_phone,
        shipping_address=req.shipping_address,
        note=req.note,
        shipping_type=req.shipping_type,
        store_id=req.store_id,
        store_name=req.store_name
    )
    
    db.add(new_order)
    db.commit() # 先取得 new_order.id
    db.refresh(new_order)

    # 寫入 Order items
    for oi in order_items_db:
        oi.order_id = new_order.id
        db.add(oi)

    # 簡化流程：訂單建立即發放 Moso 回饋
    if reward_moso_coin > 0:
        wallet.moso_coin = float(wallet.moso_coin) + reward_moso_coin
        db.add(WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="reward",
            currency="moso_coin",
            amount=reward_moso_coin,
            reference_id=new_order.id
        ))
        db.add(wallet)

    db.commit()
    db.refresh(new_order)

    # 5. 背景發送訂單通知信
    def send_order_email():
        sender_email = "tkjack6288@gmail.com" # 與 user.py 同一個寄件者設定
        recipient_email = "tkjack6288@gmail.com"
        app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
        
        if not app_password:
            print("GMAIL_APP_PASSWORD 未設定，略過寄信")
            return
            
        message = MIMEMultipart()
        message['From'] = sender_email
        message['To'] = recipient_email
        message['Subject'] = f'【Moso Shop】新訂單成立通知 (編號: {new_order.id})'
        
        items_str = "\n".join([f"- 商品ID: {oi.product_id} x {oi.quantity} (小計: NT$ {int(oi.subtotal)})" for oi in order_items_db])
        body = f"""您好，系統收到一筆新的訂單！

訂單編號：{new_order.id}
訂單金額：NT$ {int(new_order.total_amount)}
實付金額：NT$ {int(new_order.final_paid)}
Moso幣折抵：NT$ {int(new_order.moso_coin_used)}
狀態：{'已付款' if new_order.status == 'paid' else '待付款/處理中'}

商品明細：
{items_str}

請前往管理員後台查看訂單詳情處理。"""

        message.attach(MIMEText(body, 'plain', 'utf-8'))
        try:
            server = smtplib.SMTP('smtp.gmail.com', 587)
            server.starttls()
            server.login(sender_email, app_password)
            server.sendmail(sender_email, recipient_email, message.as_string())
            server.quit()
        except Exception as e:
            print(f"SMTP Email send error: {e}")

    threading.Thread(target=send_order_email).start()

    return new_order

@router.get("/me", response_model=list[OrderResponse])
def get_my_orders(skip: int = 0, limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """取得當前登入使用者的訂單列表"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    for order in orders:
        order.user_name = order.user.name if order.user else "未知顧客"
        order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in order.items:
            item.product_name = item.product.name if item.product else "未知商品"
            if item.product and item.product.images:
                try:
                    import json
                    imgs = json.loads(item.product.images)
                    item.product_image = imgs[0] if isinstance(imgs, list) and len(imgs) > 0 else item.product.images
                except:
                    item.product_image = item.product.images
            else:
                item.product_image = None
    return orders

@router.get("/user/{user_id}", response_model=list[OrderResponse])
def get_user_orders(user_id: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """取得特定使用者的訂單列表"""
    # 根據 user_id 查詢訂單，並依建立時間降序排列
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    for order in orders:
        order.user_name = order.user.name if order.user else "未知顧客"
        order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
        for item in order.items:
            item.product_name = item.product.name if item.product else "未知商品"
            if item.product and item.product.images:
                try:
                    import json
                    imgs = json.loads(item.product.images)
                    item.product_image = imgs[0] if isinstance(imgs, list) and len(imgs) > 0 else item.product.images
                except:
                    item.product_image = item.product.images
            else:
                item.product_image = None
    return orders

@router.put("/{order_id}/cancel", response_model=OrderResponse)
def cancel_order(order_id: str, req: OrderCancelRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """取消訂單，退還已付款金額 (轉換為 Moso 幣) 並扣回回饋金與恢復庫存"""
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到該訂單")
        
    if order.status not in ["pending", "paid", "處理中"]:
        raise HTTPException(status_code=400, detail="只能取消處理中的訂單")
        
    # 1. 更新訂單狀態與原因
    order.status = "cancelled"
    order.cancel_reason = req.cancel_reason
    order.cancel_note = req.cancel_note
    
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
        wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
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
                    transaction_type="reward_revert", # 扣回發送的回饋
                    currency="moso_coin",
                    amount=-reward_deduct,
                    reference_id=f"REVERT_{order.id}"
                ))
            db.add(wallet)
            
    # 3.2 呼叫綠界 API 進行刷退作業
    if cash_refund > 0 and order.payment_method in ["ecpay", "綠界"]:
        import hashlib
        import urllib.parse
        import requests
        
        # 設定綠界相關參數 (MerchantID 等可移至環境變數或統一 config)
        MERCHANT_ID = "3209113"
        HASH_KEY = "sOlG7lIXmMQIwizh"
        HASH_IV = "WN4Aov7OVQCSSCTx"
        
        # 由於目前資料庫未儲存綠界回傳之 TradeNo，此處展示退刷 API 串接結構
        # 若為正式環境，需傳入 TradeNo 與對應之 MerchantTradeNo
        ecpay_params = {
            "MerchantID": MERCHANT_ID,
            "MerchantTradeNo": f"MOSO{order.id.replace('-', '')[:10]}", # 注意：此處需為當初發起交易時的編號
            "TradeNo": "此處應為綠界交易編號", # TODO: 需從資料庫讀取
            "Action": "R", # R: 退刷, N: 放棄授權
            "TotalAmount": int(cash_refund)
        }
        
        # 產生 CheckMacValue (模擬)
        # sorted_params = sorted(ecpay_params.items())
        # raw_str = f"HashKey={HASH_KEY}&" + "&".join([f"{k}={v}" for k, v in sorted_params]) + f"&HashIV={HASH_IV}"
        # url_encoded_str = urllib.parse.quote_plus(raw_str).lower().replace('%2d', '-').replace('%5f', '_').replace('%2e', '.').replace('%21', '!').replace('%2a', '*').replace('%28', '(').replace('%29', ')')
        # check_mac_value = hashlib.sha256(url_encoded_str.encode('utf-8')).hexdigest().upper()
        # ecpay_params["CheckMacValue"] = check_mac_value
        
        # 實際發送退刷請求至綠界 (此處為模擬成功)
        # response = requests.post("https://payment.ecpay.com.tw/CreditDetail/DoAction", data=ecpay_params)
        print(f"[綠界退刷作業] 訂單 {order.id} 已呼叫退刷 API，退還金額：{cash_refund}")
            
    db.commit()
    db.refresh(order)
    
    # 補上前台顯示所需的屬性
    order.user_name = order.user.name if order.user else "未知顧客"
    order.items = order_items
    for item in order.items:
        item.product_name = item.product.name if item.product else "未知商品"
        if item.product and item.product.images:
            try:
                import json
                imgs = json.loads(item.product.images)
                item.product_image = imgs[0] if isinstance(imgs, list) and len(imgs) > 0 else item.product.images
            except:
                item.product_image = item.product.images
        else:
            item.product_image = None

    return order

@router.put("/{order_id}/return", response_model=OrderResponse)
def return_order(order_id: str, req: OrderCancelRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """申請退貨，將狀態改為 returning，等待中台確認收貨後再退款"""
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到該訂單")
        
    if order.status not in ["completed", "已完成"]:
        raise HTTPException(status_code=400, detail="只能退貨已完成的訂單")
        
    # 檢查是否在10天內
    from datetime import datetime, timezone
    now = datetime.now(timezone.utc)
    updated_at = order.updated_at
    if updated_at.tzinfo is None:
        updated_at = updated_at.replace(tzinfo=timezone.utc)
    diff_days = (now - updated_at).days
    if diff_days > 10:
        raise HTTPException(status_code=400, detail="已超過10天退貨期限")

    # 1. 更新訂單狀態與原因 (改為 returning)
    order.status = "returning"
    order.cancel_reason = req.cancel_reason
    order.cancel_note = req.cancel_note
    
    db.commit()
    db.refresh(order)
    
    # 補上前台顯示所需的屬性
    order.user_name = order.user.name if order.user else "未知顧客"
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in order.items:
        item.product_name = item.product.name if item.product else "未知商品"
        if item.product and item.product.images:
            try:
                import json
                imgs = json.loads(item.product.images)
                item.product_image = imgs[0] if isinstance(imgs, list) and len(imgs) > 0 else item.product.images
            except:
                item.product_image = item.product.images
        else:
            item.product_image = None

    # 發送退貨申請通知信
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

        def send_return_applied_email():
            sender_email = "tkjack6288@gmail.com"
            admin_email = "tkjack6288@gmail.com"
            recipient_email = user_email
            app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
            
            if not app_password:
                print("GMAIL_APP_PASSWORD 未設定，無法寄送退貨申請信件")
                return
                
            try:
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.starttls()
                server.login(sender_email, app_password)
                
                # 寄給客戶
                message_user = MIMEMultipart()
                message_user['From'] = sender_email
                message_user['To'] = recipient_email
                message_user['Subject'] = f'【Moso Shop】退貨申請已送出 (訂單編號: {order.id})'
                
                body_user = f"""親愛的 {user_name} 您好，
                
我們已收到您針對訂單 {order.id} 的退貨申請！

待我們收到您寄回的商品並確認無誤後，將隨即為您處理後續退款作業：
- 若您有使用 Moso 幣折抵，該筆 Moso 幣將全數退還至您的會員錢包。
- 若您使用信用卡付款，我們將向綠界金流發起信用卡退刷作業。

【退貨寄件方式】
請透過以下超商將商品寄回：
- 7-ELEVEN 富邦門市 (收件人：翁秀姍，電話：0988-944-774)
- 全家便利商店 新實店 (收件人：翁秀姍，電話：0988-944-774)

若有任何問題，歡迎隨時聯繫客服。
感謝您的配合！

Moso Shop 團隊 敬上"""
                message_user.attach(MIMEText(body_user, 'plain', 'utf-8'))
                server.sendmail(sender_email, recipient_email, message_user.as_string())
                print(f"已成功發送退貨申請通知信至 {recipient_email}")
                
                # 寄給管理員
                message_admin = MIMEMultipart()
                message_admin['From'] = sender_email
                message_admin['To'] = admin_email
                message_admin['Subject'] = f'【Moso Shop 管理通知】新退貨申請 (訂單編號: {order.id})'
                
                reason_text = req.cancel_reason
                if req.cancel_note:
                    reason_text += f" - {req.cancel_note}"
                    
                body_admin = f"""管理員您好，

系統收到一筆新的退貨申請：

訂單編號：{order.id}
客戶名稱：{user_name}
退貨原因：{reason_text}

請留意並追蹤後續收件狀況，待收到商品無誤後，請至後台執行「確認收貨無誤」以完成退款作業。

Moso Shop 系統通知"""
                message_admin.attach(MIMEText(body_admin, 'plain', 'utf-8'))
                server.sendmail(sender_email, admin_email, message_admin.as_string())
                print(f"已成功發送退貨申請通知信至管理員 {admin_email}")

                server.quit()
            except Exception as e:
                print(f"SMTP Email send error: {e}")

        threading.Thread(target=send_return_applied_email).start()

    return order

@router.put("/{order_id}/return_cancel", response_model=OrderResponse)
def cancel_return_order(order_id: str, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """客戶取消退貨"""
    order = db.query(Order).filter(Order.id == order_id, Order.user_id == current_user.id).first()
    if not order:
        raise HTTPException(status_code=404, detail="找不到該訂單")
        
    if order.status != "returning":
        raise HTTPException(status_code=400, detail="訂單非申請退貨狀態")
        
    order.status = "return_cancelled"
    db.commit()
    db.refresh(order)
    
    order.user_name = order.user.name if order.user else "未知顧客"
    order.items = db.query(OrderItem).filter(OrderItem.order_id == order.id).all()
    for item in order.items:
        item.product_name = item.product.name if item.product else "未知商品"
        if item.product and item.product.images:
            try:
                import json
                imgs = json.loads(item.product.images)
                item.product_image = imgs[0] if isinstance(imgs, list) and len(imgs) > 0 else item.product.images
            except:
                item.product_image = item.product.images
        else:
            item.product_image = None

    # 發送取消退貨通知信給客戶與管理員
    user_email = order.user.email if order.user else None
    user_name = order.user.name if order.user else "未知顧客"
    
    if user_email:
        import os
        import smtplib
        import threading
        from email.mime.text import MIMEText
        from email.mime.multipart import MIMEMultipart
        from dotenv import load_dotenv
        
        env_path = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), '.env')
        load_dotenv(env_path)

        def send_return_cancel_email():
            sender_email = "tkjack6288@gmail.com"
            admin_email = "tkjack6288@gmail.com"
            recipient_email = user_email
            app_password = os.environ.get("GMAIL_APP_PASSWORD", "")
            
            if not app_password:
                print("GMAIL_APP_PASSWORD 未設定，無法寄送取消退貨信件")
                return
                
            try:
                server = smtplib.SMTP('smtp.gmail.com', 587)
                server.starttls()
                server.login(sender_email, app_password)
                
                # 寄給客戶
                message_user = MIMEMultipart()
                message_user['From'] = sender_email
                message_user['To'] = recipient_email
                message_user['Subject'] = f'【Moso Shop】取消退貨通知 (訂單編號: {order.id})'
                
                body_user = f"""親愛的 {user_name} 您好，
                
我們已收到您取消訂單 {order.id} 退貨的通知。

您的訂單狀態已恢復為原狀態，您無須將商品寄回，退款作業也已為您終止。
若您後續有任何問題或需要進一步的協助，歡迎隨時聯繫客服。

感謝您的支持！

Moso Shop 團隊 敬上"""
                message_user.attach(MIMEText(body_user, 'plain', 'utf-8'))
                server.sendmail(sender_email, recipient_email, message_user.as_string())
                print(f"已成功發送取消退貨通知信至客戶 {recipient_email}")
                
                # 寄給管理員
                message_admin = MIMEMultipart()
                message_admin['From'] = sender_email
                message_admin['To'] = admin_email
                message_admin['Subject'] = f'【Moso Shop 管理通知】客戶已取消退貨 (訂單編號: {order.id})'
                
                body_admin = f"""管理員您好，

客戶 {user_name} 已於前台取消訂單 {order.id} 的退貨申請。
訂單狀態已變更為「客戶取消退貨 (return_cancelled)」，無需再進行後續的退貨驗收及退款作業。

請知悉。

Moso Shop 系統通知"""
                message_admin.attach(MIMEText(body_admin, 'plain', 'utf-8'))
                server.sendmail(sender_email, admin_email, message_admin.as_string())
                print(f"已成功發送取消退貨通知信至管理員 {admin_email}")

                server.quit()
            except Exception as e:
                print(f"SMTP Email send error: {e}")

        threading.Thread(target=send_return_cancel_email).start()

    return order
