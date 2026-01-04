"""
Check why documents are missing from verifier queue
"""
from pymongo import MongoClient
from datetime import datetime

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

print("🔍 Checking documents in database...\n")

# Get all documents with pending/flagged status
pending_docs = list(db.documents.find(
    {"verificationStatus": {"$in": ["pending", "flagged"]}},
    {"fileName": 1, "verificationStatus": 1, "isDeleted": 1, "createdAt": 1, "userId": 1}
))

print(f"📊 Total pending/flagged documents: {len(pending_docs)}\n")

if pending_docs:
    print("Documents:")
    print("="*80)
    for i, doc in enumerate(pending_docs, 1):
        is_deleted = doc.get("isDeleted", False)
        status = "❌ DELETED" if is_deleted else "✅ Active"
        
        print(f"{i}. {doc.get('fileName', 'Unknown')}")
        print(f"   Status: {doc.get('verificationStatus')}")
        print(f"   Is Deleted: {is_deleted} - {status}")
        print(f"   Created: {doc.get('createdAt')}")
        print(f"   User ID: {doc.get('userId')}")
        print("-"*80)

# Check what the verifier queue would return
print("\n🎯 Simulating verifier queue filter...")
active_pending = list(db.documents.find({
    "verificationStatus": {"$in": ["pending", "flagged"]},
    "$or": [{"isDeleted": {"$exists": False}}, {"isDeleted": False}]
}))

print(f"✅ Documents that WOULD show in queue: {len(active_pending)}")

deleted_pending = list(db.documents.find({
    "verificationStatus": {"$in": ["pending", "flagged"]},
    "isDeleted": True
}))

print(f"❌ Deleted pending documents (filtered out): {len(deleted_pending)}")

if deleted_pending:
    print("\nDeleted documents:")
    for doc in deleted_pending:
        print(f"  - {doc.get('fileName')}")
