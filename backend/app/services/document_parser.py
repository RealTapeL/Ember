import aiofiles

async def parse_document(file_path: str, file_type: str) -> str:
    """Parse uploaded document and extract text content."""
    ext = file_type.lower()
    
    if ext in ["pdf"]:
        return await _parse_pdf(file_path)
    elif ext in ["docx", "doc"]:
        return await _parse_docx(file_path)
    elif ext in ["md", "markdown", "txt"]:
        return await _parse_text(file_path)
    else:
        raise ValueError(f"Unsupported file type: {file_type}")

async def _parse_pdf(file_path: str) -> str:
    try:
        from PyPDF2 import PdfReader
        reader = PdfReader(file_path)
        text = ""
        for page in reader.pages:
            page_text = page.extract_text()
            if page_text:
                text += page_text + "\n\n"
        return text.strip()
    except Exception as e:
        raise ValueError(f"PDF parsing error: {str(e)}")

async def _parse_docx(file_path: str) -> str:
    try:
        from docx import Document
        doc = Document(file_path)
        paragraphs = [p.text for p in doc.paragraphs if p.text.strip()]
        return "\n\n".join(paragraphs)
    except Exception as e:
        raise ValueError(f"DOCX parsing error: {str(e)}")

async def _parse_text(file_path: str) -> str:
    try:
        async with aiofiles.open(file_path, "r", encoding="utf-8") as f:
            return await f.read()
    except UnicodeDecodeError:
        async with aiofiles.open(file_path, "r", encoding="gbk") as f:
            return await f.read()
    except Exception as e:
        raise ValueError(f"Text parsing error: {str(e)}")
