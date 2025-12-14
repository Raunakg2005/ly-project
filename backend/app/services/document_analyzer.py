from groq import Groq
from app.config import settings
from typing import Optional, Dict
import json

class DocumentAnalyzer:
    def __init__(self):
        self.client = Groq(api_key=settings.GROQ_API_KEY)
        self.model = settings.GROQ_MODEL
    
    async def analyze_document(
        self,
        extracted_text: str,
        file_name: str,
        file_type: str,
        category: str = "other"
    ) -> Dict:
        """
        Analyze document using Groq AI
        Returns authenticity score, risk level, and flags
        """
        
        # Create analysis prompt
        prompt = f"""You are an expert document verification AI. Analyze this document and provide:

1. Authenticity Score (0-100): How authentic/legitimate does this document appear?
2. Risk Level (low/medium/high): Based on potential fraud indicators
3. Flags: List any suspicious elements (max 5)
4. Summary: Brief 2-3 sentence analysis

Document Information:
- Filename: {file_name}
- Type: {file_type}
- Category: {category}

Document Text:
{extracted_text[:2000]}  

Respond ONLY with valid JSON in this exact format:
{{
    "authenticityScore": 85,
    "riskLevel": "low",
    "flags": ["flag1", "flag2"],
    "summary": "Document appears legitimate...",
    "confidence": 0.9
}}"""

        try:
            # Call Groq AI
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": "You are a document verification expert. Always respond with valid JSON only."
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.3,
                max_tokens=500
            )
            
            # Parse response
            analysis_text = response.choices[0].message.content.strip()
            
            # Remove markdown code blocks if present
            if analysis_text.startswith("```"):
                analysis_text = analysis_text.split("```")[1]
                if analysis_text.startswith("json"):
                    analysis_text = analysis_text[4:]
                analysis_text = analysis_text.strip()
            
            analysis = json.loads(analysis_text)
            
            return {
                "authenticityScore": float(analysis.get("authenticityScore", 0)),
                "riskLevel": analysis.get("riskLevel", "medium"),
                "flags": analysis.get("flags", []),
                "summary": analysis.get("summary", "Analysis completed"),
                "confidence": float(analysis.get("confidence", 0.5)),
                "processingTime": 0.0,  # Will be calculated by caller
                "success": True
            }
        
        except Exception as e:
            print(f"❌ Analysis error: {e}")
            return {
                "authenticityScore": 0.0,
                "riskLevel": "unknown",
                "flags": ["Analysis failed"],
                "summary": f"Could not analyze document: {str(e)}",
                "confidence": 0.0,
                "processingTime": 0.0,
                "success": False,
                "error": str(e)
            }

# Singleton instance
document_analyzer = DocumentAnalyzer()
