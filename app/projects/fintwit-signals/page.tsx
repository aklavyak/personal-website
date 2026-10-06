import { Metadata } from 'next'
import FintwitClient from './FintwitClient'

export const metadata: Metadata = {
  title: 'The Daily Finance Brief | Aklavya',
  description: 'A morning email that pulls stock calls from finance Twitter and ranks each account by how its past calls did against the S&P 500.',
  openGraph: {
    title: 'The Daily Finance Brief',
    description: 'Which finance Twitter accounts actually beat the S&P 500?',
  }
}

export default function FintwitSignals() {
  return <FintwitClient />
}
