import ToolManagerModule from 'diagram-js/lib/features/tool-manager';
import MouseModule from 'diagram-js/lib/features/mouse';

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
