from pymongo import MongoClient

# Connect to MongoDB
client = MongoClient("mongodb://localhost:27017/")
db = client["docshield"]

# Update all users with null name to empty string
result = db.users.update_many(
    {"name": None},
    {"$set": {"name": ""}}
)

print(f"✅ Updated {result.modified_count} users with null names")

# Show all users
users = db.users.find({}, {"email": 1, "name": 1, "_id": 0})
print("\nCurrent users:")
for user in users:
    print(f"  Email: {user.get('email')}, Name: '{user.get('name')}'")

client.close()
