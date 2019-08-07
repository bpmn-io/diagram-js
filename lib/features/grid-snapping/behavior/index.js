import ResizeBehavior from './ResizeBehavior';
import SpaceToolBehavior from './SpaceToolBehavior';

export default {
  __init__: [
    'gridSnappingResizeBehavior',
    'gridSnappingSpaceToolBehavior'
  ],
  gridSnappingResizeBehavior: [ 'type', ResizeBehavior ],
  gridSnappingSpaceToolBehavior: [ 'type', SpaceToolBehavior ]
};