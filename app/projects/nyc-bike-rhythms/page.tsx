import { Metadata } from 'next'
import BikeRhythmsClient from './BikeRhythmsClient'
import storyMoments from '@/data/citibike/story-moments.json'
import type { StoryMoment } from '@/lib/types/citibike'

export const metadata: Metadata = {
  title: 'City in Motion | Aklavya',
  description: '46 million bike trips reveal how New York actually moves — a visual story built with Citi Bike data',
  openGraph: {
    title: 'City in Motion',
    description: '46 million bike trips. One year. What they reveal about New York.',
    images: ['/projects/nyc-bike-rhythms/og-image.jpg']
  }
}

export default function NYCBikeRhythms() {
  return (
    <BikeRhythmsClient
      storyMoments={storyMoments as StoryMoment[]}
    />
  )
}
