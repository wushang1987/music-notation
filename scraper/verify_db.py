from pymongo import MongoClient

client = MongoClient("mongodb://localhost:27017/")
db = client["music-notation"]
collection = db["scores"]

# Get the latest document (or one with the new fields)
doc = collection.find_one({"visibility": "public"})

if doc:
    print("Found document with visibility='public'")
    print(f"Title: {doc.get('title')}")
    print(f"isPublic: {doc.get('isPublic')}")
    print(f"visibility: {doc.get('visibility')}")
else:
    print("No document found with visibility='public'")
