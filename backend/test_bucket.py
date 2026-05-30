import os
from google.cloud import storage

def check_bucket():
    try:
        bucket_name = "productsimg"
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        blobs = list(bucket.list_blobs(max_results=5))
        
        print(f"Connected to bucket: {bucket_name}")
        print(f"Found {len(blobs)} objects (showing up to 5):")
        for blob in blobs:
            print(f" - {blob.name} (size: {blob.size} bytes)")
            
        policy = bucket.get_iam_policy(requested_policy_version=3)
        public = False
        for binding in policy.bindings:
            if "allUsers" in binding.get("members", []) and "roles/storage.objectViewer" in binding.get("role", ""):
                public = True
                
        print(f"Is public via IAM? {public}")
        
    except Exception as e:
        print(f"Error checking bucket: {e}")

if __name__ == "__main__":
    check_bucket()
