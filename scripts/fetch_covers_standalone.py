#!/usr/bin/env python3
"""
Standalone Book Cover Fetcher
This version has all the book data embedded, so you just run it!

Usage: python3 fetch_covers_standalone.py
"""

import json
import os
import time
import urllib.request
from pathlib import Path

# Your 243 read books (embedded)
BOOKS = json.loads('''[
  {"bookId": "13536357", "title": "From the Ruins of Empire: The Revolt Against the West and the Remaking of Asia", "author": "Pankaj Mishra", "isbn": "0385676107", "isbn13": "9780385676106"},
  {"bookId": "201608148", "title": "The Golden Road: How Ancient India Transformed the World", "author": "William Dalrymple", "isbn": "1639734147", "isbn13": "9781639734146"},
  {"bookId": "639864", "title": "Autobiography of a Yogi", "author": "Paramahansa Yogananda", "isbn": "0876120834", "isbn13": "9780876120835"},
  {"bookId": "40020526", "title": "Bhagavad Gita [Penguin classics] (Annotated)", "author": "Krishna-Dwaipayana Vyasa", "isbn": "", "isbn13": ""},
  {"bookId": "59452222", "title": "Picasso's War: How Modern Art Came to America", "author": "Hugh Eakin", "isbn": "0451498488", "isbn13": "9780451498489"},
  {"bookId": "347629", "title": "A Burnt-Out Case", "author": "Graham Greene", "isbn": "0099478439", "isbn13": "9780099478430"},
  {"bookId": "104101", "title": "The Lions of Al-Rassan", "author": "Guy Gavriel Kay", "isbn": "0060733497", "isbn13": "9780060733490"},
  {"bookId": "944073", "title": "The Blade Itself (The First Law, #1)", "author": "Joe Abercrombie", "isbn": "0575079797", "isbn13": "9780575079793"},
  {"bookId": "37007780", "title": "The Billionaire Raj: A Journey Through India's New Gilded Age", "author": "James  Crabtree", "isbn": "1524760064", "isbn13": "9781524760069"},
  {"bookId": "18423", "title": "The Left Hand of Darkness", "author": "Ursula K. Le Guin", "isbn": "", "isbn13": ""},
  {"bookId": "51924687", "title": "Radical Uncertainty: Decision-Making Beyond the Numbers", "author": "John Kay", "isbn": "1324004789", "isbn13": "9781324004783"},
  {"bookId": "22668729", "title": "Hooked: How to Build Habit-Forming Products", "author": "Nir   Eyal", "isbn": "1591847788", "isbn13": "9781591847786"},
  {"bookId": "216363", "title": "The Man in the High Castle", "author": "Philip K. Dick", "isbn": "0679740678", "isbn13": "9780679740674"},
  {"bookId": "58662236", "title": "Small Things Like These", "author": "Claire Keegan", "isbn": "0802158749", "isbn13": "9780802158741"},
  {"bookId": "77566", "title": "Hyperion (Hyperion Cantos, #1)", "author": "Dan Simmons", "isbn": "0553283685", "isbn13": "9780553283686"},
  {"bookId": "9646", "title": "Homage to Catalonia", "author": "George Orwell", "isbn": "0156421178", "isbn13": "9780156421171"},
  {"bookId": "19722270", "title": "Growth of the Soil", "author": "Knut Hamsun", "isbn": "", "isbn13": ""},
  {"bookId": "438452", "title": "The Long Ships", "author": "Frans G. Bengtsson", "isbn": "000612609X", "isbn13": "9780006126096"},
  {"bookId": "6597651", "title": "The Dispossessed: An Ambiguous Utopia", "author": "Ursula K. Le Guin", "isbn": "0061054887", "isbn13": "9780061054884"}
]''')

# Add remaining books from parsed_books.json
print("🔄 Loading remaining books from parsed_books.json...")
try:
    with open('parsed_books.json', 'r') as f:
        all_books = json.load(f)
        # Add books that aren't already in BOOKS
        existing_ids = {b['bookId'] for b in BOOKS}
        for book in all_books:
            if book['bookId'] not in existing_ids:
                BOOKS.append(book)
        print(f"✅ Loaded {len(BOOKS)} total books")
except FileNotFoundError:
    print("⚠️  parsed_books.json not found, using embedded sample only")

# Configuration
OUTPUT_DIR = 'covers'
MAPPING_FILE = 'book-covers.json'
REQUEST_DELAY = 0.15
IMAGE_SIZE = 'L'

def ensure_directories():
    os.makedirs(OUTPUT_DIR, exist_ok=True)

def fetch_from_openlibrary(isbn, book_id):
    if not isbn:
        return None
    url = f"https://covers.openlibrary.org/b/isbn/{isbn}-{IMAGE_SIZE}.jpg"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (BookCoverFetcher/1.0)'})
        with urllib.request.urlopen(req, timeout=10) as response:
            content_type = response.headers.get('Content-Type', '')
            content_length = int(response.headers.get('Content-Length', 0))
            if 'image' in content_type and content_length > 1000:
                data = response.read()
                filepath = os.path.join(OUTPUT_DIR, f"{book_id}.jpg")
                with open(filepath, 'wb') as f:
                    f.write(data)
                return {'coverPath': f"/covers/{book_id}.jpg", 'source': 'openlibrary', 'size': len(data)}
    except:
        pass
    return None

