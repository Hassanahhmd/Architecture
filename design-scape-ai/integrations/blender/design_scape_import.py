"""Import a Design Scape AI project JSON as separate editable Blender mesh objects.
Run from Blender's Scripting workspace. JSON dimensions are meters.
"""
import bpy
import json
from pathlib import Path

def import_design_scape(path: str):
    payload = json.loads(Path(path).read_text(encoding="utf-8"))
    design = payload.get("design", payload)
    collection = bpy.data.collections.new("Design Scape AI")
    bpy.context.scene.collection.children.link(collection)
    for item in design.get("modules", []):
        w, h, d = (float(item[k]) for k in ("width", "height", "depth"))
        x, y, z = float(item.get("x", 0)), float(item.get("y", 0)), float(item.get("z", 0))
        if min(w, h, d) <= 0:
            continue
        bpy.ops.mesh.primitive_cube_add(size=1, location=(x + w/2, d/2 + z, y + h/2))
        obj = bpy.context.object
        obj.name = item.get("label") or item.get("id") or "Design Scape Module"
        obj.dimensions = (w, d, h)
        bpy.ops.object.transform_apply(location=False, rotation=False, scale=True)
        for col in list(obj.users_collection):
            col.objects.unlink(obj)
        collection.objects.link(obj)
        finish = str(item.get("finish", "oak")).lower()
        material = bpy.data.materials.get("DSAI " + finish) or bpy.data.materials.new("DSAI " + finish)
        palette = {"oak":(0.55,0.32,0.14,1),"walnut":(0.20,0.10,0.05,1),"white":(0.88,0.86,0.82,1),"greige":(0.42,0.38,0.33,1),"black":(0.035,0.035,0.035,1)}
        material.diffuse_color = palette.get(finish, palette["oak"])
        obj.data.materials.clear()
        obj.data.materials.append(material)
    return collection

# Set this path before running:
JSON_PATH = ""
if JSON_PATH:
    import_design_scape(JSON_PATH)
