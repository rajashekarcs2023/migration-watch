import pandas as pd
import numpy as np
from datetime import datetime
import json
import os
from pathlib import Path
import geopy.distance
from sklearn.cluster import DBSCAN
from shapely.geometry import Point, LineString, MultiPoint
from shapely.ops import nearest_points
import matplotlib.pyplot as plt
import io
import base64

class ConflictDetectionService:
    def __init__(self, data_dir="../data"):
        self.data_dir = Path(data_dir)
        self.migration_data = None
        self.shipping_lanes = None
        self.conflict_zones = None
        
        # Load data if available
        self._load_data()
    
    def _load_data(self):
        """Load migration and shipping lane data if available"""
        migration_file = self.data_dir / "fish_migrations.csv"
        shipping_file = self.data_dir / "shipping_lanes.json"
        
        if migration_file.exists():
            self.migration_data = pd.read_csv(migration_file)
            print(f"Loaded migration data: {len(self.migration_data)} records")
        
        if shipping_file.exists():
            with open(shipping_file, 'r') as f:
                self.shipping_lanes = json.load(f)
            print(f"Loaded shipping lanes: {len(self.shipping_lanes)} lanes")
    
    def load_migration_data(self, file_path=None, data=None):
        """Load fish migration data from file or dataframe"""
        if data is not None:
            self.migration_data = data
            return True
        
        if file_path is None:
            file_path = self.data_dir / "fish_migrations.csv"
        
        if os.path.exists(file_path):
            self.migration_data = pd.read_csv(file_path)
            return True
        
        return False
    
    def load_shipping_lanes(self, file_path=None, data=None):
        """Load shipping lanes data from file or JSON"""
        if data is not None:
            self.shipping_lanes = data
            return True
        
        if file_path is None:
            file_path = self.data_dir / "shipping_lanes.json"
        
        if os.path.exists(file_path):
            with open(file_path, 'r') as f:
                self.shipping_lanes = json.load(f)
            return True
        
        return False
    
    def _calculate_distance(self, lat1, lon1, lat2, lon2):
        """Calculate distance between two points in kilometers"""
        return geopy.distance.geodesic((lat1, lon1), (lat2, lon2)).km
    
    def _point_to_line_distance(self, point, line):
        """Calculate minimum distance from a point to a line (shipping lane)"""
        point_geom = Point(point[1], point[0])  # lon, lat
        line_geom = LineString([(p[1], p[0]) for p in line])  # Convert to lon, lat
        
        # Find nearest points
        nearest_point_on_line = nearest_points(point_geom, line_geom)[1]
        
        # Calculate distance
        return self._calculate_distance(
            point[0], point[1],
            nearest_point_on_line.y, nearest_point_on_line.x
        )
    
    def identify_migration_clusters(self, eps=50, min_samples=5):
        """
        Identify clusters in migration data using DBSCAN
        
        Args:
            eps: Maximum distance between points in a cluster (km)
            min_samples: Minimum number of points to form a cluster
            
        Returns:
            DataFrame with cluster labels
        """
        if self.migration_data is None:
            raise ValueError("Migration data not loaded")
        
        # Extract coordinates
        coords = self.migration_data[['latitude', 'longitude']].values
        
        # Create a distance matrix
        n_samples = len(coords)
        distance_matrix = np.zeros((n_samples, n_samples))
        
        for i in range(n_samples):
            for j in range(i+1, n_samples):
                distance = self._calculate_distance(
                    coords[i][0], coords[i][1],
                    coords[j][0], coords[j][1]
                )
                distance_matrix[i, j] = distance
                distance_matrix[j, i] = distance
        
        # Apply DBSCAN clustering
        dbscan = DBSCAN(eps=eps, min_samples=min_samples, metric='precomputed')
        self.migration_data['cluster'] = dbscan.fit_predict(distance_matrix)
        
        # Count clusters (excluding noise points labeled as -1)
        n_clusters = len(set(self.migration_data['cluster'])) - (1 if -1 in self.migration_data['cluster'] else 0)
        print(f"Identified {n_clusters} migration clusters")
        
        return self.migration_data
    
    def detect_conflicts(self, distance_threshold=10):
        """
        Detect conflicts between migration clusters and shipping lanes
        
        Args:
            distance_threshold: Maximum distance (km) to consider a conflict
            
        Returns:
            List of conflict zones with risk assessment
        """
        if self.migration_data is None or self.shipping_lanes is None:
            raise ValueError("Migration data and shipping lanes must be loaded")
        
        # Ensure we have clusters
        if 'cluster' not in self.migration_data.columns:
            self.identify_migration_clusters()
        
        conflicts = []
        
        # Group by cluster
        for cluster_id, cluster_data in self.migration_data[self.migration_data['cluster'] >= 0].groupby('cluster'):
            # Calculate cluster center
            cluster_center = cluster_data[['latitude', 'longitude']].mean().values
            
            # Get time range for this cluster
            if 'timestamp' in cluster_data.columns:
                time_range = [
                    cluster_data['timestamp'].min(),
                    cluster_data['timestamp'].max()
                ]
            elif 'month' in cluster_data.columns and 'year' in cluster_data.columns:
                time_range = [
                    f"{cluster_data['month'].min()}/{cluster_data['year'].min()}",
                    f"{cluster_data['month'].max()}/{cluster_data['year'].max()}"
                ]
            else:
                time_range = ["Unknown", "Unknown"]
            
            # Check each shipping lane
            for lane_id, lane in enumerate(self.shipping_lanes):
                lane_coords = lane.get('coordinates', [])
                
                if not lane_coords:
                    continue
                
                # Calculate minimum distance to shipping lane
                min_distance = self._point_to_line_distance(cluster_center, lane_coords)
                
                # If distance is below threshold, record conflict
                if min_distance <= distance_threshold:
                    # Calculate risk level (higher when distance is smaller)
                    risk_level = 100 * (1 - (min_distance / distance_threshold))
                    risk_level = max(0, min(100, risk_level))  # Ensure between 0-100
                    
                    conflicts.append({
                        'cluster_id': int(cluster_id),
                        'cluster_center': {
                            'latitude': float(cluster_center[0]),
                            'longitude': float(cluster_center[1])
                        },
                        'time_range': time_range,
                        'shipping_lane_id': lane_id,
                        'shipping_lane_name': lane.get('name', f"Lane {lane_id}"),
                        'distance_km': float(min_distance),
                        'risk_level': float(risk_level),
                        'species': cluster_data['species'].iloc[0] if 'species' in cluster_data.columns else "Unknown",
                        'count': len(cluster_data)
                    })
        
        # Sort by risk level (highest first)
        conflicts.sort(key=lambda x: x['risk_level'], reverse=True)
        self.conflict_zones = conflicts
        
        return conflicts
    
    def generate_conflict_map(self):
        """
        Generate a map visualization of migration clusters and shipping lanes
        
        Returns:
            Base64 encoded PNG image
        """
        if self.migration_data is None or self.shipping_lanes is None:
            raise ValueError("Migration data and shipping lanes must be loaded")
        
        # Ensure we have clusters
        if 'cluster' not in self.migration_data.columns:
            self.identify_migration_clusters()
        
        # Create figure
        plt.figure(figsize=(12, 8))
        
        # Plot migration clusters
        for cluster_id, cluster_data in self.migration_data[self.migration_data['cluster'] >= 0].groupby('cluster'):
            plt.scatter(
                cluster_data['longitude'], 
                cluster_data['latitude'],
                alpha=0.6,
                label=f"Cluster {cluster_id}"
            )
        
        # Plot shipping lanes
        for lane_id, lane in enumerate(self.shipping_lanes):
            lane_coords = lane.get('coordinates', [])
            if lane_coords:
                lats = [p[0] for p in lane_coords]
                lons = [p[1] for p in lane_coords]
                plt.plot(lons, lats, 'k-', alpha=0.7, linewidth=2)
        
        # Plot conflict zones if available
        if self.conflict_zones:
            for conflict in self.conflict_zones:
                plt.scatter(
                    conflict['cluster_center']['longitude'],
                    conflict['cluster_center']['latitude'],
                    color='red',
                    marker='x',
                    s=100,
                    linewidth=2
                )
        
        plt.title('Migration Clusters and Shipping Lanes')
        plt.xlabel('Longitude')
        plt.ylabel('Latitude')
        plt.grid(True)
        
        # Save to buffer
        buf = io.BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)
        
        # Encode as base64
        image_base64 = base64.b64encode(buf.read()).decode('utf-8')
        plt.close()
        
        return image_base64
    
    def get_monthly_conflict_stats(self):
        """
        Get conflict statistics by month
        
        Returns:
            Dictionary with monthly conflict counts and risk levels
        """
        if self.migration_data is None or self.conflict_zones is None:
            raise ValueError("Migration data and conflict zones must be available")
        
        monthly_stats = {}
        
        # Check if we have month/year columns
        if 'month' in self.migration_data.columns and 'year' in self.migration_data.columns:
            # Group conflicts by month
            for conflict in self.conflict_zones:
                cluster_id = conflict['cluster_id']
                cluster_data = self.migration_data[self.migration_data['cluster'] == cluster_id]
                
                # Get unique month/year combinations
                for _, row in cluster_data.drop_duplicates(['month', 'year']).iterrows():
                    month_key = f"{int(row['month'])}/{int(row['year'])}"
                    
                    if month_key not in monthly_stats:
                        monthly_stats[month_key] = {
                            'conflict_count': 0,
                            'avg_risk_level': 0,
                            'conflicts': []
                        }
                    
                    monthly_stats[month_key]['conflict_count'] += 1
                    monthly_stats[month_key]['conflicts'].append(conflict)
            
            # Calculate average risk level
            for month_key in monthly_stats:
                conflicts = monthly_stats[month_key]['conflicts']
                monthly_stats[month_key]['avg_risk_level'] = sum(c['risk_level'] for c in conflicts) / len(conflicts)
        
        return monthly_stats
    
    def suggest_route_modifications(self, lane_id, buffer_distance=20):
        """
        Suggest modifications to a shipping lane to reduce conflicts
        
        Args:
            lane_id: ID of the shipping lane to modify
            buffer_distance: Buffer distance (km) to avoid migration clusters
            
        Returns:
            Dictionary with original and suggested routes
        """
        if self.shipping_lanes is None or self.conflict_zones is None:
            raise ValueError("Shipping lanes and conflict zones must be available")
        
        # Get the shipping lane
        if lane_id >= len(self.shipping_lanes):
            raise ValueError(f"Invalid lane ID: {lane_id}")
        
        lane = self.shipping_lanes[lane_id]
        lane_coords = lane.get('coordinates', [])
        
        if not lane_coords:
            raise ValueError(f"No coordinates for lane ID: {lane_id}")
        
        # Get conflicts for this lane
        lane_conflicts = [c for c in self.conflict_zones if c['shipping_lane_id'] == lane_id]
        
        if not lane_conflicts:
            return {
                'lane_id': lane_id,
                'lane_name': lane.get('name', f"Lane {lane_id}"),
                'original_route': lane_coords,
                'suggested_route': lane_coords,
                'message': "No conflicts detected for this lane"
            }
        
        # Create a LineString for the original route
        original_line = LineString([(p[1], p[0]) for p in lane_coords])  # lon, lat
        
        # Create points for conflict zones
        conflict_points = [Point(c['cluster_center']['longitude'], c['cluster_center']['latitude']) for c in lane_conflicts]
        
        # Create a buffer around conflict points
        buffer_zones = [p.buffer(buffer_distance / 111.32) for p in conflict_points]  # rough conversion to degrees
        
        # If the original route doesn't intersect with any buffer, no modification needed
        if not any(original_line.intersects(b) for b in buffer_zones):
            return {
                'lane_id': lane_id,
                'lane_name': lane.get('name', f"Lane {lane_id}"),
                'original_route': lane_coords,
                'suggested_route': lane_coords,
                'message': "Lane already avoids conflict zones"
            }
        
        # Simple approach: For each conflict, find the nearest point on the route and move it away
        suggested_route = lane_coords.copy()
        
        for i, conflict in enumerate(lane_conflicts):
            # Find nearest point on the route
            conflict_point = Point(conflict['cluster_center']['longitude'], conflict['cluster_center']['latitude'])
            nearest_idx = None
            min_dist = float('inf')
            
            for j in range(len(suggested_route)):
                point = Point(suggested_route[j][1], suggested_route[j][0])
                dist = conflict_point.distance(point)
                if dist < min_dist:
                    min_dist = dist
                    nearest_idx = j
            
            if nearest_idx is not None:
                # Calculate vector from conflict to route point
                dx = suggested_route[nearest_idx][1] - conflict['cluster_center']['longitude']
                dy = suggested_route[nearest_idx][0] - conflict['cluster_center']['latitude']
                
                # Normalize and extend by buffer distance
                mag = (dx**2 + dy**2)**0.5
                if mag > 0:
                    dx = dx / mag * buffer_distance / 111.32
                    dy = dy / mag * buffer_distance / 111.32
                    
                    # Move the point further away
                    suggested_route[nearest_idx] = [
                        suggested_route[nearest_idx][0] + dy,
                        suggested_route[nearest_idx][1] + dx
                    ]
        
        return {
            'lane_id': lane_id,
            'lane_name': lane.get('name', f"Lane {lane_id}"),
            'original_route': lane_coords,
            'suggested_route': suggested_route,
            'message': f"Modified route to avoid {len(lane_conflicts)} conflict zones",
            'conflicts_avoided': len(lane_conflicts)
        }
    
    def get_conflict_summary(self):
        """
        Get a summary of all conflicts
        
        Returns:
            Dictionary with conflict statistics
        """
        if self.conflict_zones is None:
            raise ValueError("Conflict zones not available")
        
        total_conflicts = len(self.conflict_zones)
        
        if total_conflicts == 0:
            return {
                'total_conflicts': 0,
                'avg_risk_level': 0,
                'high_risk_count': 0,
                'medium_risk_count': 0,
                'low_risk_count': 0
            }
        
        # Count risk levels
        high_risk = sum(1 for c in self.conflict_zones if c['risk_level'] >= 70)
        medium_risk = sum(1 for c in self.conflict_zones if 30 <= c['risk_level'] < 70)
        low_risk = sum(1 for c in self.conflict_zones if c['risk_level'] < 30)
        
        # Calculate average risk
        avg_risk = sum(c['risk_level'] for c in self.conflict_zones) / total_conflicts
        
        return {
            'total_conflicts': total_conflicts,
            'avg_risk_level': avg_risk,
            'high_risk_count': high_risk,
            'medium_risk_count': medium_risk,
            'low_risk_count': low_risk,
            'species_affected': len(set(c['species'] for c in self.conflict_zones if c['species'] != "Unknown"))
        }
