from pymongo import MongoClient
import re
from scraper import validate_tune_data

def clean_database():
    client = MongoClient("mongodb://localhost:27017/")
    db = client["music-notation"]
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
    client = MongoClient("mongodb://localhost:27017/")
    db = client["music-notation"]
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
