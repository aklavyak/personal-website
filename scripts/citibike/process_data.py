#!/usr/bin/env python3
"""
NYC Bike Rhythms Data Processing Script
Processes Citi Bike trip data to generate JSON files for visualization.

Requirements:
    pip install pandas geopandas shapely

Usage:
    python process_data.py
"""

import os
import json
import zipfile
from pathlib import Path
from datetime import datetime
import warnings
warnings.filterwarnings('ignore')

import pandas as pd
import geopandas as gpd
from shapely.geometry import Point

# Paths
SCRIPT_DIR = Path(__file__).parent
RAW_DIR = SCRIPT_DIR / "raw"
OUTPUT_DIR = SCRIPT_DIR.parent.parent / "data" / "citibike"
NTA_FILE = SCRIPT_DIR / "nta_boundaries.geojson"

def load_and_process_trips():
    """Load all trip data from zip files."""
    print("Loading trip data...")

    all_trips = []
    zip_files = sorted(RAW_DIR.glob("*.zip"))

    for zip_path in zip_files:
        print(f"  Processing {zip_path.name}...")
        with zipfile.ZipFile(zip_path, 'r') as z:
            csv_files = [f for f in z.namelist() if f.endswith('.csv')]
            for csv_file in csv_files:
                with z.open(csv_file) as f:
                    df = pd.read_csv(f, usecols=[
                        'started_at', 'ended_at',
                        'start_station_name', 'start_station_id',
                        'start_lat', 'start_lng',
                        'end_station_name', 'end_station_id',
                        'end_lat', 'end_lng',
                        'member_casual'
                    ])
                    all_trips.append(df)

    trips = pd.concat(all_trips, ignore_index=True)
    print(f"  Total trips loaded: {len(trips):,}")
    return trips

def parse_datetime(trips):
    """Parse datetime columns."""
    print("Parsing datetime...")
    trips['started_at'] = pd.to_datetime(trips['started_at'])
    trips['ended_at'] = pd.to_datetime(trips['ended_at'])
    trips['day_of_week'] = trips['started_at'].dt.dayofweek  # 0=Monday
    trips['hour'] = trips['started_at'].dt.hour
    return trips

def load_neighborhoods():
    """Load and prepare neighborhood boundaries."""
    print("Loading neighborhood boundaries...")
    nta = gpd.read_file(NTA_FILE)
    # Keep only relevant columns (using nta2020 as the code)
    nta = nta[['nta2020', 'ntaname', 'boroname', 'geometry']]
    nta = nta.rename(columns={'nta2020': 'ntacode'})
    nta = nta.to_crs(epsg=4326)  # Ensure WGS84
    return nta

def create_station_to_nta_mapping(trips, nta):
    """Map each station to its neighborhood."""
    print("Creating station-to-neighborhood mapping...")

    # Get unique stations
    start_stations = trips[['start_station_id', 'start_lat', 'start_lng']].drop_duplicates()
    start_stations.columns = ['station_id', 'lat', 'lng']

    end_stations = trips[['end_station_id', 'end_lat', 'end_lng']].drop_duplicates()
    end_stations.columns = ['station_id', 'lat', 'lng']

    stations = pd.concat([start_stations, end_stations]).drop_duplicates('station_id')
    stations = stations.dropna()

    # Create GeoDataFrame
    geometry = [Point(xy) for xy in zip(stations['lng'], stations['lat'])]
    stations_gdf = gpd.GeoDataFrame(stations, geometry=geometry, crs="EPSG:4326")

    # Spatial join
    stations_with_nta = gpd.sjoin(stations_gdf, nta, how='left', predicate='within')

    # Create mapping
    mapping = stations_with_nta.set_index('station_id')[['ntacode', 'ntaname']].to_dict('index')
    print(f"  Mapped {len(mapping)} stations to neighborhoods")
    return mapping

def calculate_centroids(nta):
    """Calculate centroid coordinates for each neighborhood."""
    print("Calculating neighborhood centroids...")
    centroids = {}
    for _, row in nta.iterrows():
        if row['geometry'] is not None:
            centroid = row['geometry'].centroid
            centroids[row['ntacode']] = [round(centroid.x, 5), round(centroid.y, 5)]
    return centroids

