from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from models.wallet import Wallet, WalletTransaction
from models.external_affiliate import ExternalAffiliate
from schemas.external_affiliate import ExternalAffiliateCreate, ExternalAffiliateResponse
from core.dependencies import get_current_user

router = APIRouter(prefix="/affiliates", tags=["外部導購回饋"])

@router.post("/", response_model=ExternalAffiliateResponse)
def create_affiliate_transaction(req: ExternalAffiliateCreate, current_user: User = Depends(get_current_user), db: Session = Depends(get_db)):
    """登記外部平台導購並獲得 1~25% 回饋金"""
    if req.reward_percentage < 1 or req.reward_percentage > 25:
        raise HTTPException(status_code=400, detail="回饋比例必須在 1% 到 25% 之間")
    
    # 檢查是否重複單號
    existing = db.query(ExternalAffiliate).filter(ExternalAffiliate.transaction_id == req.transaction_id).first()
    if existing:
        raise HTTPException(status_code=400, detail="該交易序號已登記過")
    
    # 計算回饋金額
    reward_amount = req.transaction_amount * (req.reward_percentage / 100.0)
    
    new_record = ExternalAffiliate(
        user_id=current_user.id,
        platform_name=req.platform_name,
        transaction_id=req.transaction_id,
        transaction_amount=req.transaction_amount,
        reward_percentage=req.reward_percentage,
        reward_moso_coin=reward_amount,
        status="approved" # 假設系統信任前端直接 approve
    )
    db.add(new_record)
    
    # 直接匯入錢包
    wallet = db.query(Wallet).filter(Wallet.user_id == current_user.id).first()
    if wallet:
        wallet.moso_coin = float(wallet.moso_coin) + reward_amount
        db.add(WalletTransaction(
            wallet_id=wallet.id,
            transaction_type="reward",
            currency="moso_coin",
            amount=reward_amount,
            reference_id=f"AFF_{req.transaction_id}"
        ))
        db.add(wallet)
        
    db.commit()
    db.refresh(new_record)
    
    return new_record
