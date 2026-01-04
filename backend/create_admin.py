"""
Create an admin user in the database
"""
from pymongo import MongoClient
from datetime import datetime
from passlib.context import CryptContext

# Password hashing
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

def create_admin():
    # Connect to MongoDB
    client = MongoClient("mongodb://localhost:27017/")
    db = client["docshield"]
    
    print("=== Create Admin User ===\n")
    
    # Get user input
    name = input("Enter admin name: ").strip()
    email = input("Enter admin email: ").strip()
    password = input("Enter password: ").strip()
    
    if not name or not email or not password:
        print("❌ Error: All fields are required!")
        return
    
    # Check if user already exists
    existing_user = db.users.find_one({"email": email})
    if existing_user:
        print(f"❌ Error: User with email {email} already exists!")
        
        # Ask if want to upgrade to admin
        upgrade = input("\nWould you like to upgrade this user to admin? (yes/no): ").strip().lower()
        if upgrade == 'yes' or upgrade == 'y':
            result = db.users.update_one(
                {"email": email},
                {"$set": {"role": "admin", "updatedAt": datetime.utcnow()}}
            )
            if result.modified_count > 0:
                print(f"✅ Successfully upgraded {email} to admin!")
            else:
                print("❌ Failed to upgrade user")
        client.close()
        return
    
    # Hash password
    hashed_password = pwd_context.hash(password)
    
    # Create admin user
    admin_user = {
        "name": name,
        "email": email,
        "password": hashed_password,
        "role": "admin",
        "createdAt": datetime.utcnow(),
        "updatedAt": datetime.utcnow(),
        "emailVerified": True,  # Auto-verify admin
        "banned": False
    }
    
    result = db.users.insert_one(admin_user)
    
    if result.inserted_id:
        print(f"\n✅ Admin user created successfully!")
        print(f"📧 Email: {email}")
        print(f"👤 Name: {name}")
        print(f"🔑 Role: admin")
        print(f"🆔 User ID: {result.inserted_id}")
        print(f"\n🔐 Login credentials:")
        print(f"   Username: {email}")
        print(f"   Password: {password}")
        print(f"\nYou can now login at http://localhost:3000/login")
    else:
        print("❌ Failed to create admin user")
    
    client.close()

if __name__ == "__main__":
    create_admin()
