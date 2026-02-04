'use client'

import type { StoryMoment as StoryMomentType } from '@/lib/types/citibike'

type StoryMomentProps = {
  moment: StoryMomentType
  isActive: boolean
  index: number
}

export default function StoryMoment({ moment, isActive, index }: StoryMomentProps) {
  return (
    <div
      className={`story-moment ${isActive ? 'active' : ''}`}
      data-moment-id={moment.id}
    >
      <div className="story-moment-content">
        {moment.timeContext && (
          <span className="story-time-badge">{moment.timeContext}</span>
        )}
        <h2 className="story-moment-title">{moment.title}</h2>
        <p className="story-moment-description">{moment.description}</p>
        {moment.statistic && (
          <div className="story-stat">
            <span className="story-stat-value">{moment.statistic.value}</span>
            <span className="story-stat-label">{moment.statistic.label}</span>
          </div>
        )}
      </div>
    </div>
  )
}
