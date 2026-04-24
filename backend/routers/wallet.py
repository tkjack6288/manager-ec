from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.wallet import Wallet, WalletTransaction
from schemas.wallet import WalletResponse, WalletTransactionResponse
from core.dependencies import get_current_user
from pydantic import BaseModel
from datetime import datetime, timedelta, timezone

router = APIRouter(prefix="/wallets", tags=["數位錢包"])

class DepositRequest(BaseModel):
    amount: float

@router.get("/me", response_model=WalletResponse)
def get_my_wallet(current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """取得當前使用者的數位錢包餘額"""
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="找不到錢包資訊")
    return wallet

@router.post("/deposit", response_model=WalletResponse)
def deposit_cash(req: DepositRequest, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """儲值現金，若儲值滿 1000 元則免除年費升級 VIP"""
    if req.amount <= 0:
        raise HTTPException(status_code=400, detail="儲值金額必須大於 0")

    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if not wallet:
        raise HTTPException(status_code=404, detail="找不到錢包資訊")
    
    # 新增交易明細
    transaction = WalletTransaction(
        wallet_id=wallet.id,
        transaction_type="deposit",
        currency="cash",
        amount=req.amount,
        reference_id=f"DEP_{datetime.now().strftime('%Y%m%d%H%M%S')}"
    )
    db.add(transaction)

    # 增加現金餘額
    wallet.cash_balance = float(wallet.cash_balance) + req.amount

    # 若單筆儲值 >= 1000，取得 VIP 資格 (延長一年)
    if req.amount >= 1000:
        current_user.is_vip = True
        now = datetime.now(timezone.utc)
        if current_user.vip_expires_at and current_user.vip_expires_at > now:
            # 原本就在 VIP 效期內，延長一年
            current_user.vip_expires_at = current_user.vip_expires_at + timedelta(days=365)
        else:
            # 重新計算一年
            current_user.vip_expires_at = now + timedelta(days=365)
        db.add(current_user)

    db.add(wallet)
    db.commit()
    db.refresh(wallet)

    return wallet
