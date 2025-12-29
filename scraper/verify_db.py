import os
from dotenv import load_dotenv

# Load environment variables
env_file = '.env.production' if os.getenv('SCRAPER_ENV') == 'production' else '.env'
load_dotenv(env_file)


mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
db_name = os.getenv("DB_NAME", "music-notation")

client = MongoClient(mongo_uri)
db = client[db_name]
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
