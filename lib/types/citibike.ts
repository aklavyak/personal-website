export type MapState = {
  center: [number, number]
  zoom: number
  bearing?: number
  pitch?: number
}

export type TimePeriod = 'morning_rush' | 'late_morning' | 'midday' | 'evening_rush' | 'night' | 'late_night'

export type FlowFilter = {
  timePeriods: TimePeriod[]
  dayType: 'weekday' | 'weekend' | 'all'
  direction: 'inbound' | 'outbound' | 'all'
  fromPrefixes?: string[]
  toPrefixes?: string[]
}

export type SplitView = {
  left: {
    label: string
    flowFilter: FlowFilter
    flowColor: string
  }
  right: {
    label: string
    flowFilter: FlowFilter
    flowColor: string
  }
}

export type StoryMoment = {
  id: string
  title: string
  description: string
  mapState: MapState
  highlightNeighborhoods: string[]
  flowFilter?: FlowFilter | null
  flowColor?: string
  statistic?: { label: string; value: string }
  timeContext?: string
  splitView?: SplitView
}

export type HourlyData = {
  hour: number
  departures: number
  arrivals: number
  net: number
}

export type DayPattern = HourlyData[]

export type NeighborhoodPattern = {
  data: DayPattern[] // 7 days (0=Monday, 6=Sunday)
}

export type NeighborhoodFeature = {
  type: 'Feature'
  properties: {
    ntacode: string
    ntaname: string
    boroname: string
    totalTrips?: number
    peakHour?: number
    classification?: 'residential' | 'commercial' | 'mixed' | 'tourist'
  }
  geometry: {
    type: 'Polygon' | 'MultiPolygon'
    coordinates: number[][][] | number[][][][]
  }
}

export type NeighborhoodsGeoJSON = {
  type: 'FeatureCollection'
  features: NeighborhoodFeature[]
}

// Flow visualization types (compact format)
export type Flow = {
  f: string  // from neighborhood
  t: string  // to neighborhood
  fc: [number, number]  // from center coordinates
  tc: [number, number]  // to center coordinates
  d: number  // day type: 0=weekday, 1=weekend
  p: TimePeriod  // time period
  c: number  // count
}

export type TopFlow = {
  f: string
  t: string
  fc: [number, number]
  tc: [number, number]
  c: number
}

export type FlowData = {
  flows: Flow[]
  topFlows: TopFlow[]
  centroids: Record<string, [number, number]>
}

export type Metadata = {
  dataYear: number
  totalTrips: number
  totalStations: number
  memberPct: number
  casualPct: number
  dateRange: {
    start: string
    end: string
  }
  generatedAt: string
}
