from fastapi import APIRouter, HTTPException, Depends
from sqlalchemy.orm import Session
from pydantic import BaseModel
import os
from database import get_db
from models.user import User
from models.order import Order, OrderItem
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

@router.post("/")
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
            "你是一位親切、專業的 Moso Shop 電商客服人員，請務必一律使用繁體中文（zh-TW）回覆。"
            "請回答使用者的問題，可以根據一般電商規則（例如：1 Moso幣 = 1台幣）給予禮貌的回應。"
        )
        
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
