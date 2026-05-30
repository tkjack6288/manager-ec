import os
from dotenv import load_dotenv

load_dotenv()
bucket_name = os.getenv("GCP_BUCKET_NAME")
print(f"Bucket: {bucket_name}")

if bucket_name:
    try:
        from google.cloud import storage
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blob = bucket.blob("test_upload.txt")
        blob.upload_from_string(b"hello world", content_type="text/plain")
        print("Upload success!")
        print(f"URL: https://storage.googleapis.com/{bucket_name}/test_upload.txt")
    except Exception as e:
        print(f"Error: {e}")
