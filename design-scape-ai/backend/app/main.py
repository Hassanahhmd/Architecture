from __future__ import annotations

import base64
import os
from enum import Enum
from uuid import uuid4
from typing import Literal

from fastapi import FastAPI, File, Form, HTTPException, UploadFile
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Design Scape AI API", version="0.3.0")
app.add_middleware(
    CORSMiddleware,
    allow_origins=os.getenv("CORS_ORIGINS", "http://localhost:3000").split(","),
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

class ProductType(str, Enum):
    kitchen = "kitchen"
    dressing = "dressing"

class Finish(str, Enum):
    oak = "oak"
    walnut = "walnut"
    white = "white"
    greige = "greige"
    black = "black"

class Room(BaseModel):
    width_mm: int = Field(ge=1000, le=15000)
    depth_mm: int = Field(ge=1000, le=15000)
    height_mm: int = Field(ge=2000, le=5000)

class Module(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid4()))
    label: str
    kind: Literal["base", "wall", "tall", "wardrobe", "drawer", "shelf"]
    x_mm: int = Field(ge=0)
    y_mm: int = Field(ge=0, default=0)
    width_mm: int = Field(gt=0)
    height_mm: int = Field(gt=0)
    depth_mm: int = Field(gt=0)
    finish: Finish = Finish.oak
    quantity: int = Field(default=1, ge=1, le=100)

class ConceptRequest(BaseModel):
    product_type: ProductType
    room: Room
    prompt: str = ""
    reference_image_present: bool = False

class DesignSpec(BaseModel):
    id: str
    name: str
    description: str
    product_type: ProductType
    modules: list[Module]
    finish: Finish

class AIConceptResponse(BaseModel):
    designs: list[DesignSpec] = Field(min_length=5, max_length=5)

class ValidateRequest(BaseModel):
    room: Room
    design: DesignSpec

FINISHES = [Finish.oak, Finish.greige, Finish.white, Finish.walnut, Finish.black]
NAMES = ["Warm Minimal", "Soft Contemporary", "Nordic Natural", "Modern Contrast", "Quiet Luxury"]

