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

def download_image(url):
    response = requests.get(url)
    response.raise_for_status()
    return Image.open(BytesIO(response.content))

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
    # 使其公開 (如果需要的話)
    # blob.make_public()
    return f"https://storage.googleapis.com/{BUCKET_NAME}/{destination_blob_name}"

def process_product(product_id):
    print(f"處理商品 ID: {product_id}")
    with engine.connect() as conn:
        result = conn.execute(text("SELECT images FROM products WHERE id = :id"), {"id": product_id}).scalar()
        if not result:
            print("找不到商品或商品沒有圖片")
            return
            
        images_urls = json.loads(result)
        if len(images_urls) < 2:
            print("商品圖片不足兩張，無法合併")
            return
            
        print(f"找到 {len(images_urls)} 張圖片")
        
        # 計算兩張圖片相似度 (這裡使用簡單的 perceptual hash 概念)
        def image_similarity(img1, img2):
            # 將圖片轉為灰階並縮小至相同的尺寸(8x8)，然後比對像素值
            i1 = img1.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
            i2 = img2.convert('L').resize((8, 8), Image.Resampling.LANCZOS)
            
            pixels1 = list(i1.get_flattened_data())
            pixels2 = list(i2.get_flattened_data())
            
            diff = 0
            for p1, p2 in zip(pixels1, pixels2):
                if abs(p1 - p2) > 10: # 容許一些細微誤差
                    diff += 1
            
            # 最大差異像素數為 64
            similarity = 1.0 - (diff / 64.0)
            return similarity * 100

        # 下載所有圖片並去除過於相似的圖片
        downloaded_images = []
        
        for url in images_urls:
            try:
                # 若是過去產生的 collage，略過不參與產生
                if "collage_" in url:
                    continue
                    
                response_content = requests.get(url).content
                img = Image.open(BytesIO(response_content))
                if img.mode != 'RGB':
                    img = img.convert('RGB')
                
                # 檢查與已下載圖片的相似度
                is_duplicate = False
                for existing_img in downloaded_images:
                    sim = image_similarity(img, existing_img)
                    if sim > 80: # 相似度大於 80% 則視為重複
                        print(f"略過高度相似的圖片 ({sim:.1f}%): {url}")
                        is_duplicate = True
                        break
                
                if not is_duplicate:
                    downloaded_images.append(img)
            except Exception as e:
                print(f"無法下載或處理圖片 {url}: {e}")
                
        if len(downloaded_images) < 2:
            print(f"去除高度相似圖片後，圖片不足兩張 ({len(downloaded_images)}張)，不需合併")
            return
            
        new_urls = []
        for i in range(3):
            # 隨機選擇 2 到全部圖片來組合
            num_to_combine = random.randint(2, len(downloaded_images))
            selected_images = random.sample(list(downloaded_images), num_to_combine)
            
            collage = create_collage(selected_images)
            
            # 轉為 bytes
            img_byte_arr = BytesIO()
            collage.save(img_byte_arr, format='JPEG', quality=95)
            img_byte_arr = img_byte_arr.getvalue()
            
            file_name = f"products/{product_id}/collage_v2_{i}.jpg"
            print(f"上傳 {file_name} 到 GCP...")
            new_url = upload_to_gcp(img_byte_arr, file_name)
            new_urls.append(new_url)
            print(f"新圖片 URL: {new_url}")
            
        # 更新資料庫
        if new_urls:
            # 將之前產生的 collage_0.jpg 移除避免重複，或是直接附加
            filtered_urls = [u for u in images_urls if "collage_" not in u]
            updated_urls = filtered_urls + new_urls
            conn.execute(
                text("UPDATE products SET images = :images WHERE id = :id"),
                {"images": json.dumps(updated_urls), "id": product_id}
            )
            conn.commit()
            print("資料庫更新成功！")

if __name__ == "__main__":
    # 測試另一個商品，跳過前幾個
    with engine.connect() as conn:
        # 為了找一筆新的，我們加大 OFFSET
        result = conn.execute(text("SELECT id FROM products WHERE images != '[]' AND images NOT LIKE '%collage_v2%' LIMIT 1 OFFSET 5")).scalar()
        if not result:
            # 退而求其次
            result = conn.execute(text("SELECT id FROM products WHERE images != '[]' AND images NOT LIKE '%collage_v2%' LIMIT 1 OFFSET 2")).scalar()
            
        if result:
            process_product(result)
        else:
            print("沒有找到需要處理的商品圖片")
