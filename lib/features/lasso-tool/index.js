import ToolManagerModule from '../tool-manager';

import LassoTool from './LassoTool';

export default {
  __depends__: [
    ToolManagerModule
  ],
  __init__: [ 'lassoTool' ],
  lassoTool: [ 'type', LassoTool ]
};
