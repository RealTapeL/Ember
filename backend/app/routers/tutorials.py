from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import FileResponse
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import Optional

from app.database import get_db
from app.models import Tutorial, Step, Document
from app.services.llm_service import llm_service
from app.services.export_service import export_tutorial_to_docx

router = APIRouter(prefix="/api/tutorials", tags=["tutorials"])

@router.get("/document/{document_id}")
async def get_tutorial_by_document(document_id: int, db: AsyncSession = Depends(get_db)):
    """Get tutorial for a document."""
    result = await db.execute(select(Tutorial).where(Tutorial.document_id == document_id))
    tutorial = result.scalar_one_or_none()
    if not tutorial:
        raise HTTPException(404, detail="Tutorial not found")
    
    # Get steps
    steps_result = await db.execute(
        select(Step).where(Step.tutorial_id == tutorial.id).order_by(Step.order)
    )
    steps = steps_result.scalars().all()
    
    return {
        "id": tutorial.id,
        "document_id": tutorial.document_id,
        "title": tutorial.title,
        "description": tutorial.description,
        "status": tutorial.status,
        "created_at": tutorial.created_at.isoformat() if tutorial.created_at else None,
        "steps": [
            {
                "id": s.id,
                "order": s.order,
                "title": s.title,
                "description": s.description,
            }
            for s in steps
        ]
    }

@router.get("/steps/{step_id}")
async def get_step_detail(step_id: int, db: AsyncSession = Depends(get_db)):
    """Get step detail content."""
    result = await db.execute(select(Step).where(Step.id == step_id))
    step = result.scalar_one_or_none()
    if not step:
        raise HTTPException(404, detail="Step not found")
    
    return {
        "id": step.id,
        "tutorial_id": step.tutorial_id,
        "order": step.order,
        "title": step.title,
        "description": step.description,
        "content": step.content,
    }

@router.post("/chat/{document_id}")
async def chat_with_document(
    document_id: int,
    question: str,
    history: Optional[list] = None,
    db: AsyncSession = Depends(get_db)
):
    """Chat about a document."""
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise HTTPException(404, detail="Document not found")
    
    if not document.content:
        raise HTTPException(400, detail="Document content not parsed yet")
    
    try:
        result = await llm_service.chat_with_document(
            document.content,
            question,
            history
        )
        return {"answer": result["answer"], "reasoning": result.get("reasoning", "")}
    except Exception as e:
        raise HTTPException(500, detail=str(e))

@router.get("/{tutorial_id}/export")
async def export_tutorial(tutorial_id: int, db: AsyncSession = Depends(get_db)):
    """Export tutorial as Word document."""
    result = await db.execute(select(Tutorial).where(Tutorial.id == tutorial_id))
    tutorial = result.scalar_one_or_none()
    if not tutorial:
        raise HTTPException(404, detail="Tutorial not found")
    
    try:
        file_path = await export_tutorial_to_docx(db, tutorial_id)
        return FileResponse(
            file_path,
            media_type="application/vnd.openxmlformats-officedocument.wordprocessingml.document",
            filename=f"{tutorial.title}.docx",
        )
    except Exception as e:
        raise HTTPException(500, detail=f"Export failed: {str(e)}")
