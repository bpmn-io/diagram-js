import EditorActionsModule from 'lib/features/editor-actions';

import Keyboard from './Keyboard';
import KeyboardBindings from './KeyboardBindings';

export default {
  __depends__: [ EditorActionsModule ],
  __init__: [ 'keyboard', 'keyboardBindings' ],
  keyboard: [ 'type', Keyboard ],
  keyboardBindings: [ 'type', KeyboardBindings ]
};
