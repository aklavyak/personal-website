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
          <span className="fintwit-ticker">CRWD</span>
          <span className="fintwit-briefing-meta">3 credible sources &middot; high conviction</span>
          <span className="fintwit-briefing-tag fintwit-green">strong momentum</span>
        </div>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">TTD</span>
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
          <span className="fintwit-ticker">ABNB</span>
          <span className="fintwit-briefing-meta">top-tier source &middot; worth a look</span>
        </div>
        <div className="fintwit-briefing-row">
          <span className="fintwit-ticker">MELI</span>
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
            Code on GitHub ↗
          </a>
          <h1 className="fintwit-hero-title">The Daily Finance Brief</h1>
          <p className="fintwit-hero-subtitle">
            Every weekday before the market opens, I get an email with the finance Twitter
            ideas worth a closer look, ranked by whose past calls held up.
          </p>
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
              <span className="fintwit-hero-stat-label">win rate of the top-ranked account</span>
            </div>
          </div>
        </div>
      </section>

      {/* ── The Problem + Briefing ── */}
      <section className="fintwit-section">
        <div className="container">
          <div className="fintwit-contrast-grid">
            <div className="fintwit-contrast-left">
              <h2 className="fintwit-section-title">Why I built it</h2>
              <p className="fintwit-body-text">
                Twitter is full of people with stock picks. The harder question is: who
                should you actually listen to?
              </p>
              <p className="fintwit-body-text">
                I started tracking a group of accounts I follow that regularly make stock
                calls, measuring how those calls held up over time. Now, instead of
                scrolling through my feed or dozens of accounts every morning, I get one
                briefing with the accounts, and the calls, worth paying attention to.
              </p>
            </div>
            <div className="fintwit-contrast-right">
              <h3 className="fintwit-subsection-label">Sample briefing</h3>
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
            I started with 15 accounts whose ideas I&apos;ve traded on. The script looks at
            who they retweet, quote, or mention favorably to find other accounts that keep
            coming up, and it now tracks 45+.
          </p>
          <div className="fintwit-how-grid">
            <div className="fintwit-how-pipeline">
              <div className="fintwit-pipeline">
                <PipelineStep
                  number={1}
                  title="Discover"
                  description="Find new accounts through the seed accounts' connections"
                  detail="15 → 45+ accounts"
                />
                <PipelineStep
                  number={2}
                  title="Collect"
                  description="Pull only tweets posted since the last run"
                  detail="~90% fewer API calls"
                />
                <PipelineStep
                  number={3}
                  title="Extract"
                  description="A cheap first pass drops tweets that aren't stock calls. A second pulls out the ticker, long or short, and how confident the author sounds."
                  detail="6,080 tweets → 1,956 calls"
                />
                <PipelineStep
                  number={4}
                  title="Score"
                  description="Compare each call's return to the S&P 500 after 30, 60 and 90 days"
                  detail="An account's score firms up as its record grows (Bayesian)"
                />
                <PipelineStep
                  number={5}
                  title="Deliver"
                  description="Send the email: top ideas, sector themes, watchlist"
                  detail="Sent daily via Resend before the open"
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
              title="Local model → gpt-4o-mini"
              before="8-25 hours (Ollama, 5-15s/call)"
              after="~50 min, $0.60 total (gpt-4o-mini)"
              explanation="I started with a local model through Ollama because it was free. At 5–15 seconds a tweet, 6,000 tweets took most of a day. gpt-4o-mini did the same job in about 50 minutes for $0.60."
            />
            <DecisionCard
              title="Two-Pass Extraction"
              before="Structured extraction on all 6,080 tweets"
              after="Extract only the 1,956 that pass"
              explanation="Most tweets aren't stock calls, so a cheap yes/no check runs first. Only the ~30% that pass get the full extraction, which cut cost by about 70%."
            />
          </div>
          <div className="fintwit-decision-card fintwit-decision-framing">
            <h4 className="fintwit-decision-title">What I use it for</h4>
            <p className="fintwit-decision-explanation">
              I use the email to decide which companies to read about that morning. I
              don&apos;t trade off it directly. A 30–90 day window is too short to prove an
              edge, and tweets are too messy by themselves to attempt an automated strategy.
            </p>
          </div>
        </div>
      </section>

      {/* ── Does the Scoring Work? ── */}
      <section className="fintwit-section fintwit-section-dark">
        <div className="container">
          <h2 className="fintwit-section-title">Does the Scoring Work?</h2>
          <p className="fintwit-body-text fintwit-narrow">
            If the scores mean anything, the top-ranked accounts should do clearly better
            than the bottom ones. In the first run, they did:
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
                <span>p &lt; 0.001 vs. a coin flip</span>
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
                <span>trailed the S&amp;P 500</span>
              </div>
            </div>
          </div>
          <p className="fintwit-body-text" style={{ marginTop: '1.5rem', maxWidth: '650px' }}>
            The briefing ranks each idea by its author&apos;s record, so calls from accounts
            like the top one come first.
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
              <p>Every tracked account traces back to 15 I picked, so the list is at least somewhat representative of my picks.</p>
            </div>
            <div className="fintwit-improvement">
              <h4>Out-of-Sample Validation</h4>
              <p>The scores were built and tested on the same period. The real test is out-of-sample: rank the accounts on one stretch of time, then freeze the scores and test whether they hold up in a later period.</p>
            </div>
            <div className="fintwit-improvement">
              <h4>Risk Adjustment</h4>
              <p>A call that dropped 30% before ending up 10% counts the same as one that rose steadily. Drawdown isn&apos;t measured yet.</p>
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
