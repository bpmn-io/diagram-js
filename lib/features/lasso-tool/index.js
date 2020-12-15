import ToolManagerModule from '../tool-manager';
import MouseModule from '../mouse';

import LassoTool from './LassoTool';

export default {
  __depends__: [
    ToolManagerModule,
    MouseModule
  ],
  __init__: [ 'lassoTool' ],
  lassoTool: [ 'type', LassoTool ]
};
