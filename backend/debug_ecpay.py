import os
import sys
import hashlib
import urllib.parse
import requests

# 若未提供正式金流金鑰，預設使用綠界測試用金鑰
MERCHANT_ID = os.getenv("ECPAY_MERCHANT_ID", "2000132")
HASH_KEY = os.getenv("ECPAY_HASH_KEY", "5294y06JbISpM5x9")
HASH_IV = os.getenv("ECPAY_HASH_IV", "v77hoKGq4kWxNNIS")

def test_ecpay(merchant_trade_no, trade_no, total_amount, action):
    params = {
        "MerchantID": MERCHANT_ID,
        "Action": action,
        "TotalAmount": int(total_amount)
    }
    if merchant_trade_no:
        params["MerchantTradeNo"] = merchant_trade_no
    if trade_no:
        params["TradeNo"] = trade_no
    
    sorted_params = sorted(params.items())
    raw_str = f"HashKey={HASH_KEY}&" + "&".join([f"{k}={v}" for k, v in sorted_params]) + f"&HashIV={HASH_IV}"
    
    url_encoded_str = urllib.parse.quote_plus(raw_str).lower()
    url_encoded_str = url_encoded_str.replace('%2d', '-').replace('%5f', '_').replace('%2e', '.').replace('%21', '!').replace('%2a', '*').replace('%28', '(').replace('%29', ')')

    check_mac_value = hashlib.sha256(url_encoded_str.encode('utf-8')).hexdigest().upper()
    params["CheckMacValue"] = check_mac_value
    
    api_url = "https://payment.ecpay.com.tw/CreditDetail/DoAction"
    res = requests.post(api_url, data=params, timeout=10)
    print(f"Action: {action}, Response: {res.text}")

print("Testing Action N:")
test_ecpay("MOSO260503102A815883", "2605032144444432", 10, "N")

print("Testing Action R:")
test_ecpay("MOSO260503102A815883", "2605032144444432", 10, "R")
