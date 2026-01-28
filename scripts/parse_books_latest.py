#!/usr/bin/env python3
"""
Parse Books_Latest.xlsx to JSON format
Converts Excel file to books_latest.json for use in the website
"""

import pandas as pd
import json
from pathlib import Path

def parse_books_latest():
    # Read Excel file
    excel_file = 'Books_Latest.xlsx'

    if not Path(excel_file).exists():
        print(f"❌ Error: {excel_file} not found")
        return

    print(f"📖 Reading {excel_file}...")
    df = pd.read_excel(excel_file)

    print(f"📊 Found {len(df)} books")

    # Convert to list of dictionaries
    books = []
    for idx, row in df.iterrows():
        # Get ISBN - try ISBN13 first, fallback to ISBN
        # Handle as string to avoid float conversion adding ".0" suffix
        isbn_raw = row.get('ISBN13', row.get('ISBN', ''))
        if pd.notna(isbn_raw) and isbn_raw != '':
            # Convert to string and remove any .0 suffix from float conversion
            isbn = str(int(float(isbn_raw))) if str(isbn_raw).replace('.', '').isdigit() else str(isbn_raw).strip()
        else:
            isbn = ''

        # Get date read
        date_read = row.get('Date Read', '')
        if pd.notna(date_read):
            # Convert to string if it's a datetime
            date_str = str(date_read)
            if ' ' in date_str:
                date_read = date_str.split()[0]
            else:
                date_read = date_str
        else:
            date_read = ''

        # Get rating
        rating = row.get('Rating', row.get('My Rating', 0))
        if pd.notna(rating):
            try:
                rating = int(float(rating))
            except:
                rating = 0
        else:
            rating = 0

        # Get Book ID (for Goodreads URL and local cover lookup)
        book_id_raw = row.get('Book Id', '')
        if pd.notna(book_id_raw) and book_id_raw != '':
            book_id = str(int(float(book_id_raw))) if str(book_id_raw).replace('.', '').isdigit() else str(book_id_raw).strip()
        else:
            book_id = ''

        book = {
            'title': str(row.get('Title', '')).strip(),
            'author': str(row.get('Author', '')).strip(),
            'dateRead': date_read,
            'rating': rating,
            'isbn': isbn,
            'bookId': book_id,
            'goodreadsUrl': f'https://www.goodreads.com/book/show/{book_id}' if book_id else None,
            'coverUrl': f'https://covers.openlibrary.org/b/isbn/{isbn}-L.jpg' if isbn else None
        }

        books.append(book)

    # Sort by date read (most recent first)
    books.sort(key=lambda x: x['dateRead'] if x['dateRead'] else '0000-00-00', reverse=True)

    # Save to JSON
    output_file = 'data/books_latest.json'
    Path('data').mkdir(exist_ok=True)

    with open(output_file, 'w') as f:
        json.dump(books, f, indent=2)

    print(f"✅ Converted {len(books)} books to {output_file}")
    print(f"📚 Most recent book: {books[0]['title'] if books else 'None'}")
    print(f"📅 Date read: {books[0]['dateRead'] if books else 'None'}")

    # Count books with ISBNs and Book IDs
    books_with_isbn = sum(1 for b in books if b['isbn'])
    books_with_id = sum(1 for b in books if b['bookId'])
    print(f"🔢 Books with ISBN: {books_with_isbn}/{len(books)} ({books_with_isbn*100//len(books) if books else 0}%)")
    print(f"🆔 Books with Book ID: {books_with_id}/{len(books)} ({books_with_id*100//len(books) if books else 0}%)")

if __name__ == '__main__':
    parse_books_latest()
