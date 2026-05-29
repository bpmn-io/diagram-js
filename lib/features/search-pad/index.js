import OverlaysModule from '../overlays/index.js';
import SelectionModule from '../selection/index.js';
import TranslateModule from '../../i18n/translate/index.js';

import SearchPad from './SearchPad.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    TranslateModule,
    OverlaysModule,
    SelectionModule
  ],
  searchPad: [ 'type', SearchPad ]
};
