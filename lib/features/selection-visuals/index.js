import InteractionEventsModule from '../interaction-events';
import OutlineModule from '../outline';
import SelectionModule from '../selection';

import SelectionVisuals from './SelectionVisuals';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __init__: [
    'selectionVisuals'
  ],
  __depends__: [
    InteractionEventsModule,
    OutlineModule,
    SelectionModule
  ],
  selectionVisuals: [ 'type', SelectionVisuals ]
};
