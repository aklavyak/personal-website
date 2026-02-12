'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { NeighborhoodsGeoJSON, FlowData, FlowFilter, TimePeriod } from '@/lib/types/citibike'

// Dynamic import BikeMap - Mapbox GL JS needs window object
const BikeMap = dynamic(() => import('./BikeMap'), {
  ssr: false
})

type WeekExplorerProps = {
  neighborhoods: NeighborhoodsGeoJSON
  flows?: FlowData
}

const DAYS = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday']
const DAY_ABBREV = ['M', 'T', 'W', 'T', 'F', 'S', 'S']
const HOURS_PER_DAY = 24
const TOTAL_HOURS = 7 * HOURS_PER_DAY

function formatHour(hour: number): string {
  const ampm = hour >= 12 ? 'PM' : 'AM'
  const displayHour = hour === 0 ? 12 : hour > 12 ? hour - 12 : hour
  return `${displayHour}:00 ${ampm}`
}

function getTimePeriod(hour: number): TimePeriod {
  if (hour >= 6 && hour < 10) return 'morning_rush'
  if (hour >= 10 && hour < 12) return 'late_morning'
  if (hour >= 12 && hour < 16) return 'midday'
  if (hour >= 16 && hour < 20) return 'evening_rush'
  if (hour >= 20 && hour < 24) return 'night'
  return 'late_night'
}

function getColorForHour(hour: number): string {
  if (hour >= 6 && hour < 10) return '#FF9500'
  if (hour >= 10 && hour < 12) return '#FF6B35'
  if (hour >= 12 && hour < 16) return '#FFD93D'
  if (hour >= 16 && hour < 20) return '#9B59B6'
  if (hour >= 20 && hour < 24) return '#3498DB'
  return '#1A1A2E'
}

export default function WeekExplorer({ neighborhoods, flows }: WeekExplorerProps) {
  const progressRef = useRef<HTMLDivElement>(null)
  const [currentSlot, setCurrentSlot] = useState(8)
  const [isPlaying, setIsPlaying] = useState(false)
  const [playbackSpeed, setPlaybackSpeed] = useState(1)

  const currentDay = Math.floor(currentSlot / HOURS_PER_DAY)
  const currentHour = currentSlot % HOURS_PER_DAY

  const flowFilter = useMemo((): FlowFilter => {
    const timePeriod = getTimePeriod(currentHour)
    const dayType = currentDay < 5 ? 'weekday' : 'weekend'
    return {
      timePeriods: [timePeriod],
      dayType: dayType as 'weekday' | 'weekend',
      direction: 'all'
    }
  }, [currentDay, currentHour])

  const flowColor = useMemo(() => getColorForHour(currentHour), [currentHour])

  // Auto-play
  useEffect(() => {
    if (!isPlaying) return
    const interval = setInterval(() => {
      setCurrentSlot((prev) => (prev + 1) % TOTAL_HOURS)
    }, 200 / playbackSpeed)
    return () => clearInterval(interval)
  }, [isPlaying, playbackSpeed])

  // Navigation
  const goToPrev = () => setCurrentSlot((prev) => Math.max(0, prev - 1))
  const goToNext = () => setCurrentSlot((prev) => Math.min(TOTAL_HOURS - 1, prev + 1))
  const skipHours = (hours: number) => setCurrentSlot((prev) =>
    Math.max(0, Math.min(TOTAL_HOURS - 1, prev + hours))
  )

  // Click on progress bar to jump
  const handleProgressClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressRef.current) return
    const rect = progressRef.current.getBoundingClientRect()
    const percent = (e.clientX - rect.left) / rect.width
    const newSlot = Math.round(percent * (TOTAL_HOURS - 1))
    setCurrentSlot(Math.max(0, Math.min(TOTAL_HOURS - 1, newSlot)))
  }

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return
      switch (e.key) {
        case ' ':
          e.preventDefault()
          setIsPlaying(prev => !prev)
          break
        case 'ArrowLeft':
          e.preventDefault()
          e.shiftKey ? skipHours(-6) : goToPrev()
          break
        case 'ArrowRight':
          e.preventDefault()
          e.shiftKey ? skipHours(6) : goToNext()
          break
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [])

  const progressPercent = (currentSlot / (TOTAL_HOURS - 1)) * 100

  return (
    <div className="week-explorer">
      <div className="week-explorer-map">
        <BikeMap
          mapState={{
            center: [-73.98, 40.73],
            zoom: 12,
            bearing: 0,
            pitch: 20
          }}
          neighborhoods={neighborhoods}
          flows={flows}
          flowFilter={flowFilter}
          flowColor={flowColor}
        />
      </div>

      {/* Minimal Control Bar */}
      <div className="week-explorer-controls">
        {/* Top row: time + controls + speed */}
        <div className="controls-top">
          <div className="controls-time">
            <span className="controls-day">{DAYS[currentDay]}</span>
            <span className="controls-hour">{formatHour(currentHour)}</span>
          </div>

          <div className="controls-row">
            <button className="nav-btn" onClick={goToPrev} aria-label="Previous hour">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              className={`play-btn ${isPlaying ? 'playing' : ''}`}
              onClick={() => setIsPlaying(!isPlaying)}
              aria-label={isPlaying ? 'Pause' : 'Play'}
            >
              {isPlaying ? (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg width="18" height="18" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M8 5v14l11-7z" />
                </svg>
              )}
            </button>
            <button className="nav-btn" onClick={goToNext} aria-label="Next hour">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>
          </div>

          <button
            className="speed-chip"
            onClick={() => {
              const speeds = [0.5, 1, 2, 4]
              const idx = speeds.indexOf(playbackSpeed)
              setPlaybackSpeed(speeds[(idx + 1) % speeds.length])
            }}
          >
            {playbackSpeed}×
          </button>
        </div>

        {/* Progress Bar */}
        <div className="progress-container">
          <div className="progress-track" ref={progressRef} onClick={handleProgressClick}>
            <div className="progress-fill" style={{ width: `${progressPercent}%` }}>
              <span className="progress-thumb"></span>
            </div>
          </div>
          <div className="progress-days">
            {DAY_ABBREV.map((d, i) => (
              <button
                key={i}
                className={`progress-day ${i === currentDay ? 'active' : ''}`}
                onClick={() => setCurrentSlot(i * HOURS_PER_DAY + 8)}
                aria-label={`Jump to ${DAYS[i]}`}
              >
                {d}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Attribution */}
      <div className="week-explorer-attribution">
        Data: <a href="https://citibikenyc.com/system-data" target="_blank" rel="noopener noreferrer">
          Citi Bike System Data
        </a> | 2025 | Built with Mapbox
      </div>
    </div>
  )
}
