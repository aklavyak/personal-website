import { Metadata } from 'next'
import BikeRhythmsClient from './BikeRhythmsClient'
import storyMoments from '@/data/citibike/story-moments.json'
import weeklyPatterns from '@/data/citibike/weekly-patterns.json'
import neighborhoods from '@/data/citibike/neighborhoods.json'
import type { StoryMoment, NeighborhoodsGeoJSON, NeighborhoodPattern, FlowData } from '@/lib/types/citibike'

// Dynamically import flows if it exists
let flows: FlowData | undefined
try {
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  flows = require('@/data/citibike/flows.json') as FlowData
} catch {
  flows = undefined
}

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
      weeklyPatterns={weeklyPatterns as Record<string, NeighborhoodPattern>}
      neighborhoods={neighborhoods as NeighborhoodsGeoJSON}
      flows={flows}
    />
  )
}
