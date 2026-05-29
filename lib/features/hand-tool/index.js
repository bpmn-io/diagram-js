import ToolManagerModule from '../tool-manager/index.js';
import MouseModule from '../mouse/index.js';

import HandTool from './HandTool.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    ToolManagerModule,
    MouseModule
  ],
  __init__: [ 'handTool' ],
  handTool: [ 'type', HandTool ]
};
