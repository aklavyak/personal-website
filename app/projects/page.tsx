import Link from 'next/link'

export const metadata = {
  title: 'Projects | Aklavya',
  description: 'My projects and work',
}

export default function Projects() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Projects</h1>
        </div>
      </section>

      <section className="projects-section">
        <div className="container">
          {/* Featured Project - City in Motion */}
          <Link href="/projects/nyc-bike-rhythms" className="featured-project-card">
            <div className="featured-project-visual">
              <div className="flow-lines">
                <svg viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="flowGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#FF9500" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#FF9500" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#FF9500" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path d="M0,100 Q100,20 200,100 T400,100" stroke="url(#flowGrad)" strokeWidth="2" fill="none" className="flow-path" />
                  <path d="M0,140 Q150,60 250,120 T400,80" stroke="url(#flowGrad)" strokeWidth="1.5" fill="none" className="flow-path delay-1" />
                  <path d="M0,60 Q80,120 180,80 T400,120" stroke="url(#flowGrad)" strokeWidth="1" fill="none" className="flow-path delay-2" />
                </svg>
              </div>
              <div className="featured-project-stat">
                <span className="stat-number">46M</span>
                <span className="stat-label">trips</span>
              </div>
            </div>
            <div className="featured-project-content">
              <span className="featured-tag">Featured</span>
              <h2 className="featured-project-title">City in Motion</h2>
              <p className="featured-project-description">
                Looking at how NYC moves: ebbs &amp; flows
              </p>
              <span className="featured-cta">Read the story →</span>
            </div>
          </Link>

          {/* The Daily Finance Brief */}
          <Link href="/projects/fintwit-signals" className="featured-project-card featured-project-card-green" style={{ marginTop: '2rem' }}>
            <div className="featured-project-visual">
              <div className="flow-lines">
                <svg viewBox="0 0 400 200" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="priceGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#00C853" stopOpacity="0.1" />
                      <stop offset="50%" stopColor="#00C853" stopOpacity="0.6" />
                      <stop offset="100%" stopColor="#00C853" stopOpacity="0.9" />
                    </linearGradient>
                  </defs>
                  <path d="M0,170 L40,160 L80,150 L120,155 L160,125 L200,110 L240,90 L280,96 L320,65 L360,50 L400,30" stroke="url(#priceGrad)" strokeWidth="2" fill="none" className="flow-path" />
                  <path d="M0,150 L50,145 L100,152 L150,140 L200,138 L250,130 L300,128 L350,120 L400,112" stroke="url(#priceGrad)" strokeWidth="1.5" fill="none" className="flow-path delay-1" />
                  <path d="M0,130 L60,138 L120,128 L180,145 L240,150 L300,142 L360,158 L400,165" stroke="url(#priceGrad)" strokeWidth="1" fill="none" className="flow-path delay-2" />
                </svg>
              </div>
              <div className="featured-project-stat">
                <span className="stat-number">1,956</span>
                <span className="stat-label">stock calls</span>
              </div>
            </div>
            <div className="featured-project-content">
              <h2 className="featured-project-title">The Daily Finance Brief</h2>
              <p className="featured-project-description">
                How good are Twitter&apos;s stock-picking pros? And should we actually trade their calls?
              </p>
              <span className="featured-cta">View project →</span>
            </div>
          </Link>
        </div>
      </section>
    </>
  )
}
