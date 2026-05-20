import SelectionModule from '../selection';

import KeepSelectionVisibleOnResize from './KeepSelectionVisibleOnResize';

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
