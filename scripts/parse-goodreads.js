const fs = require('fs');
const path = require('path');
const { parse } = require('csv-parse/sync');

// Configuration
const INPUT_FILE = path.join(__dirname, '../goodreads-export.csv');
const OUTPUT_FILE = path.join(__dirname, '../data/books.json');
const MIN_DATE = new Date('2023-01-01');

// Check if input file exists
if (!fs.existsSync(INPUT_FILE)) {
  console.error(`Error: Could not find ${INPUT_FILE}`);
  console.log('\nTo export your Goodreads data:');
  console.log('1. Go to Goodreads → My Books');
  console.log('2. Scroll to Tools section → Import/Export');
  console.log('3. Click "Export Library"');
  console.log('4. Save the CSV file as "goodreads-export.csv" in the project root');
  process.exit(1);
}

try {
  // Read CSV file
  const csvContent = fs.readFileSync(INPUT_FILE, 'utf-8');
  
  // Parse CSV (assuming first row is headers)
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
    relax_column_count: true
  });

  console.log(`Found ${records.length} total books in export`);

  // Filter and process books
  const filteredBooks = records
    .filter(book => {
      // Only include books that are marked as "read" in Exclusive Shelf (column S)
      const exclusiveShelf = book['Exclusive Shelf'] ? book['Exclusive Shelf'].trim().toLowerCase() : '';
      return exclusiveShelf === 'read';
    })
    .map(book => {
      // Parse date read
      let dateRead = null;
      let dateStr = (book['Date Read'] || '').trim();
      
      if (!dateStr || dateStr === '') {
        // If Date Read is empty, try Date Added as fallback
        dateStr = (book['Date Added'] || '').trim();
      }
      
      if (dateStr && dateStr !== '') {
        // Goodreads date format can vary: "YYYY/MM/DD", "YYYY-MM-DD", or just "YYYY"
        // Try YYYY/MM/DD format first
        const parts = dateStr.split('/');
        if (parts.length === 3) {
          dateRead = new Date(parseInt(parts[0]), parseInt(parts[1]) - 1, parseInt(parts[2]));
        } else {
          // Try standard date parsing
          dateRead = new Date(dateStr);
        }
        
        // If still invalid, try YYYY-MM-DD
        if (isNaN(dateRead.getTime())) {
          const parts2 = dateStr.split('-');
          if (parts2.length === 3) {
            dateRead = new Date(parseInt(parts2[0]), parseInt(parts2[1]) - 1, parseInt(parts2[2]));
          }
        }
      }

      // Skip if date is invalid or before minimum date (2023-01-01)
      if (!dateRead || isNaN(dateRead.getTime()) || dateRead < MIN_DATE) {
        return null;
      }

      // Get rating (convert to number)
      let rating = null;
      if (book['My Rating'] && book['My Rating'].trim()) {
        rating = parseInt(book['My Rating'].trim());
        if (isNaN(rating)) rating = null;
      }

      // Construct cover URL from ISBN
      let coverUrl = null;
      // Clean ISBN - remove quotes, equals signs, and other non-digit characters
      let isbn13 = book['ISBN13'] ? book['ISBN13'].replace(/[="]/g, '').replace(/[^0-9X]/g, '') : null;
      let isbn = book['ISBN'] ? book['ISBN'].replace(/[="]/g, '').replace(/[^0-9X]/g, '') : null;
      
      // Prefer ISBN13, fall back to ISBN
      const finalIsbn = (isbn13 && isbn13.length >= 10) ? isbn13 : (isbn && isbn.length >= 10 ? isbn : null);
      
      if (finalIsbn) {
        // Use Open Library Covers API
        coverUrl = `https://covers.openlibrary.org/b/isbn/${finalIsbn}-L.jpg?default=false`;
      }

      return {
        title: book['Title'] || 'Unknown Title',
        author: book['Author'] || 'Unknown Author',
        dateRead: dateRead.toISOString().split('T')[0], // YYYY-MM-DD format
        rating: rating,
        coverUrl: coverUrl,
        isbn: isbn13 || isbn
      };
    })
    .filter(book => book !== null)
    .sort((a, b) => {
      // Sort by date descending (most recent first)
      return new Date(b.dateRead) - new Date(a.dateRead);
    });

  console.log(`Filtered to ${filteredBooks.length} books read since ${MIN_DATE.toISOString().split('T')[0]}`);

  // Write to JSON file
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(filteredBooks, null, 2));
  console.log(`✅ Successfully wrote books to ${OUTPUT_FILE}`);

} catch (error) {
  console.error('Error processing Goodreads export:', error.message);
  process.exit(1);
}
