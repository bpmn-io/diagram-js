import GridSnapping from '../GridSnapping';

import ResizeBehavior from './ResizeBehavior';

export default {
  __depends__: [
    GridSnapping
  ],
  __init__: [
    'gridSnappingResizeBehavior'
  ],
  gridSnappingResizeBehavior: [ 'type', ResizeBehavior ]
};