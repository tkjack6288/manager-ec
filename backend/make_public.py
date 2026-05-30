import os
from google.cloud import storage

def make_bucket_public():
    try:
        bucket_name = "productsimg"
        client = storage.Client()
        bucket = client.bucket(bucket_name)
        
        policy = bucket.get_iam_policy(requested_policy_version=3)
        policy.bindings.append(
            {"role": "roles/storage.objectViewer", "members": {"allUsers"}}
        )
        bucket.set_iam_policy(policy)
        print(f"Bucket {bucket_name} is now public!")
        
    except Exception as e:
        print(f"Failed to make bucket public: {e}")

if __name__ == "__main__":
    make_bucket_public()