def generate(req: ConceptRequest):
    result = []
    count = max(3, min(8, req.room.width_mm // 750))
    unit = req.room.width_mm // count
    for i, finish in enumerate(FINISHES):
        modules = []
        if req.product_type == ProductType.kitchen:
            for n in range(count):
                modules.append(Module(
                    id=f"b{i}-{n}",
                    label=["Sink base", "Drawer base", "Hob base", "Storage base"][n % 4],
                    kind="base", x_mm=n * unit, width_mm=max(100, unit - 12),
                    height_mm=880, depth_mm=620, finish=finish,
                ))
            upper_count = max(2, count - 1)
            upper_unit = req.room.width_mm // upper_count
            for n in range(upper_count):
                modules.append(Module(
                    id=f"w{i}-{n}", label="Wall cabinet", kind="wall",
                    x_mm=n * upper_unit, y_mm=1450,
                    width_mm=max(100, upper_unit - 12), height_mm=720,
                    depth_mm=350, finish=Finish.white if i % 2 == 0 else finish,
                ))
            # Tall pantry is placed only when there is sufficient width to avoid
            # silently extending the cabinet run outside the room envelope.
            if req.room.width_mm >= 3600:
                modules.append(Module(
                    id=f"t{i}", label="Tall pantry", kind="tall",
                    x_mm=req.room.width_mm - 660, width_mm=648,
                    height_mm=min(2300, req.room.height_mm - 100),
                    depth_mm=620, finish=Finish.oak if i % 2 == 0 else finish,
                ))
        else:
            for n in range(count):
                modules.append(Module(
                    id=f"d{i}-{n}", label="Hanging bay" if n % 2 else "Shelving bay",
                    kind="wardrobe", x_mm=n * unit, width_mm=max(100, unit - 12),
                    height_mm=min(2350, req.room.height_mm - 100),
                    depth_mm=600, finish=finish,
                ))
        result.append(DesignSpec(
            id=f"{req.product_type.value}-{i + 1}", name=NAMES[i],
            description=f"{NAMES[i]} parametric concept", product_type=req.product_type,
            modules=modules, finish=finish,
        ))
    return result

def validate_spec(room: Room, design: DesignSpec) -> list[str]:
    errors = []
    for module in design.modules:
        if module.x_mm + module.width_mm > room.width_mm:
            errors.append(f"{module.label}: exceeds room width")
        if module.y_mm + module.height_mm > room.height_mm:
            errors.append(f"{module.label}: exceeds room height")
        if module.depth_mm > room.depth_mm:
            errors.append(f"{module.label}: exceeds room depth")
    return errors

@app.get("/health")
def health():
    return {
        "status": "ok",
        "service": "design-scape-ai-api",
        "version": "0.3.0",
        "ai_configured": bool(os.getenv("OPENAI_API_KEY")),
    }

@app.post("/api/v1/concepts", response_model=list[DesignSpec])
def generate_concepts(req: ConceptRequest):
    return generate(req)

@app.post("/api/v1/ai-concepts", response_model=AIConceptResponse)
async def generate_ai_concepts(
    product_type: ProductType = Form(...),
    width_mm: int = Form(..., ge=1000, le=15000),
    depth_mm: int = Form(..., ge=1000, le=15000),
    height_mm: int = Form(..., ge=2000, le=5000),
    prompt: str = Form(""),
    reference_image: UploadFile | None = File(default=None),
):
    api_key = os.getenv("OPENAI_API_KEY")
    if not api_key:
        raise HTTPException(status_code=503, detail="AI provider is not configured. Add OPENAI_API_KEY to the backend environment.")
    image_data_url = None
    if reference_image:
        if reference_image.content_type not in {"image/jpeg", "image/png", "image/webp"}:
            raise HTTPException(status_code=415, detail="Reference image must be JPEG, PNG or WEBP.")
        raw = await reference_image.read()
        if len(raw) > 8 * 1024 * 1024:
            raise HTTPException(status_code=413, detail="Reference image must be 8 MB or smaller.")
        encoded = base64.b64encode(raw).decode("ascii")
        image_data_url = f"data:{reference_image.content_type};base64,{encoded}"

    try:
        from openai import OpenAI
        client = OpenAI(api_key=api_key)
        user_content = [{
            "type": "text",
            "text": (
                f"Create exactly five distinct {product_type.value} design alternatives. "
                f"Room envelope in millimeters: width={width_mm}, depth={depth_mm}, height={height_mm}. "
                f"User brief: {prompt or 'Create practical contemporary storage.'} "
                "Return a parametric design specification, not an image. Use only supported module kinds "
                "(base, wall, tall, wardrobe, drawer, shelf) and finishes (oak, walnut, white, greige, black). "
                "Every module must fit within the room envelope. Coordinates x_mm and y_mm are measured from "
                "the left floor corner. Do not infer exact room dimensions from the reference image; dimensions "
                "provided in text are authoritative. The image is a style/material reference only. "
                "Use practical cabinet widths, depths and heights, leave realistic gaps, and avoid overlapping "
                "modules. Produce five meaningfully different layouts/styles."
            ),
        }]
        if image_data_url:
            user_content.append({"type": "image_url", "image_url": {"url": image_data_url, "detail": "high"}})
        schema = AIConceptResponse.model_json_schema()
        response = client.chat.completions.create(
            model=os.getenv("OPENAI_MODEL", "gpt-4.1-mini"),
            temperature=0.4,
            messages=[
                {"role": "system", "content": "You are a careful kitchen and wardrobe CAD planner. Output valid JSON matching the requested schema. Do not claim code compliance or manufacturing readiness."},
                {"role": "user", "content": user_content},
            ],
            response_format={"type": "json_schema", "json_schema": {"name": "design_concepts", "strict": True, "schema": schema}},
        )
        payload = response.choices[0].message.content
        if not payload:
            raise ValueError("AI provider returned an empty response")
        parsed = AIConceptResponse.model_validate_json(payload)
        for design in parsed.designs:
            errors = validate_spec(Room(width_mm=width_mm, depth_mm=depth_mm, height_mm=height_mm), design)
            if errors:
                raise ValueError("; ".join(errors))
        return parsed
    except HTTPException:
        raise
    except Exception as exc:
        raise HTTPException(status_code=502, detail=f"AI generation failed validation or provider request: {str(exc)[:400]}") from exc

@app.post("/api/v1/validate")
def validate(req: ValidateRequest):
    errors = validate_spec(req.room, req.design)
    return {"valid": not errors, "errors": errors, "checks": ["positive dimensions", "room envelope width", "room envelope height", "room envelope depth"]}

@app.post("/api/v1/cut-list")
def make_cut_list(design: DesignSpec):
    rows = []
    for module in design.modules:
        inner_width = module.width_mm - 36
        inner_height = module.height_mm - 36
        if inner_width <= 0 or inner_height <= 0:
            raise HTTPException(status_code=422, detail=f"{module.label}: module is too small for the assumed 18 mm panel construction.")
        rows.extend([
            {"module_id": module.id, "module": module.label, "part": "Sides", "width_mm": module.depth_mm, "height_mm": module.height_mm, "thickness_mm": 18, "material": module.finish.value, "quantity": 2 * module.quantity},
            {"module_id": module.id, "module": module.label, "part": "Top / Bottom", "width_mm": inner_width, "height_mm": module.depth_mm, "thickness_mm": 18, "material": module.finish.value, "quantity": 2 * module.quantity},
            {"module_id": module.id, "module": module.label, "part": "Back", "width_mm": inner_width, "height_mm": inner_height, "thickness_mm": 6, "material": "back-6mm", "quantity": module.quantity},
        ])
    return {"status": "preliminary", "warning": "Not a fabrication release. Verify construction method, edge banding, grain, hardware, appliance clearances, wall conditions and workshop rules before cutting.", "rows": rows}
