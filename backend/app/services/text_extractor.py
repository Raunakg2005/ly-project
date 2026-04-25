from PyPDF2 import PdfReader
from typing import Optional
import io

async def extract_pdf_text(file_content: bytes) -> dict:
    """
    Extract text from PDF.
    - Text-based PDFs: direct PyPDF2 extraction
    - Scanned PDFs (image-only): falls back to pdf2image + Tesseract OCR
    """
    try:
        pdf_file = io.BytesIO(file_content)
        reader = PdfReader(pdf_file)

        page_count = len(reader.pages)
        metadata = reader.metadata if reader.metadata else {}

        # Try direct text extraction first
        text_parts = []
        for page in reader.pages:
            text = page.extract_text()
            if text and text.strip():
                text_parts.append(text.strip())

        full_text = "\n\n".join(text_parts)

        # If text is too short, this is likely a scanned PDF — use OCR fallback
        if len(full_text.strip()) < 50:
            print("📄 Scanned PDF detected — falling back to OCR")
            return await _ocr_pdf_fallback(file_content, page_count, metadata)

        return {
            "text": full_text,
            "page_count": page_count,
            "metadata": {
                "author": metadata.get("/Author", "Unknown"),
                "title": metadata.get("/Title", ""),
                "subject": metadata.get("/Subject", ""),
                "creator": metadata.get("/Creator", ""),
            },
            "success": True,
            "method": "pdf"
        }

    except Exception as e:
        return {
            "text": "",
            "page_count": 0,
            "metadata": {},
            "success": False,
            "error": str(e),
            "method": "pdf"
        }

async def _ocr_pdf_fallback(file_content: bytes, page_count: int, metadata: dict) -> dict:
    """
    Render PDF pages to images using PyMuPDF (no system deps) then OCR with Tesseract.
    Works on any deployment — no Poppler required.
    """
    try:
        import fitz  # PyMuPDF
        import pytesseract
        from PIL import Image
        import io

        doc = fitz.open(stream=file_content, filetype="pdf")
        text_parts = []
        confidences = []

        for page in doc:
            # Render page to image at 200 DPI (scale factor ~2.78)
            mat = fitz.Matrix(200 / 72, 200 / 72)
            pix = page.get_pixmap(matrix=mat)
            img_bytes = pix.tobytes("png")
            img = Image.open(io.BytesIO(img_bytes))

            text = pytesseract.image_to_string(img)
            if text.strip():
                text_parts.append(text.strip())

            # Gather confidence
            data = pytesseract.image_to_data(img, output_type=pytesseract.Output.DICT)
            confs = [int(c) for c in data['conf'] if c != '-1' and int(c) >= 0]
            if confs:
                confidences.append(sum(confs) / len(confs))

        doc.close()
        full_text = "\n\n".join(text_parts)
        avg_confidence = round(sum(confidences) / len(confidences), 1) if confidences else 0.0

        return {
            "text": full_text,
            "page_count": page_count,
            "metadata": {
                "author": metadata.get("/Author", "Unknown"),
                "title": metadata.get("/Title", ""),
                "subject": metadata.get("/Subject", ""),
                "creator": metadata.get("/Creator", ""),
            },
            "ocr_confidence": avg_confidence,
            "success": True,
            "method": "ocr_pdf"
        }

    except ImportError as e:
        print(f"⚠️ Missing dependency for scanned PDF OCR: {e} — run: pip install pymupdf pytesseract")
        return {"text": "", "page_count": page_count, "metadata": {}, "success": False,
                "method": "ocr_pdf", "error": str(e)}
    except Exception as e:
        print(f"❌ PDF OCR fallback error: {e}")
        return {"text": "", "page_count": page_count, "metadata": {}, "success": False,
                "method": "ocr_pdf", "error": str(e)}



async def extract_image_text(file_content: bytes) -> dict:
    """
    Extract text from image using OCR (Tesseract)
    """
    try:
        from PIL import Image
        import pytesseract
        import io
        
        # Open image from bytes
        image = Image.open(io.BytesIO(file_content))
        
        # Perform OCR
        text = pytesseract.image_to_string(image)
        
        # Get confidence data
        data = pytesseract.image_to_data(image, output_type=pytesseract.Output.DICT)
        confidences = [int(conf) for conf in data['conf'] if conf != '-1']
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        return {
            "text": text.strip(),
            "success": True,
            "method": "ocr",
            "confidence": avg_confidence,
            "language": "eng"  # Default to English
        }
    
    except Exception as e:
        print(f"OCR Error: {e}")
        return {
            "text": "",
            "success": False,
            "method": "ocr",
            "error": str(e)
        }

async def extract_docx_text(file_content: bytes) -> dict:
    """
    Extract text from DOCX file
    """
    try:
        from docx import Document
        import io
        
        # Load document from bytes
        doc = Document(io.BytesIO(file_content))
        
        # Extract text from paragraphs
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        full_text = "\n\n".join(paragraphs)
        
        # Extract text from tables
        tables_text = []
        for table in doc.tables:
            for row in table.rows:
                row_text = [cell.text for cell in row.cells]
                tables_text.append(" | ".join(row_text))
        
        if tables_text:
            full_text += "\n\n" + "\n".join(tables_text)
        
        return {
            "text": full_text.strip(),
            "success": True,
            "method": "docx",
            "paragraph_count": len(paragraphs),
            "table_count": len(doc.tables)
        }
    
    except Exception as e:
        print(f"DOCX Error: {e}")
        return {
            "text": "",
            "success": False,
            "method": "docx",
            "error": str(e)
        }

async def extract_text(file_content: bytes, file_type: str) -> Optional[str]:
    """
    Extract text based on file type
    """
    file_type_lower = file_type.lower()
    
    if 'pdf' in file_type_lower:
        result = await extract_pdf_text(file_content)
        return result.get("text", "") if result.get("success") else None
    
    elif any(img_type in file_type_lower for img_type in ['image', 'jpeg', 'jpg', 'png']):
        result = await extract_image_text(file_content)
        return result.get("text", "") if result.get("success") else None
    
    elif 'word' in file_type_lower or 'document' in file_type_lower or file_type_lower.endswith('.docx'):
        result = await extract_docx_text(file_content)
        return result.get("text", "") if result.get("success") else None
    
    return None
