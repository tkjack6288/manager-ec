import os
import json
from google.cloud import firestore
from sqlalchemy import create_engine, inspect
from sqlalchemy.orm import sessionmaker
import sys
import uuid

# 將專案目錄加入 sys.path
# 將專案目錄加入 sys.path
sys.path.append(os.path.join(os.path.dirname(__file__), 'backend'))
# 我們不直接 import models，改用純 SQLAlchemy engine 以避免 meta data 衝突
from database import SQLALCHEMY_DATABASE_URL

# 設定 service account
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = os.path.join(os.path.dirname(__file__), 'service-account.json')

def migrate_data():
    # 建立 Firestore 連線 (讀取 mosodb 資料庫)
    print("Connecting to Firestore...")
    # 若有指定 database='mosodb'，請加上 database 參數 (python-firestore 目前可能只有 default database 支援度較好)
    # 根據 GCP 規定，若 Firestore Database Name 為 default，可以不加；若是其他名字則需要給
    try:
        db = firestore.Client(database="mosodb")
        products_ref = db.collection('product_info')
        docs = products_ref.stream()
    except Exception as e:
        print(f"Failed to connect to mosodb, trying default db: {e}")
        db = firestore.Client()
        products_ref = db.collection('product_info')
        docs = products_ref.stream()

    firestore_products = []
    firestore_fields = set()
    
    for doc in docs:
        data = doc.to_dict()
        data['id'] = doc.id
        firestore_products.append(data)
        for key in data.keys():
            firestore_fields.add(key)
            
    print(f"Found {len(firestore_products)} products in Firestore.")
    print(f"Firestore fields: {firestore_fields}")

    # 連接 PostgreSQL
    print(f"Connecting to PostgreSQL: {SQLALCHEMY_DATABASE_URL}")
    engine = create_engine(SQLALCHEMY_DATABASE_URL)
    
    # 取得目前的 products 表結構
    inspector = inspect(engine)
    if 'products' not in inspector.get_table_names():
        print("Table 'products' does not exist in PostgreSQL. Please run init_db.py first.")
        return
        
    pg_columns = [col['name'] for col in inspector.get_columns('products')]
    print(f"PostgreSQL columns: {pg_columns}")
    
    # 比對欄位並自動新增
    missing_columns = firestore_fields - set(pg_columns) - {'id'} # id 不視為 missing，因為 products 表本身有 id 或其他主鍵
    if missing_columns:
        print(f"Missing columns in PostgreSQL: {missing_columns}")
        with engine.begin() as conn:
            for col in missing_columns:
                print(f"Adding column '{col}' to products table...")
                # 這裡一律用 TEXT，因為從 NoSQL 來最安全，若有其他需求後續再改型別
                conn.exec_driver_sql(f"ALTER TABLE products ADD COLUMN \"{col}\" TEXT")
        print("Columns added successfully.")
    
    # 開始寫入資料
    Session = sessionmaker(bind=engine)
    session = Session()
    
    print("Migrating data...")
    count = 0
    for f_prod in firestore_products:
        # 尋找是否已存在
        # 使用 Firestore 的 id 或是名稱來判斷，若無則新增
        name = f_prod.get('name') or f_prod.get('title') or "Untitled"
        
        # 準備 mapping，盡量對齊 SQLAlchemy Model
        pg_product = {}
        # 生成 postgres 用的 id (以 uuid 為主，符合一般 schema 設計)
        pg_product['id'] = str(uuid.uuid4())

        for key, value in f_prod.items():
            if key == 'id':
                continue # 不要覆蓋我們 postgres 的 id (通常是 uuid 或 int)
            
            # 處理可能為 dict/list 的資料
            if isinstance(value, (dict, list)):
                pg_product[key] = json.dumps(value)
            else:
                pg_product[key] = str(value) if value is not None else None
                
        # 補充必要欄位 (假設 name, price, sku 是必填)
        if 'name' not in pg_product or pg_product['name'] is None:
            pg_product['name'] = name
        if 'price' not in pg_product or pg_product['price'] is None:
            pg_product['price'] = 0.0
        if 'sku' not in pg_product or pg_product['sku'] is None:
            pg_product['sku'] = str(uuid.uuid4())[:8] # 隨機產生一組 sku
        if 'category' not in pg_product or pg_product['category'] is None:
            pg_product['category'] = 'Uncategorized'
            
        # 建立物件並存入
        try:
            # 這裡透過 SQL 直接 insert 較彈性，避免 ORM model 尚未更新導致無法 mapped
            # 但若用 SQLAlchemy Core 會更安全
            columns = ", ".join([f"\"{k}\"" for k in pg_product.keys()])
            values_placeholders = ", ".join([f":{k}" for k in pg_product.keys()])
            
            # 若有自訂 id
            # ...
            
            from sqlalchemy import text
            insert_stmt = f"INSERT INTO products ({columns}) VALUES ({values_placeholders})"
            session.execute(text(insert_stmt), pg_product)
            count += 1
        except Exception as e:
            print(f"Failed to insert product {name}: {e}")
            session.rollback()
            continue
            
    session.commit()
    print(f"Successfully migrated {count} products!")
    
if __name__ == "__main__":
    migrate_data()
