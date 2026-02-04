'use client'

import { useEffect, useState } from 'react'
import ScrollStory from '@/components/projects/nyc-bike-rhythms/ScrollStory'
import WeekExplorer from '@/components/projects/nyc-bike-rhythms/WeekExplorer'
import type { StoryMoment, NeighborhoodsGeoJSON, FlowData } from '@/lib/types/citibike'

type BikeRhythmsClientProps = {
  storyMoments: StoryMoment[]
}

// Empty placeholder for immediate render
const EMPTY_NEIGHBORHOODS: NeighborhoodsGeoJSON = {
  type: 'FeatureCollection',
  features: []
}

export default function BikeRhythmsClient({
  storyMoments
}: BikeRhythmsClientProps) {
  const [neighborhoods, setNeighborhoods] = useState<NeighborhoodsGeoJSON>(EMPTY_NEIGHBORHOODS)
  const [flows, setFlows] = useState<FlowData | undefined>(undefined)

  // Scroll to top when page loads (prevents browser scroll restoration)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Load data - preload links in page.tsx start fetch early
  useEffect(() => {
    Promise.all([
      fetch('/data/citibike/neighborhoods.json').then(res => res.json()),
      fetch('/data/citibike/flows.json').then(res => res.json())
    ])
      .then(([neighborhoodsData, flowsData]) => {
        setNeighborhoods(neighborhoodsData)
        setFlows(flowsData)
      })
      .catch(err => console.error('Failed to load data:', err))
  }, [])

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

      {/* Always render components - map shows dark background while loading */}
      <ScrollStory
        moments={storyMoments}
        neighborhoods={neighborhoods}
        flows={flows}
      />

      {/* Week Explorer section */}
      <section className="week-explorer-section" id="week-explorer">
        <WeekExplorer
          neighborhoods={neighborhoods}
          flows={flows}
        />
      </section>
    </div>
  )
}
