import InteractionEventsModule from '../interaction-events';

import Selection from './Selection';
import SelectionVisuals from './SelectionVisuals';
import SelectionBehavior from './SelectionBehavior';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [ 'selectionVisuals', 'selectionBehavior' ],
  __depends__: [
    InteractionEventsModule,
  ],
  selection: [ 'type', Selection ],
  selectionVisuals: [ 'type', SelectionVisuals ],
  selectionBehavior: [ 'type', SelectionBehavior ]
};
