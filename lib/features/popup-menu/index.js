import PopupMenu from './PopupMenu';

import Search from '../search';

import TranslateModule from '../../i18n/translate/index.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    Search,
    TranslateModule
  ],
  __init__: [ 'popupMenu' ],
  popupMenu: [ 'type', PopupMenu ]
};
