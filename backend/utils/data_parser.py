import pandas as pd
import json
import os
from pathlib import Path
from datetime import datetime
import numpy as np

class DataParser:
    def __init__(self, data_dir="../data"):
        self.data_dir = Path(data_dir)
    
    def parse_fish_migration_data(self, file_path=None, format_type="csv"):
        """
        Parse fish migration data from various formats
        
        Args:
            file_path: Path to the data file
            format_type: Type of file (csv, json)
            
        Returns:
            DataFrame with standardized migration data
        """
        if file_path is None:
            # Try to find a migration data file in the data directory
            for ext in ["csv", "json"]:
                potential_path = self.data_dir / f"fish_migrations.{ext}"
                if potential_path.exists():
                    file_path = potential_path
                    format_type = ext
                    break
            
            if file_path is None:
                raise FileNotFoundError("No fish migration data file found")
        
        # Determine format type from file extension if not specified
        if format_type == "auto":
            format_type = os.path.splitext(file_path)[1].lower().replace(".", "")
        
        # Parse based on format
        if format_type == "csv":
            return self._parse_csv_migration_data(file_path)
        elif format_type == "json":
            return self._parse_json_migration_data(file_path)
        else:
            raise ValueError(f"Unsupported format type: {format_type}")
    
    def _parse_csv_migration_data(self, file_path):
        """Parse migration data from CSV format"""
        df = pd.read_csv(file_path)
        
        # Standardize column names (lowercase)
        df.columns = [col.lower() for col in df.columns]
        
        # Check for required columns
        required_cols = ['latitude', 'longitude']
        if not all(col in df.columns for col in required_cols):
            # Try alternative column names
            mapping = {
                'lat': 'latitude',
                'lon': 'longitude',
                'lng': 'longitude',
                'long': 'longitude'
            }
            
            df = df.rename(columns={k: v for k, v in mapping.items() if k in df.columns})
            
            if not all(col in df.columns for col in required_cols):
                raise ValueError(f"Missing required columns: {required_cols}")
        
        # Process timestamp if available
        if 'timestamp' in df.columns:
            # Try to convert to datetime
            try:
                df['timestamp'] = pd.to_datetime(df['timestamp'])
                
                # Extract month and year if not present
                if 'month' not in df.columns:
                    df['month'] = df['timestamp'].dt.month
                
                if 'year' not in df.columns:
                    df['year'] = df['timestamp'].dt.year
            except:
                print("Warning: Could not parse timestamp column")
        
        # If we have month/year but no timestamp, create a timestamp
        elif 'month' in df.columns and 'year' in df.columns:
            try:
                # Create a timestamp for the first day of the month
                df['timestamp'] = pd.to_datetime(df[['year', 'month']].assign(day=1))
            except:
                print("Warning: Could not create timestamp from month/year")
        
        # Ensure species column exists
        if 'species' not in df.columns:
            if 'species_name' in df.columns:
                df['species'] = df['species_name']
            elif 'name' in df.columns:
                df['species'] = df['name']
            else:
                df['species'] = "Unknown"
        
        return df
    
    def _parse_json_migration_data(self, file_path):
        """Parse migration data from JSON format"""
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Handle different JSON structures
        if isinstance(data, list):
            # List of records
            if len(data) > 0 and isinstance(data[0], dict):
                df = pd.DataFrame(data)
            else:
                raise ValueError("Invalid JSON structure for migration data")
        elif isinstance(data, dict):
            # Dictionary with records
            if 'features' in data:  # GeoJSON format
                features = data['features']
                records = []
                
                for feature in features:
                    record = feature.get('properties', {}).copy()
                    
                    # Extract coordinates from geometry
                    if 'geometry' in feature and feature['geometry']:
                        geometry = feature['geometry']
                        if geometry['type'] == 'Point':
                            coords = geometry['coordinates']
                            record['longitude'] = coords[0]
                            record['latitude'] = coords[1]
                    
                    records.append(record)
                
                df = pd.DataFrame(records)
            elif 'data' in data:
                # Data field contains records
                df = pd.DataFrame(data['data'])
            else:
                # Try to convert dict to DataFrame
                df = pd.DataFrame([data])
        else:
            raise ValueError("Invalid JSON structure for migration data")
        
        # Standardize column names and continue processing as with CSV
        return self._parse_csv_migration_data(df)
    
    def parse_shipping_lanes(self, file_path=None, format_type="json"):
        """
        Parse shipping lane data from various formats
        
        Args:
            file_path: Path to the data file
            format_type: Type of file (json, geojson, csv)
            
        Returns:
            List of shipping lanes with standardized format
        """
        if file_path is None:
            # Try to find a shipping lanes file in the data directory
            for ext in ["json", "geojson", "csv"]:
                potential_path = self.data_dir / f"shipping_lanes.{ext}"
                if potential_path.exists():
                    file_path = potential_path
                    format_type = "geojson" if ext == "geojson" else ext
                    break
            
            if file_path is None:
                raise FileNotFoundError("No shipping lanes data file found")
        
        # Determine format type from file extension if not specified
        if format_type == "auto":
            ext = os.path.splitext(file_path)[1].lower().replace(".", "")
            format_type = "geojson" if ext == "geojson" else ext
        
        # Parse based on format
        if format_type == "json":
            return self._parse_json_shipping_lanes(file_path)
        elif format_type == "geojson":
            return self._parse_geojson_shipping_lanes(file_path)
        elif format_type == "csv":
            return self._parse_csv_shipping_lanes(file_path)
        else:
            raise ValueError(f"Unsupported format type: {format_type}")
    
    def _parse_json_shipping_lanes(self, file_path):
        """Parse shipping lanes from JSON format"""
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        # Handle different JSON structures
        if isinstance(data, list):
            # List of lanes
            lanes = data
        elif isinstance(data, dict) and 'lanes' in data:
            # Dictionary with lanes field
            lanes = data['lanes']
        elif isinstance(data, dict) and 'routes' in data:
            # Dictionary with routes field
            lanes = data['routes']
        else:
            # Try to treat the whole object as a single lane
            lanes = [data]
        
        # Standardize lane format
        standardized_lanes = []
        
        for i, lane in enumerate(lanes):
            std_lane = {
                'id': lane.get('id', i),
                'name': lane.get('name', lane.get('route_name', f"Lane {i}")),
                'coordinates': []
            }
            
            # Extract coordinates
            if 'coordinates' in lane:
                std_lane['coordinates'] = lane['coordinates']
            elif 'path' in lane:
                std_lane['coordinates'] = lane['path']
            elif 'points' in lane:
                std_lane['coordinates'] = lane['points']
            elif 'geometry' in lane and 'coordinates' in lane['geometry']:
                std_lane['coordinates'] = lane['geometry']['coordinates']
            
            # Add metadata if available
            for key in ['traffic_volume', 'vessel_count', 'risk_level', 'description']:
                if key in lane:
                    std_lane[key] = lane[key]
            
            standardized_lanes.append(std_lane)
        
        return standardized_lanes
    
    def _parse_geojson_shipping_lanes(self, file_path):
        """Parse shipping lanes from GeoJSON format"""
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        if 'features' not in data:
            raise ValueError("Invalid GeoJSON structure: missing 'features' field")
        
        features = data['features']
        standardized_lanes = []
        
        for i, feature in enumerate(features):
            if 'geometry' not in feature:
                continue
            
            geometry = feature['geometry']
            properties = feature.get('properties', {})
            
            std_lane = {
                'id': properties.get('id', i),
                'name': properties.get('name', properties.get('route_name', f"Lane {i}")),
                'coordinates': []
            }
            
            # Extract coordinates based on geometry type
            if geometry['type'] == 'LineString':
                # LineString: array of positions
                std_lane['coordinates'] = [
                    [coord[1], coord[0]] for coord in geometry['coordinates']  # Convert to [lat, lon]
                ]
            elif geometry['type'] == 'MultiLineString':
                # MultiLineString: array of LineString arrays
                # Use the first LineString for simplicity
                if len(geometry['coordinates']) > 0:
                    std_lane['coordinates'] = [
                        [coord[1], coord[0]] for coord in geometry['coordinates'][0]  # Convert to [lat, lon]
                    ]
            
            # Add metadata from properties
            for key in ['traffic_volume', 'vessel_count', 'risk_level', 'description']:
                if key in properties:
                    std_lane[key] = properties[key]
            
            if std_lane['coordinates']:
                standardized_lanes.append(std_lane)
        
        return standardized_lanes
    
    def _parse_csv_shipping_lanes(self, file_path):
        """Parse shipping lanes from CSV format"""
        df = pd.read_csv(file_path)
        
        # Standardize column names
        df.columns = [col.lower() for col in df.columns]
        
        # Check if this is a point-by-point format or a lane-by-lane format
        if 'lane_id' in df.columns or 'route_id' in df.columns:
            # Point-by-point format: each row is a point in a lane
            lane_id_col = 'lane_id' if 'lane_id' in df.columns else 'route_id'
            
            # Required columns for coordinates
            lat_col = next((col for col in ['latitude', 'lat'] if col in df.columns), None)
            lon_col = next((col for col in ['longitude', 'lon', 'lng', 'long'] if col in df.columns), None)
            
            if lat_col is None or lon_col is None:
                raise ValueError("Missing latitude/longitude columns in CSV")
            
            # Group by lane ID
            lanes_dict = {}
            for lane_id, group in df.groupby(lane_id_col):
                lane_name = f"Lane {lane_id}"
                if 'name' in df.columns:
                    names = group['name'].unique()
                    if len(names) > 0:
                        lane_name = names[0]
                
                # Sort by sequence if available
                if 'sequence' in df.columns:
                    group = group.sort_values('sequence')
                
                lanes_dict[lane_id] = {
                    'id': lane_id,
                    'name': lane_name,
                    'coordinates': group[[lat_col, lon_col]].values.tolist()
                }
                
                # Add metadata if available
                for key in ['traffic_volume', 'vessel_count', 'risk_level', 'description']:
                    if key in df.columns:
                        values = group[key].unique()
                        if len(values) > 0:
                            lanes_dict[lane_id][key] = values[0]
            
            return list(lanes_dict.values())
        else:
            # Lane-by-lane format: each row is a complete lane
            standardized_lanes = []
            
            for i, row in df.iterrows():
                # Try to find coordinate columns
                coord_cols = [col for col in df.columns if col.startswith('point_') or col.startswith('coord_')]
                
                if not coord_cols and ('start_lat' in df.columns and 'start_lon' in df.columns and 
                                      'end_lat' in df.columns and 'end_lon' in df.columns):
                    # Simple start/end format
                    coordinates = [
                        [row['start_lat'], row['start_lon']],
                        [row['end_lat'], row['end_lon']]
                    ]
                elif not coord_cols and ('coordinates' in df.columns or 'path' in df.columns or 'points' in df.columns):
                    # JSON string in a column
                    coord_col = next(col for col in ['coordinates', 'path', 'points'] if col in df.columns)
                    try:
                        coordinates = json.loads(row[coord_col])
                    except:
                        print(f"Warning: Could not parse coordinates from row {i}")
                        continue
                else:
                    # No recognizable coordinate format
                    print(f"Warning: No coordinates found for row {i}")
                    continue
                
                std_lane = {
                    'id': row.get('id', i),
                    'name': row.get('name', row.get('route_name', f"Lane {i}")),
                    'coordinates': coordinates
                }
                
                # Add metadata if available
                for key in ['traffic_volume', 'vessel_count', 'risk_level', 'description']:
                    if key in df.columns:
                        std_lane[key] = row[key]
                
                standardized_lanes.append(std_lane)
            
            return standardized_lanes
    
    def save_standardized_data(self, migration_data=None, shipping_lanes=None):
        """
        Save standardized data to the data directory
        
        Args:
            migration_data: DataFrame with migration data
            shipping_lanes: List of shipping lanes
            
        Returns:
            Tuple of (migration_file_path, shipping_lanes_file_path)
        """
        migration_path = None
        shipping_path = None
        
        # Save migration data if provided
        if migration_data is not None:
            migration_path = self.data_dir / "standardized_migrations.csv"
            migration_data.to_csv(migration_path, index=False)
            print(f"Saved standardized migration data to {migration_path}")
        
        # Save shipping lanes if provided
        if shipping_lanes is not None:
            shipping_path = self.data_dir / "standardized_shipping_lanes.json"
            with open(shipping_path, 'w') as f:
                json.dump(shipping_lanes, f, indent=2)
            print(f"Saved standardized shipping lanes to {shipping_path}")
        
        return migration_path, shipping_path
