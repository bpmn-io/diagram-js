import PopupMenu from './PopupMenu.js';

import Search from '../search/index.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ Search ],
  __init__: [ 'popupMenu' ],
  popupMenu: [ 'type', PopupMenu ]
};
