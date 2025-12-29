from pymongo import MongoClient
import re
import os
from dotenv import load_dotenv
from scraper import validate_tune_data

# Load environment variables
env_file = '.env.production' if os.getenv('SCRAPER_ENV') == 'production' else '.env'
load_dotenv(env_file)



def clean_database():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("DB_NAME", "music-notation")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["scores"]

    
    cursor = collection.find({})
    deleted_count = 0
    
    print("Scanning database for invalid tunes...")
    for doc in cursor:
        # Normalize data structure for validation if needed
        # validate_tune_data expects 'title' and 'content'
        
        # Handle inconsistent field names if any (abc_content vs content)
        if 'content' not in doc and 'abc_content' in doc:
             doc['content'] = doc['abc_content']
             
        if not validate_tune_data(doc):
            print(f"Deleting invalid tune: {doc.get('title', 'Unknown')} (ID: {doc['_id']})")
            collection.delete_one({'_id': doc['_id']})
            deleted_count += 1
            
    print(f"Cleanup complete. Deleted {deleted_count} invalid documents.")

def deduplicate_scores():
    mongo_uri = os.getenv("MONGODB_URI", "mongodb://localhost:27017/")
    db_name = os.getenv("DB_NAME", "music-notation")
    client = MongoClient(mongo_uri)
    db = client[db_name]
    collection = db["scores"]

    
    print("Scanning for duplicate scores (matching content)...")
    
    # Aggregation to find duplicates
    pipeline = [
        {
            "$group": {
                "_id": "$content",
                "count": {"$sum": 1},
                "ids": {"$push": "$_id"}
            }
        },
        {
            "$match": {
                "count": {"$gt": 1}
            }
        }
    ]
    
    duplicates = list(collection.aggregate(pipeline))
    total_removed = 0
    
    for entry in duplicates:
        # Keep the first ID, remove the others
        ids_to_remove = entry['ids'][1:]
        result = collection.delete_many({"_id": {"$in": ids_to_remove}})
        total_removed += result.deleted_count
        print(f"Removed {result.deleted_count} duplicates for content starting with: {entry['_id'][:50]}...")
        
    print(f"Deduplication complete. Removed {total_removed} duplicate records.")

if __name__ == "__main__":
    clean_database()
    deduplicate_scores()
