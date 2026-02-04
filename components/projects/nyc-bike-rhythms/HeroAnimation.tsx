'use client'

// Pre-calculated top 50 routes - coordinates are SVG viewport (0-100)
const HERO_PATHS = [
  { from: [24.5, 50.3], to: [30.1, 53], delay: 0 },
  { from: [50.2, 60.2], to: [45.7, 67.5], delay: 0.1 },
  { from: [45.7, 67.5], to: [50.2, 60.2], delay: 0.2 },
  { from: [30.1, 53], to: [24.5, 50.3], delay: 0.3 },
  { from: [24.5, 50.3], to: [22, 57.6], delay: 0.4 },
  { from: [22, 57.6], to: [24.5, 50.3], delay: 0.5 },
  { from: [27.1, 59.7], to: [33.9, 62], delay: 0.6 },
  { from: [28.8, 42.9], to: [24.5, 50.3], delay: 0.7 },
  { from: [33.9, 62], to: [27.1, 59.7], delay: 0.8 },
  { from: [24.5, 50.3], to: [28.8, 42.9], delay: 0.9 },
  { from: [24.5, 50.3], to: [34.2, 46.1], delay: 1.0 },
  { from: [34.2, 46.1], to: [28.8, 42.9], delay: 1.1 },
  { from: [28.8, 42.9], to: [34.2, 46.1], delay: 1.2 },
  { from: [34.2, 46.1], to: [24.5, 50.3], delay: 1.3 },
  { from: [56.8, 68.4], to: [45.7, 67.5], delay: 1.4 },
  { from: [45.7, 67.5], to: [56.8, 68.4], delay: 1.5 },
  { from: [37.1, 52.8], to: [30.1, 53], delay: 1.6 },
  { from: [30.1, 53], to: [37.1, 52.8], delay: 1.7 },
  { from: [33.1, 66.5], to: [33.9, 62], delay: 1.8 },
  { from: [33.9, 62], to: [33.1, 66.5], delay: 1.9 },
  { from: [34.2, 46.1], to: [30.1, 53], delay: 2.0 },
  { from: [19.9, 70.9], to: [21.4, 66.3], delay: 2.1 },
  { from: [30.1, 53], to: [34.2, 46.1], delay: 2.2 },
  { from: [21.4, 66.3], to: [19.9, 70.9], delay: 2.3 },
  { from: [34.2, 46.1], to: [37.1, 52.8], delay: 2.4 },
  { from: [37.1, 52.8], to: [34.2, 46.1], delay: 2.5 },
  { from: [27.1, 59.7], to: [24.5, 50.3], delay: 2.6 },
  { from: [32.1, 77.6], to: [24.9, 85.9], delay: 2.7 },
  { from: [24.5, 50.3], to: [37.1, 52.8], delay: 2.8 },
  { from: [24.9, 85.9], to: [32.1, 77.6], delay: 2.9 },
  { from: [22, 57.6], to: [27.1, 59.7], delay: 0 },
  { from: [30.1, 53], to: [33.9, 62], delay: 0.15 },
  { from: [27.1, 59.7], to: [22, 57.6], delay: 0.3 },
  { from: [37.1, 52.8], to: [24.5, 50.3], delay: 0.45 },
  { from: [33.9, 62], to: [24.1, 63.2], delay: 0.6 },
  { from: [37.1, 52.8], to: [33.9, 62], delay: 0.75 },
  { from: [33.9, 62], to: [30.1, 53], delay: 0.9 },
  { from: [34.2, 46.1], to: [40.7, 46.9], delay: 1.05 },
  { from: [24.5, 50.3], to: [27.1, 59.7], delay: 1.2 },
  { from: [40.7, 46.9], to: [34.2, 46.1], delay: 1.35 },
  { from: [24.1, 63.2], to: [33.9, 62], delay: 1.5 },
  { from: [22, 57.6], to: [24.1, 63.2], delay: 1.65 },
  { from: [37.1, 31.1], to: [32.6, 37.5], delay: 1.8 },
  { from: [32.6, 37.5], to: [34.2, 46.1], delay: 1.95 },
  { from: [24.5, 50.3], to: [19.9, 70.9], delay: 2.1 },
  { from: [28.1, 68.6], to: [33.1, 66.5], delay: 2.25 },
  { from: [33.1, 66.5], to: [28.1, 68.6], delay: 2.4 },
  { from: [19.9, 70.9], to: [24.5, 50.3], delay: 2.55 },
  { from: [33.9, 62], to: [37.1, 52.8], delay: 2.7 },
  { from: [24.1, 63.2], to: [22, 57.6], delay: 2.85 }
]

function createCurvePath(from: number[], to: number[]): string {
  const midX = (from[0] + to[0]) / 2
  const midY = (from[1] + to[1]) / 2
  // Curve control point perpendicular to the line
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const len = Math.sqrt(dx * dx + dy * dy)
  const curveAmount = len * 0.3
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
        {/* Gradient definitions */}
        <defs>
          <radialGradient id="glow" cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="rgba(255, 149, 0, 0.15)" />
            <stop offset="100%" stopColor="rgba(255, 149, 0, 0)" />
          </radialGradient>
          <filter id="blur">
            <feGaussianBlur stdDeviation="0.3" />
          </filter>
        </defs>

        {/* Background glow at activity centers */}
        <circle cx="30" cy="55" r="20" fill="url(#glow)" />
        <circle cx="45" cy="65" r="15" fill="url(#glow)" />

        {/* Animated trip lines */}
        {HERO_PATHS.map((path, i) => (
          <path
            key={`line-${i}`}
            className="trip-line"
            d={createCurvePath(path.from, path.to)}
            style={{ animationDelay: `${path.delay}s` }}
          />
        ))}

        {/* Moving dots along paths */}
        {HERO_PATHS.map((path, i) => (
          <circle
            key={`dot-${i}`}
            className="trip-dot"
            r="0.6"
          >
            <animateMotion
              dur="2.5s"
              repeatCount="indefinite"
              begin={`${path.delay}s`}
              path={createCurvePath(path.from, path.to)}
              calcMode="spline"
              keySplines="0.4 0 0.2 1"
            />
          </circle>
        ))}
      </svg>
    </div>
  )
}
