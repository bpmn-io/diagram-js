import ClipboardModule from '../clipboard';
import RulesModule from '../rules';
import MouseTrackingModule from '../mouse-tracking';

import CopyPaste from './CopyPaste';


export default {
  __depends__: [
    ClipboardModule,
    RulesModule,
    MouseTrackingModule
  ],
  __init__: [ 'copyPaste' ],
  copyPaste: [ 'type', CopyPaste ]
};
