import asyncio
import json
import sqlite3
import uuid
import datetime
from playwright.async_api import async_playwright

product_id = "c71e93b5-bd38-415d-a364-76dc8d0d974f"
shopee_url = "https://shopee.tw/%E3%80%90%E6%9D%B1%E9%96%80%E8%88%88%E8%A8%98%E3%80%91%E6%89%8B%E5%B7%A5%E8%B1%AC%E8%82%89%E6%B0%B4%E9%A4%83-(%E9%AB%98%E9%BA%97%E8%8F%9C-%E9%9F%AD%E8%8F%9C-%E7%99%BD%E9%9F%AD%E9%BB%83%E4%BB%BB%E9%81%B8-650g)(%E5%86%B7%E5%87%8D)-%E5%8F%AF7-11%E8%B6%85%E5%8F%96-i.1160255627.28527780044"
db_path = r"d:\jay\ai\antigravity\manager-ec\backend\mososhop.db"

reviews_data = []

async def handle_response(response):
    if "get_ratings" in response.url and response.status == 200:
        try:
            data = await response.json()
            if 'data' in data and 'ratings' in data['data']:
                ratings = data['data']['ratings']
                if ratings:
                    reviews_data.extend(ratings)
                    print(f"Intercepted {len(ratings)} reviews.")
        except Exception as e:
            pass

async def main():
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=False)
        context = await browser.new_context(
            user_agent="Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36"
        )
        page = await context.new_page()
        page.on("response", handle_response)
        
        print("Navigating to Shopee...")
        await page.goto(shopee_url, wait_until="domcontentloaded")
        
        print("Scrolling...")
        for i in range(15):
            await page.mouse.wheel(0, 1000)
            await page.wait_for_timeout(1000)
        
        await page.wait_for_timeout(3000)
        
        await browser.close()
        
        if reviews_data:
            print(f"Found {len(reviews_data)} reviews. Inserting into database...")
            conn = sqlite3.connect(db_path)
            c = conn.cursor()
            
            c.execute("SELECT id FROM users LIMIT 1")
            row = c.fetchone()
            if row:
                user_id = row[0]
            else:
                user_id = str(uuid.uuid4())
                c.execute("INSERT INTO users (id, email, name, auth_provider) VALUES (?, ?, ?, ?)", 
                          (user_id, "shopee_mock@example.com", "Shopee 用戶", "local"))
            
            count = 0
            # Keep track of unique comments to avoid duplicates from multiple API calls
            seen = set()
            for r in reviews_data:
                comment = r.get('comment', '')
                if comment and comment not in seen:
                    seen.add(comment)
                    author = r.get('author_username', 'Shopee 用戶')
                    full_comment = f"【轉載自 Shopee 用戶 {author}】\n{comment}"
                    rating = r.get('rating_star', 5)
                    
                    c.execute("INSERT INTO product_reviews (id, user_id, product_id, rating, comment, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)", (
                        str(uuid.uuid4()), user_id, product_id, rating, full_comment, "approved", datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S.%f")
                    ))
                    count += 1
            
            conn.commit()
            conn.close()
            print(f"Successfully inserted {count} reviews.")
        else:
            print("No reviews intercepted. Shopee might have blocked it or reviews are not loaded.")

if __name__ == "__main__":
    asyncio.run(main())
