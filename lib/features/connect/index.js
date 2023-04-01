import SelectionModule from '../selection';
import RulesModule from '../rules';
import DraggingModule from '../dragging';

import Connect from './Connect';
import ConnectPreview from './ConnectPreview';


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