def aggregate_by_neighborhood(trips, station_mapping):
    """Aggregate trips by neighborhood, day, and hour."""
    print("Aggregating trips by neighborhood...")

    # Map stations to neighborhoods
    trips['start_nta'] = trips['start_station_id'].map(
        lambda x: station_mapping.get(x, {}).get('ntacode')
    )
    trips['end_nta'] = trips['end_station_id'].map(
        lambda x: station_mapping.get(x, {}).get('ntacode')
    )

    # Departures by neighborhood/day/hour
    departures = trips.groupby(['start_nta', 'day_of_week', 'hour']).size().reset_index(name='departures')
    departures.columns = ['ntacode', 'day', 'hour', 'departures']

    # Arrivals by neighborhood/day/hour
    arrivals = trips.groupby(['end_nta', 'day_of_week', 'hour']).size().reset_index(name='arrivals')
    arrivals.columns = ['ntacode', 'day', 'hour', 'arrivals']

    # Merge
    patterns = departures.merge(arrivals, on=['ntacode', 'day', 'hour'], how='outer').fillna(0)
    patterns['departures'] = patterns['departures'].astype(int)
    patterns['arrivals'] = patterns['arrivals'].astype(int)
    patterns['net'] = patterns['arrivals'] - patterns['departures']

    return patterns, trips

def generate_flows(trips, centroids):
    """Generate origin-destination flow data, optimized for size."""
    print("Generating flow data...")

    # Filter trips with valid NTA mappings
    valid_trips = trips.dropna(subset=['start_nta', 'end_nta'])
    # Exclude trips within same neighborhood
    valid_trips = valid_trips[valid_trips['start_nta'] != valid_trips['end_nta']]

    # Create day type: weekday (0-4) or weekend (5-6)
    valid_trips['day_type'] = valid_trips['day_of_week'].apply(lambda x: 'weekday' if x < 5 else 'weekend')

    # Create time periods for more compact data
    def get_time_period(hour):
        if 6 <= hour < 10:
            return 'morning_rush'
        elif 10 <= hour < 12:
            return 'late_morning'
        elif 12 <= hour < 16:
            return 'midday'
        elif 16 <= hour < 20:
            return 'evening_rush'
        elif 20 <= hour < 24:
            return 'night'
        else:
            return 'late_night'

    valid_trips['time_period'] = valid_trips['hour'].apply(get_time_period)

    # Group by origin-destination-day_type-time_period
    flow_counts = valid_trips.groupby(
        ['start_nta', 'end_nta', 'day_type', 'time_period']
    ).size().reset_index(name='count')

    # Filter to significant flows (minimum 200 trips)
    flow_counts = flow_counts[flow_counts['count'] >= 200]

    print(f"  Found {len(flow_counts):,} significant flows")

    # Round centroids to reduce file size
    def round_coord(coord):
        return [round(coord[0], 4), round(coord[1], 4)]

    # Build flow list
    flows = []
    for _, row in flow_counts.iterrows():
        from_nta = row['start_nta']
        to_nta = row['end_nta']

        if from_nta in centroids and to_nta in centroids:
            flows.append({
                'f': from_nta,
                't': to_nta,
                'fc': round_coord(centroids[from_nta]),
                'tc': round_coord(centroids[to_nta]),
                'd': 0 if row['day_type'] == 'weekday' else 1,  # 0=weekday, 1=weekend
                'p': row['time_period'],
                'c': int(row['count'])
            })

    # Top flows (aggregated across all time)
    agg_flows = valid_trips.groupby(['start_nta', 'end_nta']).size().reset_index(name='count')
    agg_flows = agg_flows[agg_flows['count'] >= 1000]
    agg_flows = agg_flows.sort_values('count', ascending=False).head(150)

    top_flows = []
    for _, row in agg_flows.iterrows():
        from_nta = row['start_nta']
        to_nta = row['end_nta']
        if from_nta in centroids and to_nta in centroids:
            top_flows.append({
                'f': from_nta,
                't': to_nta,
                'fc': round_coord(centroids[from_nta]),
                'tc': round_coord(centroids[to_nta]),
                'c': int(row['count'])
            })

    # Compact centroids
    compact_centroids = {k: round_coord(v) for k, v in centroids.items()}

    return {
        'flows': flows,
        'topFlows': top_flows,
        'centroids': compact_centroids
    }

