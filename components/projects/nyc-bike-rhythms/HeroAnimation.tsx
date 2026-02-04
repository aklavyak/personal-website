'use client'

// Curated 20 routes for elegant, slow animation
const HERO_PATHS = [
  { from: [24.5, 50.3], to: [30.1, 53], delay: 0 },
  { from: [50.2, 60.2], to: [45.7, 67.5], delay: 0.8 },
  { from: [30.1, 53], to: [24.5, 50.3], delay: 1.6 },
  { from: [24.5, 50.3], to: [22, 57.6], delay: 2.4 },
  { from: [27.1, 59.7], to: [33.9, 62], delay: 3.2 },
  { from: [28.8, 42.9], to: [24.5, 50.3], delay: 4.0 },
  { from: [24.5, 50.3], to: [34.2, 46.1], delay: 4.8 },
  { from: [56.8, 68.4], to: [45.7, 67.5], delay: 5.6 },
  { from: [37.1, 52.8], to: [30.1, 53], delay: 6.4 },
  { from: [33.1, 66.5], to: [33.9, 62], delay: 7.2 },
  { from: [34.2, 46.1], to: [30.1, 53], delay: 0.4 },
  { from: [19.9, 70.9], to: [21.4, 66.3], delay: 1.2 },
  { from: [34.2, 46.1], to: [37.1, 52.8], delay: 2.0 },
  { from: [27.1, 59.7], to: [24.5, 50.3], delay: 2.8 },
  { from: [32.1, 77.6], to: [24.9, 85.9], delay: 3.6 },
  { from: [22, 57.6], to: [27.1, 59.7], delay: 4.4 },
  { from: [33.9, 62], to: [24.1, 63.2], delay: 5.2 },
  { from: [37.1, 31.1], to: [32.6, 37.5], delay: 6.0 },
  { from: [24.5, 50.3], to: [19.9, 70.9], delay: 6.8 },
  { from: [33.9, 62], to: [37.1, 52.8], delay: 7.6 }
]

function createCurvePath(from: number[], to: number[]): string {
  const midX = (from[0] + to[0]) / 2
  const midY = (from[1] + to[1]) / 2
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  const curveAmount = len * 0.25
  const ctrlX = midX - (dy / len) * curveAmount
  const ctrlY = midY + (dx / len) * curveAmount
  return `M${from[0]},${from[1]} Q${ctrlX},${ctrlY} ${to[0]},${to[1]}`
}

export default function HeroAnimation() {
  return (
    <div className="hero-animation">
      <svg
        className="hero-svg"
        viewBox="0 0 100 100"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 149, 0, 0.12)" />
            <stop offset="100%" stopColor="rgba(255, 149, 0, 0)" />
          </radialGradient>
        </defs>

        {/* Subtle background glow */}
        <circle cx="30" cy="55" r="25" fill="url(#glow)" />
        <circle cx="45" cy="65" r="18" fill="url(#glow)" />

        {/* Animated trip lines - slow, elegant */}
        {HERO_PATHS.map((path, i) => (
          <path
            key={`line-${i}`}
            className="trip-line"
            d={createCurvePath(path.from, path.to)}
            style={{ animationDelay: `${path.delay}s` }}
          />
        ))}

        {/* Moving dots - gentle motion */}
        {HERO_PATHS.map((path, i) => (
          <circle
            key={`dot-${i}`}
            className="trip-dot"
            r="0.5"
          >
            <animateMotion
              dur="4s"
              repeatCount="indefinite"
              begin={`${path.delay}s`}
              path={createCurvePath(path.from, path.to)}
              calcMode="spline"
              keySplines="0.25 0.1 0.25 1"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}
