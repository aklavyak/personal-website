import ArchiveContent from '@/components/ArchiveContent'

export const metadata = {
  title: 'Visual Archive | Aklavya',
  description: 'Photography and visual work archive',
}

// Roll 5 photos - 2020 in black and white
const roll5Photos = [
  { src: '/photos/roll5/000082710001.jpg', alt: '' },
  { src: '/photos/roll5/000082710002.jpg', alt: '' },
  { src: '/photos/roll5/000082710003.jpg', alt: '' },
  { src: '/photos/roll5/000082710004.jpg', alt: '' },
  { src: '/photos/roll5/000082710005.jpg', alt: '' },
  { src: '/photos/roll5/000082710006.jpg', alt: '' },
  { src: '/photos/roll5/000082710007.jpg', alt: '' },
  { src: '/photos/roll5/000082710008.jpg', alt: '' },
  { src: '/photos/roll5/000082710009.jpg', alt: '' },
  { src: '/photos/roll5/000082710010.jpg', alt: '' },
  { src: '/photos/roll5/000082710011.jpg', alt: '' },
  { src: '/photos/roll5/000082710012.jpg', alt: '' },
  { src: '/photos/roll5/000082710016.jpg', alt: '' },
  { src: '/photos/roll5/000082710019.jpg', alt: '' },
  { src: '/photos/roll5/000082710020.jpg', alt: '' },
  { src: '/photos/roll5/000082710021.jpg', alt: '' },
  { src: '/photos/roll5/000082710022.jpg', alt: '' },
  { src: '/photos/roll5/000082710023.jpg', alt: '' },
  { src: '/photos/roll5/000082710024.jpg', alt: '' },
  { src: '/photos/roll5/000082710025.jpg', alt: '' },
  { src: '/photos/roll5/000082710026.jpg', alt: '' },
  { src: '/photos/roll5/000082710028.jpg', alt: '' },
  { src: '/photos/roll5/000082710029.jpg', alt: '' },
  { src: '/photos/roll5/000082710030.jpg', alt: '' },
  { src: '/photos/roll5/000082710031.jpg', alt: '' },
  { src: '/photos/roll5/000082710032.jpg', alt: '' },
  { src: '/photos/roll5/000082710034.jpg', alt: '' },
  { src: '/photos/roll5/000082710035.jpg', alt: '' },
]

// Other photos
const otherPhotos = [
  { src: '/photos/000322010014.jpg', alt: '' },
  { src: '/photos/000491850011.jpg', alt: '' },
  { src: '/photos/000561870029.jpg', alt: '' },
  { src: '/photos/000561870037.jpg', alt: '' },
]

export default function Archive() {
  return (
    <>
      <section className="page-header">
        <div className="container">
          <h1 className="page-title">Visual Archive</h1>
        </div>
      </section>

      <ArchiveContent roll5Photos={roll5Photos} otherPhotos={otherPhotos} />
    </>
  )
}
