# Mososhop (manager-ec) 專案說明文件

## 專案簡介
Mososhop (manager-ec) 是一個功能完善的現代化全端電商系統。本系統具備完整的會員機制、數位錢包（現金與 Moso 幣）、商品與庫存管理、訂單與金流串接、以及外部導購回饋系統。系統支援多種登入方式（包含 Google 與 Line），並內建後台管理功能。

## 系統架構與技術棧

### 後端 (Backend)
- **核心框架**: FastAPI (Python 3.12+)
- **資料庫**: PostgreSQL (透過 SQLAlchemy, psycopg2 進行 ORM 與連線操作)
- **依賴管理**: `uv` (依專案規範，統一使用 uv 進行管理與執行)
- **身份驗證**: JWT (`pyjwt`), `bcrypt`, `passlib`
- **雲端與外部服務**: Google Cloud Storage, Google GenAI, ECPay (綠界金流)
- **測試框架**: `pytest`, `pytest-asyncio`

### 前端 (Frontend)
- **核心框架**: Next.js 16 (React 19)
- **樣式與 UI**: Tailwind CSS 4, Framer Motion (動畫), Lucide React (圖示)
- **其他套件**: Axios (API 請求), React Quill New (富文本編輯器)

---

## 目錄結構與模組

- **`/backend`**: FastAPI 後端主程式目錄。包含 `main.py` 入口點、各 API 路由 (`routers/`)、資料庫模型 (`models/`)、以及資料驗證結構 (`schemas/`)。同時也包含多個輔助腳本（例如資料庫遷移、單元測試、假資料生成等）。
- **`/frontend`**: Next.js 前端主程式目錄。包含網站 UI、使用者中心、購物車及管理後台。
- **`/scraper`**: 爬蟲工具目錄，包含抓取外部平台（如 Shopee）評論或商品資料的 Python 腳本。
- **`/uploads`**: 本地開發時的靜態檔案與上傳檔案存放區。

---

## 核心功能 (Core Features)

1. **會員系統 (User & Auth)**
   - 支援 Email 本地註冊登入。
   - 整合第三方登入 (Google, Line)。
   - 提供 VIP 免年費會員機制及到期日管理。

2. **錢包與點數 (Wallet & Moso Coin)**
   - 每個會員擁有專屬數位錢包。
   - 支援「現金餘額」與「Moso 幣 (1 Moso = 1 TWD)」。
   - 詳細的交易異動明細紀錄 (deposit, spend, reward)。

3. **商品管理 (Products)**
   - 支援 SKU 庫存單位管理。
   - 支援多規格 (Variants) 與不同溫層設定 (常溫、冷藏、冷凍)。
   - 內建商品分類與狀態控制（上/下架）。

4. **訂單與支付 (Orders & Payment)**
   - 購物車與訂單建立。
   - 支援使用 Moso 幣折抵消費額。
   - 串接綠界科技 (ECPay) 處理線上付款，亦支援錢包餘額直接扣款。
   - 訂單完成後可發放 Moso 幣回饋（預設 10%）。

5. **外部導購 (External Affiliates)**
   - 追蹤使用者透過平台前往 PChome, Shopee 等外部電商的購買紀錄。
   - 依據交易金額與回饋比例 (1% ~ 25%) 審核並發放 Moso 幣。

6. **附加功能**
   - **客服與通訊**: 內建 Chat 聊天功能與 Newsletter 電子報訂閱。
   - **評價系統**: 商品 Reviews 系統（可由爬蟲輔助匯入）。
   - **AI 應用**: 透過 Google GenAI 自動生成圖片拼貼等。

---

## 開發與執行指南

> **⚠️ Python 開發規範**
> 請一律使用 `uv` 進行依賴管理與腳本執行。
> - 安裝套件：`uv add <package_name>`
> - 執行腳本：`uv run python <script_name>`

### 後端啟動
1. 進入後端目錄：`cd backend`
2. 複製環境變數設定檔：`cp .env.example .env` 並填寫相關連線資訊。
3. 啟動 FastAPI 伺服器：
   ```bash
   uv run uvicorn main:app --reload
   ```

### 前端啟動
1. 進入前端目錄：`cd frontend`
2. 安裝依賴：`npm install`
3. 啟動 Next.js 開發伺服器：
   ```bash
   npm run dev
   ```
   啟動後可於 `http://localhost:3000` 預覽前端畫面。

---

## 部署 (Deployment)
專案包含 Dockerfile 與部署腳本 (`deploy.sh`)，後端 API 支援容器化，可順利部署至 Google Cloud Run。前端同樣支援容器化或部署至 Vercel 等平台。
