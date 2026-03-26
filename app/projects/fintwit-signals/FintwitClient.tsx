'use client'

import { useEffect, useRef, useState } from 'react'

// ─── Network Visualization ────────────────────────────────────
function NetworkGraph() {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const animRef = useRef<number>(0)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    const dpr = window.devicePixelRatio || 1
    const rect = canvas.getBoundingClientRect()
    canvas.width = rect.width * dpr
    canvas.height = rect.height * dpr
    ctx.scale(dpr, dpr)

    const w = rect.width
    const h = rect.height
    const cx = w / 2
    const cy = h / 2

    const seeds: { x: number; y: number; angle: number }[] = []
    for (let i = 0; i < 15; i++) {
      const angle = (i / 15) * Math.PI * 2 - Math.PI / 2
      const r = Math.min(w, h) * 0.2
      seeds.push({ x: cx + Math.cos(angle) * r, y: cy + Math.sin(angle) * r, angle })
    }

    const discovered: { x: number; y: number; tier: 'proven' | 'established' | 'preliminary'; parentIdx: number }[] = []
    for (let i = 0; i < 30; i++) {
      const angle = (i / 30) * Math.PI * 2 - Math.PI / 2 + 0.1
      const r = Math.min(w, h) * 0.38 + (Math.random() - 0.5) * 20
      const tier = i < 8 ? 'proven' : i < 20 ? 'established' : 'preliminary'
      discovered.push({
        x: cx + Math.cos(angle) * r,
        y: cy + Math.sin(angle) * r,
        tier,
        parentIdx: Math.floor(Math.random() * 15)
      })
    }

    let progress = 0

    function draw() {
      if (!ctx) return
      ctx.clearRect(0, 0, w, h)
      progress = Math.min(progress + 0.008, 1)
      const ease = 1 - Math.pow(1 - progress, 3)

      const visibleDiscovered = Math.floor(ease * discovered.length)
      for (let i = 0; i < visibleDiscovered; i++) {
        const d = discovered[i]
        const s = seeds[d.parentIdx]
        ctx.beginPath()
        ctx.moveTo(s.x, s.y)
        ctx.lineTo(d.x, d.y)
        ctx.strokeStyle = 'rgba(0, 200, 83, 0.08)'
        ctx.lineWidth = 1
        ctx.stroke()
      }

      seeds.forEach((s) => {
        ctx.beginPath()
        ctx.arc(s.x, s.y, 5, 0, Math.PI * 2)
        ctx.fillStyle = '#ffffff'
        ctx.fill()
        ctx.beginPath()
        ctx.arc(s.x, s.y, 8, 0, Math.PI * 2)
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)'
        ctx.lineWidth = 1
        ctx.stroke()
      })

      for (let i = 0; i < visibleDiscovered; i++) {
        const d = discovered[i]
        const color = d.tier === 'proven' ? '#00C853' : d.tier === 'established' ? '#66BB6A' : '#424242'
        const radius = d.tier === 'proven' ? 4 : d.tier === 'established' ? 3 : 2.5
        ctx.beginPath()
        ctx.arc(d.x, d.y, radius, 0, Math.PI * 2)
        ctx.fillStyle = color
        ctx.fill()
      }

      ctx.fillStyle = 'rgba(255,255,255,0.15)'
      ctx.font = '11px monospace'
      ctx.textAlign = 'center'
      ctx.fillText('15 seeds', cx, cy - 6)
      ctx.fillText(`→ ${visibleDiscovered + 15} tracked`, cx, cy + 10)

      if (progress < 1) {
        animRef.current = requestAnimationFrame(draw)
      }
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && progress === 0) {
          animRef.current = requestAnimationFrame(draw)
        }
      },
      { threshold: 0.3 }
    )
    observer.observe(canvas)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(animRef.current)
    }
  }, [])

  return (
    <div className="fintwit-network-wrap">
      <canvas ref={canvasRef} className="fintwit-network-canvas" />
      <div className="fintwit-network-legend">
        <span className="fintwit-legend-item"><span className="fintwit-dot fintwit-dot-seed" /> Seed accounts</span>
        <span className="fintwit-legend-item"><span className="fintwit-dot fintwit-dot-proven" /> Proven</span>
        <span className="fintwit-legend-item"><span className="fintwit-dot fintwit-dot-established" /> Established</span>
        <span className="fintwit-legend-item"><span className="fintwit-dot fintwit-dot-preliminary" /> Preliminary</span>
      </div>
    </div>
  )
}

