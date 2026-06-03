import KeyboardModule from 'diagram-js/lib/features/keyboard';

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