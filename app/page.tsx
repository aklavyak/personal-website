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
          <div className="section-header">
            <h2 className="section-title">Projects</h2>
            <Link href="/projects" className="section-link">View All →</Link>
          </div>
          <div className="features-grid">
            <Link href="/projects/nyc-bike-rhythms" className="feature-card feature-card-project">
              <div className="feature-project-visual">
                <div className="feature-gradient-bg" />
                <span className="feature-stat">46M</span>
              </div>
              <h3>City in Motion</h3>
              <p>How 46 million Citi Bike trips reveal New York&apos;s hidden rhythms</p>
              <span className="feature-link">Explore →</span>
            </Link>
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
