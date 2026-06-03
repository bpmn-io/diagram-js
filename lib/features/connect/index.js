import SelectionModule from 'diagram-js/lib/features/selection';
import RulesModule from 'diagram-js/lib/features/rules';
import DraggingModule from 'diagram-js/lib/features/dragging';

import Connect from './Connect.js';
import ConnectPreview from './ConnectPreview.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    SelectionModule,
    RulesModule,
    DraggingModule
  ],
  __init__: [
    'connectPreview'
  ],
  connect: [ 'type', Connect ],
  connectPreview: [ 'type', ConnectPreview ]
};
