# SketchUp importer source

This Ruby extension imports the project's JSON export as separate named SketchUp groups with simple material assignments.

## Install for development
1. Copy `design_scape_ai_loader.rb` and `design_scape_ai.rb` into SketchUp's Plugins folder.
2. Restart SketchUp.
3. Choose Extensions → Import Design Scape AI JSON.
4. Select a JSON exported from Design Scape AI.

The importer assumes dimensions are meters and converts them to SketchUp internal units. It creates block geometry only. It does not create parametric dynamic components, hardware, joinery, appliance cut-outs, CNC data or verified shop drawings. Review orientation and all dimensions before use.
