"""
Test the documents API endpoint directly
"""
import requests
import json

# You'll need to get a valid token from the browser
# For now, let's just check the raw response structure
token = "YOUR_TOKEN_HERE"  # Replace with actual token from browser

url = "http://localhost:8000/api/documents"
params = {
    "page": 1,
    "limit": 10,
    "status_filter": "all",
    "date_range": "all",
    "sort_by": "createdAt",
    "sort_order": "desc"
}

headers = {
    "Authorization": f"Bearer {token}"
}

print("🔍 Testing documents API endpoint...\n")
print(f"URL: {url}")
print(f"Params: {json.dumps(params, indent=2)}\n")

try:
    response = requests.get(url, params=params, headers=headers)
    print(f"Status Code: {response.status_code}\n")
    
    if response.status_code == 200:
        data = response.json()
        print(f"✅ Success! Got {len(data)} documents\n")
        
        # Check first document for reviewHistory
        if data:
            first_doc = data[0]
            print(f"First document: {first_doc.get('fileName')}")
            print(f"  Status: {first_doc.get('verificationStatus')}")
            print(f"  Has reviewHistory key: {'reviewHistory' in first_doc}")
            
            if 'reviewHistory' in first_doc:
                print(f"  reviewHistory type: {type(first_doc['reviewHistory'])}")
                print(f"  reviewHistory value: {first_doc['reviewHistory']}")
            
            print(f"\n📋 Full first document keys:")
            for key in first_doc.keys():
                print(f"  - {key}")
    else:
        print(f"❌ Error: {response.text}")
        
except Exception as e:
    print(f"❌ Exception: {e}")

print("\n💡 If reviewHistory is missing, check if serialize_review_history is being called")
