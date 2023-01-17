import DraggingModule from '../dragging';
import PreviewSupportModule from '../preview-support';
import RulesModule from '../rules';
import SelectionModule from '../selection';
import Mouse from '../mouse';

import Create from './Create';
import CreatePreview from './CreatePreview';


export default {
  __depends__: [
    DraggingModule,
    PreviewSupportModule,
    RulesModule,
    SelectionModule,
    Mouse
  ],
  __init__: [
    'create',
    'createPreview'
  ],
  create: [ 'type', Create ],
  createPreview: [ 'type', CreatePreview ]
};
