# SketchUp importer source

This Ruby extension imports the project's JSON export as separate named SketchUp groups with simple material assignments.

## Install for development
1. Download the `design-scape-ai-sketchup-extension` artifact from the GitHub Actions workflow (or package the two files using the documented folder structure).
2. In SketchUp, open Extension Manager → Install Extension and select `design-scape-ai-sketchup.rbz`.
3. Restart SketchUp.
3. Choose Extensions → Import Design Scape AI JSON.
4. Select a JSON exported from Design Scape AI.

The importer assumes dimensions are meters and converts them to SketchUp internal units. It creates block geometry only. It does not create parametric dynamic components, hardware, joinery, appliance cut-outs, CNC data or verified shop drawings. Review orientation and all dimensions before use.
