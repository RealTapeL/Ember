from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
from fastapi.responses import FileResponse
from contextlib import asynccontextmanager
import os

from app.database import init_db
from app.routers import documents, tutorials
from app.config import get_settings

settings = get_settings()

# Detect frontend dist directory
BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
FRONTEND_DIST = os.path.join(BASE_DIR, "..", "frontend", "dist")
FRONTEND_DIST = os.path.normpath(FRONTEND_DIST)
HAS_FRONTEND = os.path.exists(os.path.join(FRONTEND_DIST, "index.html"))

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Startup
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    await init_db()
    yield
    # Shutdown
    pass

app = FastAPI(
    title="Knowledge Legacy Workshop API",
    description="Knowledge Legacy Workshop API",
    version="1.0.0",
    lifespan=lifespan
)

# CORS
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Routers
app.include_router(documents.router)
app.include_router(tutorials.router)

# Health check
@app.get("/api/health")
async def health_check():
    return {"status": "ok"}

# Serve frontend static files if dist exists
if HAS_FRONTEND:
    @app.get("/{full_path:path}")
    async def serve_frontend(request: Request, full_path: str):
        # API routes should not be handled here
        if full_path.startswith("api/"):
            return {"detail": "Not Found"}
        
        file_path = os.path.join(FRONTEND_DIST, full_path)
        if os.path.exists(file_path) and os.path.isfile(file_path):
            return FileResponse(file_path)
        
        # SPA fallback: return index.html for all non-file routes
        return FileResponse(os.path.join(FRONTEND_DIST, "index.html"))

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("app.main:app", host="0.0.0.0", port=8000, reload=True)
