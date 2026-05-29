import CreateMoveSnapping from './CreateMoveSnapping.js';
import ResizeSnapping from './ResizeSnapping.js';
import Snapping from './Snapping.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [
    'createMoveSnapping',
    'resizeSnapping',
    'snapping'
  ],
  createMoveSnapping: [ 'type', CreateMoveSnapping ],
  resizeSnapping: [ 'type', ResizeSnapping ],
  snapping: [ 'type', Snapping ]
};