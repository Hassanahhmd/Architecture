"""Import Design Scape AI JSON in 3ds Max 2024+ Python console.
Run inside 3ds Max. The project stores dimensions in meters; Max system units are set to the scene's current units.
"""
import json
from pymxs import runtime as rt

def import_design_scape_json(path):
    with open(path, "r", encoding="utf-8") as f:
        payload = json.load(f)
    design = payload.get("design", payload)
    root = rt.Dummy(name="Design Scape AI")
    for item in design.get("modules", []):
        w, h, d = (float(item[k]) for k in ("width", "height", "depth"))
        x, y, z = float(item.get("x", 0)), float(item.get("y", 0)), float(item.get("z", 0))
        if min(w, h, d) <= 0:
            continue
        # Convert meters to current Max system units through the runtime unit converter.
        sx, sy, sz = (rt.units.decodeValue(str(v) + "m") for v in (w, d, h))
        px, py, pz = (rt.units.decodeValue(str(v) + "m") for v in (x, d/2 + z, y + h/2))
        obj = rt.Box(length=sx, width=sy, height=sz, name=item.get("label", "Design Scape Module"))
        obj.pos = rt.Point3(px, py, pz)
        obj.parent = root
        obj.wirecolor = rt.color(184, 138, 90)
    return root

# Example: import_design_scape_json(r"C:\\path\\to\\design-scape-project.json")
