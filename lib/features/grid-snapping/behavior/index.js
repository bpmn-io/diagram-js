import PasteBehavior from './PasteBehavior';
import ResizeBehavior from './ResizeBehavior';
import SpaceToolBehavior from './SpaceToolBehavior';

export default {
  __init__: [
    'gridSnappingPasteBehavior',
    'gridSnappingResizeBehavior',
    'gridSnappingSpaceToolBehavior'
  ],
  gridSnappingPasteBehavior: [ 'type', PasteBehavior ],
  gridSnappingResizeBehavior: [ 'type', ResizeBehavior ],
  gridSnappingSpaceToolBehavior: [ 'type', SpaceToolBehavior ]
};