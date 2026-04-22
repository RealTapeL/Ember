from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.models import Document, Tutorial, Step
from app.services.llm_service import llm_service

async def generate_tutorial_for_document(db: AsyncSession, document_id: int):
    """Generate tutorial for a document."""
    # Get document
    result = await db.execute(select(Document).where(Document.id == document_id))
    document = result.scalar_one_or_none()
    if not document:
        raise ValueError("Document not found")
    
    # Update status
    document.status = "generating"
    await db.commit()
    
    try:
        # Generate tutorial via LLM
        tutorial_data = await llm_service.generate_tutorial(
            document.content,
            document.original_name
        )
        
        # Create tutorial
        tutorial = Tutorial(
            document_id=document.id,
            title=tutorial_data.get("title", "Untitled Tutorial"),
            description=tutorial_data.get("description", ""),
            status="completed"
        )
        db.add(tutorial)
        await db.flush()  # Get tutorial.id
        
        # Create steps
        steps_data = tutorial_data.get("steps", [])
        for step_data in steps_data:
            step = Step(
                tutorial_id=tutorial.id,
                order=step_data.get("order", 0),
                title=step_data.get("title", "Untitled Step"),
                description=step_data.get("description", ""),
                content=step_data.get("content", "")
            )
            db.add(step)
        
        # Update document status
        document.status = "completed"
        await db.commit()
        
        return tutorial
        
    except Exception as e:
        document.status = "error"
        document.error_message = str(e)
        await db.commit()
        raise
