export default function Footer() {
  const currentYear = new Date().getFullYear()

  return (
    <footer className="footer">
      <div className="container">
        <p>&copy; {currentYear} Aklavya. Built with <a href="https://nextjs.org/" target="_blank" rel="noopener">Next.js</a>.</p>
      </div>
    </footer>
  )
}
