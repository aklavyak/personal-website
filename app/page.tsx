import Link from 'next/link'
import BooksPreview from '@/components/BooksPreview'
import TypeWriter from '@/components/TypeWriter'

export default function Home() {
  return (
    <>
      <section className="hero">
        <div className="container">
          <div className="hero-content">
            <h1 className="hero-title">
              <TypeWriter text="Greetings, I'm Aklavya" speed={80} />
            </h1>
          </div>
        </div>
      </section>

      <section className="features">
        <div className="container">
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">✎</div>
              <h3>Projects</h3>
              <p>Explore my work and side projects. Coming soon with detailed case studies and code.</p>
              <Link href="/projects/" className="feature-link">View Projects →</Link>
            </div>
          </div>
        </div>
      </section>

      <BooksPreview />

      <section className="visual-archive-preview">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Visual Archive</h2>
            <Link href="/archive" className="section-link">View All →</Link>
          </div>
          <div className="archive-preview-grid">
            <div className="archive-preview-item">
              <img src="/photos/000322010014.jpg" alt="" loading="lazy" />
            </div>
            <div className="archive-preview-item">
              <img src="/photos/000491850011.jpg" alt="" loading="lazy" />
            </div>
            <div className="archive-preview-item">
              <img src="/photos/000561870029.jpg" alt="" loading="lazy" />
            </div>
            <div className="archive-preview-item">
              <img src="/photos/000561870037.jpg" alt="" loading="lazy" />
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
