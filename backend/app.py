from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
import os
import json
import pandas as pd
import io
import base64
from dotenv import load_dotenv
from services.qdrant_service import QdrantService
from services.gemini_service import GeminiService
from services.conflict_detection_service import ConflictDetectionService
from utils.data_parser import DataParser

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize services
qdrant_service = QdrantService()
gemini_service = GeminiService()
conflict_service = ConflictDetectionService()
data_parser = DataParser()

@app.route('/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({"status": "ok", "message": "OceanPulse backend is running"})

@app.route('/api/vector/search', methods=['POST'])
def vector_search():
    """Search for similar vectors in Qdrant"""
    data = request.json
    query = data.get('query')
    limit = data.get('limit', 5)
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    try:
        results = qdrant_service.search(query, limit)
        return jsonify({"results": results})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gemini/generate', methods=['POST'])
def generate_text():
    """Generate text using Gemini API"""
    data = request.json
    prompt = data.get('prompt')
    
    if not prompt:
        return jsonify({"error": "Prompt is required"}), 400
    
    try:
        response = gemini_service.generate(prompt)
        return jsonify({"response": response})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/gemini/rag', methods=['POST'])
def rag_query():
    """RAG (Retrieval Augmented Generation) endpoint"""
    data = request.json
    query = data.get('query')
    
    if not query:
        return jsonify({"error": "Query is required"}), 400
    
    try:
        # First retrieve relevant documents from Qdrant
        docs = qdrant_service.search(query, limit=3)
        
        # Then generate a response using Gemini with the retrieved context
        context = "\n\n".join([doc["payload"]["content"] for doc in docs])
        prompt = f"Context:\n{context}\n\nQuestion: {query}\n\nAnswer:"
        
        response = gemini_service.generate(prompt)
        return jsonify({
            "response": response,
            "sources": docs
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

# Conflict detection endpoints
@app.route('/api/conflicts/upload-migration-data', methods=['POST'])
def upload_migration_data():
    """Upload fish migration data"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        # Save the uploaded file temporarily
        temp_path = os.path.join(os.path.dirname(__file__), 'data', 'temp_migration_data')
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        file_ext = os.path.splitext(file.filename)[1].lower()
        temp_file = f"{temp_path}{file_ext}"
        file.save(temp_file)
        
        # Parse the data
        migration_data = data_parser.parse_fish_migration_data(temp_file, format_type="auto")
        
        # Load into conflict service
        conflict_service.load_migration_data(data=migration_data)
        
        # Save standardized data
        data_parser.save_standardized_data(migration_data=migration_data)
        
        return jsonify({
            "message": "Migration data uploaded successfully",
            "record_count": len(migration_data),
            "columns": migration_data.columns.tolist()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conflicts/upload-shipping-lanes', methods=['POST'])
def upload_shipping_lanes():
    """Upload shipping lanes data"""
    if 'file' not in request.files:
        return jsonify({"error": "No file provided"}), 400
    
    file = request.files['file']
    if file.filename == '':
        return jsonify({"error": "No file selected"}), 400
    
    try:
        # Save the uploaded file temporarily
        temp_path = os.path.join(os.path.dirname(__file__), 'data', 'temp_shipping_lanes')
        os.makedirs(os.path.dirname(temp_path), exist_ok=True)
        
        file_ext = os.path.splitext(file.filename)[1].lower()
        temp_file = f"{temp_path}{file_ext}"
        file.save(temp_file)
        
        # Parse the data
        shipping_lanes = data_parser.parse_shipping_lanes(temp_file, format_type="auto")
        
        # Load into conflict service
        conflict_service.load_shipping_lanes(data=shipping_lanes)
        
        # Save standardized data
        data_parser.save_standardized_data(shipping_lanes=shipping_lanes)
        
        return jsonify({
            "message": "Shipping lanes uploaded successfully",
            "lane_count": len(shipping_lanes)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conflicts/detect', methods=['POST'])
def detect_conflicts():
    """Detect conflicts between migration data and shipping lanes"""
    data = request.json or {}
    distance_threshold = data.get('distance_threshold', 10)  # km
    
    try:
        # Identify migration clusters first
        eps = data.get('cluster_distance', 50)  # km
        min_samples = data.get('min_cluster_size', 5)
        
        conflict_service.identify_migration_clusters(eps=eps, min_samples=min_samples)
        
        # Detect conflicts
        conflicts = conflict_service.detect_conflicts(distance_threshold=distance_threshold)
        
        return jsonify({
            "conflicts": conflicts,
            "conflict_count": len(conflicts),
            "summary": conflict_service.get_conflict_summary()
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conflicts/map', methods=['GET'])
def get_conflict_map():
    """Get a visualization of conflicts"""
    try:
        # Generate the map
        image_base64 = conflict_service.generate_conflict_map()
        
        # Return as JSON with base64 image
        return jsonify({
            "image": image_base64,
            "content_type": "image/png"
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conflicts/monthly-stats', methods=['GET'])
def get_monthly_stats():
    """Get conflict statistics by month"""
    try:
        monthly_stats = conflict_service.get_monthly_conflict_stats()
        return jsonify(monthly_stats)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conflicts/suggest-route', methods=['POST'])
def suggest_route_modification():
    """Suggest modifications to a shipping lane to reduce conflicts"""
    data = request.json
    lane_id = data.get('lane_id')
    buffer_distance = data.get('buffer_distance', 20)  # km
    
    if lane_id is None:
        return jsonify({"error": "lane_id is required"}), 400
    
    try:
        suggestion = conflict_service.suggest_route_modifications(lane_id, buffer_distance)
        return jsonify(suggestion)
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conflicts/analyze', methods=['POST'])
def analyze_conflicts():
    """Generate AI analysis of conflicts using Gemini"""
    data = request.json
    query = data.get('query', "Analyze the conflicts between marine migrations and shipping lanes")
    
    try:
        # Get conflict summary
        summary = conflict_service.get_conflict_summary()
        
        # Get top conflicts (limit to 5 for context size)
        conflicts = conflict_service.conflict_zones[:5] if conflict_service.conflict_zones else []
        
        # Create context for Gemini
        context = f"""Conflict Summary:
- Total conflicts: {summary.get('total_conflicts', 0)}
- Average risk level: {summary.get('avg_risk_level', 0):.1f}%
- High risk conflicts: {summary.get('high_risk_count', 0)}
- Medium risk conflicts: {summary.get('medium_risk_count', 0)}
- Low risk conflicts: {summary.get('low_risk_count', 0)}
- Species affected: {summary.get('species_affected', 0)}

Top Conflict Zones:"""
        
        for i, conflict in enumerate(conflicts):
            context += f"""
{i+1}. Conflict with {conflict.get('shipping_lane_name', 'Unknown Lane')}:
   - Species: {conflict.get('species', 'Unknown')}
   - Risk Level: {conflict.get('risk_level', 0):.1f}%
   - Location: Lat {conflict.get('cluster_center', {}).get('latitude', 0):.4f}, Lon {conflict.get('cluster_center', {}).get('longitude', 0):.4f}
   - Distance to shipping lane: {conflict.get('distance_km', 0):.1f} km"""
        
        # Generate analysis with Gemini
        analysis = gemini_service.analyze_marine_data(context, query)
        
        return jsonify({
            "analysis": analysis,
            "summary": summary,
            "conflicts": conflicts
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route('/api/conflicts/load-sample-data', methods=['POST'])
def load_sample_data():
    """Load sample data for testing"""
    try:
        # Check if we have the sample data files
        migration_file = os.path.join(os.path.dirname(__file__), 'data', 'fish_migrations.csv')
        shipping_file = os.path.join(os.path.dirname(__file__), 'data', 'shipping_lanes.json')
        
        if not os.path.exists(migration_file) or not os.path.exists(shipping_file):
            return jsonify({"error": "Sample data files not found"}), 404
        
        # Load the data
        migration_data = data_parser.parse_fish_migration_data(migration_file)
        shipping_lanes = data_parser.parse_shipping_lanes(shipping_file)
        
        # Load into conflict service
        conflict_service.load_migration_data(data=migration_data)
        conflict_service.load_shipping_lanes(data=shipping_lanes)
        
        return jsonify({
            "message": "Sample data loaded successfully",
            "migration_count": len(migration_data),
            "shipping_lanes_count": len(shipping_lanes)
        })
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
