"""
Check specific document: Swapnil_Pawar_certificate (1).pdf
"""
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

filename = "Swapnil_Pawar_certificate (1).pdf"

print(f"🔍 Searching for: {filename}\n")

# Find all documents with this filename
docs = list(db.documents.find({"fileName": filename}))

print(f"📊 Found {len(docs)} document(s) with this filename\n")

for i, doc in enumerate(docs, 1):
    print(f"Document #{i}:")
    print("="*80)
    print(f"  ID: {doc.get('_id')}")
    print(f"  File Name: {doc.get('fileName')}")
    print(f"  Status: {doc.get('verificationStatus')}")
    print(f"  Is Deleted: {doc.get('isDeleted', 'NOT SET (treated as False)')}")
    print(f"  Created: {doc.get('createdAt')}")
    print(f"  User ID: {doc.get('userId')}")
    print(f"  File Hash: {doc.get('fileHash', 'N/A')[:32]}...")
    print("="*80)
    print()

# Also search for similar names
print("\n🔎 Searching for similar filenames...")
similar = list(db.documents.find({
    "fileName": {"$regex": "Swapnil_Pawar_certificate", "$options": "i"}
}))

print(f"\n📋 Found {len(similar)} total documents with similar names:")
for doc in similar:
    status = "❌ DELETED" if doc.get('isDeleted') else "✅ Active"
    print(f"  - {doc.get('fileName')} [{doc.get('verificationStatus')}] {status}")
