'use client'

import { formatBookDate } from '@/lib/utils'

type Book = {
  title: string
  author: string
  dateRead: string
  rating?: number
  coverUrl?: string
  isbn?: string
  bookId?: string
  goodreadsUrl?: string
}

type BooksGridProps = {
  books: Book[]
}

export default function BooksGrid({ books }: BooksGridProps) {
  const handleLocalCoverError = (e: React.SyntheticEvent<HTMLImageElement>, book: Book) => {
    // If local cover fails, try OpenLibrary
    const target = e.currentTarget
    if (target.src.includes('/covers/')) {
      if (book.isbn) {
        target.src = `https://covers.openlibrary.org/b/isbn/${book.isbn}-L.jpg`
      } else {
        // No ISBN, show placeholder
        target.style.display = 'none'
        const placeholder = target.nextElementSibling as HTMLElement
        if (placeholder) placeholder.style.display = 'flex'
      }
    } else {
      // All attempts failed, show placeholder
      target.style.display = 'none'
      const placeholder = target.nextElementSibling as HTMLElement
      if (placeholder) placeholder.style.display = 'flex'
    }
  }

  return (
    <div className="bookshelf-grid">
      {books.map((book, index) => (
        <a
          key={book.bookId || book.isbn || index}
          href={book.goodreadsUrl || '#'}
          target="_blank"
          rel="noopener noreferrer"
          className="bookshelf-item"
        >
          <div className="book-cover-wrapper">
            {book.bookId || book.coverUrl ? (
              <img
                src={
                  // Try local cover first using bookId
                  book.bookId ? `/covers/${book.bookId}.jpg` : book.coverUrl || ''
                }
                alt={`${book.title} by ${book.author}`}
                loading="lazy"
                className="book-cover-image"
                onError={(e) => handleLocalCoverError(e, book)}
              />
            ) : null}
            <div
              className="book-placeholder"
              style={{ display: book.bookId || book.coverUrl ? 'none' : 'flex' }}
            >
              <span className="book-placeholder-text">{book.title.charAt(0)}</span>
            </div>
            {book.rating && book.rating > 0 && (
              <div className="book-rating">
                {Array.from({ length: 5 }, (_, i) => (
                  <span key={i} className={`star ${i < book.rating! ? 'filled' : ''}`}>★</span>
                ))}
              </div>
            )}
            <div className="book-hover-overlay">
              <div className="book-hover-title">{book.title}</div>
              <div className="book-hover-author">{book.author}</div>
            </div>
          </div>
          <div className="book-info">
            <h3 className="book-title">{book.title}</h3>
            <p className="book-author">{book.author}</p>
            {book.dateRead && (
              <p className="book-date">{formatBookDate(book.dateRead)}</p>
            )}
          </div>
        </a>
      ))}
    </div>
  )
}
