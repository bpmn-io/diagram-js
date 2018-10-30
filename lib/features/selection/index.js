import InteractionEventsModule from '../interaction-events';
import OutlineModule from '../outline';

import Selection from './Selection';
import SelectionVisuals from './SelectionVisuals';
import SelectionBehavior from './SelectionBehavior';
import HighlightRelated from './HighlightRelated';


export default {
  __init__: [ 'selectionVisuals', 'selectionBehavior', 'highlightRelated' ],
  __depends__: [
    InteractionEventsModule,
    OutlineModule
  ],
  selection: [ 'type', Selection ],
  selectionVisuals: [ 'type', SelectionVisuals ],
  selectionBehavior: [ 'type', SelectionBehavior ],
  highlightRelated: [ 'type', HighlightRelated ]
};
