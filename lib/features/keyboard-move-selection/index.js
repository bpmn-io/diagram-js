import KeyboardModule from '../keyboard';
import SelectionModule from '../selection';

import KeyboardMoveSelection from './KeyboardMoveSelection';

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
