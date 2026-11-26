from fastapi.testclient import TestClient
from app.main import app

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
    monkeypatch.delenv("OPENAI_API_KEY", raising=False)
    response = client.post("/api/v1/ai-concepts", data={
        "product_type": "kitchen", "width_mm": 4200, "depth_mm": 3200,
        "height_mm": 2800, "prompt": "minimal kitchen"
    })
    assert response.status_code == 503

def test_cut_list_is_explicitly_preliminary():
    designs = client.post("/api/v1/concepts", json={
        "product_type": "kitchen",
        "room": {"width_mm": 4200, "depth_mm": 3200, "height_mm": 2800}
    }).json()
    response = client.post("/api/v1/cut-list", json=designs[0])
    assert response.status_code == 200
    assert response.json()["status"] == "preliminary"
    assert len(response.json()["rows"]) == len(designs[0]["modules"]) * 3
