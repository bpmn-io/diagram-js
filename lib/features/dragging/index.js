import HoverFixModule from 'diagram-js/lib/features/hover-fix';
import SelectionModule from 'diagram-js/lib/features/selection';

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