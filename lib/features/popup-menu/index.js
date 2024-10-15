import PopupMenu from './PopupMenu';

import Search from '../search';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ Search ],
  __init__: [ 'popupMenu' ],
  popupMenu: [ 'type', PopupMenu ]
};
