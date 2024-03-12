import DraggingModule from '../dragging/index.js';
import RulesModule from '../rules/index.js';

import Bendpoints from './Bendpoints.js';
import BendpointMove from './BendpointMove.js';
import BendpointMovePreview from './BendpointMovePreview.js';
import ConnectionSegmentMove from './ConnectionSegmentMove.js';
import BendpointSnapping from './BendpointSnapping.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    DraggingModule,
    RulesModule
  ],
  __init__: [ 'bendpoints', 'bendpointSnapping', 'bendpointMovePreview' ],
  bendpoints: [ 'type', Bendpoints ],
  bendpointMove: [ 'type', BendpointMove ],
  bendpointMovePreview: [ 'type', BendpointMovePreview ],
  connectionSegmentMove: [ 'type', ConnectionSegmentMove ],
  bendpointSnapping: [ 'type', BendpointSnapping ]
};
