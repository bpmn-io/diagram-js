import InteractionEventsModule from 'diagram-js/lib/features/interaction-events';
import SelectionModule from 'diagram-js/lib/features/selection';
import OutlineModule from 'diagram-js/lib/features/outline';
import RulesModule from 'diagram-js/lib/features/rules';
import DraggingModule from 'diagram-js/lib/features/dragging';
import PreviewSupportModule from 'diagram-js/lib/features/preview-support';

import Move from './Move.js';
import MovePreview from './MovePreview.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
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
