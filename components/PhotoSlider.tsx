'use client'

import { useRef, useState, useEffect } from 'react'

type Photo = {
  src: string
  alt?: string
}

type PhotoSliderProps = {
  photos: Photo[]
  title: string
  descriptor: string
  onPhotoClick?: (index: number) => void
}

export default function PhotoSlider({ photos, title, descriptor, onPhotoClick }: PhotoSliderProps) {
  const sliderRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (!sliderRef.current) return
    const { scrollLeft, scrollWidth, clientWidth } = sliderRef.current
    setCanScrollLeft(scrollLeft > 10)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
  }

  useEffect(() => {
    checkScrollability()
    window.addEventListener('resize', checkScrollability)
    return () => window.removeEventListener('resize', checkScrollability)
  }, [])

  const scroll = (direction: 'left' | 'right') => {
    if (!sliderRef.current) return
    const scrollAmount = sliderRef.current.clientWidth * 0.7
    sliderRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth'
    })
  }

  return (
    <div className="photo-slider-section">
      <div className="slider-header">
        <h3 className="slider-title">{title}</h3>
        {descriptor && <p className="slider-descriptor">{descriptor}</p>}
      </div>
      <div className="slider-container">
        {canScrollLeft && (
          <button
            className="slider-arrow left"
            onClick={() => scroll('left')}
            aria-label="Scroll left"
          >
            <span>&#8249;</span>
          </button>
        )}
        <div
          ref={sliderRef}
          className="slider-track"
          onScroll={checkScrollability}
        >
          {photos.map((photo, idx) => (
            <div
              key={idx}
              className="slider-item"
              onClick={() => onPhotoClick?.(idx)}
              style={{ cursor: onPhotoClick ? 'pointer' : 'default' }}
            >
              <img src={photo.src} alt={photo.alt || ''} loading="lazy" />
            </div>
          ))}
        </div>
        {canScrollRight && (
          <button
            className="slider-arrow right"
            onClick={() => scroll('right')}
            aria-label="Scroll right"
          >
            <span>&#8250;</span>
          </button>
        )}
      </div>
    </div>
  )
}