// ─── Animated Counter ─────────────────────────────────────────
function Counter({ end, suffix = '', prefix = '', decimals = 0, duration = 2000 }: {
  end: number; suffix?: string; prefix?: string; decimals?: number; duration?: number
}) {
  const [value, setValue] = useState(0)
  const ref = useRef<HTMLSpanElement>(null)

  useEffect(() => {
    const el = ref.current
    if (!el) return
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          const start = performance.now()
          const tick = (now: number) => {
            const elapsed = now - start
            const progress = Math.min(elapsed / duration, 1)
            const ease = 1 - Math.pow(1 - progress, 3)
            setValue(ease * end)
            if (progress < 1) requestAnimationFrame(tick)
          }
          requestAnimationFrame(tick)
          observer.disconnect()
        }
      },
      { threshold: 0.5 }
    )
    observer.observe(el)
    return () => observer.disconnect()
  }, [end, duration])

  return (
    <span ref={ref} className="fintwit-counter">
      {prefix}{decimals > 0 ? value.toFixed(decimals) : Math.round(value).toLocaleString()}{suffix}
    </span>
  )
}

// ─── Pipeline Step ────────────────────────────────────────────
function PipelineStep({ number, title, description, detail }: {
  number: number; title: string; description: string; detail: string
}) {
  return (
    <div className="fintwit-pipeline-step">
      <div className="fintwit-pipeline-number">{number}</div>
      <div className="fintwit-pipeline-body">
        <h4 className="fintwit-pipeline-title">{title}</h4>
        <p className="fintwit-pipeline-desc">{description}</p>
        <span className="fintwit-pipeline-detail">{detail}</span>
      </div>
    </div>
  )
}

// ─── Decision Card ────────────────────────────────────────────
function DecisionCard({ title, before, after, explanation }: {
  title: string; before: string; after: string; explanation: string
}) {
  return (
    <div className="fintwit-decision-card">
      <h4 className="fintwit-decision-title">{title}</h4>
      <p className="fintwit-decision-explanation">{explanation}</p>
      <div className="fintwit-decision-comparison">
        <div className="fintwit-decision-before">
          <span className="fintwit-decision-label">Before</span>
          <span className="fintwit-decision-value">{before}</span>
        </div>
        <div className="fintwit-decision-arrow">→</div>
        <div className="fintwit-decision-after">
          <span className="fintwit-decision-label">After</span>
          <span className="fintwit-decision-value fintwit-green">{after}</span>
        </div>
      </div>
    </div>
  )
}

// ─── Mock Briefing ────────────────────────────────────────────
function MockBriefing() {
  return (
    <div className="fintwit-briefing">
      <div className="fintwit-briefing-header">
        <span className="fintwit-briefing-dot" />
        <span className="fintwit-briefing-title">Daily Briefing — Mar 15, 2026</span>
      </div>
      <div className="fintwit-briefing-section">
        <h5>High Conviction Ideas</h5>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">PLTR</span>
          <span className="fintwit-briefing-meta">3 credible sources &middot; high conviction</span>
          <span className="fintwit-briefing-tag fintwit-green">strong momentum</span>
        </div>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">AXON</span>
          <span className="fintwit-briefing-meta">2 credible sources &middot; medium conviction</span>
          <span className="fintwit-briefing-tag fintwit-green">emerging</span>
        </div>
      </div>
      <div className="fintwit-briefing-section">
        <h5>Sector Themes</h5>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">Defense / AI</span>
          <span className="fintwit-briefing-meta">5 mentions across proven sources &middot; ITA, BOTZ</span>
        </div>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">Nuclear Energy</span>
          <span className="fintwit-briefing-meta">3 mentions &middot; URA, NLR</span>
        </div>
      </div>
      <div className="fintwit-briefing-section">
        <h5>Watchlist</h5>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">RKLB</span>
          <span className="fintwit-briefing-meta">top-tier source &middot; worth a look</span>
        </div>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">ASTS</span>
          <span className="fintwit-briefing-meta">top-tier source &middot; catalyst upcoming</span>
        </div>
      </div>
    </div>
  )
}

