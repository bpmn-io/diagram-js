import ClipboardModule from '../clipboard';
import RulesModule from '../rules';

import CopyPaste from './CopyPaste';


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
