import HoverFixModule from '../hover-fix';
import SelectionModule from '../selection';

import Dragging from './Dragging';


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