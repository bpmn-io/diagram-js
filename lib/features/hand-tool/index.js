import ToolManagerModule from '../tool-manager';

import HandTool from './HandTool';

export default {
  __depends__: [
    ToolManagerModule
  ],
  __init__: [ 'handTool' ],
  handTool: [ 'type', HandTool ]
};
