"""
Check all flagged documents for review_history
"""
from pymongo import MongoClient
from datetime import datetime

client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

print("🔍 Checking ALL flagged documents...\n")

# Find all flagged documents
flagged_docs = list(db.documents.find(
    {"verificationStatus": "flagged"},
    {"fileName": 1, "verificationStatus": 1, "review_history": 1, "manualReview": 1, "updatedAt": 1}
).sort("updatedAt", -1))

print(f"📊 Found {len(flagged_docs)} flagged document(s)\n")
print("="*70)

for i, doc in enumerate(flagged_docs, 1):
    print(f"\n{i}. {doc.get('fileName')}")
    print(f"   Last Updated: {doc.get('updatedAt', 'N/A')}")
    
    # Check review_history
    review_history = doc.get('review_history', [])
    print(f"   review_history exists: {review_history is not None}")
    print(f"   review_history length: {len(review_history) if review_history else 0}")
    
    if review_history:
        for j, review in enumerate(review_history, 1):
            print(f"\n   Review #{j}:")
            print(f"      Reviewer: {review.get('reviewer_name', 'N/A')}")
            print(f"      Decision: {review.get('decision', 'N/A')}")
            print(f"      Notes: {review.get('notes', 'N/A')}")
            print(f"      Date: {review.get('reviewed_at', 'N/A')}")
    
    # Check old manualReview field
    manual_review = doc.get('manualReview')
    if manual_review:
        print(f"\n   ⚠️ Old manualReview field:")
        print(f"      Notes: {manual_review.get('notes', 'N/A')}")
    
    print("-"*70)

print("\n💡 If review_history is empty, the backend endpoint isn't saving correctly.")
print("   Try flagging another document and run this script again.")
