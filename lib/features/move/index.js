import InteractionEventsModule from '../interaction-events/index.js';
import SelectionModule from '../selection/index.js';
import OutlineModule from '../outline/index.js';
import RulesModule from '../rules/index.js';
import DraggingModule from '../dragging/index.js';
import PreviewSupportModule from '../preview-support/index.js';

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
