"""
Test if flagging a document stores review_history
"""
from pymongo import MongoClient
from bson import ObjectId

client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

# Find the flagged document
doc = db.documents.find_one(
    {"fileName": "unnamed (2).png"},
    {"fileName": 1, "verificationStatus": 1, "review_history": 1, "manualReview": 1}
)

if doc:
    print(f"📄 Document: {doc['fileName']}")
    print(f"   Status: {doc.get('verificationStatus')}")
    print()
    
    # Check review_history
    review_history = doc.get('review_history', [])
    print(f"✅ review_history field exists: {review_history is not None}")
    print(f"   Length: {len(review_history) if review_history else 0}")
    
    if review_history:
        print(f"\n📋 Review History:")
        for i, review in enumerate(review_history, 1):
            print(f"   {i}. Reviewer: {review.get('reviewer_name', 'N/A')}")
            print(f"      Decision: {review.get('decision', 'N/A')}")
            print(f"      Notes: {review.get('notes', 'N/A')}")
            print()
    
    # Check old manualReview field
    manual_review = doc.get('manualReview')
    if manual_review:
        print(f"\n⚠️ Old manualReview field still exists:")
        print(f"   Decision: {manual_review.get('decision', 'N/A')}")
        print(f"   Notes: {manual_review.get('notes', 'N/A')}")
else:
    print("❌ Document not found")
