import ConnectionSnapping from './ConnectionSnapping';
import CreateMoveSnapping from './CreateMoveSnapping';
import ResizeSnapping from './ResizeSnapping';
import Snapping from './Snapping';

export default {
  __init__: [
    'connectionSnapping',
    'createMoveSnapping',
    'resizeSnapping',
    'snapping'
  ],
  connectionSnapping: [ 'type', ConnectionSnapping ],
  createMoveSnapping: [ 'type', CreateMoveSnapping ],
  resizeSnapping: [ 'type', ResizeSnapping ],
  snapping: [ 'type', Snapping ]
};