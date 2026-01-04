from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from app.config import settings
from app.database import connect_to_mongo, close_mongo_connection
from app.api import auth, documents, ai, download, bulk_upload, verification, batch_verification, manual_review, preview, certificates, notification_preferences, test_email, shares, public_shares, verifier

# Lifespan event handler
@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    await connect_to_mongo()
    
    # Start file cleanup scheduler
    from app.services.cleanup_scheduler import cleanup_scheduler
    cleanup_scheduler.start()
    
    yield
    
    # Shutdown
    cleanup_scheduler.stop()
    await close_mongo_connection()

# Create FastAPI app
app = FastAPI(
    title=settings.APP_NAME,
    description="Quantum-safe document verification platform API",
    version="0.2.0",
    lifespan=lifespan
)

# CORS middleware
# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:3000",
        "http://127.0.0.1:3000",
        "http://localhost:3001",
        "https://docshield.vercel.app"  # Add your production URL here
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include routers
app.include_router(auth.router)
app.include_router(documents.router)
app.include_router(bulk_upload.router)
app.include_router(download.router)
app.include_router(verification.router)
app.include_router(batch_verification.router)
app.include_router(preview.router)
app.include_router(manual_review.router)
app.include_router(certificates.router)
app.include_router(notification_preferences.router)
app.include_router(test_email.router)
app.include_router(ai.router)
app.include_router(shares.router)
app.include_router(public_shares.router)
app.include_router(verifier.router)

# Health check
@app.get("/")
async def root():
    return {
        "message": "DocShield API",
        "version": "0.2.0",
        "status": "running"
    }

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
