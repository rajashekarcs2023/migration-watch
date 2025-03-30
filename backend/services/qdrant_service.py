import os
from qdrant_client import QdrantClient
from qdrant_client.http import models
from qdrant_client.http.models import Distance, VectorParams
import numpy as np
from sentence_transformers import SentenceTransformer

class QdrantService:
    def __init__(self):
        # Load environment variables
        self.qdrant_url = os.getenv("QDRANT_URL", "http://localhost:6333")
        self.qdrant_api_key = os.getenv("QDRANT_API_KEY", None)
        self.collection_name = os.getenv("QDRANT_COLLECTION_NAME", "oceanpulse_data")
        self.vector_size = 768  # Default for many sentence transformers
        
        # Initialize Qdrant client
        self.client = QdrantClient(
            url=self.qdrant_url,
            api_key=self.qdrant_api_key
        )
        
        # Initialize sentence transformer model for embeddings
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        
        # Ensure collection exists
        self._ensure_collection()
    
    def _ensure_collection(self):
        """Ensure that the collection exists, create it if it doesn't"""
        collections = self.client.get_collections().collections
        collection_names = [collection.name for collection in collections]
        
        if self.collection_name not in collection_names:
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=VectorParams(
                    size=self.vector_size,
                    distance=Distance.COSINE
                )
            )
            print(f"Created collection: {self.collection_name}")
    
    def _get_embedding(self, text):
        """Generate embedding for a text using sentence transformers"""
        return self.model.encode(text)
    
    def add_document(self, document, metadata=None):
        """Add a document to the vector database"""
        if metadata is None:
            metadata = {}
        
        embedding = self._get_embedding(document)
        
        # Create a unique ID for the document
        doc_id = np.random.randint(0, 10000000)
        
        # Create payload with document content and metadata
        payload = {
            "content": document,
            **metadata
        }
        
        # Add point to the collection
        self.client.upsert(
            collection_name=self.collection_name,
            points=[
                models.PointStruct(
                    id=doc_id,
                    vector=embedding.tolist(),
                    payload=payload
                )
            ]
        )
        
        return doc_id
    
    def search(self, query, limit=5):
        """Search for similar documents"""
        query_embedding = self._get_embedding(query)
        
        # Search for similar vectors
        search_result = self.client.search(
            collection_name=self.collection_name,
            query_vector=query_embedding.tolist(),
            limit=limit
        )
        
        return search_result
    
    def batch_upload(self, documents, metadatas=None):
        """Upload multiple documents at once"""
        if metadatas is None:
            metadatas = [{} for _ in documents]
        
        # Generate embeddings for all documents
        embeddings = self.model.encode(documents)
        
        # Create points
        points = []
        for i, (document, embedding, metadata) in enumerate(zip(documents, embeddings, metadatas)):
            doc_id = np.random.randint(0, 10000000)
            payload = {
                "content": document,
                **metadata
            }
            
            points.append(
                models.PointStruct(
                    id=doc_id,
                    vector=embedding.tolist(),
                    payload=payload
                )
            )
        
        # Upload points in batch
        self.client.upsert(
            collection_name=self.collection_name,
            points=points
        )
        
        return len(points)
