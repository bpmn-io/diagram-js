import SelectionModule from '../selection';

import Dragging from './Dragging';
import HoverFix from './HoverFix';

export default {
  __init__: [
    'hoverFix'
  ],
  __depends__: [
    SelectionModule
  ],
  dragging: [ 'type', Dragging ],
  hoverFix: [ 'type', HoverFix ]
};