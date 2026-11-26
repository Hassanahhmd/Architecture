# Design Scape AI API

```bash
python -m venv .venv
source .venv/bin/activate  # Windows: .venv\\Scripts\\activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

Interactive API docs: http://localhost:8000/docs

Implemented endpoints: health, five deterministic concept generation, basic room-envelope validation, preliminary cut-list rows. Authentication, persistence, AI provider calls and billing are intentionally not simulated.
