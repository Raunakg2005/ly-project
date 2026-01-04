"""
Add review_history to flagged document to demonstrate the feature
"""
from pymongo import MongoClient
from datetime import datetime
from bson import ObjectId

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

# Find the flagged document
doc = db.documents.find_one({"fileName": "unnamed (2).png", "verificationStatus": "flagged"})

if doc:
    print(f"✅ Found document: {doc['fileName']}\n")
    
    # Get verifier user
    verifier = db.users.find_one({"email": "verifier@docshield.com"})
    
    if verifier:
        # Add review_history
        review_entry = {
            "reviewer_id": verifier["_id"],
            "reviewer_name": verifier.get("name", "John Verifier"),
            "decision": "flagged",
            "notes": "Image quality is too low for verification. Please upload a higher resolution scan.",
            "reviewed_at": datetime.utcnow()
        }
        
        # Update document with review_history
        result = db.documents.update_one(
            {"_id": doc["_id"]},
            {"$push": {"review_history": review_entry}}
        )
        
        if result.modified_count > 0:
            print("✅ Added review_history to document!")
            print(f"\nReviewer: {review_entry['reviewer_name']}")
            print(f"Decision: {review_entry['decision']}")
            print(f"Notes: {review_entry['notes']}")
            print("\n🎯 Now refresh the /documents page to see the flagged reason alert!")
        else:
            print("❌ Failed to update document")
    else:
        print("❌ Verifier user not found")
else:
    print("❌ Document not found")
