# Knowledge Legacy Workshop

> Turn your notes into their ladder.

A knowledge legacy tool for graduates. Users upload their learning documents, notes, or papers, and the system transforms them into structured, interactive tutorials for juniors to learn step by step.

## Project Structure

```
Ember/
├── frontend/          # React + Vite + Tailwind CSS frontend
├── backend/           # FastAPI + SQLAlchemy + SQLite backend
├── design.md          # Design PRD
└── README.md
```

## Tech Stack

- **Frontend**: React 18 + TypeScript + Vite + Tailwind CSS v3
- **Backend**: Python + FastAPI + SQLAlchemy (async) + SQLite
- **LLM**: OpenAI-compatible API (default: Kimi / Moonshot)
- **Document Parsing**: PyPDF2 (PDF) + python-docx (Word) + native (MD/TXT)

## Quick Start

### 1. Start Backend

```bash
cd backend
python3 -m venv .venv
source .venv/bin/activate
pip install -r requirements.txt

# Configure environment variables
cp .env.example .env
# Edit .env and fill in your LLM API Key

# Start server
./start.sh
# Or: uvicorn app.main:app --host 0.0.0.0 --port 8000 --reload
```

Backend runs at `http://localhost:8000`

### 2. Start Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs at `http://localhost:5173`

## Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `LLM_API_KEY` | LLM API Key | (required) |
| `LLM_BASE_URL` | LLM API Base URL | `https://api.moonshot.cn/v1` |
| `LLM_MODEL` | Model name | `moonshot-v1-8k` |
| `DATABASE_URL` | Database connection | `sqlite+aiosqlite:///./ember.db` |
| `UPLOAD_DIR` | Upload file storage directory | `./uploads` |

## Features

- **Document Upload**: Drag-and-drop upload for PDF, Word, Markdown, TXT
- **AI Transformation**: LLM automatically converts documents into structured learning tutorials
- **3D Step Cards**: Mouse hover triggers 3D tilt effect
- **Typewriter Effect**: Step content appears character by character with speed-up support
- **Smart Q&A**: Interactive问答 based on document content
- **Heritage Corridor**: Infinite scrolling visual gallery

## API Docs

Visit `http://localhost:8000/docs` after starting the backend.
