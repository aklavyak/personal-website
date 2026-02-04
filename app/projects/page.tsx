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
          <p className="page-subtitle">Work, experiments, and side projects</p>
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
                46 million bike trips reveal how New York actually moves. A scrollytelling exploration of Citi Bike data.
              </p>
              <span className="featured-cta">Explore the story →</span>
            </div>
          </Link>
        </div>
      </section>
    </>
  )
}
