import ClipboardModule from '../clipboard/index.js';
import RulesModule from '../rules/index.js';

import CopyPaste from './CopyPaste.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    ClipboardModule,
    RulesModule
  ],
  __init__: [ 'copyPaste' ],
  copyPaste: [ 'type', CopyPaste ]
};
