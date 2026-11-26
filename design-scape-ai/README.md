# Design Scape AI

A web-first parametric kitchen and dressing-room concept studio by Design Scape. This is an MVP / development foundation, not a production CAD/CAM or manufacturing-release system.

## What is included

### Web application
- Next.js 14 + TypeScript responsive workspace.
- Three.js / React Three Fiber interactive 3D viewport with orbit and zoom.
- Kitchen and dressing-room project modes.
- Five deterministic local parametric concept presets.
- Backend API connection for concept generation.
- Optional AI prompt + reference-image generation when an OpenAI API key is configured on the backend.
- Editable module dimensions, position, labels and finishes.
- Browser-local project save.
- JSON project, OBJ geometry and preliminary cut-list CSV downloads.
- Indicative cost calculation using editable-in-code starter assumptions.

### API
- FastAPI endpoints for health, deterministic concepts, optional AI concepts, room-envelope / front-elevation validation and preliminary cut-list rows.
- AI route accepts JPEG, PNG and WEBP reference images up to 8 MB. Images are treated as style references; text dimensions remain authoritative.
- AI output is parsed into a Pydantic schema and rejected if modules exceed the room envelope, overlap in front elevation, or mismatch the requested product type.

### Software integrations
- SketchUp Ruby importer source: creates separate named groups with simple materials from project JSON.
- Blender Python importer: creates separate editable mesh objects.
- 3ds Max Python / PyMXS importer: creates separate box objects.
- Prisma schema and PostgreSQL Docker Compose starter.

## Run locally

Requirements: Node.js 20+, Python 3.12+, and optionally Docker.

### 1. Configure backend

```bash
cd design-scape-ai/backend
python -m venv .venv
# Windows: .venv\\Scripts\\activate
# macOS/Linux: source .venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload --port 8000
```

API docs: http://localhost:8000/docs

### 2. Configure AI (optional)

Set `OPENAI_API_KEY` and optionally `OPENAI_MODEL` in the backend process environment. The API key must stay on the server; never expose it as a `NEXT_PUBLIC_*` variable or commit it to Git.

Without the key, the app uses deterministic parametric presets and clearly reports that AI generation is unavailable.

### 3. Run frontend

In a second terminal:

```bash
cd design-scape-ai
npm install
npm run dev
```

Open http://localhost:3000. Set `NEXT_PUBLIC_API_URL=http://localhost:8000` if the API runs elsewhere.

### 4. Optional PostgreSQL starter

```bash
docker compose up -d db
```

The Prisma schema is included as a persistence design baseline. Project persistence is not yet wired to Prisma; current browser save uses localStorage.

## API endpoints

- `GET /health`
- `POST /api/v1/concepts`
- `POST /api/v1/ai-concepts` (multipart form; requires server-side `OPENAI_API_KEY`)
- `POST /api/v1/validate`
- `POST /api/v1/cut-list`

## Important limitations and safety

- AI generation requires a valid provider key, model access, internet connectivity and billing on the provider account.
- No authentication, user accounts, tenant isolation, subscription checkout, payment webhooks, cloud project storage or admin dashboard are implemented.
- The Prisma schema is not yet connected to runtime persistence.
- Cost figures are illustrative placeholders, not supplier quotations. Replace them with verified supplier / workshop price lists.
- Cut lists assume a simple 18 mm panel / 6 mm back construction and are preliminary only. They do not include edge-banding deductions, grain direction, hardware drilling, appliance voids, CNC nesting, joinery details or workshop-specific rules.
- Room validation is a basic geometric envelope and front-elevation check, not building-code, ergonomic or installation approval.
- OBJ export and DCC importers create simple block geometry. Native SKP / FBX export, parametric round-trip editing, dynamic components, UV maps, render assets and manufacturing-ready shop drawings are not implemented.
- Verify units, orientation, dimensions, material definitions, appliance clearances and all fabrication data with a qualified designer / workshop before execution.

## Roadmap to production SaaS

1. Add secure authentication, role-based access and tenant isolation.
2. Wire PostgreSQL persistence, project versions, cloud file storage and backups.
3. Add payment provider selection for the intended market, subscription checkout, verified webhooks, invoices and credit metering.
4. Replace placeholder cost assumptions with an admin-managed supplier catalog.
5. Expand parametric rules for L / U / island kitchens, corner mechanisms, appliance dimensions, door swings, fillers, plinths, worktops and hardware.
6. Implement manufacturing-grade cut-list rules, edge-banding, sheet nesting, CNC and workshop validation.
7. Package and test native SketchUp extension; improve Blender / 3ds Max adapters and add GLB / FBX pipelines.
8. Add end-to-end, security, accessibility and performance tests before public launch.
