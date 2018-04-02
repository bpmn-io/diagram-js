import RulesModule from '../rules';
import DraggingModule from '../dragging';
import PreviewSupportModule from '../preview-support';

import Resize from './Resize';
import ResizePreview from './ResizePreview';
import ResizeHandles from './ResizeHandles';

export default {
  __depends__: [
    RulesModule,
    DraggingModule,
    PreviewSupportModule
  ],
  __init__: [
    'resize',
    'resizePreview',
    'resizeHandles'
  ],
  resize: [ 'type', Resize ],
  resizePreview: [ 'type', ResizePreview ],
  resizeHandles: [ 'type', ResizeHandles ]
};
