from fastapi import APIRouter, Form, Request
from fastapi.responses import HTMLResponse
import os

router = APIRouter(prefix="/logistics", tags=["Logistics"])

# 測試用特店編號 (綠界物流 C2C 測試特店編號為 2000933)
ECPAY_MERCHANT_ID = "2000933"
# 綠界電子地圖網址
ECPAY_MAP_URL = "https://logistics.ecpay.com.tw/Express/map"

@router.get("/map/{subtype}", response_class=HTMLResponse)
def logistics_map(subtype: str, request: Request):
    """
    產生轉跳至綠界電子地圖的 HTML 隱藏表單
    subtype: UNIMART (7-11) 或 FAMI (全家)
    """
    if subtype not in ["UNIMART", "FAMI"]:
        return HTMLResponse(content="Invalid subtype", status_code=400)

    scheme = request.headers.get("x-forwarded-proto", request.url.scheme)
    host = request.headers.get("x-forwarded-host", request.url.netloc)
    reply_url = f"{scheme}://{host}/logistics/map/callback"
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="zh-Hant">
    <head>
        <meta charset="UTF-8">
        <title>轉跳中...</title>
    </head>
    <body onload="document.getElementById('ecpay-map-form').submit();">
        <p>正在前往門市選擇頁面，請稍候...</p>
        <form id="ecpay-map-form" method="POST" action="{ECPAY_MAP_URL}">
            <input type="hidden" name="MerchantID" value="{ECPAY_MERCHANT_ID}">
            <input type="hidden" name="MerchantTradeNo" value="MapTest12345"> <!-- 測試可隨意填 -->
            <input type="hidden" name="LogisticsType" value="CVS">
            <input type="hidden" name="LogisticsSubType" value="{subtype}">
            <input type="hidden" name="IsCollection" value="N">
            <input type="hidden" name="ServerReplyURL" value="{reply_url}">
        </form>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)

@router.post("/map/callback", response_class=HTMLResponse)
def logistics_map_callback(
    CVSStoreID: str = Form(None),
    CVSStoreName: str = Form(None),
    CVSAddress: str = Form(None),
    LogisticsSubType: str = Form(None)
):
    """
    接收綠界電子地圖回傳的門市資料，並透過 JavaScript postMessage 傳給父視窗後關閉自己。
    """
    # 當沒有收到正確資料時的防錯
    if not CVSStoreID:
        return HTMLResponse("Failed to get CVS store info.", status_code=400)
    
    html_content = f"""
    <!DOCTYPE html>
    <html lang="zh-Hant">
    <head>
        <meta charset="UTF-8">
        <title>處理中...</title>
        <script>
            // 將取得的資料傳遞回父視窗
            if (window.opener) {{
                window.opener.postMessage({{
                    type: "ECPAY_MAP_RESULT",
                    storeId: "{CVSStoreID}",
                    storeName: "{CVSStoreName}",
                    storeAddress: "{CVSAddress}",
                    subtype: "{LogisticsSubType}"
                }}, "*");
                // 關閉目前視窗
                window.close();
            }} else {{
                document.write("找不到父視窗，請手動關閉此頁面。");
            }}
        </script>
    </head>
    <body>
        <p>門市選擇完成，正在返回...</p>
    </body>
    </html>
    """
    return HTMLResponse(content=html_content)
