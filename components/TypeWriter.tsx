'use client'

import { useState, useEffect } from 'react'

type TypeWriterProps = {
  text: string
  speed?: number
  delay?: number
}

export default function TypeWriter({ text, speed = 80, delay = 500 }: TypeWriterProps) {
  const [displayText, setDisplayText] = useState('')
  const [index, setIndex] = useState(0)
  const [started, setStarted] = useState(false)

  useEffect(() => {
    const startTimeout = setTimeout(() => setStarted(true), delay)
    return () => clearTimeout(startTimeout)
  }, [delay])

  useEffect(() => {
    if (!started) return

    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayText(prev => prev + text[index])
        setIndex(index + 1)
      }, speed)
      return () => clearTimeout(timeout)
    }
  }, [index, text, speed, started])

  return (
    <span className="typewriter">
      {displayText}
      <span className="typewriter-cursor">|</span>
    </span>
  )
}
