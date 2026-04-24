from database import engine, Base
# 匯入所有模型，確保 Base.metadata.create_all() 能抓到
from models import user, wallet

# 在本地端開發使用 SQLite 時，自動建立所有資料表
Base.metadata.create_all(bind=engine)
