import os
import sys

sys.path.insert(0, os.path.abspath('backend'))
from routers.payment import cancel_ecpay_authorization

success = cancel_ecpay_authorization("MOSO260503102A815883", None, 10)
print(f"Success: {success}")
