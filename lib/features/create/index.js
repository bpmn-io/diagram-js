import DraggingModule from '../dragging/index.js';
import PreviewSupportModule from '../preview-support/index.js';
import RulesModule from '../rules/index.js';
import SelectionModule from '../selection/index.js';

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
