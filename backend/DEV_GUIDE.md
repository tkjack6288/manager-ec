# 專案後端開發規範

1. **框架與語言**：使用 Python 3 + FastAPI。
2. **依賴管理**：所有套件透過 `uv` 安裝。
3. **資料庫 ORM**：採用 SQLAlchemy 2.0，所有資料表必須設定 Schema 並定義關聯 (Relationships)。
4. **非同步 (Async)**：盡量使用非同步函式來提升並行處理能力，但考量到目前安裝的 psycopg2 是同步 driver，此專案初版可先以同步 ORM 實作，或後續換成 asyncpg。這裡先以標準同步 SQLAlchemy 作為起點。
5. **架構分層**：
   - `models/`: SQLAlchemy 實體定義。
   - `schemas/`: Pydantic 驗證模型 (Request/Response)。
   - `routers/`: API 路由與端點。
   - `services/`: 核心商業邏輯 (如回饋計算、扣抵邏輯)。
   - `core/`: 配置與環境變數 (config)、安全認證 (security)。
   - `database.py`: DB 連線與 Session 管理。
6. **語系限制**：程式碼中所有註解都必須為 **繁體中文**。
