import GridSnapping from './GridSnapping';

import GridSnappingBehaviorModule from './behavior';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ GridSnappingBehaviorModule ],
  __init__: [ 'gridSnapping' ],
  gridSnapping: [ 'type', GridSnapping ]
};