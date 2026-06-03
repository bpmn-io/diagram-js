import DraggingModule from 'diagram-js/lib/features/dragging';

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
