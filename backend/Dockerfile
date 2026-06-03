FROM python:3.11-slim

WORKDIR /app

# 安裝 uv
RUN pip install uv

# 複製依賴配置
COPY pyproject.toml uv.lock ./

# 匯出 requirements.txt 並安裝
RUN uv pip compile pyproject.toml -o requirements.txt && uv pip install --system -r requirements.txt

# 複製其餘專案檔案
COPY . .

# 曝露 Cloud Run 預設的 8080 port
EXPOSE 8080

# 啟動 FastAPI 服務
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8080"]
