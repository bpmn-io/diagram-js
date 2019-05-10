import DraggingModule from '../dragging';
import RulesModule from '../rules';

import Bendpoints from './Bendpoints';
import BendpointMove from './BendpointMove';
import BendpointMovePreview from './BendpointMovePreview';
import ConnectionSegmentMove from './ConnectionSegmentMove';
import BendpointSnapping from './BendpointSnapping';


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
