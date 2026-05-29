import GridSnappingBehaviorModule from './behavior/index.js';

import GridSnapping from './GridSnapping.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ GridSnappingBehaviorModule ],
  __init__: [ 'gridSnapping' ],
  gridSnapping: [ 'type', GridSnapping ]
};