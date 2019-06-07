import KeyboardModule from '../keyboard';
import ToolManagerModule from '../tool-manager';

import HandTool from './HandTool';

export default {
  __depends__: [
    KeyboardModule,
    ToolManagerModule
  ],
  __init__: [ 'handTool' ],
  handTool: [ 'type', HandTool ]
};
