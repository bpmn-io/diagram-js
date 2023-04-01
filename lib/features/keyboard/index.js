import Keyboard from './Keyboard';
import KeyboardBindings from './KeyboardBindings';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'keyboard', 'keyboardBindings' ],
  keyboard: [ 'type', Keyboard ],
  keyboardBindings: [ 'type', KeyboardBindings ]
};
