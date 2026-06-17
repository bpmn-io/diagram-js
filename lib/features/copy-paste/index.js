import ClipboardModule from 'diagram-js/lib/features/clipboard';
import CreateModule from 'diagram-js/lib/features/create';
import MouseModule from 'diagram-js/lib/features/mouse';
import RulesModule from 'diagram-js/lib/features/rules';

import CopyPaste from './CopyPaste.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    ClipboardModule,
    CreateModule,
    MouseModule,
    RulesModule
  ],
  __init__: [ 'copyPaste' ],
  copyPaste: [ 'type', CopyPaste ]
};
