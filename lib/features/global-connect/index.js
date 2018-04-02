import ConnectModule from '../connect';
import RulesModule from '../rules';
import DraggingModule from '../dragging';
import ToolManagerModule from '../tool-manager';

import GlobalConnect from './GlobalConnect';

export default {
  __depends__: [
    ConnectModule,
    RulesModule,
    DraggingModule,
    ToolManagerModule
  ],
  globalConnect: [ 'type', GlobalConnect ]
};
