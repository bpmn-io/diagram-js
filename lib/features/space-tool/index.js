import DraggingModule from '../dragging';
import RulesModule from '../rules';
import ToolManagerModule from '../tool-manager';
import PreviewSupportModule from '../preview-support';

import SpaceTool from './SpaceTool';
import SpaceToolPreview from './SpaceToolPreview';

export default {
  __init__: ['spaceToolPreview'],
  __depends__: [
    DraggingModule,
    RulesModule,
    ToolManagerModule,
    PreviewSupportModule
  ],
  spaceTool: ['type', SpaceTool ],
  spaceToolPreview: ['type', SpaceToolPreview ]
};
