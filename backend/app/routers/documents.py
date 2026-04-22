import os
import uuid
import aiofiles
from fastapi import APIRouter, UploadFile, File, Depends, HTTPException, BackgroundTasks
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List

from app.database import get_db
from app.models import Document, Tutorial, Step
from app.config import get_settings
from app.services.document_parser import parse_document
from app.services.tutorial_generator import generate_tutorial_for_document

router = APIRouter(prefix="/api/documents", tags=["documents"])
settings = get_settings()

ALLOWED_EXTENSIONS = {"pdf", "docx", "doc", "md", "markdown", "txt"}

@router.post("/upload")
async def upload_document(
    background_tasks: BackgroundTasks,
    file: UploadFile = File(...),
    db: AsyncSession = Depends(get_db)
):
    """Upload a document and trigger tutorial generation."""
    # Validate file type
    ext = file.filename.split(".")[-1].lower() if "." in file.filename else ""
    if ext not in ALLOWED_EXTENSIONS:
        raise HTTPException(400, detail=f"Unsupported file type. Allowed: {', '.join(ALLOWED_EXTENSIONS)}")
    
    # Check file size (read first chunk)
    content = await file.read()
    if len(content) > settings.MAX_FILE_SIZE:
        raise HTTPException(400, detail="File too large (max 20MB)")
    
    # Save file
    os.makedirs(settings.UPLOAD_DIR, exist_ok=True)
    file_id = str(uuid.uuid4())
    filename = f"{file_id}.{ext}"
    file_path = os.path.join(settings.UPLOAD_DIR, filename)
    
    async with aiofiles.open(file_path, "wb") as f:
        await f.write(content)
    
    # Create document record
    document = Document(
        filename=filename,
        original_name=file.filename,
        file_type=ext,
        file_size=len(content),
        status="uploaded"
    )
    db.add(document)
    await db.commit()
    await db.refresh(document)
    
    # Parse document in background
    background_tasks.add_task(process_document, document.id, file_path, ext)
    
    return {
        "id": document.id,
        "original_name": document.original_name,
        "status": document.status,
        "file_type": document.file_type,
        "file_size": document.file_size,
    }

async def process_document(document_id: int, file_path: str, file_type: str):
    """Background task to parse document and generate tutorial."""
    from app.database import AsyncSessionLocal
    
    async with AsyncSessionLocal() as db:
        try:
            # Parse document
            result = await db.execute(select(Document).where(Document.id == document_id))
            document = result.scalar_one_or_none()
            if not document:
                return
            
            document.status = "parsing"
            await db.commit()
            
            content = await parse_document(file_path, file_type)
            document.content = content
            document.status = "parsed"
            await db.commit()
            
            # Generate tutorial
            await generate_tutorial_for_document(db, document_id)
            
        except Exception as e:
            result = await db.execute(select(Document).where(Document.id == document_id))
            document = result.scalar_one_or_none()
            if document:
                document.status = "error"
                document.error_message = str(e)
                await db.commit()

@router.get("/")
async def list_documents(db: AsyncSession = Depends(get_db)):
    """List all documents."""
    result = await db.execute(select(Document).order_by(Document.created_at.desc()))
    documents = result.scalars().all()
    return [
        {
            "id": d.id,
            "original_name": d.original_name,
            "status": d.status,
            "file_type": d.file_type,
            "file_size": d.file_size,
            "created_at": d.created_at.isoformat() if d.created_at else None,
            "error_message": d.error_message,
        }
        for d in documents
    ]

@router.get("/{document_id}")
async def get_document(document_id: int, db: AsyncSession = Depends(get_db)):
    """Get document details."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(404, detail="Document not found")
    
    return {
        "id": document.id,
        "original_name": document.original_name,
        "status": document.status,
        "file_type": document.file_type,
        "file_size": document.file_size,
        "created_at": document.created_at.isoformat() if document.created_at else None,
        "error_message": document.error_message,
    }

@router.delete("/{document_id}")
async def delete_document(document_id: int, db: AsyncSession = Depends(get_db)):
    """Delete a document and its tutorials."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(404, detail="Document not found")
    
    # Delete file
    file_path = os.path.join(settings.UPLOAD_DIR, document.filename)
    if os.path.exists(file_path):
        os.remove(file_path)
    
    # Delete related tutorials (cascade handled by DB or manually)
    tutorials_result = await db.execute(select(Tutorial).where(Tutorial.document_id == document_id))
    tutorials = tutorials_result.scalars().all()
    for tutorial in tutorials:
        steps_result = await db.execute(select(Step).where(Step.tutorial_id == tutorial.id))
        steps = steps_result.scalars().all()
        for step in steps:
            await db.delete(step)
        await db.delete(tutorial)
    
    await db.delete(document)
    await db.commit()
    
    return {"message": "Deleted successfully"}