def generate_weekly_patterns(patterns):
    """Generate weekly patterns JSON."""
    print("Generating weekly patterns...")

    weekly = {}
    for ntacode in patterns['ntacode'].dropna().unique():
        nta_data = patterns[patterns['ntacode'] == ntacode]
        days = []
        for day in range(7):
            day_data = nta_data[nta_data['day'] == day].sort_values('hour')
            hours = []
            for hour in range(24):
                hour_row = day_data[day_data['hour'] == hour]
                if len(hour_row) > 0:
                    hours.append({
                        'hour': hour,
                        'departures': int(hour_row['departures'].iloc[0]),
                        'arrivals': int(hour_row['arrivals'].iloc[0]),
                        'net': int(hour_row['net'].iloc[0])
                    })
                else:
                    hours.append({'hour': hour, 'departures': 0, 'arrivals': 0, 'net': 0})
            days.append(hours)
        weekly[ntacode] = {'data': days}

    return weekly

def generate_neighborhoods_geojson(nta, patterns):
    """Generate simplified neighborhoods GeoJSON with stats."""
    print("Generating neighborhoods GeoJSON...")

    # Aggregate stats per neighborhood
    nta_stats = patterns.groupby('ntacode').agg({
        'departures': 'sum',
        'arrivals': 'sum'
    }).reset_index()
    nta_stats['total_trips'] = nta_stats['departures'] + nta_stats['arrivals']

    # Peak hour per neighborhood (weekday only)
    weekday_patterns = patterns[patterns['day'] < 5]  # Mon-Fri
    peak_hours = weekday_patterns.groupby(['ntacode', 'hour'])['departures'].sum().reset_index()
    peak_hours = peak_hours.loc[peak_hours.groupby('ntacode')['departures'].idxmax()]
    peak_hours = peak_hours.set_index('ntacode')['hour'].to_dict()

    # Merge with NTA boundaries
    nta_with_stats = nta.merge(nta_stats, on='ntacode', how='left')

    # Simplify geometry
    nta_with_stats['geometry'] = nta_with_stats['geometry'].simplify(0.001, preserve_topology=True)

    # Add peak hour
    nta_with_stats['peakHour'] = nta_with_stats['ntacode'].map(peak_hours)

    # Classify neighborhoods
    def classify(row):
        if pd.isna(row['total_trips']) or row['total_trips'] == 0:
            return None
        # Simple classification based on peak hour
        if row['peakHour'] and row['peakHour'] < 9:
            return 'residential'
        elif row['peakHour'] and row['peakHour'] >= 9 and row['peakHour'] < 11:
            return 'commercial'
        else:
            return 'mixed'

    nta_with_stats['classification'] = nta_with_stats.apply(classify, axis=1)

    # Filter to neighborhoods with data
    nta_with_stats = nta_with_stats[nta_with_stats['total_trips'] > 0]

    # Convert to GeoJSON
    geojson = json.loads(nta_with_stats.to_json())

    return geojson

