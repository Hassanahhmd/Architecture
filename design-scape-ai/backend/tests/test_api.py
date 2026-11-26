from pathlib import Path
import sys

# Make the backend package import stable whether pytest is invoked from the
# repository root or the backend directory.
sys.path.insert(0, str(Path(__file__).resolve().parents[1]))

from fastapi.testclient import TestClient
from app.main import app
from app.db import Base, engine
from app import models

Base.metadata.create_all(bind=engine)
client = TestClient(app)

def test_health_reports_ai_configuration():
    response = client.get("/health")
    assert response.status_code == 200
    assert response.json()["status"] == "ok"

def test_five_kitchen_concepts_fit_room():
    response = client.post("/api/v1/concepts", json={
        "product_type": "kitchen",
        "room": {"width_mm": 4200, "depth_mm": 3200, "height_mm": 2800},
        "prompt": "warm oak and greige"
    })
    assert response.status_code == 200
    designs = response.json()
    assert len(designs) == 5
    for design in designs:
        for module in design["modules"]:
            assert module["x_mm"] + module["width_mm"] <= 4200
            assert module["y_mm"] + module["height_mm"] <= 2800
            assert module["depth_mm"] <= 3200

def test_five_dressing_concepts_fit_room():
    response = client.post("/api/v1/concepts", json={
        "product_type": "dressing",
        "room": {"width_mm": 3600, "depth_mm": 2600, "height_mm": 2700}
    })
    assert response.status_code == 200
    assert len(response.json()) == 5

def test_invalid_room_is_rejected():
    response = client.post("/api/v1/concepts", json={
        "product_type": "kitchen",
        "room": {"width_mm": 300, "depth_mm": 3200, "height_mm": 2800}
    })
    assert response.status_code == 422

def test_ai_endpoint_requires_secret_instead_of_fake_generation(monkeypatch):
    import uuid
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    email = f"{uuid.uuid4()}@example.com"
    registered = client.post("/api/v1/auth/register", json={"email": email, "password": "ci-test-password-123"})
    assert registered.status_code == 201
    token = registered.json()["access_token"]
    response = client.post("/api/v1/ai-concepts", headers={"Authorization": f"Bearer {token}"}, data={
        "product_type": "kitchen", "width_mm": 4200, "depth_mm": 3200,
        "height_mm": 2800, "prompt": "minimal kitchen"
    })
    assert response.status_code == 503

def test_authenticated_user_can_save_and_list_projects():
    import uuid
    email = f"{uuid.uuid4()}@example.com"
    registered = client.post("/api/v1/auth/register", json={"email": email, "password": "ci-test-password-123"})
    assert registered.status_code == 201
    token = registered.json()["access_token"]
    headers = {"Authorization": f"Bearer {token}"}
    saved = client.post("/api/v1/projects", headers=headers, json={
        "name": "CI kitchen",
        "product_type": "kitchen",
        "room": {"width": 4.2, "depth": 3.2, "height": 2.8},
        "design": {"id": "sample", "modules": []}
    })
    assert saved.status_code == 201
    assert saved.json()["name"] == "CI kitchen"
    listed = client.get("/api/v1/projects", headers=headers)
    assert listed.status_code == 200
    assert any(p["id"] == saved.json()["id"] for p in listed.json())

def test_projects_require_authentication():
    response = client.get("/api/v1/projects")
    assert response.status_code == 401

def test_cut_list_is_explicitly_preliminary():
    designs = client.post("/api/v1/concepts", json={
        "product_type": "kitchen",
        "room": {"width_mm": 4200, "depth_mm": 3200, "height_mm": 2800}
    }).json()
    response = client.post("/api/v1/cut-list", json=designs[0])
    assert response.status_code == 200
    assert response.json()["status"] == "preliminary"
    assert len(response.json()["rows"]) == len(designs[0]["modules"]) * 3

def test_kitchen_concepts_do_not_overlap_tall_pantry_on_front_elevation():
    response = client.post("/api/v1/concepts", json={
        "product_type": "kitchen",
        "room": {"width_mm": 4200, "depth_mm": 3200, "height_mm": 2800}
    })
    design = response.json()[0]
    modules = design["modules"]
    tall = next(m for m in modules if m["kind"] == "tall")
    bases = [m for m in modules if m["kind"] == "base"]
    walls = [m for m in modules if m["kind"] == "wall"]
    assert all(b["x_mm"] + b["width_mm"] <= tall["x_mm"] or tall["x_mm"] + tall["width_mm"] <= b["x_mm"] for b in bases)
    assert all(w["x_mm"] + w["width_mm"] <= tall["x_mm"] or tall["x_mm"] + tall["width_mm"] <= w["x_mm"] for w in walls)
