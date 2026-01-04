from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi.responses import FileResponse
from bson import ObjectId
from datetime import datetime
from pathlib import Path

from app.core.security import decode_access_token
from app.database import get_database
from app.services.certificate_generator import certificate_generator

router = APIRouter(prefix="/api/certificates", tags=["Certificates"])
security = HTTPBearer()

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    """Get current user ID from JWT token"""
    token = credentials.credentials
    payload = decode_access_token(token)
    
    if payload is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials"
        )
    
    email = payload.get("sub")
    db = get_database()
    user = await db.users.find_one({"email": email})
    
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User not found"
        )
    
    return str(user["_id"])

@router.post("/generate/{document_id}")
async def generate_certificate(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Generate certificate for a verified document"""
    db = get_database()
    
    # Get document
    document = await db.documents.find_one({
        "_id": ObjectId(document_id),
        "userId": ObjectId(user_id)
    })
    
    if not document:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found"
        )
    
    # Check if document is verified
    if document.get("verificationStatus") != "verified":
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Only verified documents can have certificates generated"
        )
    
    # Check if certificate already exists
    existing_cert = await db.certificates.find_one({"documentId": ObjectId(document_id)})
    if existing_cert:
        return{
            "success": True,
            "message": "Certificate already exists",
            "certificate": {
                "id": existing_cert.get("certificateId"),
                "created_at": existing_cert.get("createdAt")
            }
        }
    
    # Get verifier info if available
    verifier_name = None
    if document.get("manualReview"):
        verifier_id = document["manualReview"].get("verifier_id")
        if verifier_id:
            verifier = await db.users.find_one({"_id": ObjectId(verifier_id)})
            if verifier:
                verifier_name = verifier.get("name", "DocShield Verifier")
    
    # Generate certificate
    try:
        cert_path, cert_id = certificate_generator.generate_certificate(
            document_id=document_id,
            user_id=user_id,
            document_name=document.get("fileName", "Unknown"),
            file_hash=document.get("fileHash", ""),
            verification_status=document.get("verificationStatus", "verified"),
            verification_date=document.get("updatedAt", datetime.utcnow()),
            verifier_name=verifier_name
        )
        
        # Save certificate info to database
        certificate_doc = {
            "certificateId": cert_id,
            "documentId": ObjectId(document_id),
            "userId": ObjectId(user_id),
            "documentName": document.get("fileName"),
            "fileHash": document.get("fileHash"),
            "verificationStatus": document.get("verificationStatus"),
            "verificationDate": document.get("updatedAt", datetime.utcnow()),
            "verifierId": document.get("manualReview", {}).get("verifier_id"),
            "verifierName": verifier_name,
            "certificatePath": cert_path,
            "qrCodeUrl": f"https://docshield.com/verify/{cert_id}",
            "createdAt": datetime.utcnow()
        }
        
        await db.certificates.insert_one(certificate_doc)
        
        return {
            "success": True,
            "message": "Certificate generated successfully",
            "certificate": {
                "id": cert_id,
                "path": cert_path,
                "created_at": datetime.utcnow()
            }
        }
    
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"Failed to generate certificate: {str(e)}"
        )

@router.get("/download/{certificate_id}")
async def download_certificate(
    certificate_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Download certificate PDF"""
    db = get_database()
    
    # Get certificate
    certificate = await db.certificates.find_one({
        "certificateId": certificate_id
    })
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Verify ownership
    if str(certificate.get("userId")) != user_id:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not authorized to access this certificate"
        )
    
    # Check if file exists
    cert_path = Path(certificate.get("certificatePath"))
    if not cert_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate file not found"
        )
    
    # Return file
    return FileResponse(
        path=str(cert_path),
        media_type="application/pdf",
        filename=f"certificate_{certificate_id}.pdf"
    )

@router.get("/verify/{certificate_id}")
async def verify_certificate(certificate_id: str):
    """Verify certificate validity (public endpoint)"""
    db = get_database()
    
    certificate = await db.certificates.find_one({
        "certificateId": certificate_id
    })
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found"
        )
    
    # Get document
    document = await db.documents.find_one({
        "_id": certificate.get("documentId")
    })
    
    return {
        "valid": True,
        "certificate": {
            "id": certificate.get("certificateId"),
            "document_name": certificate.get("documentName"),
            "verification_status": certificate.get("verificationStatus"),
            "verification_date": certificate.get("verificationDate"),
            "verifier_name": certificate.get("verifierName"),
            "created_at": certificate.get("createdAt")
        },
        "document": {
            "id": str(document.get("_id")),
            "file_hash": document.get("fileHash"),
            "status": document.get("verificationStatus")
        } if document else None
    }

@router.get("/document/{document_id}")
async def get_document_certificate(
    document_id: str,
    user_id: str = Depends(get_current_user_id)
):
    """Get certificate for a specific document"""
    db = get_database()
    
    certificate = await db.certificates.find_one({
        "documentId": ObjectId(document_id),
        "userId": ObjectId(user_id)
    })
    
    if not certificate:
        return {
            "exists": False,
            "message": "No certificate found for this document"
        }
    
    return {
        "exists": True,
        "certificate": {
            "id": certificate.get("certificateId"),
            "created_at": certificate.get("createdAt"),
            "verifier_name": certificate.get("verifierName")
        }
    }

@router.get("/{document_id}")
async def view_certificate(document_id: str):
    """View certificate for a document (for iframe preview - no auth required for verifiers)"""
    db = get_database()
    
    # Get certificate by document ID
    certificate = await db.certificates.find_one({
        "documentId": ObjectId(document_id)
    })
    
    if not certificate:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate not found for this document"
        )
    
    # Check if file exists
    cert_path = Path(certificate.get("certificatePath"))
    if not cert_path.exists():
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Certificate file not found"
        )
    
    # Return file for viewing (not download)
    return FileResponse(
        path=str(cert_path),
        media_type="application/pdf",
        headers={"Content-Disposition": "inline"}  # View in browser, not download
    )
