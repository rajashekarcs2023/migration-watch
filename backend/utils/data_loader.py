import os
import json
import csv
from pathlib import Path
import pandas as pd
from services.qdrant_service import QdrantService

class DataLoader:
    def __init__(self, data_dir="../data"):
        self.data_dir = Path(data_dir)
        self.qdrant_service = QdrantService()
    
    def load_json_data(self, filename):
        """Load data from a JSON file"""
        file_path = self.data_dir / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        with open(file_path, 'r') as f:
            data = json.load(f)
        
        return data
    
    def load_csv_data(self, filename):
        """Load data from a CSV file"""
        file_path = self.data_dir / filename
        
        if not file_path.exists():
            raise FileNotFoundError(f"File not found: {file_path}")
        
        return pd.read_csv(file_path)
    
    def process_marine_species_data(self, filename="marine_species.json"):
        """Process marine species data and upload to Qdrant"""
        try:
            data = self.load_json_data(filename)
            
            documents = []
            metadatas = []
            
            for species in data:
                # Create a document with species information
                doc = f"""
                Species: {species.get('name', 'Unknown')}
                Scientific Name: {species.get('scientific_name', 'Unknown')}
                Conservation Status: {species.get('conservation_status', 'Unknown')}
                
                Description: {species.get('description', '')}
                
                Migration Pattern: {species.get('migration_pattern', '')}
                
                Habitat: {species.get('habitat', '')}
                
                Threats: {', '.join(species.get('threats', []))}
                """
                
                documents.append(doc)
                metadatas.append({
                    "type": "marine_species",
                    "name": species.get('name'),
                    "scientific_name": species.get('scientific_name'),
                    "conservation_status": species.get('conservation_status')
                })
            
            # Batch upload to Qdrant
            count = self.qdrant_service.batch_upload(documents, metadatas)
            print(f"Uploaded {count} marine species documents to Qdrant")
            
            return count
        except Exception as e:
            print(f"Error processing marine species data: {str(e)}")
            raise
    
    def process_shipping_route_data(self, filename="shipping_routes.csv"):
        """Process shipping route data and upload to Qdrant"""
        try:
            df = self.load_csv_data(filename)
            
            documents = []
            metadatas = []
            
            for _, row in df.iterrows():
                # Create a document with shipping route information
                doc = f"""
                Route ID: {row.get('route_id', 'Unknown')}
                Origin: {row.get('origin', 'Unknown')}
                Destination: {row.get('destination', 'Unknown')}
                
                Description: {row.get('description', '')}
                
                Traffic Volume: {row.get('traffic_volume', 'Unknown')} vessels per month
                
                Environmental Impact: {row.get('environmental_impact', 'Unknown')}
                
                Conflict Zones: {row.get('conflict_zones', '')}
                """
                
                documents.append(doc)
                metadatas.append({
                    "type": "shipping_route",
                    "route_id": row.get('route_id'),
                    "origin": row.get('origin'),
                    "destination": row.get('destination')
                })
            
            # Batch upload to Qdrant
            count = self.qdrant_service.batch_upload(documents, metadatas)
            print(f"Uploaded {count} shipping route documents to Qdrant")
            
            return count
        except Exception as e:
            print(f"Error processing shipping route data: {str(e)}")
            raise
    
    def load_all_data(self):
        """Load all available data into Qdrant"""
        total_count = 0
        
        # Process marine species data if file exists
        species_file = self.data_dir / "marine_species.json"
        if species_file.exists():
            count = self.process_marine_species_data()
            total_count += count
        
        # Process shipping route data if file exists
        routes_file = self.data_dir / "shipping_routes.csv"
        if routes_file.exists():
            count = self.process_shipping_route_data()
            total_count += count
        
        return total_count

if __name__ == "__main__":
    # When run directly, load all data
    loader = DataLoader()
    count = loader.load_all_data()
    print(f"Total documents loaded: {count}")
