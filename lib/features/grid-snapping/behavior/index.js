import ResizeBehavior from './ResizeBehavior.js';
import ResizeElementsBehavior from './ResizeElementsBehavior.js';
import SpaceToolBehavior from './SpaceToolBehavior.js';

export default {
  __init__: [
    'gridSnappingResizeBehavior',
    'gridSnappingResizeElementsBehavior',
    'gridSnappingSpaceToolBehavior'
  ],
  gridSnappingResizeBehavior: [ 'type', ResizeBehavior ],
  gridSnappingResizeElementsBehavior: [ 'type', ResizeElementsBehavior ],
  gridSnappingSpaceToolBehavior: [ 'type', SpaceToolBehavior ]
};