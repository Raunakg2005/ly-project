"""
Test login directly with the database
"""
from pymongo import MongoClient
from passlib.context import CryptContext

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

# Test credentials
test_email = "test@docshield.com"
test_password = "test123"

verifier_email = "verifier@docshield.com"
verifier_password = "Verifier@123"

def test_login(email, password):
    print(f"\n🔐 Testing login for: {email}")
    print(f"   Password: {password}")
    
    # Find user
    user = db.users.find_one({"email": email})
    
    if not user:
        print(f"   ❌ User not found!")
        return False
    
    print(f"   ✅ User found in database")
    print(f"   Role: {user.get('role', 'user')}")
    
    # Check password fields
    has_password = 'password' in user
    has_hashed = 'hashed_password' in user
    
    print(f"   Has 'password' field: {has_password}")
    print(f"   Has 'hashed_password' field: {has_hashed}")
    
    # Get the password field
    password_field = user.get("hashed_password") or user.get("password")
    
    if not password_field:
        print(f"   ❌ No password field found!")
        return False
    
    # Verify password
    is_valid = pwd_context.verify(password, password_field)
    
    if is_valid:
        print(f"   ✅ PASSWORD CORRECT!")
        return True
    else:
        print(f"   ❌ PASSWORD INCORRECT!")
        return False

# Test both accounts
print("="*60)
print("TESTING LOGIN CREDENTIALS")
print("="*60)

test_login(test_email, test_password)
test_login(verifier_email, verifier_password)

print("\n" + "="*60)
