"""
Fix duplicate password fields
"""
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

print("🔧 Fixing duplicate password fields...\n")

# Remove hashed_password field from test user
result = db.users.update_one(
    {"email": "test@docshield.com"},
    {"$unset": {"hashed_password": ""}}
)

if result.modified_count > 0:
    print("✅ Removed 'hashed_password' field from test@docshield.com")
else:
    print("ℹ️  No changes needed for test@docshield.com")

# Verify
user = db.users.find_one({"email": "test@docshield.com"})
print(f"\n📋 Current fields for test@docshield.com:")
print(f"   Has 'password': {'password' in user}")
print(f"   Has 'hashed_password': {'hashed_password' in user}")
print("\n✅ Login should work now!")
