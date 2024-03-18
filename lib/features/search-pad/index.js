import OverlaysModule from '../overlays';
import SelectionModule from '../selection';
import TranslateModule from '../../i18n/translate/index.js';

import SearchPad from './SearchPad';


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
