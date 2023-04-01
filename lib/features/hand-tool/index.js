import ToolManagerModule from '../tool-manager';
import MouseModule from '../mouse';

import HandTool from './HandTool';


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
