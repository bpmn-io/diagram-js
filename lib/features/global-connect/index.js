import ConnectModule from '../connect';
import RulesModule from '../rules';
import DraggingModule from '../dragging';
import ToolManagerModule from '../tool-manager';
import MouseModule from '../mouse';

import GlobalConnect from './GlobalConnect';


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
