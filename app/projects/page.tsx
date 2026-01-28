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
          <p className="page-subtitle">A collection of my work, experiments, and side projects</p>
        </div>
      </section>

      <section className="projects-section">
        <div className="container">
          <div className="empty-state">
            <div className="empty-icon">🚧</div>
            <h2>Projects Coming Soon</h2>
            <p>I&apos;m currently working on some exciting projects. Check back soon to see what I&apos;ve been building.</p>
          </div>
        </div>
      </section>
    </>
  )
}
