# Mososhop 系統資料庫架構設計 (Schema Design)

這份文件為系統分析師 (System Analyst) 定義的 Mososhop 核心資料表 (Tables) 架構，預計實作於 PostgreSQL。

## 1. 核心實體 (Core Entities)

### `users` (會員資料表)
| 欄位名稱      | 型態           | 屬性                     | 說明                       |
|---------------|----------------|--------------------------|----------------------------|
| `id`          | UUID           | PRIMARY KEY              | 會員唯一識別碼             |
| `email`       | VARCHAR(255)   | UNIQUE, NOT NULL         | 登入 Email                 |
| `password`    | VARCHAR(255)   | NULLABLE                 | 雜湊密碼 (SSO登入可為 Null)|
| `auth_provider`| VARCHAR(50)   | NOT NULL                 | 登入提供者 (local, google, line) |
| `name`        | VARCHAR(100)   | NOT NULL                 | 姓名 / 暱稱                |
| `is_vip`      | BOOLEAN        | DEFAULT FALSE            | 是否免年費會員 (VIP)       |
| `vip_expires_at`| TIMESTAMP    | NULLABLE                 | VIP 到期時間               |
| `created_at`  | TIMESTAMP      | DEFAULT NOW()            | 建立時間                   |
| `updated_at`  | TIMESTAMP      | DEFAULT NOW()            | 更新時間                   |

### `wallets` (數位錢包與點數)
記錄使用者的現金與 moso 幣餘額。每個 user 有對應的 wallet。
| 欄位名稱      | 型態           | 屬性                     | 說明                       |
|---------------|----------------|--------------------------|----------------------------|
| `id`          | UUID           | PRIMARY KEY              | 錢包 ID                    |
| `user_id`     | UUID           | FOREIGN KEY, UNIQUE      | 關聯會員 ID                |
| `cash_balance`| DECIMAL(12, 2) | DEFAULT 0.00             | 現金餘額                   |
| `moso_coin`   | DECIMAL(12, 2) | DEFAULT 0.00             | Moso 幣餘額 (1 moso = 1元) |
| `updated_at`  | TIMESTAMP      | DEFAULT NOW()            | 最後更新餘額時間           |

### `wallet_transactions` (錢包異動明細)
| 欄位名稱      | 型態           | 屬性                     | 說明                       |
|---------------|----------------|--------------------------|----------------------------|
| `id`          | UUID           | PRIMARY KEY              | 異動明細 ID                |
| `wallet_id`   | UUID           | FOREIGN KEY              | 關聯錢包 ID                |
| `type`        | VARCHAR(50)    | NOT NULL                 | 類型 (deposit, spend, reward) |
| `currency`    | VARCHAR(20)    | NOT NULL                 | 幣別 (cash, moso_coin)     |
| `amount`      | DECIMAL(12, 2) | NOT NULL                 | 異動金額 (+ 或 -)          |
| `reference_id`| VARCHAR(255)   | NULLABLE                 | 關聯訂單或儲值單號         |
| `created_at`  | TIMESTAMP      | DEFAULT NOW()            | 發生時間                   |

### `products` (商品資料表)
| 欄位名稱      | 型態           | 屬性                     | 說明                       |
|---------------|----------------|--------------------------|----------------------------|
| `id`          | UUID           | PRIMARY KEY              | 商品 ID                    |
| `sku`         | VARCHAR(100)   | UNIQUE, NOT NULL         | 庫存單位編號               |
| `name`        | VARCHAR(255)   | NOT NULL                 | 商品名稱                   |
| `description` | TEXT           |                          | 說明敘述                   |
| `price`       | DECIMAL(12, 2) | NOT NULL                 | 售價                       |
| `stock`       | INTEGER        | DEFAULT 0                | 庫存數量                   |
| `category`    | VARCHAR(100)   | NOT NULL                 | 分類                       |
| `is_active`   | BOOLEAN        | DEFAULT TRUE             | 是否上架                   |
| `created_at`  | TIMESTAMP      | DEFAULT NOW()            | 建立時間                   |
| `updated_at`  | TIMESTAMP      | DEFAULT NOW()            | 更新時間                   |

### `orders` (訂單資料表)
| 欄位名稱          | 型態           | 屬性                     | 說明                       |
|-------------------|----------------|--------------------------|----------------------------|
| `id`              | UUID           | PRIMARY KEY              | 訂單 ID                    |
| `user_id`         | UUID           | FOREIGN KEY              | 會員 ID                    |
| `total_amount`    | DECIMAL(12, 2) | NOT NULL                 | 總金額                     |
| `moso_coin_used`  | DECIMAL(12, 2) | DEFAULT 0.00             | 使用 Moso 幣折抵金額       |
| `final_paid`      | DECIMAL(12, 2) | NOT NULL                 | 實際支付金額               |
| `reward_moso_coin`| DECIMAL(12, 2) | DEFAULT 0.00             | 預計回饋 Moso 幣 (預設 10%)|
| `status`          | VARCHAR(50)    | NOT NULL                 | 狀態 (pending, paid, completed, cancelled) |
| `payment_method`  | VARCHAR(50)    | NOT NULL                 | 支付方式 (ecpay, wallet)   |
| `created_at`      | TIMESTAMP      | DEFAULT NOW()            | 建立時間                   |
| `updated_at`      | TIMESTAMP      | DEFAULT NOW()            | 更新時間                   |

### `order_items` (訂單明細)
| 欄位名稱      | 型態           | 屬性                     | 說明                       |
|---------------|----------------|--------------------------|----------------------------|
| `id`          | UUID           | PRIMARY KEY              | 明細 ID                    |
| `order_id`    | UUID           | FOREIGN KEY              | 訂單 ID                    |
| `product_id`  | UUID           | FOREIGN KEY              | 商品 ID                    |
| `quantity`    | INTEGER        | NOT NULL                 | 數量                       |
| `unit_price`  | DECIMAL(12, 2) | NOT NULL                 | 購買時單價                 |
| `subtotal`    | DECIMAL(12, 2) | NOT NULL                 | 小計                       |

### `external_affiliates` (外部導購明細)
處理前往外部平台購買的回饋紀錄。
| 欄位名稱      | 型態           | 屬性                     | 說明                       |
|---------------|----------------|--------------------------|----------------------------|
| `id`          | UUID           | PRIMARY KEY              | 導購紀錄 ID                |
| `user_id`     | UUID           | FOREIGN KEY              | 會員 ID                    |
| `platform_name`| VARCHAR(100)  | NOT NULL                 | 外部平台名稱 (如 PChome, Shopee) |
| `transaction_id`| VARCHAR(255)| UNIQUE                   | 外部交易序號               |
| `transaction_amount`| DECIMAL(12, 2) | NOT NULL         | 外部交易總額               |
| `reward_percentage` | DECIMAL(5, 2) | NOT NULL          | 回饋比例 (1% ~ 25%)        |
| `reward_moso_coin`  | DECIMAL(12, 2)| NOT NULL          | 實際獲得回饋金             |
| `status`      | VARCHAR(50)    | NOT NULL                 | 狀態 (pending_review, approved, rejected) |
| `created_at`  | TIMESTAMP      | DEFAULT NOW()            | 發生時間                   |
