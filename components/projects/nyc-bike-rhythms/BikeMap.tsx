'use client'

import { useRef, useEffect, useState, useMemo } from 'react'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import type { MapState, NeighborhoodsGeoJSON, FlowData, FlowFilter, Flow } from '@/lib/types/citibike'

type BikeMapProps = {
  mapState: MapState
  neighborhoods: NeighborhoodsGeoJSON
  highlightNeighborhoods?: string[]
  flows?: FlowData
  flowFilter?: FlowFilter | null
  flowColor?: string
  onNeighborhoodClick?: (id: string, name: string) => void
}

// Type assertion helper for GeoJSON data
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const asGeoJSON = (data: NeighborhoodsGeoJSON): any => data

// Convert hex color to RGB string
function hexToRgb(hex: string): string {
  // Handle rgba format
  if (hex.startsWith('rgba')) {
    const match = hex.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)/)
    if (match) return `${match[1]}, ${match[2]}, ${match[3]}`
  }
  // Handle hex format
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  if (result) {
    return `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
  }
  return '255, 149, 0'  // Default orange
}

// Create curved arc between two points
function createArc(
  from: [number, number],
  to: [number, number],
  numPoints: number = 50
): [number, number][] {
  const points: [number, number][] = []

  // Calculate midpoint and offset for curve
  const midX = (from[0] + to[0]) / 2
  const midY = (from[1] + to[1]) / 2

  // Calculate perpendicular offset based on distance
  const dx = to[0] - from[0]
  const dy = to[1] - from[1]
  const dist = Math.sqrt(dx * dx + dy * dy)

  // Offset perpendicular to the line (curve amount)
  const curveAmount = dist * 0.2
  const offsetX = -dy / dist * curveAmount
  const offsetY = dx / dist * curveAmount

  // Control point for quadratic bezier
  const controlX = midX + offsetX
  const controlY = midY + offsetY

  // Generate points along quadratic bezier curve
  for (let i = 0; i <= numPoints; i++) {
    const t = i / numPoints
    const x = (1 - t) * (1 - t) * from[0] + 2 * (1 - t) * t * controlX + t * t * to[0]
    const y = (1 - t) * (1 - t) * from[1] + 2 * (1 - t) * t * controlY + t * t * to[1]
    points.push([x, y])
  }

  return points
}

// Filter flows based on filter criteria
function filterFlows(flows: Flow[], filter: FlowFilter): Flow[] {
  return flows.filter(flow => {
    // Filter by time periods
    if (!filter.timePeriods.includes(flow.p)) return false

    // Filter by day type (d: 0 = weekday, 1 = weekend)
    if (filter.dayType === 'weekday' && flow.d !== 0) return false
    if (filter.dayType === 'weekend' && flow.d !== 1) return false

    // Filter by direction/prefixes
    if (filter.direction === 'outbound' && filter.fromPrefixes && filter.toPrefixes) {
      const fromMatch = filter.fromPrefixes.some(p => flow.f.startsWith(p))
      const toMatch = filter.toPrefixes.some(p => flow.t.startsWith(p))
      if (!fromMatch || !toMatch) return false
    } else if (filter.direction === 'inbound' && filter.toPrefixes) {
      const toMatch = filter.toPrefixes.some(p => flow.t.startsWith(p))
      if (!toMatch) return false
    }

    return true
  })
}

// Create GeoJSON for flow lines
function createFlowGeoJSON(flows: Flow[], maxCount: number) {
  const features = flows.map(flow => ({
    type: 'Feature' as const,
    properties: {
      from: flow.f,
      to: flow.t,
      count: flow.c,
      normalizedCount: flow.c / maxCount
    },
    geometry: {
      type: 'LineString' as const,
      coordinates: createArc(flow.fc, flow.tc)
    }
  }))

  return {
    type: 'FeatureCollection' as const,
    features
  }
}

export default function BikeMap({
  mapState,
  neighborhoods,
  highlightNeighborhoods = [],
  flows,
  flowFilter,
  flowColor = '#FF9500',
  onNeighborhoodClick
}: BikeMapProps) {
  const mapContainer = useRef<HTMLDivElement>(null)
  const map = useRef<mapboxgl.Map | null>(null)
  const [loaded, setLoaded] = useState(false)
  const animationRef = useRef<number | null>(null)
  const progressRef = useRef(0)

  // Filter and prepare flow data
  const filteredFlows = useMemo(() => {
    if (!flows || !flowFilter) return []

    const filtered = filterFlows(flows.flows, flowFilter)

    // Aggregate flows by from-to pair (combine all matching time periods/days)
    const aggregated = new Map<string, Flow>()
    for (const flow of filtered) {
      const key = `${flow.f}-${flow.t}`
      const existing = aggregated.get(key)
      if (existing) {
        existing.c += flow.c
      } else {
        aggregated.set(key, { ...flow })
      }
    }

    // Sort by count and take top flows
    // Show more flows for 'all' direction (e.g., The Gap) to show coverage
    const maxFlows = flowFilter.direction === 'all' ? 300 : 100
    return Array.from(aggregated.values())
      .sort((a, b) => b.c - a.c)
      .slice(0, maxFlows)
  }, [flows, flowFilter])

  const flowGeoJSON = useMemo(() => {
    if (filteredFlows.length === 0) return null
    const maxCount = Math.max(...filteredFlows.map(f => f.c))
    return createFlowGeoJSON(filteredFlows, maxCount)
  }, [filteredFlows])

  // Initialize map
  useEffect(() => {
    if (!mapContainer.current || map.current) return

    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN
    if (!token) {
      console.error('Mapbox token not found')
      return
    }

    mapboxgl.accessToken = token

    map.current = new mapboxgl.Map({
      container: mapContainer.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: mapState.center,
      zoom: mapState.zoom,
      bearing: mapState.bearing || 0,
      pitch: mapState.pitch || 0,
      maxZoom: 16,
      minZoom: 10,
      scrollZoom: false,
      dragRotate: false
    })

    map.current.on('load', () => {
      if (!map.current) return
      setLoaded(true)

      // Add neighborhoods source
      map.current.addSource('neighborhoods', {
        type: 'geojson',
        data: asGeoJSON(neighborhoods)
      })

      // Add flows source with lineMetrics for gradient direction
      map.current.addSource('flows', {
        type: 'geojson',
        lineMetrics: true,
        data: { type: 'FeatureCollection', features: [] }
      })

      // Neighborhood fill layer - more subtle
      map.current.addLayer({
        id: 'neighborhoods-fill',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': 'rgba(255, 255, 255, 0.02)',
          'fill-opacity': 0.5
        }
      })

      // Neighborhood borders
      map.current.addLayer({
        id: 'neighborhoods-line',
        type: 'line',
        source: 'neighborhoods',
        paint: {
          'line-color': 'rgba(255, 255, 255, 0.1)',
          'line-width': 0.5
        }
      })

      // Flow lines layer with gradient showing direction (faded→bright)
      map.current.addLayer({
        id: 'flows-line',
        type: 'line',
        source: 'flows',
        paint: {
          'line-gradient': [
            'interpolate',
            ['linear'],
            ['line-progress'],
            0, 'rgba(255, 149, 0, 0.1)',
            0.3, 'rgba(255, 149, 0, 0.3)',
            0.7, 'rgba(255, 149, 0, 0.6)',
            1, 'rgba(255, 149, 0, 0.9)'
          ],
          'line-width': [
            'interpolate', ['linear'], ['get', 'normalizedCount'],
            0, 2,
            1, 5
          ]
        }
      })

      // Add source for animated particles (moving dots)
      map.current.addSource('particles', {
        type: 'geojson',
        data: { type: 'FeatureCollection', features: [] }
      })

      // Particle layer - small circles that move along flows
      map.current.addLayer({
        id: 'flow-particles',
        type: 'circle',
        source: 'particles',
        paint: {
          'circle-radius': 3,
          'circle-color': '#FFFFFF',
          'circle-opacity': 0.9,
          'circle-blur': 0.5
        }
      })

      // Highlight layer for selected neighborhoods
      map.current.addLayer({
        id: 'neighborhoods-highlight',
        type: 'fill',
        source: 'neighborhoods',
        paint: {
          'fill-color': flowColor,
          'fill-opacity': 0
        }
      })

      // Click handler
      map.current.on('click', 'neighborhoods-fill', (e) => {
        if (e.features && e.features[0] && onNeighborhoodClick) {
          const props = e.features[0].properties
          if (props) {
            onNeighborhoodClick(props.ntacode, props.ntaname)
          }
        }
      })

      // Hover effects
      map.current.on('mouseenter', 'neighborhoods-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = 'pointer'
        }
      })

      map.current.on('mouseleave', 'neighborhoods-fill', () => {
        if (map.current) {
          map.current.getCanvas().style.cursor = ''
        }
      })
    })

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
      map.current?.remove()
      map.current = null
    }
  }, [])

  // Update map state on changes
  useEffect(() => {
    if (!map.current || !loaded) return

    map.current.flyTo({
      center: mapState.center,
      zoom: mapState.zoom,
      bearing: mapState.bearing || 0,
      pitch: mapState.pitch || 0,
      duration: 2000,
      essential: true
    })
  }, [mapState, loaded])

  // Update flows
  useEffect(() => {
    if (!map.current || !loaded) return

    const source = map.current.getSource('flows') as mapboxgl.GeoJSONSource
    if (source && flowGeoJSON) {
      source.setData(flowGeoJSON as GeoJSON.FeatureCollection)
    } else if (source) {
      source.setData({ type: 'FeatureCollection', features: [] })
    }
  }, [flowGeoJSON, loaded])

  // Update flow color gradient
  useEffect(() => {
    if (!map.current || !loaded) return

    // Parse the flowColor and create gradient with it
    // Default to orange if color can't be parsed
    const baseColor = flowColor.startsWith('rgba') ? flowColor : flowColor

    map.current.setPaintProperty('flows-line', 'line-gradient', [
      'interpolate',
      ['linear'],
      ['line-progress'],
      0, `rgba(${hexToRgb(baseColor)}, 0.1)`,
      0.3, `rgba(${hexToRgb(baseColor)}, 0.3)`,
      0.7, `rgba(${hexToRgb(baseColor)}, 0.6)`,
      1, `rgba(${hexToRgb(baseColor)}, 0.9)`
    ])
    map.current.setPaintProperty('neighborhoods-highlight', 'fill-color', flowColor)

    // Update particle color to match flow
    if (map.current.getLayer('flow-particles')) {
      map.current.setPaintProperty('flow-particles', 'circle-color', '#FFFFFF')
    }
  }, [flowColor, loaded])

  // Update highlighted neighborhoods and labels
  useEffect(() => {
    if (!map.current || !loaded) return

    // Update fill highlight
    map.current.setPaintProperty('neighborhoods-highlight', 'fill-opacity', [
      'case',
      ['in', ['get', 'ntacode'], ['literal', highlightNeighborhoods]],
      0.3,
      0
    ])
  }, [highlightNeighborhoods, loaded])

  // Update neighborhoods data
  useEffect(() => {
    if (!map.current || !loaded) return

    const source = map.current.getSource('neighborhoods') as mapboxgl.GeoJSONSource
    if (source) {
      source.setData(asGeoJSON(neighborhoods))
    }
  }, [neighborhoods, loaded])

  // Animate particles along flow lines
  useEffect(() => {
    if (!map.current || !loaded || !flowGeoJSON) return

    const particleSource = map.current.getSource('particles') as mapboxgl.GeoJSONSource
    if (!particleSource) return

    // Generate multiple particles per flow line at different offsets
    const generateParticles = () => {
      // INCREMENT PROGRESS - makes particles move!
      progressRef.current = (progressRef.current + 0.008) % 1

      const particles: GeoJSON.Feature[] = []
      const numParticlesPerFlow = 3

      flowGeoJSON.features.forEach((feature, flowIndex) => {
        const coords = feature.geometry.coordinates as [number, number][]
        const numPoints = coords.length

        for (let p = 0; p < numParticlesPerFlow; p++) {
          // Offset each particle along the flow
          const offset = (progressRef.current + (p / numParticlesPerFlow)) % 1
          const index = Math.floor(offset * (numPoints - 1))
          const point = coords[Math.min(index, numPoints - 1)]

          particles.push({
            type: 'Feature',
            properties: { flowIndex },
            geometry: {
              type: 'Point',
              coordinates: point
            }
          })
        }
      })

      particleSource.setData({
        type: 'FeatureCollection',
        features: particles
      })

      animationRef.current = requestAnimationFrame(generateParticles)
    }

    generateParticles()

    return () => {
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [flowGeoJSON, loaded])

  return (
    <div className="bike-map-wrapper">
      <div ref={mapContainer} className="bike-map" />
    </div>
  )
}
