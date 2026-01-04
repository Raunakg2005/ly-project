"""
Check if flagged documents have review_history
"""
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

print("🔍 Checking flagged documents for review_history...\n")

# Find flagged documents
flagged_docs = list(db.documents.find(
    {"verificationStatus": "flagged"},
    {"fileName": 1, "verificationStatus": 1, "review_history": 1}
))

print(f"📊 Found {len(flagged_docs)} flagged document(s)\n")

for i, doc in enumerate(flagged_docs, 1):
    print(f"{i}. {doc.get('fileName')}")
    print(f"   Status: {doc.get('verificationStatus')}")
    
    review_history = doc.get('review_history', [])
    print(f"   Has review_history: {len(review_history) > 0}")
    
    if review_history:
        print(f"   Number of reviews: {len(review_history)}")
        for j, review in enumerate(review_history, 1):
            print(f"   Review #{j}:")
            print(f"      Reviewer: {review.get('reviewer_name', 'Unknown')}")
            print(f"      Decision: {review.get('decision', 'N/A')}")
            print(f"      Notes: {review.get('notes', 'No notes')}")
    else:
        print(f"   ❌ NO review_history field!")
    
    print("-" * 60)
