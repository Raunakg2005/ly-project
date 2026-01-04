"""
Check if verifier user exists in database
"""
from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

print("🔍 Checking for verifier users in database...\n")

# Find all users
all_users = list(db.users.find({}, {"email": 1, "role": 1, "name": 1}))

print(f"📊 Total users in database: {len(all_users)}\n")

# Show all users
print("👥 All users:")
print("-" * 60)
for user in all_users:
    role = user.get('role', 'user')
    print(f"  Email: {user.get('email')}")
    print(f"  Name: {user.get('name', 'N/A')}")
    print(f"  Role: {role}")
    print("-" * 60)

# Check for verifier specifically
verifier_users = list(db.users.find({"role": {"$in": ["verifier", "admin"]}}))
print(f"\n✅ Verifier/Admin users found: {len(verifier_users)}")

if verifier_users:
    print("\n🎯 Verifier accounts:")
    for user in verifier_users:
        print(f"  • {user.get('email')} ({user.get('role')})")
else:
    print("\n❌ No verifier or admin users found!")
    print("   Run: python create_verifier.py")
