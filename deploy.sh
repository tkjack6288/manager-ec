#!/bin/bash
# 部署至 Google Cloud Platform - Cloud Run
# 專案 ID: antigravity-ecommerce

PROJECT_ID="antigravity-ecommerce"
REGION="asia-east1"
# DATABASE_URL="postgresql://user:password@host:5432/dbname"

echo "=== 準備部署 Mososhop 後端 API 至 Cloud Run ==="
gcloud config set project $PROJECT_ID

cd backend

echo "打包與推播 Docker 映像檔 (Backend)..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/mososhop-backend

echo "部署 Backend 至 Cloud Run..."
gcloud run deploy mososhop-backend \
  --image gcr.io/$PROJECT_ID/mososhop-backend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 8000 \
  --set-env-vars="DATABASE_URL=$DATABASE_URL"

echo "=== 準備部署 Mososhop 前端網站 (包含中台) 至 Cloud Run ==="
cd ../frontend

echo "打包與推播 Docker 映像檔 (Frontend)..."
gcloud builds submit --tag gcr.io/$PROJECT_ID/mososhop-frontend

echo "部署 Frontend 至 Cloud Run..."
gcloud run deploy mososhop-frontend \
  --image gcr.io/$PROJECT_ID/mososhop-frontend \
  --platform managed \
  --region $REGION \
  --allow-unauthenticated \
  --port 3000

echo "部署完成！🎊"
