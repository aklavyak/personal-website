'use client'

import { useEffect, useState } from 'react'
import ScrollStory from '@/components/projects/nyc-bike-rhythms/ScrollStory'
import WeekExplorer from '@/components/projects/nyc-bike-rhythms/WeekExplorer'
import type { StoryMoment, NeighborhoodsGeoJSON, FlowData } from '@/lib/types/citibike'

type BikeRhythmsClientProps = {
  storyMoments: StoryMoment[]
}

export default function BikeRhythmsClient({
  storyMoments
}: BikeRhythmsClientProps) {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodsGeoJSON | null>(null)
  const [flows, setFlows] = useState<FlowData | undefined>(undefined)

  // Scroll to top when page loads (prevents browser scroll restoration)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Lazy load data after initial render
  useEffect(() => {
    // Load neighborhoods first (smaller, needed for map)
    fetch('/data/citibike/neighborhoods.json')
      .then(res => res.json())
      .then(data => setNeighborhoods(data))
      .catch(err => console.error('Failed to load neighborhoods:', err))

    // Load flows in parallel (larger, for visualizations)
    fetch('/data/citibike/flows.json')
      .then(res => res.json())
      .then(data => setFlows(data))
      .catch(err => console.error('Failed to load flows:', err))
  }, [])

  const hasData = neighborhoods && neighborhoods.features.length > 0

  return (
    <div className="bike-rhythms">
      {/* Hero with cover visual */}
      <section className="bike-rhythms-hero">
        <div className="hero-cover-visual">
          <div className="cover-gradient" />
          <div className="cover-lines">
            {[...Array(12)].map((_, i) => (
              <div key={i} className="cover-line" style={{
                animationDelay: `${i * 0.2}s`,
                top: `${15 + i * 6}%`,
                opacity: 0.15 + (i % 3) * 0.1
              }} />
            ))}
          </div>
          <div className="cover-glow" />
        </div>
        <div className="hero-content-overlay">
          <p className="bike-rhythms-eyebrow">A Visual Story</p>
          <h1 className="bike-rhythms-title">City in Motion</h1>
          <p className="bike-rhythms-subtitle">
            46 million bike trips. One year. What they reveal about New York.
          </p>
          <div className="bike-rhythms-scroll-hint">
            <span>Scroll to explore</span>
            <div className="scroll-arrow">↓</div>
          </div>
        </div>
      </section>

      {!hasData ? (
        <section className="bike-rhythms-loading">
          <div className="container">
            <div className="loading-card">
              <div className="loading-spinner" />
              <p>Loading 46 million trips...</p>
            </div>
          </div>
        </section>
      ) : (
        <>
          <ScrollStory
            moments={storyMoments}
            neighborhoods={neighborhoods}
            flows={flows}
          />

          {/* Week Explorer section - full screen, no intro to prevent extra scroll */}
          <section className="week-explorer-section" id="week-explorer">
            <WeekExplorer
              neighborhoods={neighborhoods}
              flows={flows}
            />
          </section>
        </>
      )}
    </div>
  )
}
