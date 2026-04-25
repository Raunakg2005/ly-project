from groq import Groq
from app.config import settings
from typing import Optional, Dict
import json
import time

# Per-category guidance so the AI judges each document by the right standard
CATEGORY_GUIDANCE = {
    "certificate": """
This is an official certificate or award. Evaluate based on:
- Presence of issuing organization name and logo/header
- Recipient name clearly stated
- Date of issue
- Official signatures or stamps
- Certificate/registration number
- Consistent professional formatting
FLAG only genuine authenticity concerns (missing issuer, inconsistent dates, altered text).
Do NOT flag things like "unverifiable certificate number" if a number is present — just note it cannot be independently verified.
Typical authentic score: 70-95 depending on how complete the official markers are.""",

    "id": """
This is a government or institutional ID document. Evaluate based on:
- Issuing authority clearly identified
- Photo reference (if described in text)
- ID/registration number present
- Expiry date if applicable
- Security features mentioned
FLAG: missing ID numbers, inconsistent personal details, suspicious formatting.
Typical authentic score: 75-98.""",

    "contract": """
This is a legal contract or agreement. Evaluate based on:
- Parties clearly identified
- Dates present
- Signatures or signature blocks
- Clear terms and obligations
- Professional legal language
FLAG: missing party details, unsigned, contradictory clauses, suspicious amendments.
Typical authentic score: 70-95.""",

    "cover_letter": """
This is a personal cover letter or job application letter. 
IMPORTANT: Cover letters are personal documents — they CANNOT and SHOULD NOT be expected to have:
- Verified email addresses (emails are always unverifiable from text alone)
- Confirmed work experience (this is a claim, not a certificate)
- Official stamps or signatures
Evaluate based on:
- Does it read as a genuine, coherent professional letter?
- Is there a consistent name, contact details, and addressed recipient?
- Does it avoid obvious contradictions or suspicious claims?
- Is the language consistent and professional?
Typical authentic score for a well-written cover letter: 80-95.
Only flag things like: contradictory dates, multiple different names used, or clearly fabricated company names.""",

    "resume": """
This is a resume or CV. Like cover letters, resumes contain unverifiable claims by nature.
Evaluate based on:
- Consistent personal information throughout
- Logical, chronological work/education history
- No obvious contradictions in dates or roles
- Professional formatting
Do NOT flag "unverified experience" or "unconfirmed education" — these are inherent to all resumes.
Typical authentic score: 75-95.""",

    "invoice": """
This is a financial invoice or billing document. Evaluate based on:
- Vendor/issuer name and contact
- Invoice number
- Itemized services/products
- Dates and payment terms
- Total amounts consistent with line items
FLAG: missing invoice numbers, inconsistent totals, no vendor contact info.
Typical authentic score: 70-95.""",

    "other": """
Analyze this document for general authenticity. Evaluate whether:
- It appears to be what it claims to be
- Internal information is consistent
- There are no obvious signs of tampering or fabrication
- The formatting and language are appropriate for the document type
Be reasonable — only flag genuine red flags, not inherent limitations of the document type.
Typical authentic score: 65-90."""
}


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
        Analyze document using Groq AI with category-aware prompting.
        Returns authenticity score, risk level, flags, and summary.
        """
        # Detect category from filename if not specified
        if category == "other":
            name_lower = file_name.lower()
            if any(k in name_lower for k in ["cover", "letter", "coverletter"]):
                category = "cover_letter"
            elif any(k in name_lower for k in ["resume", "cv", "curriculum"]):
                category = "resume"
            elif any(k in name_lower for k in ["cert", "certificate", "award", "diploma"]):
                category = "certificate"
            elif any(k in name_lower for k in ["invoice", "bill", "receipt"]):
                category = "invoice"
            elif any(k in name_lower for k in ["contract", "agreement", "mou"]):
                category = "contract"
            elif any(k in name_lower for k in ["id", "passport", "license", "card"]):
                category = "id"

        guidance = CATEGORY_GUIDANCE.get(category, CATEGORY_GUIDANCE["other"])

        prompt = f"""You are a professional document authenticity analyst.

Document Details:
- Filename: {file_name}
- File Type: {file_type}
- Category: {category}

Category-Specific Guidelines:
{guidance}

Document Content (first 2500 characters):
{extracted_text[:2500]}

Analyze the document following the category guidelines above. Be fair and reasonable.
Respond ONLY with valid JSON — no markdown, no explanation outside JSON:
{{
    "authenticityScore": <integer 0-100>,
    "riskLevel": "<low|medium|high>",
    "flags": ["<only genuine red flags, max 3, empty array if none>"],
    "summary": "<2-3 sentence fair assessment of the document>",
    "confidence": <float 0.0-1.0>
}}"""

        start = time.time()
        try:
            response = self.client.chat.completions.create(
                model=self.model,
                messages=[
                    {
                        "role": "system",
                        "content": (
                            "You are a document authenticity expert. "
                            "Apply category-appropriate standards. "
                            "Never flag inherent limitations of a document type as suspicious. "
                            "Respond with valid JSON only."
                        )
                    },
                    {
                        "role": "user",
                        "content": prompt
                    }
                ],
                temperature=0.2,
                max_tokens=600
            )

            analysis_text = response.choices[0].message.content.strip()

            # Strip markdown code fences if present
            if "```" in analysis_text:
                parts = analysis_text.split("```")
                for part in parts:
                    part = part.strip()
                    if part.startswith("json"):
                        part = part[4:].strip()
                    if part.startswith("{"):
                        analysis_text = part
                        break

            analysis = json.loads(analysis_text)
            processing_time = round(time.time() - start, 2)

            return {
                "authenticityScore": float(analysis.get("authenticityScore", 70)),
                "riskLevel": analysis.get("riskLevel", "medium"),
                "flags": analysis.get("flags", []),
                "summary": analysis.get("summary", "Analysis completed"),
                "confidence": float(analysis.get("confidence", 0.8)),
                "processingTime": processing_time,
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
                "processingTime": round(time.time() - start, 2),
                "success": False,
                "error": str(e)
            }


# Singleton instance
document_analyzer = DocumentAnalyzer()
