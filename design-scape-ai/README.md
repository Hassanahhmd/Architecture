# Design Scape AI

Web-first kitchen and dressing-room design configurator for Design Scape.

## MVP scope
- Next.js 14 + TypeScript frontend with a React Three Fiber viewport.
- Five deterministic concept alternatives for kitchen and dressing-room projects.
- Editable dimensions, modules and finishes.
- JSON, OBJ and preliminary cut-list CSV exports.
- FastAPI backend with concept generation, basic room-envelope validation and preliminary cut-list endpoints.
- Prisma PostgreSQL schema and Docker Compose starter.

## Local development
Requirements: Node.js 20+, Python 3.11+, Docker (optional).

Frontend:
```bash
npm install
npm run dev
```
Open http://localhost:3000.

Backend:
```bash
cd backend
python -m venv .venv
# activate .venv, then:
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```
API docs: http://localhost:8000/docs.

## Environment
Copy `.env.example` to `.env.local` and configure secrets locally. Never commit API keys, payment credentials or database passwords.

## Important limitations
This is an MVP foundation, not a production CAD/CAM application. Concept generation is deterministic; no live LLM or vision provider is connected. Reference uploads are previewed in the browser only. Cost figures are illustrative assumptions. Cut lists are preliminary carcass estimates, not verified fabrication schedules. Appliance clearances, collision checks, opening swings, edge banding, hardware drilling, grain direction, sheet nesting and workshop-specific rules are not implemented. OBJ is an interchange export; native SKP and FBX export are not implemented. Authentication, tenant isolation, cloud persistence, subscriptions, payment webhooks, admin catalog and production deployment remain future work.

## Architecture roadmap
- Keep geometry generation deterministic; AI should return schema-validated DesignSpec data only.
- Store authoritative dimensions in millimeters at API and persistence boundaries.
- Use GLB as browser interchange; develop SketchUp Ruby and Blender Python adapters for native workflows.
- Validate manufacturing rules with a real workshop before claiming production readiness.
- Add secure authentication, role-based access, tenant-isolated records, usage credits and verified payment webhooks before public SaaS launch.
