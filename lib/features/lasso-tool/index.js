import ToolManagerModule from '../tool-manager/index.js';
import MouseModule from '../mouse/index.js';

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
