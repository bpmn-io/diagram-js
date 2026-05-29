import ResizeBehavior from './ResizeBehavior.js';
import SpaceToolBehavior from './SpaceToolBehavior.js';

export default {
  __init__: [
    'gridSnappingResizeBehavior',
    'gridSnappingSpaceToolBehavior'
  ],
  gridSnappingResizeBehavior: [ 'type', ResizeBehavior ],
  gridSnappingSpaceToolBehavior: [ 'type', SpaceToolBehavior ]
};