import KeyboardModule from '../keyboard/index.js';
import SelectionModule from '../selection/index.js';

import KeyboardMoveSelection from './KeyboardMoveSelection.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    KeyboardModule,
    SelectionModule
  ],
  __init__: [
    'keyboardMoveSelection'
  ],
  keyboardMoveSelection: [ 'type', KeyboardMoveSelection ]
};
