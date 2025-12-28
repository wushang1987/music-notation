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

if __name__ == "__main__":
    clean_database()
