'use client'

import { useEffect, useState, useRef } from 'react'
import ScrollStory from '@/components/projects/nyc-bike-rhythms/ScrollStory'
import WeekExplorer from '@/components/projects/nyc-bike-rhythms/WeekExplorer'
import HeroAnimation from '@/components/projects/nyc-bike-rhythms/HeroAnimation'
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
  const [shouldLoadMap, setShouldLoadMap] = useState(false)
  const heroRef = useRef<HTMLElement>(null)

  // Scroll to top when page loads (prevents browser scroll restoration)
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])

  // Scroll-triggered loading - start loading map data when user scrolls
  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 100) {
        setShouldLoadMap(true)
        window.removeEventListener('scroll', handleScroll)
      }
    }
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  // Load data only when scroll trigger fires
  useEffect(() => {
    if (!shouldLoadMap) return

    Promise.all([
      fetch('/data/citibike/neighborhoods.json').then(res => res.json()),
      fetch('/data/citibike/flows.json').then(res => res.json())
    ])
      .then(([neighborhoodsData, flowsData]) => {
        setNeighborhoods(neighborhoodsData)
        setFlows(flowsData)
      })
      .catch(err => console.error('Failed to load data:', err))
  }, [shouldLoadMap])

  return (
    <div className="bike-rhythms">
      {/* Hero with animated SVG trip visualization - loads instantly */}
      <section className="bike-rhythms-hero" ref={heroRef}>
        <div className="hero-cover-visual">
          <div className="cover-gradient" />
          <HeroAnimation />
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
