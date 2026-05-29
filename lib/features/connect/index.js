import SelectionModule from '../selection/index.js';
import RulesModule from '../rules/index.js';
import DraggingModule from '../dragging/index.js';

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
