import DraggingModule from 'diagram-js/lib/features/dragging';
import PreviewSupportModule from 'diagram-js/lib/features/preview-support';
import RulesModule from 'diagram-js/lib/features/rules';
import SelectionModule from 'diagram-js/lib/features/selection';

import Create from './Create.js';
import CreatePreview from './CreatePreview.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    DraggingModule,
    PreviewSupportModule,
    RulesModule,
    SelectionModule
  ],
  __init__: [
    'create',
    'createPreview'
  ],
  create: [ 'type', Create ],
  createPreview: [ 'type', CreatePreview ]
};
