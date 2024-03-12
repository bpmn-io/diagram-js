import InteractionEventsModule from '../interaction-events/index.js';
import OutlineModule from '../outline/index.js';

import Selection from './Selection.js';
import SelectionVisuals from './SelectionVisuals.js';
import SelectionBehavior from './SelectionBehavior.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'selectionVisuals', 'selectionBehavior' ],
  __depends__: [
    InteractionEventsModule,
    OutlineModule
  ],
  selection: [ 'type', Selection ],
  selectionVisuals: [ 'type', SelectionVisuals ],
  selectionBehavior: [ 'type', SelectionBehavior ]
};