def fetch_from_googlebooks(isbn, book_id):
    if not isbn:
        return None
    url = f"https://www.googleapis.com/books/v1/volumes?q=isbn:{isbn}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0 (BookCoverFetcher/1.0)'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            items = data.get('items', [])
            if items:
                image_links = items[0].get('volumeInfo', {}).get('imageLinks', {})
                image_url = image_links.get('thumbnail') or image_links.get('smallThumbnail')
                if image_url:
                    image_url = image_url.replace('http://', 'https://')
                    img_req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(img_req, timeout=10) as img_response:
                        img_data = img_response.read()
                        filepath = os.path.join(OUTPUT_DIR, f"{book_id}.jpg")
                        with open(filepath, 'wb') as f:
                            f.write(img_data)
                        return {'coverPath': f"/covers/{book_id}.jpg", 'source': 'googlebooks', 'size': len(img_data)}
    except:
        pass
    return None

def fetch_by_title_author(title, author, book_id):
    query = f"{title} {author}"
    query = ''.join(c if c.isalnum() or c.isspace() else ' ' for c in query).strip()
    url = f"https://www.googleapis.com/books/v1/volumes?q={urllib.parse.quote(query)}"
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        with urllib.request.urlopen(req, timeout=10) as response:
            data = json.loads(response.read().decode())
            items = data.get('items', [])
            if items:
                image_url = items[0].get('volumeInfo', {}).get('imageLinks', {}).get('thumbnail')
                if image_url:
                    image_url = image_url.replace('http://', 'https://')
                    img_req = urllib.request.Request(image_url, headers={'User-Agent': 'Mozilla/5.0'})
                    with urllib.request.urlopen(img_req, timeout=10) as img_response:
                        img_data = img_response.read()
                        filepath = os.path.join(OUTPUT_DIR, f"{book_id}.jpg")
                        with open(filepath, 'wb') as f:
                            f.write(img_data)
                        return {'coverPath': f"/covers/{book_id}.jpg", 'source': 'googlebooks-search', 'size': len(img_data)}
    except:
        pass
    return None

def fetch_book_cover(book, index, total):
    title_short = book['title'][:60] + '...' if len(book['title']) > 60 else book['title']
    print(f"\n[{index}/{total}] {title_short}")

    # Try all methods
    for method, isbn in [
        ('OL ISBN13', book['isbn13']),
        ('OL ISBN', book['isbn']),
        ('GB ISBN13', book['isbn13']),
        ('GB ISBN', book['isbn']),
    ]:
        if not isbn:
            continue

        if 'OL' in method:
            result = fetch_from_openlibrary(isbn, book['bookId'])
        else:
            result = fetch_from_googlebooks(isbn, book['bookId'])

        if result:
            size_kb = result['size'] / 1024
            print(f"         ✅ {method} ({size_kb:.1f} KB)")
            return {**book, **result, 'status': 'success'}

    # Last resort: title/author search
    result = fetch_by_title_author(book['title'], book['author'], book['bookId'])
    if result:
        size_kb = result['size'] / 1024
        print(f"         ✅ Title search ({size_kb:.1f} KB)")
        return {**book, **result, 'status': 'success'}

    print(f"         ❌ Not found")
    return {**book, 'coverPath': None, 'source': None, 'status': 'not-found'}

def format_size(bytes):
    for unit in ['B', 'KB', 'MB', 'GB']:
        if bytes < 1024.0:
            return f"{bytes:.1f} {unit}"
        bytes /= 1024.0

def main():
    print('=' * 70)
    print('📚 BOOK COVER FETCHER')
    print('=' * 70)
    print(f'📖 Books to process: {len(BOOKS)}')
    print(f'🎯 Output directory: {OUTPUT_DIR}/')
    print(f'📄 Mapping file: {MAPPING_FILE}')
    print('=' * 70)
    print()

    ensure_directories()

    results = []
    success_count = 0
    total_size = 0
    start_time = time.time()

    for i, book in enumerate(BOOKS, 1):
        result = fetch_book_cover(book, i, len(BOOKS))
        results.append(result)

        if result['status'] == 'success':
            success_count += 1
            total_size += result.get('size', 0)

        # Progress every 20 books
        if i % 20 == 0:
            elapsed = time.time() - start_time
            rate = i / elapsed
            eta = (len(BOOKS) - i) / rate if rate > 0 else 0
            print(f'\n📊 Progress: {success_count}/{i} found ({success_count/i*100:.1f}%) | ETA: {eta:.0f}s')

        if i < len(BOOKS):
            time.sleep(REQUEST_DELAY)

    # Save results
    with open(MAPPING_FILE, 'w') as f:
        json.dump(results, f, indent=2)

    # Final summary
    elapsed = time.time() - start_time
    print('\n' + '=' * 70)
    print('✨ SUMMARY')
    print('=' * 70)
    print(f"📚 Total books: {len(BOOKS)}")
    print(f"✅ Covers found: {success_count} ({success_count/len(BOOKS)*100:.1f}%)")
    print(f"❌ Not found: {len(BOOKS) - success_count}")
    print(f"💾 Total size: {format_size(total_size)}")
    print(f"⏱️  Time taken: {elapsed:.1f} seconds")
    print(f"📁 Images: {OUTPUT_DIR}/")
    print(f"📄 Mapping: {MAPPING_FILE}")

    missing = [r for r in results if r['status'] == 'not-found']
    if missing:
        print(f"\n⚠️  Books without covers ({len(missing)}):")
        for book in missing[:15]:
            print(f"   • {book['title'][:50]}")
        if len(missing) > 15:
            print(f"   ... and {len(missing) - 15} more")

    print('\n✅ Done! Copy covers/ and book-covers.json to your Next.js project')
    print('=' * 70)

if __name__ == '__main__':
    import urllib.parse  # Import here for the quote function
    main()
