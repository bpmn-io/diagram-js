import InteractionEventsModule from '../interaction-events';
import SelectionModule from '../selection';
import OutlineModule from '../outline';
import RulesModule from '../rules';
import DraggingModule from '../dragging';
import PreviewSupportModule from '../preview-support';

import Move from './Move';
import MovePreview from './MovePreview';

export default {
  __depends__: [
    InteractionEventsModule,
    SelectionModule,
    OutlineModule,
    RulesModule,
    DraggingModule,
    PreviewSupportModule
  ],
  __init__: [
    'move',
    'movePreview'
  ],
  move: [ 'type', Move ],
  movePreview: [ 'type', MovePreview ]
};
