import DraggingModule from '../dragging/index.js';
import RulesModule from '../rules/index.js';
import ToolManagerModule from '../tool-manager/index.js';
import PreviewSupportModule from '../preview-support/index.js';
import MouseModule from '../mouse/index.js';

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
