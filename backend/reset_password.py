"""
Reset test user password
"""
from pymongo import MongoClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

email = "test@docshield.com"
new_password = "test123"

# Update password
result = db.users.update_one(
    {"email": email},
    {"$set": {"password": pwd_context.hash(new_password)}}
)

if result.modified_count > 0:
    print(f"✅ Password reset successfully for {email}")
    print(f"   New password: {new_password}")
else:
    print(f"❌ User {email} not found")
