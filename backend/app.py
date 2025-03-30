from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
from services.qdrant_service import QdrantService
from services.gemini_service import GeminiService

# Load environment variables
load_dotenv()

# Initialize Flask app
app = Flask(__name__)
CORS(app)

# Initialize services
qdrant_service = QdrantService()
gemini_service = GeminiService()

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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=True)
