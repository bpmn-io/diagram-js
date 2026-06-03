import ConnectModule from 'diagram-js/lib/features/connect';
import RulesModule from 'diagram-js/lib/features/rules';
import DraggingModule from 'diagram-js/lib/features/dragging';
import ToolManagerModule from 'diagram-js/lib/features/tool-manager';
import MouseModule from 'diagram-js/lib/features/mouse';

import GlobalConnect from './GlobalConnect.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    ConnectModule,
    RulesModule,
    DraggingModule,
    ToolManagerModule,
    MouseModule
  ],
  globalConnect: [ 'type', GlobalConnect ]
};
