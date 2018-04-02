import DraggingModule from '../dragging';

import ToolManager from './ToolManager';

export default {
  __depends__: [
    DraggingModule
  ],
  __init__: [ 'toolManager' ],
  toolManager: [ 'type', ToolManager ]
};
