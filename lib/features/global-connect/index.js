import ConnectModule from '../connect/index.js';
import RulesModule from '../rules/index.js';
import DraggingModule from '../dragging/index.js';
import ToolManagerModule from '../tool-manager/index.js';
import MouseModule from '../mouse/index.js';

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
