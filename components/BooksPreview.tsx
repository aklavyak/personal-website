'use client'

import Link from 'next/link'
import books from '@/data/books_latest.json'

type Book = {
  title: string
  author: string
  dateRead: string
  rating: number
  isbn: string
  bookId: string
  goodreadsUrl: string | null
  coverUrl: string | null
}

const featuredBookIds = ['13536357', '59452222', '13651', '625094', '12172', '7588', '53972214']

export default function BooksPreview() {
  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement>, book: Book) => {
    const target = e.currentTarget

    // If we're currently trying local cover and it fails, try OpenLibrary
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
      // OpenLibrary failed, show placeholder
      target.style.display = 'none'
      const placeholder = target.nextElementSibling as HTMLElement
      if (placeholder) placeholder.style.display = 'flex'
    }
  }

  return (
    <section className="books-preview">
      <div className="container">
        <div className="section-header">
          <h2 className="section-title">Books</h2>
          <Link href="/books/" className="section-link">
            See More →
          </Link>
        </div>
        <div className="bookshelf">
          <div className="bookshelf-base"></div>
          {(books as Book[])
            .filter(book => featuredBookIds.includes(book.bookId))
            .map((book) => (
            <a
              key={book.bookId || book.isbn}
              href={book.goodreadsUrl || '#'}
              target="_blank"
              rel="noopener noreferrer"
              className="bookshelf-book"
            >
              <div className="book-spine">
                <div className="book-cover-wrapper">
                  {book.bookId || book.coverUrl ? (
                    <img
                      src={
                        // Try local cover first using bookId
                        book.bookId ? `/covers/${book.bookId}.jpg` : book.coverUrl || ''
                      }
                      alt={book.title}
                      loading="eager"
                      className="book-cover"
                      onError={(e) => handleImageError(e, book)}
                    />
                  ) : null}
                  <div
                    className="book-placeholder"
                    style={{ display: book.bookId || book.coverUrl ? 'none' : 'flex' }}
                  >
                    {book.title[0]}
                  </div>
                </div>
                <div className="book-info">
                  <div className="book-title">{book.title}</div>
                  <div className="book-author">{book.author}</div>
                </div>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
