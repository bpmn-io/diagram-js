import DraggingModule from '../dragging';

import ToolManager from './ToolManager';


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
