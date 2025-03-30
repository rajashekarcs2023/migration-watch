import os
import google.generativeai as genai
from google.generativeai.types import HarmCategory, HarmBlockThreshold

class GeminiService:
    def __init__(self):
        # Load environment variables
        self.api_key = os.getenv("GEMINI_API_KEY")
        self.model_name = os.getenv("GEMINI_MODEL", "gemini-pro")
        
        if not self.api_key:
            raise ValueError("GEMINI_API_KEY environment variable is required")
        
        # Configure the Gemini API
        genai.configure(api_key=self.api_key)
        
        # Get the model
        self.model = genai.GenerativeModel(
            model_name=self.model_name,
            safety_settings={
                HarmCategory.HARM_CATEGORY_HARASSMENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_HATE_SPEECH: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
                HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
            },
            generation_config={
                "temperature": 0.7,
                "top_p": 0.95,
                "top_k": 40,
                "max_output_tokens": 1024,
            }
        )
    
    def generate(self, prompt, system_instruction=None):
        """Generate text using Gemini API"""
        try:
            if system_instruction:
                chat = self.model.start_chat(history=[])
                response = chat.send_message(
                    f"System: {system_instruction}\n\nUser: {prompt}"
                )
            else:
                response = self.model.generate_content(prompt)
            
            return response.text
        except Exception as e:
            print(f"Error generating text: {str(e)}")
            raise

    def generate_with_structured_prompt(self, context, question):
        """Generate a response with a structured prompt format"""
        prompt = f"""
        Context information:
        {context}
        
        Question: {question}
        
        Please provide a detailed answer based on the context information provided above.
        If the information to answer the question is not present in the context, please state that.
        """
        
        return self.generate(prompt)
    
    def analyze_marine_data(self, data_description, question):
        """Specialized method for marine data analysis"""
        system_instruction = """
        You are OceanPulse Assistant, an expert in marine biology, migration patterns, 
        and shipping route analysis. Provide detailed, accurate information about marine 
        species, their migration patterns, and how they interact with human activities 
        like shipping. Focus on conservation implications and practical solutions.
        """
        
        prompt = f"""
        Marine Data Description:
        {data_description}
        
        Question: {question}
        
        Please analyze this marine data and provide insights relevant to the question.
        """
        
        return self.generate(prompt, system_instruction)
