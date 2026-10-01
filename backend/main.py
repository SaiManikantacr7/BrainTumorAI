import os
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles

from app.core.config import settings
from app.db.database import initialize_database, initialize_mongodb, close_mongodb, is_mongodb_connected
from app.api.auth import router as auth_router
from app.api.scans import router as scans_router
from app.api.analysis import router as analysis_router
from app.api.patients import router as patients_router
from app.api.models import router as models_router
from app.api.validation import router as validation_router
from app.api.experiments import router as experiments_router
from app.api.reports import router as reports_router
from app.api.admin import router as admin_router
from app.api.geographic import router as geographic_router
from app.api.wellness import router as wellness_router

# Create database tables automatically upon startup
initialize_database()

# Initialize uploads directory
os.makedirs(settings.UPLOAD_DIR, exist_ok=True)

app = FastAPI(
    title="NEUROSCAN AI API",
    description="Explainable Multimodal Brain MRI Analysis Platform — Clinical Decision Support & Research Prototype",
    version="1.3.0",
    docs_url="/docs",
    redoc_url="/redoc",
)

@app.on_event("startup")
def connect_mongodb():
    initialize_mongodb()

@app.on_event("shutdown")
def disconnect_mongodb():
    close_mongodb()

# Configure CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # Allows all origins for seamless local dev & Docker networking
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount uploads static directory
app.mount("/uploads", StaticFiles(directory=settings.UPLOAD_DIR), name="uploads")

# Register routers
app.include_router(auth_router, prefix="/api")
app.include_router(scans_router, prefix="/api")
app.include_router(analysis_router, prefix="/api")
app.include_router(patients_router, prefix="/api")
app.include_router(models_router, prefix="/api")
app.include_router(validation_router, prefix="/api")
app.include_router(experiments_router, prefix="/api")
app.include_router(reports_router, prefix="/api")
app.include_router(admin_router, prefix="/api")
app.include_router(geographic_router, prefix="/api")
app.include_router(wellness_router, prefix="/api")

@app.get("/api/health")
def health_check():
    return {
        "status": "online",
        "platform": settings.APP_NAME,
        "environment": settings.ENVIRONMENT,
        "version": settings.DEFAULT_MODEL_VERSION,
        "device": settings.MODEL_DEVICE,
        "mongodb": "connected" if is_mongodb_connected() else "not_connected",
        "disclaimer": "Research Prototype — AI-generated results require qualified clinician review.",
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="0.0.0.0", port=8000, reload=True)
