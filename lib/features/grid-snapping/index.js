import Grid from './Grid';
import GridSnapping from './GridSnapping';

import GridSnappingBehaviorModule from './behavior';

export default {
  __depends__: [ GridSnappingBehaviorModule ],
  __init__: [ 'grid', 'gridSnapping' ],
  grid: [ 'type', Grid ],
  gridSnapping: [ 'type', GridSnapping ]
};