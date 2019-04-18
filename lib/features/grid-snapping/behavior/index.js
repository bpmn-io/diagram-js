import GridSnapping from '../GridSnapping';

import ResizeBehavior from './ResizeBehavior';
import SpaceToolBehavior from './SpaceToolBehavior';

export default {
  __depends__: [
    GridSnapping
  ],
  __init__: [
    'gridSnappingResizeBehavior',
    'gridSnappingSpaceToolBehavior'
  ],
  gridSnappingResizeBehavior: [ 'type', ResizeBehavior ],
  gridSnappingSpaceToolBehavior: [ 'type', SpaceToolBehavior ]
};