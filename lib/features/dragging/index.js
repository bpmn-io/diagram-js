import HoverFixModule from '../hover-fix/index.js';
import SelectionModule from '../selection/index.js';

import Dragging from './Dragging.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    HoverFixModule,
    SelectionModule,
  ],
  dragging: [ 'type', Dragging ],
};