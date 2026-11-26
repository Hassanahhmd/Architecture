require 'json'
require 'sketchup.rb'

module DesignScape
  module AIImporter
    extend self

    MATERIALS = {
      'oak' => [184, 138, 90], 'walnut' => [101, 69, 47],
      'white' => [232, 229, 223], 'greige' => [170, 160, 148],
      'black' => [52, 52, 52]
    }.freeze

    def import_project
      path = UI.openpanel('Select Design Scape AI project JSON', '', 'JSON Files|*.json||')
      return unless path
      payload = JSON.parse(File.read(path))
      design = payload['design'] || payload
      modules = design['modules'] || []
      model = Sketchup.active_model
      model.start_operation('Import Design Scape AI', true)
      begin
        modules.each do |item|
          w = item.fetch('width').to_f
          h = item.fetch('height').to_f
          d = item.fetch('depth').to_f
          x = item.fetch('x', 0).to_f
          y = item.fetch('y', 0).to_f
          next if [w, h, d].any? { |v| v <= 0 }
          group = model.active_entities.add_group
          group.name = item['label'] || item['id'] || 'Design Scape Module'
          # Design Scape JSON is meters; SketchUp internal units are inches.
          p1 = Geom::Point3d.new(x.m, 0, y.m)
          p2 = Geom::Point3d.new((x + w).m, 0, y.m)
          p3 = Geom::Point3d.new((x + w).m, d.m, y.m)
          p4 = Geom::Point3d.new(x.m, d.m, y.m)
          face = group.entities.add_face(p1, p2, p3, p4)
          face.reverse! if face.normal.z < 0
          face.pushpull(h.m) if face
          finish = (item['finish'] || 'oak').to_s.downcase
          rgb = MATERIALS[finish] || MATERIALS['oak']
          material = model.materials[finish] || model.materials.add(finish)
          material.color = Sketchup::Color.new(*rgb)
          group.material = material
        end
        model.commit_operation
        UI.messagebox("Imported #{modules.length} Design Scape modules. Review orientation, clearances and component construction before production.")
      rescue StandardError => e
        model.abort_operation
        UI.messagebox("Design Scape import failed: #{e.message}")
      end
    end

    unless file_loaded?(__FILE__)
      UI.menu('Extensions').add_item('Import Design Scape AI JSON') { import_project }
      file_loaded(__FILE__)
    end
  end
end
