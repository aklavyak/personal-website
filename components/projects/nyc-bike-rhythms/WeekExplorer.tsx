'use client'

import { useState, useEffect, useMemo, useRef } from 'react'
import dynamic from 'next/dynamic'
import type { NeighborhoodsGeoJSON, FlowData, FlowFilter, TimePeriod } from '@/lib/types/citibike'

// Dynamic import BikeMap - Mapbox GL JS is ~400KB, don't block initial load
const BikeMap = dynamic(() => import('./BikeMap'), {
  ssr: false,
  loading: () => <div className="bike-map-placeholder" />
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

      {/* Modern Control Panel */}
      <div className="week-explorer-controls">
        {/* Time Display */}
        <div className="controls-time">
          <div className="controls-day">{DAYS[currentDay]}</div>
          <div className="controls-hour">{formatHour(currentHour)}</div>
        </div>

        {/* Playback Controls */}
        <div className="controls-row">
          <button className="nav-btn" onClick={() => skipHours(-6)} aria-label="Back 6 hours">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 18V6l-8.5 6 8.5 6zm.5-6l8.5 6V6l-8.5 6z"/>
            </svg>
          </button>
          <button className="nav-btn" onClick={goToPrev} aria-label="Previous hour">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M15.41 7.41L14 6l-6 6 6 6 1.41-1.41L10.83 12z"/>
            </svg>
          </button>
          <button
            className={`play-btn ${isPlaying ? 'playing' : ''}`}
            onClick={() => setIsPlaying(!isPlaying)}
            aria-label={isPlaying ? 'Pause' : 'Play'}
          >
            {isPlaying ? (
              <span className="pause-icon">
                <span></span>
                <span></span>
              </span>
            ) : (
              <span className="play-icon"></span>
            )}
          </button>
          <button className="nav-btn" onClick={goToNext} aria-label="Next hour">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M8.59 16.59L10 18l6-6-6-6-1.41 1.41L13.17 12z"/>
            </svg>
          </button>
          <button className="nav-btn" onClick={() => skipHours(6)} aria-label="Forward 6 hours">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
              <path d="M4 18l8.5-6L4 6v12zm9-12v12l8.5-6L13 6z"/>
            </svg>
          </button>
        </div>

        {/* Progress Bar with Day Markers */}
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

        {/* Speed Control */}
        <div className="speed-control">
          <select
            className="speed-select"
            value={playbackSpeed}
            onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          >
            <option value={0.5}>0.5× speed</option>
            <option value={1}>1× speed</option>
            <option value={2}>2× speed</option>
            <option value={4}>4× speed</option>
          </select>
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
