require 'sketchup.rb'
require 'extensions.rb'

module DesignScape
  module AIImporter
    unless file_loaded?(__FILE__)
      extension = SketchupExtension.new('Design Scape AI Importer', 'design_scape_ai/main')
      extension.description = 'Imports editable Design Scape AI cabinet modules from project JSON.'
      extension.version = '0.1.0'
      extension.creator = 'Design Scape'
      Sketchup.register_extension(extension, true)
      file_loaded(__FILE__)
    end
  end
end
