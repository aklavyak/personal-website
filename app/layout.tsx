import type { Metadata } from 'next'
import { Playfair_Display } from 'next/font/google'
import Nav from '@/components/Nav'
import Footer from '@/components/Footer'
import './globals.css'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  weight: ['400', '500', '600', '700']
})

export const metadata: Metadata = {
  title: 'Aklavya | Personal Website',
  description: 'Personal website showcasing projects and reading list',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" data-theme="dark">
      <body className={`${playfair.variable} body`}>
        <Nav />
        <main className="main-content">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  )
}
