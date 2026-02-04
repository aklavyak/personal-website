'use client'

import { useRef, useState, useEffect, useCallback } from 'react'
import dynamic from 'next/dynamic'
import StoryMoment from './StoryMoment'
import type { StoryMoment as StoryMomentType, NeighborhoodsGeoJSON, FlowData } from '@/lib/types/citibike'

// Dynamic import BikeMap - Mapbox GL JS is ~400KB, don't block initial load
const BikeMap = dynamic(() => import('./BikeMap'), {
  ssr: false,
  loading: () => <div className="bike-map-placeholder" />
})

type ScrollStoryProps = {
  moments: StoryMomentType[]
  neighborhoods: NeighborhoodsGeoJSON
  flows?: FlowData
}

export default function ScrollStory({ moments, neighborhoods, flows }: ScrollStoryProps) {
  const [activeIndex, setActiveIndex] = useState(0)
  const [isHidden, setIsHidden] = useState(false)
  const momentRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    const observers: IntersectionObserver[] = []

    momentRefs.current.forEach((ref, index) => {
      if (!ref) return

      const observer = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            // Trigger when element enters the center zone of viewport
            if (entry.isIntersecting) {
              setActiveIndex(index)
            }
          })
        },
        {
          root: null,
          rootMargin: '-35% 0px -35% 0px', // Center 30% of viewport triggers
          threshold: 0.1 // Trigger early
        }
      )

      observer.observe(ref)
      observers.push(observer)
    })

    return () => {
      observers.forEach((observer) => observer.disconnect())
    }
  }, [moments])

  // Hide scroll-story-map when week-explorer section is visible
  useEffect(() => {
    const weekExplorer = document.getElementById('week-explorer')
    if (!weekExplorer) return

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          setIsHidden(entry.isIntersecting)
        })
      },
      { threshold: 0.1 }
    )

    observer.observe(weekExplorer)
    return () => observer.disconnect()
  }, [])

  const setMomentRef = useCallback((el: HTMLDivElement | null, index: number) => {
    momentRefs.current[index] = el
  }, [])

  const activeMoment = moments[activeIndex]
  const hasSplitView = !!activeMoment.splitView

  return (
    <div className={`scroll-story ${hasSplitView ? 'has-split-view' : ''}`}>
      <div className={`scroll-story-map ${hasSplitView ? 'split-view' : ''} ${isHidden ? 'hidden' : ''}`}>
        {hasSplitView && activeMoment.splitView ? (
          <>
            <div className="split-map-left">
              <div className="split-map-label">{activeMoment.splitView.left.label}</div>
              <BikeMap
                mapState={activeMoment.mapState}
                neighborhoods={neighborhoods}
                highlightNeighborhoods={[]}
                flows={flows}
                flowFilter={activeMoment.splitView.left.flowFilter}
                flowColor={activeMoment.splitView.left.flowColor}
              />
            </div>
            <div className="split-map-right">
              <div className="split-map-label">{activeMoment.splitView.right.label}</div>
              <BikeMap
                mapState={activeMoment.mapState}
                neighborhoods={neighborhoods}
                highlightNeighborhoods={[]}
                flows={flows}
                flowFilter={activeMoment.splitView.right.flowFilter}
                flowColor={activeMoment.splitView.right.flowColor}
              />
            </div>
          </>
        ) : (
          <BikeMap
            mapState={activeMoment.mapState}
            neighborhoods={neighborhoods}
            highlightNeighborhoods={activeMoment.highlightNeighborhoods}
            flows={flows}
            flowFilter={activeMoment.flowFilter}
            flowColor={activeMoment.flowColor || '#FF9500'}
          />
        )}
      </div>

      <div className="scroll-story-content">
        {moments.map((moment, index) => (
          <div
            key={moment.id}
            ref={(el) => setMomentRef(el, index)}
          >
            <StoryMoment
              moment={moment}
              isActive={index === activeIndex}
              index={index}
            />
          </div>
        ))}
      </div>
    </div>
  )
}