def generate_story_moments(patterns, trips):
    """Generate story moments with compelling narratives and flow filters."""
    print("Generating story moments...")

    total_trips = len(trips)

    # Calculate stats
    weekday = patterns[patterns['day'] < 5]
    weekend = patterns[patterns['day'] >= 5]

    # Morning rush (7-9 AM weekdays)
    morning_rush = weekday[(weekday['hour'] >= 7) & (weekday['hour'] < 10)]
    morning_rush_trips = morning_rush['departures'].sum()

    # Evening rush (5-7 PM weekdays)
    evening_rush = weekday[(weekday['hour'] >= 17) & (weekday['hour'] < 19)]
    evening_rush_trips = evening_rush['departures'].sum()

    # Friday night (10 PM - 2 AM)
    friday = patterns[patterns['day'] == 4]
    friday_night = friday[(friday['hour'] >= 22) | (friday['hour'] < 2)]
    friday_night_trips = friday_night['arrivals'].sum()

    # Weekend leisure
    weekend_leisure = weekend[(weekend['hour'] >= 10) & (weekend['hour'] < 16)]
    weekend_leisure_trips = weekend_leisure['departures'].sum()

    # Member vs casual percentage
    member_pct = (trips['member_casual'] == 'member').mean() * 100
    casual_pct = 100 - member_pct

    moments = [
        {
            "id": "intro",
            "title": "The Invisible Geography",
            "description": f"Every morning, an invisible map of class appears across New York. {total_trips:,.0f} bike trips in 2025 reveal who lives where, who works where, and the widening gap between them.",
            "mapState": {"center": [-73.97, 40.73], "zoom": 12.5, "bearing": 0, "pitch": 0},
            "highlightNeighborhoods": [],
            "flowFilter": None,
            "statistic": {"label": "Annual Trips", "value": f"{total_trips:,.0f}"}
        },
        {
            "id": "exodus",
            "title": "The Exodus",
            "description": "By 7am, Brooklyn is emptying. Williamsburg, Greenpoint, Bed-Stuy — neighborhoods young professionals could still afford a decade ago — now send a river of commuters toward Manhattan. They're riding toward jobs that pay enough to leave, but not enough to stay.",
            "mapState": {"center": [-73.96, 40.71], "zoom": 12.5, "bearing": -15, "pitch": 40},
            "highlightNeighborhoods": ["BK0101", "BK0102", "BK0301"],
            "flowFilter": {
                "hours": [7, 8, 9],
                "days": [0, 1, 2, 3, 4],
                "direction": "outbound",
                "fromPrefixes": ["BK", "QN"],
                "toPrefixes": ["MN"]
            },
            "flowColor": "#FF9500",
            "timeContext": "Weekday, 7-9 AM",
            "statistic": {"label": "Morning Exodus", "value": f"{morning_rush_trips:,.0f}"}
        },
        {
            "id": "two-cities",
            "title": "Two Cities, One Rush Hour",
            "description": "The finance workers arrive by 8am. The creative class rolls in at 11. Same city, different economies, different schedules. The 4-hour gap between Wall Street's peak and the East Village's isn't just about sleep — it's about who sets their own hours.",
            "mapState": {"center": [-74.005, 40.72], "zoom": 13.5, "bearing": 0, "pitch": 30},
            "highlightNeighborhoods": ["MN0101", "MN0303", "MN0302"],
            "flowFilter": {
                "hours": [8, 9],
                "days": [0, 1, 2, 3, 4],
                "direction": "inbound",
                "toPrefixes": ["MN"]
            },
            "flowColor": "#FF6B35",
            "timeContext": "Weekday Morning",
            "statistic": {"label": "Peak Hour Spread", "value": "4 hours"}
        },
        {
            "id": "midday-divide",
            "title": "The Midday Divide",
            "description": f"At noon, the membership map inverts. Along the waterfront and near Central Park, {casual_pct:.0f}% of riders are tourists on single-trip passes. In working neighborhoods, it's still commuters. Citi Bike is two systems: leisure infrastructure for visitors, transit infrastructure for residents.",
            "mapState": {"center": [-73.97, 40.77], "zoom": 13, "bearing": 0, "pitch": 0},
            "highlightNeighborhoods": ["MN0701", "MN0801", "BK0201"],
            "flowFilter": {
                "hours": [11, 12, 13],
                "days": [0, 1, 2, 3, 4],
                "direction": "all"
            },
            "flowColor": "#FFD93D",
            "timeContext": "Weekday, 12 PM",
            "statistic": {"label": "Casual Riders", "value": f"{casual_pct:.0f}%"}
        },
        {
            "id": "return",
            "title": "The Return",
            "description": f"The evening doesn't mirror the morning — it amplifies it. {evening_rush_trips:,.0f} evening trips vs {morning_rush_trips:,.0f} in the morning. The difference? Errands, gym visits, happy hours. The commute home is rarely just a commute.",
            "mapState": {"center": [-73.98, 40.72], "zoom": 12, "bearing": 10, "pitch": 35},
            "highlightNeighborhoods": ["BK0102", "BK0202", "MN0701"],
            "flowFilter": {
                "hours": [17, 18, 19],
                "days": [0, 1, 2, 3, 4],
                "direction": "outbound",
                "fromPrefixes": ["MN"],
                "toPrefixes": ["BK", "QN"]
            },
            "flowColor": "#9B59B6",
            "timeContext": "Weekday, 5-7 PM",
            "statistic": {"label": "Evening Rush", "value": f"{evening_rush_trips:,.0f}"}
        },
        {
            "id": "friday-night",
            "title": "Friday Night's Geography",
            "description": "Friday night redraws the city. The East Village, Williamsburg, and the Lower East Side — neighborhoods that gentrified first — become destinations. The flow tells you where nightlife moved as rents rose.",
            "mapState": {"center": [-73.99, 40.72], "zoom": 13.5, "bearing": 20, "pitch": 45},
            "highlightNeighborhoods": ["MN0303", "BK0102", "MN0302"],
            "flowFilter": {
                "hours": [21, 22, 23, 0, 1],
                "days": [4],
                "direction": "inbound",
                "toPrefixes": ["MN03", "BK01"]
            },
            "flowColor": "#3498DB",
            "timeContext": "Friday, 10 PM - 1 AM",
            "statistic": {"label": "Friday Night Arrivals", "value": f"{friday_night_trips:,.0f}"}
        },
        {
            "id": "weekend",
            "title": "Weekend Transformation",
            "description": f"On weekends, the commuter network becomes a leisure network. Same bikes, same docks, completely different city. {weekend_leisure_trips:,.0f} weekend trips show where New Yorkers actually want to be when they're not working.",
            "mapState": {"center": [-73.97, 40.75], "zoom": 12, "bearing": 0, "pitch": 20},
            "highlightNeighborhoods": ["BK0602", "BK0201", "MN0202"],
            "flowFilter": {
                "hours": [10, 11, 12, 13, 14, 15],
                "days": [5, 6],
                "direction": "all"
            },
            "flowColor": "#2ECC71",
            "timeContext": "Saturday & Sunday",
            "statistic": {"label": "Weekend Trips", "value": f"{weekend_leisure_trips:,.0f}"}
        },
        {
            "id": "gap",
            "title": "The Gap",
            "description": f"{patterns['ntacode'].nunique()} neighborhoods analyzed. But Citi Bike only reaches 40% of New York. The system's boundaries trace familiar lines — income, race, historical investment. The invisible geography has invisible edges.",
            "mapState": {"center": [-73.97, 40.73], "zoom": 11.5, "bearing": 0, "pitch": 0},
            "highlightNeighborhoods": [],
            "flowFilter": None,
            "statistic": {"label": "Neighborhoods Covered", "value": f"{patterns['ntacode'].nunique()}"}
        }
    ]

    return moments

