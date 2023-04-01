import CreateMoveSnapping from './CreateMoveSnapping';
import ResizeSnapping from './ResizeSnapping';
import Snapping from './Snapping';


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