from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
from database import get_db
from models.user import User
from models.order import Order, OrderItem
from models.product import Product
from core.dependencies import get_optional_current_user

try:
    from google import genai
    from google.genai import types
except ImportError:
    genai = None

router = APIRouter(prefix="/chat", tags=["客服中心"])

class ChatMessage(BaseModel):
    role: str # "user" or "model"
    content: str

class ChatRequest(BaseModel):
    messages: list[ChatMessage]

@router.post("")
def chat_with_bot(req: ChatRequest, current_user: User | None = Depends(get_optional_current_user), db: Session = Depends(get_db)):
    api_key = os.environ.get("GEMINI_API_KEY")
    if not api_key:
        return {"reply": "抱歉，系統尚未設定 AI 金鑰，暫時無法提供智能客服服務。請稍後再試。"}
        
    if genai is None:
        return {"reply": "伺服器尚未安裝 AI 模組，請聯繫管理員。"}

    try:
        client = genai.Client(api_key=api_key)
        
        # 建立基礎 System Instruction
        system_instruction = (
            "你是一位親切、專業的一對一私人購物顧問，負責在 Moso Shop 電商平台為顧客提供專屬的購物建議。請一律使用繁體中文（zh-TW）回覆。\n"
            "你的任務是：\n"
            "1. 主動並有禮貌地詢問顧客的需求（例如：送禮或自用、預算範圍、偏好風格等）。\n"
            "2. 記下顧客在對話中透露的資訊，並根據這些線索，從【站內商品型錄】挑選最合適的商品推薦給他們。\n"
            "3. 每次推薦商品時，必須使用 Markdown 連結格式：`[商品名稱](/product/商品ID)`，讓顧客可以直接點擊查看詳情。例如：推薦您這款 [商品名稱](/product/123-456-789)。\n"
            "4. 回答必須保持顧問的專業與親切感，絕不要像死板的機器人。"
        )
        
        # 載入站內有效商品列表
        products = db.query(Product).filter(Product.is_active == True, Product.is_sellable == True).all()
        if products:
            product_catalog = "\n\n【站內商品型錄】（請優先從以下清單為顧客挑選推薦）：\n"
            for p in products:
                desc_snippet = p.description[:60] + "..." if p.description and len(p.description) > 60 else (p.description or "無描述")
                # 濾除 HTML 標籤
                import re
                desc_snippet = re.sub(r'<[^>]+>', '', desc_snippet)
                product_catalog += f"- [{p.name}](/product/{p.id}) | 價格: NT${int(p.selling_price)} | 簡介: {desc_snippet}\n"
            system_instruction += product_catalog
        
        # 動態注入使用者的即時訂單資訊
        if current_user:
            orders = db.query(Order).filter(Order.user_id == current_user.id).order_by(Order.created_at.desc()).limit(5).all()
            if orders:
                order_info = "這位使用者的最近訂單狀態如下：\n"
                for o in orders:
                    status_text = "處理中" if o.status == "pending" else "已付款" if o.status == "paid" else "已出貨" if o.status == "shipped" else "已送達" if o.status == "delivered" else "已完成" if o.status == "completed" else "已取消" if o.status == "cancelled" else o.status
                    order_info += f"- 訂單編號: {o.id}, 狀態: {status_text}, 總額: NT${int(o.final_paid)}。\n"
                system_instruction += "\n\n【系統即時資訊】\n" + order_info + "如果使用者問到訂單進度，請參考以上即時資料直接回答他。"
            else:
                system_instruction += "\n\n【系統即時資訊】\n這位使用者目前沒有任何訂單紀錄。"
        else:
            system_instruction += "\n\n【系統即時資訊】\n目前這位使用者是以訪客身分發問（尚未登入），如果他詢問私人訂單資料，請引導他先登入會員中心。"
        
        contents = [
            types.Content(
                role="user" if msg.role == "user" else "model",
                parts=[types.Part.from_text(text=msg.content)]
            ) for msg in req.messages
        ]
        
        response = client.models.generate_content(
            model='gemini-2.5-flash',
            contents=contents,
            config=types.GenerateContentConfig(
                system_instruction=system_instruction,
                temperature=0.7
            ),
        )
        return {"reply": response.text}
        
    except Exception as e:
        print(f"Chat API Error: {e}")
        return {"reply": "客服系統目前繁忙中，請稍後再試。"}
