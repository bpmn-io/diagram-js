import Keyboard from './Keyboard.js';
import KeyboardBindings from './KeyboardBindings.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'keyboard', 'keyboardBindings' ],
  keyboard: [ 'type', Keyboard ],
  keyboardBindings: [ 'type', KeyboardBindings ]
};
