import DraggingModule from '../dragging/index.js';

import ToolManager from './ToolManager.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    DraggingModule
  ],
  __init__: [ 'toolManager' ],
  toolManager: [ 'type', ToolManager ]
};
