import SelectionModule from '../selection/index.js';

import KeepSelectionVisibleOnResize from './KeepSelectionVisibleOnResize.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'keepSelectionVisibleOnResize' ],
  __depends__: [
    SelectionModule
  ],
  keepSelectionVisibleOnResize: [ 'type', KeepSelectionVisibleOnResize ]
};
