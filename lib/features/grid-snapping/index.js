import GridSnapping from './GridSnapping';

import GridSnappingBehaviorModule from './behavior';

export default {
  __depends__: [ GridSnappingBehaviorModule ],
  __init__: [ 'gridSnapping' ],
  gridSnapping: [ 'type', GridSnapping ]
};