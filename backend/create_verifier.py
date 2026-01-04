"""
Create a verifier user in the database
"""
import asyncio
from pymongo import MongoClient
from datetime import datetime
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

async def create_verifier_user():
    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["docshield"]
    
    # User details
    email = "verifier@docshield.com"
    password = "Verifier@123"
    name = "John Verifier"
    role = "verifier"
    
    # Check if user exists
    existing = db.users.find_one({"email": email})
    if existing:
        print(f"✅ Verifier user already exists: {email}")
        print(f"   Role: {existing.get('role', 'user')}")
        if existing.get('role') != 'verifier':
            # Update role
            db.users.update_one(
                {"email": email},
                {"$set": {"role": "verifier"}}
            )
            print(f"   Updated role to: verifier")
        return
    
    # Create user
    user_doc = {
        "email": email,
        "password": pwd_context.hash(password),
        "name": name,
        "role": role,
        "createdAt": datetime.utcnow(),
        "isActive": True
    }
    
    result = db.users.insert_one(user_doc)
    
    print(f"✅ Verifier user created successfully!")
    print(f"   Email: {email}")
    print(f"   Password: {password}")
    print(f"   Role: {role}")
    print(f"   User ID: {result.inserted_id}")
    print(f"\n🔐 Login credentials:")
    print(f"   Username: {email}")
    print(f"   Password: {password}")

if __name__ == "__main__":
    asyncio.run(create_verifier_user())
