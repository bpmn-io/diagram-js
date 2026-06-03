import KeyboardModule from 'diagram-js/lib/features/keyboard';
import SelectionModule from 'diagram-js/lib/features/selection';

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
