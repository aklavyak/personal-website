'use client'

import { useState } from 'react'
import PhotoSlider from './PhotoSlider'
import PhotoLightbox from './PhotoLightbox'

type Photo = {
  src: string
  alt?: string
}

type ArchiveContentProps = {
  roll5Photos: Photo[]
  otherPhotos: Photo[]
}

export default function ArchiveContent({ roll5Photos, otherPhotos }: ArchiveContentProps) {
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [activeSlider, setActiveSlider] = useState<'roll5' | 'other'>('roll5')

  const activePhotos = activeSlider === 'roll5' ? roll5Photos : otherPhotos

  const handlePhotoClick = (slider: 'roll5' | 'other', index: number) => {
    setActiveSlider(slider)
    setCurrentIndex(index)
    setLightboxOpen(true)
  }

  const handleNavigate = (index: number) => {
    setCurrentIndex(index)
  }

  const handleClose = () => {
    setLightboxOpen(false)
  }

  return (
    <>
      <section className="archive-sliders">
        <div className="container">
          <PhotoSlider
            photos={roll5Photos}
            title="2020 in B&W"
            descriptor=""
            onPhotoClick={(index) => handlePhotoClick('roll5', index)}
          />

          <PhotoSlider
            photos={otherPhotos}
            title="And More"
            descriptor=""
            onPhotoClick={(index) => handlePhotoClick('other', index)}
          />
        </div>
      </section>

      <PhotoLightbox
        photos={activePhotos}
        isOpen={lightboxOpen}
        currentIndex={currentIndex}
        onClose={handleClose}
        onNavigate={handleNavigate}
      />
    </>
  )
}
