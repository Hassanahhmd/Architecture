from __future__ import annotations
from enum import Enum
from typing import Literal
from uuid import uuid4
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

app = FastAPI(title="Design Scape AI API", version="0.2.0")
app.add_middleware(CORSMiddleware, allow_origins=["http://localhost:3000"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

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

class ValidateRequest(BaseModel):
    room: Room
    design: DesignSpec

FINISHES = [Finish.oak, Finish.greige, Finish.white, Finish.walnut, Finish.black]
NAMES = ["Warm Minimal", "Soft Contemporary", "Nordic Natural", "Modern Contrast", "Quiet Luxury"]

def generate(req: ConceptRequest):
    result = []
    count = max(3, min(8, req.room.width_mm // 750))
    for i, finish in enumerate(FINISHES):
        modules = []
        unit = req.room.width_mm // count
        if req.product_type == ProductType.kitchen:
            for n in range(count):
                modules.append(Module(id=f"b{i}-{n}", label=["Sink base", "Drawer base", "Hob base", "Storage base"][n % 4], kind="base", x_mm=n*unit, width_mm=max(100, unit-12), height_mm=880, depth_mm=620, finish=finish))
            upper_count = max(2, count-1)
            for n in range(upper_count):
                modules.append(Module(id=f"w{i}-{n}", label="Wall cabinet", kind="wall", x_mm=n*(req.room.width_mm//upper_count), y_mm=1450, width_mm=max(100, req.room.width_mm//upper_count-12), height_mm=720, depth_mm=350, finish=Finish.white if i%2 == 0 else finish))
            modules.append(Module(id=f"t{i}", label="Tall pantry", kind="tall", x_mm=max(0, req.room.width_mm-680), width_mm=660, height_mm=min(2300, req.room.height_mm-100), depth_mm=620, finish=Finish.oak if i%2 == 0 else finish))
        else:
            for n in range(count):
                modules.append(Module(id=f"d{i}-{n}", label="Hanging bay" if n%2 else "Shelving bay", kind="wardrobe", x_mm=n*unit, width_mm=max(100, unit-12), height_mm=min(2350, req.room.height_mm-100), depth_mm=600, finish=finish))
        result.append(DesignSpec(id=f"{req.product_type.value}-{i+1}", name=NAMES[i], description=f"{NAMES[i]} parametric concept", product_type=req.product_type, modules=modules, finish=finish))
    return result

@app.get("/health")
def health():
    return {"status": "ok", "service": "design-scape-ai-api", "version": "0.2.0"}

@app.post("/api/v1/concepts", response_model=list[DesignSpec])
def generate_concepts(req: ConceptRequest):
    return generate(req)

@app.post("/api/v1/validate")
def validate(req: ValidateRequest):
    errors = []
    for module in req.design.modules:
        if module.x_mm + module.width_mm > req.room.width_mm:
            errors.append(f"{module.label}: exceeds room width")
        if module.y_mm + module.height_mm > req.room.height_mm:
            errors.append(f"{module.label}: exceeds room height")
    return {"valid": not errors, "errors": errors, "checks": ["positive dimensions", "room envelope"]}

@app.post("/api/v1/cut-list")
def make_cut_list(design: DesignSpec):
    rows = []
    for module in design.modules:
        rows.extend([
            {"module_id": module.id, "module": module.label, "part": "Sides", "width_mm": module.depth_mm, "height_mm": module.height_mm, "thickness_mm": 18, "material": module.finish.value, "quantity": 2*module.quantity},
            {"module_id": module.id, "module": module.label, "part": "Top / Bottom", "width_mm": module.width_mm-36, "height_mm": module.depth_mm, "thickness_mm": 18, "material": module.finish.value, "quantity": 2*module.quantity},
            {"module_id": module.id, "module": module.label, "part": "Back", "width_mm": module.width_mm-36, "height_mm": module.height_mm-36, "thickness_mm": 6, "material": "back-6mm", "quantity": module.quantity},
        ])
    return {"status": "preliminary", "warning": "Verify construction, edge banding, grain, hardware and workshop rules before fabrication.", "rows": rows}
