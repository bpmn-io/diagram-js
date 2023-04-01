import DraggingModule from '../dragging';
import RulesModule from '../rules';
import ToolManagerModule from '../tool-manager';
import PreviewSupportModule from '../preview-support';
import MouseModule from '../mouse';

import SpaceTool from './SpaceTool';
import SpaceToolPreview from './SpaceToolPreview';


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
