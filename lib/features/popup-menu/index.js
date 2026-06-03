import PopupMenu from './PopupMenu.js';

import Search from 'diagram-js/lib/features/search';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ Search ],
  __init__: [ 'popupMenu' ],
  popupMenu: [ 'type', PopupMenu ]
};
