import OverlaysModule from '../overlays';
import SelectionModule from '../selection';

import SearchPad from './SearchPad';


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
