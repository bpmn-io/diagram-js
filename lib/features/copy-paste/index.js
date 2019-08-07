import ClipboardModule from '../clipboard';
import CreateModule from '../create';
import MouseModule from '../mouse';
import RulesModule from '../rules';

import CopyPaste from './CopyPaste';


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
