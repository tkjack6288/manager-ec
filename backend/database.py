from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker, declarative_base
import os

# 預設使用 SQLite 作為本地開發測試，若環境變數有設定 DATABASE_URL 則使用對應資料庫（如 PostgreSQL）
# 已改為預設連向 GCP 的 Cloud SQL 資料庫
SQLALCHEMY_DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./test.db")

# 如果是 SQLite 需要加上 check_same_thread=False
connect_args = {"check_same_thread": False} if SQLALCHEMY_DATABASE_URL.startswith("sqlite") else {}

engine = create_engine(
    SQLALCHEMY_DATABASE_URL, connect_args=connect_args
)
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

Base = declarative_base()

# 取得資料庫 Session 的依賴函式
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
