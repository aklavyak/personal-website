import booksData from '@/data/books_latest.json'
import BooksGrid from '@/components/BooksGrid'

export const metadata = {
  title: 'Books | Aklavya',
  description: 'some recent reads',
}

export default function Books() {
  const books = booksData as Array<{
    title: string
    author: string
    dateRead: string
    rating?: number
    coverUrl?: string
    isbn?: string
    bookId?: string
    goodreadsUrl?: string
  }>

  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Books</h1>
          <p className="page-subtitle">some recent reads</p>
        </div>
      </section>

      <section className="books-section">
        <div className="container">
          {books && books.length > 0 ? (
            <BooksGrid books={books} />
          ) : (
            <div className="empty-state">
              <div className="empty-icon">📖</div>
              <h2>No Books Yet</h2>
              <p>Once you export your Goodreads data and run the parsing script, your books will appear here.</p>
              <p className="empty-hint">Run <code>npm run parse-books</code> after exporting your Goodreads CSV.</p>
            </div>
          )}
        </div>
      </section>
    </>
  )
}
