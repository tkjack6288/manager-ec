from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.wallet import Wallet, WalletTransaction
from models.order import Order, OrderItem
from models.product import Product
from schemas.order import OrderCreate, OrderResponse
from core.dependencies import get_current_user

router = APIRouter(prefix="/orders", tags=["訂單與結帳"])

@router.post("/", response_model=OrderResponse)
def create_order(req: OrderCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """建立訂單、處理庫存並計算 Moso 幣折抵與回饋 (10%)"""
    if not req.items:
        raise HTTPException(status_code=400, detail="購物車不能為空")
    
    total_amount = 0.0
    order_items_db = []
    
    # 1. 計算總金額並扣庫存 (簡化版：先檢查後再扣)
    for item in req.items:
        prod = db.query(Product).filter(Product.id == item.product_id).first()
        if not prod or not prod.is_active:
            raise HTTPException(status_code=404, detail=f"商品不存在或已下架: {item.product_id}")
        current_stock = prod.stock or 0
        if current_stock < item.quantity:
            raise HTTPException(status_code=400, detail=f"庫存不足: {prod.name}")
        
        subtotal = float(prod.price) * item.quantity
        total_amount += subtotal
        
        o_item = OrderItem(
            product_id=prod.id,
            quantity=item.quantity,
            unit_price=prod.price,
            subtotal=subtotal
        )
        order_items_db.append(o_item)
        
        # 扣除庫存
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
    new_order = Order(
        user_id=current_user.id,
        total_amount=total_amount,
        moso_coin_used=moso_coin_used,
        final_paid=final_paid,
        reward_moso_coin=reward_moso_coin,
        status="completed" if final_paid == 0 else "pending", # 若全額扣抵直接完成
        payment_method="wallet" if final_paid == 0 else "ecpay"
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

    return new_order

@router.get("/me", response_model=list[OrderResponse])
def get_my_orders(skip: int = 0, limit: int = 50, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """取得當前登入使用者的訂單列表"""
    orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders

@router.get("/user/{user_id}", response_model=list[OrderResponse])
def get_user_orders(user_id: str, skip: int = 0, limit: int = 50, db: Session = Depends(get_db)):
    """取得特定使用者的訂單列表"""
    # 根據 user_id 查詢訂單，並依建立時間降序排列
    orders = db.query(Order).filter(Order.user_id == user_id).order_by(Order.created_at.desc()).offset(skip).limit(limit).all()
    return orders
