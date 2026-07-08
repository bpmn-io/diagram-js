import SelectionModule from '../selection/index.js';

import KeepSelectionVisible from './KeepSelectionVisible.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'keepSelectionVisible' ],
  __depends__: [
    SelectionModule
  ],
  keepSelectionVisible: [ 'type', KeepSelectionVisible ]
};
