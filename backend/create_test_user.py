"""
Quick script to create a test user in MongoDB
"""
from pymongo import MongoClient
from passlib.context import CryptContext
from datetime import datetime

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

# Check if user exists
existing_user = db.users.find_one({"email": "test@docshield.com"})

if existing_user:
    print("✅ Test user already exists!")
    print(f"Email: {existing_user['email']}")
    print(f"Name: {existing_user.get('name', 'N/A')}")
else:
    # Create test user
    hashed_password = pwd_context.hash("test123")
    
    test_user = {
        "email": "test@docshield.com",
        "name": "Test User",
        "hashedPassword": hashed_password,
        "role": "user",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow()
    }
    
    result = db.users.insert_one(test_user)
    print("✅ Test user created successfully!")
    print(f"User ID: {result.inserted_id}")
    print(f"Email: test@docshield.com")
    print(f"Password: test123")

client.close()
