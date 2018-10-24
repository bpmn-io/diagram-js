import EditorActions from '../../features/editor-actions';
import KeyboardModule from '../../features/keyboard';

import KeyboardMove from './KeyboardMove';


export default {
  __depends__: [
    EditorActions,
    KeyboardModule
  ],
  __init__: [ 'keyboardMove' ],
  keyboardMove: [ 'type', KeyboardMove ]
};