def generate_metadata(trips):
    """Generate metadata file."""
    member_pct = (trips['member_casual'] == 'member').mean() * 100
    return {
        "dataYear": 2025,
        "totalTrips": int(len(trips)),
        "totalStations": int(trips['start_station_id'].nunique()),
        "memberPct": round(member_pct, 1),
        "casualPct": round(100 - member_pct, 1),
        "dateRange": {
            "start": trips['started_at'].min().strftime('%Y-%m-%d'),
            "end": trips['started_at'].max().strftime('%Y-%m-%d')
        },
        "generatedAt": datetime.now().isoformat()
    }

def save_json(data, filename):
    """Save data to JSON file."""
    output_path = OUTPUT_DIR / filename
    with open(output_path, 'w') as f:
        json.dump(data, f, separators=(',', ':'))
    size_kb = output_path.stat().st_size / 1024
    print(f"  Saved {filename} ({size_kb:.1f} KB)")

def main():
    print("=" * 60)
    print("NYC Bike Rhythms Data Processing")
    print("=" * 60)

    # Ensure output directory exists
    OUTPUT_DIR.mkdir(parents=True, exist_ok=True)

    # Load data
    trips = load_and_process_trips()
    trips = parse_datetime(trips)
    nta = load_neighborhoods()

    # Process
    station_mapping = create_station_to_nta_mapping(trips, nta)
    centroids = calculate_centroids(nta)
    patterns, trips_with_nta = aggregate_by_neighborhood(trips, station_mapping)

    # Generate outputs
    print("\nGenerating output files...")

    weekly = generate_weekly_patterns(patterns)
    save_json(weekly, 'weekly-patterns.json')

    neighborhoods = generate_neighborhoods_geojson(nta, patterns)
    save_json(neighborhoods, 'neighborhoods.json')

    flows = generate_flows(trips_with_nta, centroids)
    save_json(flows, 'flows.json')

    moments = generate_story_moments(patterns, trips)
    save_json(moments, 'story-moments.json')

    metadata = generate_metadata(trips)
    save_json(metadata, 'metadata.json')

    print("\n" + "=" * 60)
    print("Processing complete!")
    print(f"Output files saved to: {OUTPUT_DIR}")
    print("=" * 60)

if __name__ == "__main__":
    main()
