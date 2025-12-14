from fastapi import APIRouter, HTTPException
from fastapi.responses import StreamingResponse
from pydantic import BaseModel
from typing import List
from groq import Groq
from app.config import settings
import json

router = APIRouter(prefix="/api/ai", tags=["AI"])

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]

# Initialize Groq client
groq_client = Groq(api_key=settings.GROQ_API_KEY)

@router.post("/chat")
async def chat(request: ChatRequest):
    """AI chatbot with streaming responses"""
    
    # System prompt
    system_message = {
        "role": "system",
        "content": """You are DocShield Assistant, a helpful AI chatbot for the DocShield quantum-safe document verification platform.

Your role:
- Help users understand document verification processes
- Explain cybersecurity and quantum cryptography concepts
- Guide users through the platform features
- Answer questions about document security
- Be friendly, concise, and professional

Platform features:
- Quantum-resistant digital signatures (RSA-2048, migrating to Dilithium3)
- AI-powered document authenticity analysis with Groq & Llama 3.3
- Support for certificates, IDs, contracts, and other documents
- Real-time verification with blockchain-style certificate chains
- Educational modules on cybersecurity

Keep responses helpful and under 200 words unless asked for detailed explanations."""
    }
    
    # Prepare messages
    all_messages = [system_message] + [msg.model_dump() for msg in request.messages]
    
    try:
        # Create streaming response
        async def generate():
            stream = groq_client.chat.completions.create(
                model=settings.GROQ_MODEL,
                messages=all_messages,
                stream=True,
                temperature=0.7,
                max_tokens=500
            )
            
            for chunk in stream:
                if chunk.choices[0].delta.content:
                    yield f"data: {json.dumps({'content': chunk.choices[0].delta.content})}\n\n"
            
            yield "data: [DONE]\n\n"
        
        return StreamingResponse(generate(), media_type="text/event-stream")
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))
