import KeyboardModule from '../keyboard';
import SelectionModule from '../selection';

import KeyboardMoveSelection from './KeyboardMoveSelection';


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
