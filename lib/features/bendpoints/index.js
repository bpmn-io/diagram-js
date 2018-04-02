import DraggingModule from '../dragging';
import RulesModule from '../rules';

import Bendpoints from './Bendpoints';
import BendpointMove from './BendpointMove';
import ConnectionSegmentMove from './ConnectionSegmentMove';
import BendpointSnapping from './BendpointSnapping';


export default {
  __depends__: [
    DraggingModule,
    RulesModule
  ],
  __init__: [ 'bendpoints', 'bendpointSnapping' ],
  bendpoints: [ 'type', Bendpoints ],
  bendpointMove: [ 'type', BendpointMove ],
  connectionSegmentMove: [ 'type', ConnectionSegmentMove ],
  bendpointSnapping: [ 'type', BendpointSnapping ]
};
