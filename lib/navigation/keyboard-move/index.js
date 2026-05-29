import KeyboardModule from '../../features/keyboard/index.js';

import KeyboardMove from './KeyboardMove.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    KeyboardModule
  ],
  __init__: [ 'keyboardMove' ],
  keyboardMove: [ 'type', KeyboardMove ]
};