import ToolManagerModule from '../tool-manager';
import MouseModule from '../mouse';

import HandTool from './HandTool';

export default {
  __depends__: [
    ToolManagerModule,
    MouseModule
  ],
  __init__: [ 'handTool' ],
  handTool: [ 'type', HandTool ]
};
