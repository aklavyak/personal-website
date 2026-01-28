'use client'

import { useEffect, useCallback } from 'react'

type Photo = {
  src: string
  alt?: string
}

type PhotoLightboxProps = {
  photos: Photo[]
  isOpen: boolean
  currentIndex: number
  onClose: () => void
  onNavigate: (index: number) => void
}

export default function PhotoLightbox({
  photos,
  isOpen,
  currentIndex,
  onClose,
  onNavigate
}: PhotoLightboxProps) {
  const handlePrev = useCallback(() => {
    const newIndex = currentIndex === 0 ? photos.length - 1 : currentIndex - 1
    onNavigate(newIndex)
  }, [currentIndex, photos.length, onNavigate])

  const handleNext = useCallback(() => {
    const newIndex = currentIndex === photos.length - 1 ? 0 : currentIndex + 1
    onNavigate(newIndex)
  }, [currentIndex, photos.length, onNavigate])

  const handleKeyDown = useCallback((e: KeyboardEvent) => {
    if (!isOpen) return

    switch (e.key) {
      case 'Escape':
        onClose()
        break
      case 'ArrowLeft':
        handlePrev()
        break
      case 'ArrowRight':
        handleNext()
        break
    }
  }, [isOpen, onClose, handlePrev, handleNext])

  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown)
    return () => document.removeEventListener('keydown', handleKeyDown)
  }, [handleKeyDown])

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = ''
    }
    return () => {
      document.body.style.overflow = ''
    }
  }, [isOpen])

  if (!isOpen || !photos[currentIndex]) return null

  const currentPhoto = photos[currentIndex]

  return (
    <div className="lightbox-overlay" onClick={onClose}>
      <div className="lightbox-content" onClick={(e) => e.stopPropagation()}>
        <button
          className="lightbox-close"
          onClick={onClose}
          aria-label="Close lightbox"
        >
          <span>&times;</span>
        </button>

        <button
          className="lightbox-nav prev"
          onClick={handlePrev}
          aria-label="Previous photo"
        >
          <span>&#8249;</span>
        </button>

        <img
          src={currentPhoto.src}
          alt={currentPhoto.alt || ''}
          className="lightbox-image"
        />

        <button
          className="lightbox-nav next"
          onClick={handleNext}
          aria-label="Next photo"
        >
          <span>&#8250;</span>
        </button>

        <div className="lightbox-counter">
          {currentIndex + 1} / {photos.length}
        </div>
      </div>
    </div>
  )
}
