from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel
from bson import ObjectId
from datetime import datetime
from app.database import get_database
from app.api.documents import get_current_user_id

router = APIRouter(prefix="/api/documents", tags=["Document Category"])

class UpdateCategoryRequest(BaseModel):
    category: str

@router.patch("/{document_id}/category")
async def update_document_category(
    document_id: str,
    request: UpdateCategoryRequest,
    user_id: str = Depends(get_current_user_id)
):
    """Update document category"""
    db = get_database()
    
    # Verify document exists and user owns it
    try:
        doc = await db.documents.find_one({
            "_id": ObjectId(document_id),
            "userId": ObjectId(user_id)
        })
    except:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid document ID"
        )
    
    if not doc:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Document not found or access denied"
        )
    
    # Update category
    await db.documents.update_one(
        {"_id": ObjectId(document_id)},
        {
            "$set": {
                "metadata.category": request.category,
                "updatedAt": datetime.utcnow()
            }
        }
    )
    
    return {"success": True, "category": request.category}
