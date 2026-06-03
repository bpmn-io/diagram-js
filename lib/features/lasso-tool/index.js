import ToolManagerModule from 'diagram-js/lib/features/tool-manager';
import MouseModule from 'diagram-js/lib/features/mouse';

import LassoTool from './LassoTool.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    ToolManagerModule,
    MouseModule
  ],
  __init__: [ 'lassoTool' ],
  lassoTool: [ 'type', LassoTool ]
};
