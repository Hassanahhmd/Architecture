# Design Scape AI DCC integrations

- SketchUp: Ruby extension source; imports JSON as separate named groups.
- Blender: Python importer; creates separate editable mesh objects.
- 3ds Max: Python/PyMXS importer; creates separate editable box objects.

These are interchange bridges, not native parametric round-trip integrations. They do not yet preserve live parametric constraints, hardware drilling, UV/material maps, render assets, component definitions or workshop CNC operations. Validate unit settings and model orientation in the target application.
