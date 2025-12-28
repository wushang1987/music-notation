
import requests
from bs4 import BeautifulSoup
from pymongo import MongoClient
import time
from datetime import datetime
import argparse
import re

# MongoDB Setup
MONGO_URI = "mongodb://localhost:27017/"
DB_NAME = "music-notation"
COLLECTION_NAME = "scores"

def get_mongo_collection():
    client = MongoClient(MONGO_URI)
    db = client[DB_NAME]
    return db[COLLECTION_NAME]



def scrape_tune_page(url):
    print(f"Scraping tune page: {url}")
    try:
        response = requests.get(url)
        if response.status_code != 200:
            print(f"Failed to fetch {url}")
            return None
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Extract Title
        # Title is usually in h2 or h3 or part of the pre content
        # From earlier view_content_chunk: "#### 100 Pipers"
        # So it might be h4 or h3
        
        title_tag = soup.find('h3', text=True) # or h4?
        # Fallback: parse from ABC 'T:' field
        
        # Extract ABC Content
        # It is usually in a <pre> tag or code block
        # From chunk: ```\nX:53 ... ``` -> so it likely is inside a <pre> tag in HTML
        
        abc_content = ""
        pre_tags = soup.find_all('pre')
        for pre in pre_tags:
            text = pre.get_text()
            if "X:" in text and "K:" in text: # Basic validation for ABC notation
                abc_content = text.strip()
                break
        
        if not abc_content:
            # Try to fetch from the raw abc link if available
            # [abc](https://abcnotation.com/getResource/downloads/text_/...)
            abc_dl_link = soup.find('a', string="abc", href=True)
            if abc_dl_link:
                dl_url = abc_dl_link['href']
                if dl_url.startswith('/'):
                    dl_url = "https://abcnotation.com" + dl_url
                print(f"Fetching raw ABC from {dl_url}")
                abc_resp = requests.get(dl_url)
                if abc_resp.status_code == 200:
                    abc_content = abc_resp.text
        
        if not abc_content:
            print("Could not find ABC content")
            return None
            
        # Parse Title from ABC if not found
        title = "Unknown"
        for line in abc_content.splitlines():
            if line.startswith("T:"):
                title = line[2:].strip()
                break
                
        data = {
            "source_url": url,
            "title": title,
            "content": abc_content,
            "scraped_at": datetime.now(),
            "isPublic": True,
            "visibility": "public"
        }
        
        if not validate_tune_data(data):
             print(f"Skipping invalid data for {url}")
             return None
             
        return data

    except Exception as e:
        print(f"Error scraping {url}: {e}")
        return None

def validate_tune_data(data):
    if not data:
        return False
        
    # Check title
    if not data.get('title') or data['title'] == "Unknown" or len(data['title']) < 2:
        return False
        
    # Check ABC content
    content = data.get('content', '')
    if "X:" not in content or "K:" not in content:
        return False
        
    # Ensure there are notes after the K: field
    # Split by K: to find the body. Note: K: might appear multiple times but usually denotes key change or start.
    # We want to ensure there is at least some content line that is not a header field.
    
    lines = content.splitlines()
    has_k = False
    has_notes = False
    
    for i, line in enumerate(lines):
        if line.startswith("K:"):
            has_k = True
            # Check lines after K:
            rest = lines[i+1:]
            for r in rest:
                r = r.strip()
                if not r:
                    continue
                # If a line doesn't start with a header letter followed by colon, it's likely notes.
                # Headers: X, T, M, L, Q, P, C, Z, N, G, H, I, K, O, R, S, U, W, B, D, F
                # Note: some legitimate note lines might start with a letter and colon if inline fields, but rare to start line.
                # Heuristic: If it doesn't look like X: or T:, etc.
                if not re.match(r'^[A-Z]:', r):
                    has_notes = True
                    break
            if has_notes:
                break
                
    if not has_notes:
         return False

    return True

def save_to_mongo(data):
    if not data:
        return
    
    collection = get_mongo_collection()
    # Upsert based on source_url
    collection.update_one(
        {"source_url": data["source_url"]},
        {"$set": data},
        upsert=True
    )
    print(f"Saved/Updated: {data['title']}")

def browse_tunes(start_page=0, page_limit=1):
    base_url = "https://abcnotation.com/browseTunes"
    results = []
    
    for i in range(page_limit):
        page_num = start_page + i
        # Format page number as 4 digits based on observed URL pattern (e.g. n=0021)
        page_str = f"{page_num:04d}"
        params = {'n': page_str}
        
        print(f"Browsing page {page_str}...")
        results.extend(extract_tune_urls(base_url, params))
        
    return results

def search_tunes(query, page_limit=1):
    base_url = "https://abcnotation.com/searchTunes"
    results = []
    
    for page in range(page_limit):
        start_index = page * 10
        params = {
            'q': query,
            'f': 'c',
            'o': 'a',
            's': start_index 
        }
        
        print(f"Searching page {page + 1}... (start={start_index})")
        results.extend(extract_tune_urls(base_url, params))
        
    return results

def extract_tune_urls(base_url, params):
    try:
        response = requests.get(base_url, params=params)
        if response.status_code != 200:
            print(f"Failed to fetch {base_url}: {response.status_code}")
            return []
            
        soup = BeautifulSoup(response.content, 'html.parser')
        
        # Find all 'a' tags that link to tunePage
        tune_links = soup.find_all('a', href=re.compile(r'tunePage\?a='))
        
        urls = []
        seen_links = set()
        for link in tune_links:
            href = link['href']
            if href.startswith('/'):
                href = "https://abcnotation.com" + href
                
            if href not in seen_links:
                seen_links.add(href)
                urls.append(href)
                
        return urls
    except Exception as e:
        print(f"Error extracting URLs: {e}")
        return []

def main():
    parser = argparse.ArgumentParser(description="Scrape ABC tunes")
    parser.add_argument("--query", default="jig", help="Search query (ignored if --browse is used)")
    parser.add_argument("--limit", type=int, default=1, help="Number of search result pages or browse pages to scrape")
    parser.add_argument("--browse", action="store_true", help="Browse tunes instead of searching")
    parser.add_argument("--start-page", type=int, default=0, help="Starting page number for browse mode")
    
    args = parser.parse_args()
    
    if args.browse:
        print(f"Starting browse mode from page {args.start_page}")
        tune_urls = browse_tunes(args.start_page, args.limit)
    else:
        print(f"Starting search mode for '{args.query}'")
        tune_urls = search_tunes(args.query, args.limit)
        
    print(f"Found {len(tune_urls)} tunes to scrape.")
    
    for url in tune_urls:
        data = scrape_tune_page(url)
        if data:
            save_to_mongo(data)
            time.sleep(1) # Be polite

if __name__ == "__main__":
    main()
