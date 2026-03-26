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
            <Link href="/projects/fintwit-signals" className="feature-card feature-card-project">
              <div className="feature-project-visual">
                <div className="feature-gradient-bg" style={{ background: 'linear-gradient(135deg, rgba(0,200,83,0.06) 0%, transparent 100%)' }} />
                <svg className="feature-svg-visual" viewBox="0 0 200 60" fill="none">
                  <path d="M0,45 L20,42 L40,38 L60,40 L80,30 L100,25 L120,20 L140,22 L160,15 L180,12 L200,8" stroke="#00C853" strokeWidth="2" strokeLinecap="round" opacity="0.6" />
                  <path d="M0,50 L200,50" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />
                  <circle cx="120" cy="20" r="3" fill="#00C853" opacity="0.8" />
                  <circle cx="180" cy="12" r="3" fill="#00C853" opacity="0.8" />
                </svg>
              </div>
              <h3>The Daily Finance Brief</h3>
              <p>Crowdsourcing the next trade from finance twitter</p>
              <span className="feature-link">View project →</span>
            </Link>
            <Link href="/projects/nyc-bike-rhythms" className="feature-card feature-card-project">
              <div className="feature-project-visual">
                <div className="feature-gradient-bg" />
                <svg className="feature-svg-visual" viewBox="0 0 200 60" fill="none">
                  <path d="M20,50 Q40,30 60,35 T100,20 T140,30 T180,15" stroke="#FF9500" strokeWidth="2" strokeLinecap="round" opacity="0.5" />
                  <path d="M30,45 Q70,15 110,25 T170,10" stroke="#FF9500" strokeWidth="1.5" strokeLinecap="round" opacity="0.3" />
                  <circle cx="60" cy="35" r="2.5" fill="#FF9500" opacity="0.6" />
                  <circle cx="140" cy="30" r="2.5" fill="#FF9500" opacity="0.6" />
                  <circle cx="180" cy="15" r="2.5" fill="#FF9500" opacity="0.6" />
                </svg>
              </div>
              <h3>City in Motion</h3>
              <p>Visualizing the 46 million Citi Bike trips from 2025</p>
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
