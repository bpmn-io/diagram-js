import DraggingModule from 'diagram-js/lib/features/dragging';
import RulesModule from 'diagram-js/lib/features/rules';
import ToolManagerModule from 'diagram-js/lib/features/tool-manager';
import PreviewSupportModule from 'diagram-js/lib/features/preview-support';
import MouseModule from 'diagram-js/lib/features/mouse';

import SpaceTool from './SpaceTool.js';
import SpaceToolPreview from './SpaceToolPreview.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'spaceToolPreview' ],
  __depends__: [
    DraggingModule,
    RulesModule,
    ToolManagerModule,
    PreviewSupportModule,
    MouseModule
  ],
  spaceTool: [ 'type', SpaceTool ],
  spaceToolPreview: [ 'type', SpaceToolPreview ]
};
