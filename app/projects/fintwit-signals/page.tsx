import { Metadata } from 'next'
import FintwitClient from './FintwitClient'

export const metadata: Metadata = {
  title: 'Fintwit Signal Intelligence | Aklavya',
  description: 'An automated system that tracks financial Twitter accounts, extracts stock calls, and ranks sources by verified performance against the S&P 500.',
  openGraph: {
    title: 'Fintwit Signal Intelligence',
    description: 'Separating signal from noise on financial Twitter — with data.',
  }
}

export default function FintwitSignals() {
  return <FintwitClient />
}
