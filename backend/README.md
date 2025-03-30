# OceanPulse Backend

This is the backend service for the OceanPulse marine migration and shipping conflict detection platform. It provides API endpoints for vector search using Qdrant and AI-powered text generation using Google's Gemini API.

## Features

- Flask REST API with CORS support
- Qdrant vector database integration for semantic search
- Google Gemini API integration for AI text generation
- RAG (Retrieval Augmented Generation) implementation
- Sample marine species and shipping route data
- Docker and docker-compose setup for easy deployment

## Setup Instructions

### Prerequisites

- Python 3.10+
- Docker and docker-compose (optional, for containerized setup)
- Google Gemini API key

### Environment Setup

1. Clone the repository
2. Create a `.env` file based on `.env.example`:
   ```
   cp .env.example .env
   ```
3. Add your Gemini API key to the `.env` file:
   ```
   GEMINI_API_KEY=your_api_key_here
   ```

### Local Development

1. Create a virtual environment and activate it:
   ```bash
   python -m venv venv
   source venv/bin/activate  # On Windows: venv\Scripts\activate
   ```

2. Install dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run the Flask application:
   ```bash
   python app.py
   ```

4. Load sample data into Qdrant:
   ```bash
   python utils/data_loader.py
   ```

### Docker Deployment

1. Make sure Docker and docker-compose are installed
2. Build and start the containers:
   ```bash
   docker-compose up -d
   ```
3. The API will be available at http://localhost:5000

## API Endpoints

- `GET /health` - Health check endpoint
- `POST /api/vector/search` - Search for similar vectors in Qdrant
- `POST /api/gemini/generate` - Generate text using Gemini API
- `POST /api/gemini/rag` - RAG (Retrieval Augmented Generation) endpoint

## Data Structure

The backend includes sample data for:
- Marine species information (JSON format)
- Shipping routes (CSV format)

You can add your own data by placing files in the `data` directory and running the data loader.

## Integration with Frontend

The backend is designed to work with the OceanPulse frontend. The API endpoints can be called from the frontend to:
1. Search for marine species and shipping route information
2. Generate AI-powered responses about marine conservation
3. Implement RAG for context-aware responses about marine migration and shipping conflicts
