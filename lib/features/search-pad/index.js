import OverlaysModule from '../overlays/index.js';
import SelectionModule from '../selection/index.js';

import SearchPad from './SearchPad.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    OverlaysModule,
    SelectionModule
  ],
  searchPad: [ 'type', SearchPad ]
};