// ─── Main Page ────────────────────────────────────────────────
export default function FintwitClient() {
  return (
    <div className="fintwit-page">

      {/* ── Hero ── */}
      <section className="fintwit-hero">
        <div className="container">
          <a href="https://github.com/aklavyak/fintwit-signals" target="_blank" rel="noopener noreferrer" className="fintwit-hero-tag">
            View Source on GitHub ↗
          </a>
          <h1 className="fintwit-hero-title">The Daily Finance Brief</h1>
          <div className="fintwit-hero-stats">
            <div className="fintwit-hero-stat">
              <span className="fintwit-counter">$0.60</span>
              <span className="fintwit-hero-stat-label">total LLM cost</span>
            </div>
            <div className="fintwit-hero-stat">
              <span className="fintwit-counter">Daily</span>
              <span className="fintwit-hero-stat-label">runs before market open</span>
            </div>
            <div className="fintwit-hero-stat">
              <Counter end={73} suffix="%" />
              <span className="fintwit-hero-stat-label">best source win rate</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Problem + Briefing ── */}
      <section className="fintwit-section">
        <div className="container">
          <div className="fintwit-contrast-grid">
            <div className="fintwit-contrast-left">
              <h2 className="fintwit-section-title">The Problem</h2>
              <p className="fintwit-body-text">
                Every day, useful trade ideas are buried inside my Twitter timeline:
                scattered across dozens of accounts, diluted by noise, and surfaced by
                an algorithm that optimizes for engagement, not alpha.
              </p>
              <p className="fintwit-body-text">
                Manual browsing takes hours and still misses things. The signal is there;
                the infrastructure to extract it isn&apos;t.
              </p>
              <p className="fintwit-body-text fintwit-emphasis">
                So I built a project to give me a Daily Briefing.
              </p>
            </div>
            <div className="fintwit-contrast-right">
              <h3 className="fintwit-subsection-label">What lands in my inbox each morning</h3>
              <MockBriefing />
            </div>
          </div>
        </div>
      </section>

      {/* ── How It Works (Network + Pipeline merged) ── */}
      <section className="fintwit-section fintwit-section-dark">
        <div className="container">
          <h2 className="fintwit-section-title">How It Works</h2>
          <p className="fintwit-body-text fintwit-narrow">
            Starting from 15 accounts I&apos;ve traded from, the system maps their social
            graph to discover new sources worth tracking. The network grows continuously
            as new connections surface.
          </p>
          <div className="fintwit-how-grid">
            <div className="fintwit-how-pipeline">
              <div className="fintwit-pipeline">
                <PipelineStep
                  number={1}
                  title="Discover"
                  description="Map the social graph of seed accounts to find new sources"
                  detail="15 seeds → 45+ tracked, growing continuously"
                />
                <PipelineStep
                  number={2}
                  title="Collect"
                  description="Pull tweets from all tracked accounts, only fetching new content"
                  detail="~90% reduction in API calls on daily runs"
                />
                <PipelineStep
                  number={3}
                  title="Extract"
                  description="Two-pass LLM: quick filter, then structured data for tickers, direction, and conviction"
                  detail="6,080 tweets → 1,956 actionable calls"
                />
                <PipelineStep
                  number={4}
                  title="Score"
                  description="Check each call against actual market performance at 30, 60, and 90 days"
                  detail="Bayesian composite builds source credibility over time"
                />
                <PipelineStep
                  number={5}
                  title="Deliver"
                  description="Email a morning briefing with the highest-conviction ideas, sector themes, and watchlist"
                  detail="Daily via Resend, before market open"
                />
              </div>
            </div>
            <div className="fintwit-how-network">
              <h4 className="fintwit-subsection-label">Network Discovery</h4>
              <NetworkGraph />
            </div>
          </div>
        </div>
      </section>

      {/* ── Decisions That Shaped the Project ── */}
      <section className="fintwit-section">
        <div className="container">
          <h2 className="fintwit-section-title">Decisions That Shaped the Project</h2>
          <div className="fintwit-decisions-grid">
            <DecisionCard
              title="Local LLM → API"
              before="8-25 hours (Ollama, 5-15s/call)"
              after="~50 min, $0.60 total (gpt-4o-mini)"
              explanation="Started with a free local model to avoid cost. But with 6,000+ tweets, 'free' meant a full day of runtime. Switching to gpt-4o-mini cut processing time by 95% for less than a dollar."
            />
            <DecisionCard
              title="Two-Pass Extraction"
              before="Structured extraction on all 6,080 tweets"
              after="Filter first, extract 30%, 70% cost savings"
              explanation="Most tweets aren't stock calls. A lightweight yes/no classifier runs first. Only the ~30% that pass get the expensive structured extraction."
            />
          </div>
          <div className="fintwit-decision-card fintwit-decision-framing">
            <h4 className="fintwit-decision-title">Why Idea Generation, Not Trading Signals</h4>
            <p className="fintwit-decision-explanation">
              This tool tells me where to look, not what to buy. The scoring windows
              (30/60/90 days) are too short for rigorous quant research, and Twitter data
              isn&apos;t reliable enough for automated trading. But as a research filter that
              surfaces the ideas worth spending time on each morning, it&apos;s exactly what I needed.
            </p>
          </div>
        </div>
      </section>

      {/* ── Does the Scoring Work? ── */}
      <section className="fintwit-section fintwit-section-dark">
        <div className="container">
          <h2 className="fintwit-section-title">Does the Scoring Work?</h2>
          <p className="fintwit-body-text fintwit-narrow">
            The whole system depends on credibility scoring actually separating
            signal from noise. Here&apos;s what the first run showed:
          </p>
          <div className="fintwit-spread">
            <div className="fintwit-spread-card fintwit-spread-best">
              <span className="fintwit-spread-label">Top-Ranked Source</span>
              <div className="fintwit-spread-stat">
                <Counter end={73} suffix="%" />
                <span>win rate</span>
              </div>
              <div className="fintwit-spread-stat">
                <Counter end={13.8} suffix="%" prefix="+" decimals={1} />
                <span>avg excess return vs S&P 500</span>
              </div>
              <div className="fintwit-spread-stat">
                <span className="fintwit-counter">73 calls</span>
                <span>statistically significant (p &lt; 0.001)</span>
              </div>
            </div>
            <div className="fintwit-spread-divider">
              <span>vs</span>
            </div>
            <div className="fintwit-spread-card fintwit-spread-worst">
              <span className="fintwit-spread-label">Lowest-Ranked Source</span>
              <div className="fintwit-spread-stat">
                <span className="fintwit-counter">46%</span>
                <span>win rate</span>
              </div>
              <div className="fintwit-spread-stat">
                <span className="fintwit-counter fintwit-red">-2.1%</span>
                <span>avg excess return vs S&P 500</span>
              </div>
              <div className="fintwit-spread-stat">
                <span className="fintwit-counter">83 calls</span>
                <span>underperforms market</span>
              </div>
            </div>
          </div>
          <p className="fintwit-body-text" style={{ marginTop: '1.5rem', maxWidth: '650px' }}>
            That spread is the point. The scoring weights ideas from sources with
            proven track records, so the briefing naturally surfaces better ideas first.
          </p>
        </div>
      </section>

      {/* ── Open Questions ── */}
      <section className="fintwit-section">
        <div className="container">
          <h2 className="fintwit-section-title">Open Questions</h2>
          <div className="fintwit-improvements">
            <div className="fintwit-improvement">
              <h4>Seed Bias</h4>
              <p>Network reflects my corner of fintwit. Broader seeding needed to generalize.</p>
            </div>
            <div className="fintwit-improvement">
              <h4>Out-of-Sample Validation</h4>
              <p>Need to split by time period to confirm scoring holds on unseen data.</p>
            </div>
            <div className="fintwit-improvement">
              <h4>Risk Adjustment</h4>
              <p>Measures return, not the drawdown path to get there.</p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Tech Stack ── */}
      <section className="fintwit-section fintwit-section-dark">
        <div className="container">
          <h2 className="fintwit-section-title">Tech Stack</h2>
          <div className="fintwit-stack-grid">
            {[
              { name: 'Python', role: 'Pipeline orchestration' },
              { name: 'gpt-4o-mini', role: 'Classification & extraction' },
              { name: 'SQLite', role: 'Single-file database' },
              { name: 'yfinance', role: 'Market data for scoring' },
              { name: 'RapidAPI', role: 'Twitter data collection' },
              { name: 'Resend', role: 'Email delivery' },
              { name: 'GitHub Actions', role: 'Daily scheduled runs' },
              { name: 'scipy / numpy', role: 'Bayesian statistics' },
            ].map((t) => (
              <div key={t.name} className="fintwit-stack-item">
                <span className="fintwit-stack-name">{t.name}</span>
                <span className="fintwit-stack-role">{t.role}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
