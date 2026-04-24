import os
import random
import requests
import json
from io import BytesIO
from PIL import Image
from google.cloud import storage
from database import engine
from sqlalchemy import text

# 環境變數設定
os.environ["GOOGLE_APPLICATION_CREDENTIALS"] = "../service-account.json"
BUCKET_NAME = "antigravity-ecommerce_cloudbuild"
PROJECT_ID = "antigravity-ecommerce"
LOCATION = "us-central1" # Vertex AI 常用區域，您可以修改為 asia-east1 如果有啟用

import vertexai
from vertexai.preview.vision_models import ImageGenerationModel

# 初始化 Vertex AI
vertexai.init(project=PROJECT_ID, location=LOCATION)

from vertexai.preview.vision_models import Image as VertexImage
from vertexai.preview.vision_models import ImageGenerationModel

def generate_ai_image(product_name, base_image_url):
    print(f"正在透過 Vertex AI 為 {product_name} 進行圖片編輯/延伸以產生不同角度...")
    
    # 下載原圖
    try:
        response = requests.get(base_image_url)
        response.raise_for_status()
        base_img_bytes = response.content
        # 轉換為 Vertex AI 支援的 Image 物件
        base_image = vertexai.preview.vision_models.Image(base_img_bytes)
        print("成功下載原圖並載入")
    except Exception as e:
        print(f"下載原圖失敗: {e}")
        return []

    # 使用 Vertex AI Imagen 3 模型
    # 若要保留原商品，我們可以使用 Image Edit 或 Image Inpainting (以原圖為基底)
    # 由於 imagegeneration@006 已被標為 EOL，我們改用最新的 imagen-3.0-generate-001 (若是生圖)
    # 編輯模型請使用 imagen-3.0-capability-001 或 imagen-2.0-edit
    try:
        model = ImageGenerationModel.from_pretrained("imagen-3.0-capability-001")
    except:
        model = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
    
    # 建立 prompt，我們只產生一張圖供您測試確認
    # prompt: 要求將這件商品放置在有質感的木桌上，改變光線或周圍環境(創造出情境感與不同視角)，但保持商品原本的文字與包裝樣貌
    prompt = "Place this exact product on a modern wooden table with soft morning sunlight, viewed from a slight top-down angle. Keep the product's original text, labels, and exact appearance unchanged, only generate a realistic new environment around it."
    
    generated_images = []
    
    try:
        print("開始以原圖為基底產生新情境圖 (1張)...")
        
        try:
            # 嘗試使用無 mask 編輯 (若支援)
            # 在某些 SDK 版本中，可以使用 edit_image 加上 edit_mode (例如 edit_mode="inpainting-insert") 或 context_image
            # 這裡我們換個方式，使用舊的 API / edit_mode 或產生時參考原圖
            
            # 使用 ImageGenerationModel 的 edit_image 並且設定 mask 留白 (自動去背與合成需要額外處理)
            # 這裡我們直接使用 "Product Image" 的最佳實踐: edit_image_with_prompt 或傳遞 context_image
            response = model.edit_image(
                base_image=base_image,
                prompt=prompt,
                number_of_images=1
            )
            
            if response and response.images and len(response.images) > 0:
                gen_img = response.images[0]
                img = Image.open(BytesIO(gen_img._image_bytes))
                generated_images.append(img)
                print("產生成功")
            else:
                print("產生失敗或被過濾")
        except Exception as inner_e:
            print(f"無 Mask 編輯失敗，嘗試直接使用 generate_images: {inner_e}")
            # 如果編輯失敗，我們嘗試退回生圖模型
            model_gen = ImageGenerationModel.from_pretrained("imagen-3.0-generate-001")
            response = model_gen.generate_images(
                prompt=f"A photorealistic product photography of {product_name}. The product looks EXACTLY like the original packaging. It is placed on a modern wooden table with soft morning sunlight, viewed from a slight top-down angle. Keep the product's original text, labels, and exact appearance unchanged, only generate a realistic new environment around it.",
                number_of_images=1,
                aspect_ratio="1:1"
            )
            
            if response and response.images and len(response.images) > 0:
                gen_img = response.images[0]
                img = Image.open(BytesIO(gen_img._image_bytes))
                generated_images.append(img)
                print("備用方案產生成功")
            else:
                print("備用方案產生失敗或被過濾")
            
    except Exception as e:
        print(f"呼叫 Imagen 失敗: {e}")
        
            
    return generated_images

