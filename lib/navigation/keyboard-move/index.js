import KeyboardModule from '../../features/keyboard';

import KeyboardMove from './KeyboardMove';


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