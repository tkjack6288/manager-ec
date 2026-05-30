from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
import jwt
from sqlalchemy.orm import Session
from database import get_db
from models.user import User
from core.security import SECRET_KEY, ALGORITHM

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="users/login")
oauth2_scheme_optional = OAuth2PasswordBearer(tokenUrl="users/login", auto_error=False)
def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)):
    """依賴函式：從 JWT Token 中取得當前登入使用者"""
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="無法驗證憑證",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            raise credentials_exception
    except jwt.PyJWTError:
        raise credentials_exception
    
    user = db.query(User).filter(User.id == user_id).first()
    if user is None:
        raise credentials_exception
    return user

def get_optional_current_user(token: str = Depends(oauth2_scheme_optional), db: Session = Depends(get_db)):
    """非強制的依賴函式：如果有 Token 則嘗試解析使用者，沒有或錯誤則回傳 None"""
    if not token:
        return None
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id: str = payload.get("sub")
        if user_id is None:
            return None
        user = db.query(User).filter(User.id == user_id).first()
        return user
    except jwt.PyJWTError:
        return None