from PIL import ImageDraw, ImageFilter

def create_collage(images, max_height=800):
    # 改為左右擺放
    # 並將所有圖片縮放到相同高度
    
    scaled_images = []
    for img in images:
        ratio = max_height / img.height
        new_width = int(img.width * ratio)
        scaled_img = img.resize((new_width, max_height), Image.Resampling.LANCZOS)
        scaled_images.append(scaled_img)
        
    total_width = sum(img.width for img in scaled_images)
    
    # 加入商品相關元素以提升質感：例如加上柔和的背景陰影和圓角邊框，或是加上文字等
    # 這裡我們加上一個帶有質感的背景板
    padding = 40
    bg_width = total_width + padding * (len(images) + 1)
    bg_height = max_height + padding * 2
    
    collage = Image.new('RGB', (bg_width, bg_height), '#f8f9fa') # 淺灰白背景
    
    # 在背景上畫點綴裝飾 (例如細框線或角落元素)
    draw = ImageDraw.Draw(collage)
    draw.rectangle([10, 10, bg_width-10, bg_height-10], outline='#e9ecef', width=2)
    
    x_offset = padding
    for img in scaled_images:
        # 添加圖片，若要更進階可以將圖片做圓角，這裡先直接貼上
        collage.paste(img, (x_offset, padding))
        x_offset += img.width + padding
        
    return collage

def upload_to_gcp(image_bytes, destination_blob_name):
    storage_client = storage.Client()
    bucket = storage_client.bucket(BUCKET_NAME)
    blob = bucket.blob(destination_blob_name)
    blob.upload_from_string(image_bytes, content_type='image/jpeg')
    return f"https://storage.googleapis.com/{BUCKET_NAME}/{destination_blob_name}"

def process_product(product_id):
    print(f"處理商品 ID: {product_id}")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT images, name FROM products WHERE id = :id"), {"id": product_id}).mappings().first()
        if not result:
            print("找不到商品")
            return
            
        product_name = result["name"]
        images_urls = json.loads(result["images"] or "[]")
        
        # 使用第一張圖片做為原圖基底
        base_image_url = images_urls[0]
        # 呼叫 Vertex AI 產生不同角度的圖片
        ai_images = generate_ai_image(product_name, base_image_url)
        
        if len(ai_images) == 0:
            print("無法產生任何 AI 圖片，流程中斷")
            return
            
        print(f"成功產生 {len(ai_images)} 張 AI 圖片")
        
        new_urls = []
        
        # 將這些 AI 產生的圖片分別產生為 collage 或者直接存檔上傳
        # 根據您的需求，我們將這 3 張不同角度的圖合併為一張超大展示圖，或是分別傳上去
        # 因為只要一張圖，且現在產出的是單張 AI 生成圖
        # 我們直接把這張生成的圖片上傳，不進行拼貼
        for i, ai_img in enumerate(ai_images):
            # 轉為 bytes
            img_byte_arr = BytesIO()
            ai_img.save(img_byte_arr, format='JPEG', quality=95)
            img_byte_arr = img_byte_arr.getvalue()
            
            file_name = f"products/{product_id}/ai_generated_{i}.jpg"
            print(f"上傳 {file_name} 到 GCP...")
            new_url = upload_to_gcp(img_byte_arr, file_name)
            new_urls.append(new_url)
            print(f"新圖片 URL: {new_url}")
            
        # 更新資料庫
        if new_urls:
            # 我們將原本的圖片保留，把 ai_collage 加到最後面，並過濾掉之前的 collage_v2
            filtered_urls = [u for u in images_urls if "collage_" not in u]
            updated_urls = filtered_urls + new_urls
            conn.execute(
                text("UPDATE products SET images = :images WHERE id = :id"),
                {"images": json.dumps(updated_urls), "id": product_id}
            )
            conn.commit()
            print("資料庫更新成功！")

if __name__ == "__main__":
    # 找另一個商品來測試 AI 生圖功能
    with engine.connect() as conn:
        result = conn.execute(text("SELECT id FROM products WHERE images != '[]' AND images NOT LIKE '%ai_collage%' LIMIT 1 OFFSET 2")).scalar()
        if not result:
            result = conn.execute(text("SELECT id FROM products WHERE images != '[]' AND images NOT LIKE '%ai_collage%' LIMIT 1")).scalar()
            
        if result:
            process_product(result)
        else:
            print("沒有找到需要處理的商品")
