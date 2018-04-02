import OverlaysModule from '../overlays';
import SelectionModule from '../selection';

import SearchPad from './SearchPad';

export default {
  __depends__: [
    OverlaysModule,
    SelectionModule
  ],
  searchPad: [ 'type', SearchPad ]
};
