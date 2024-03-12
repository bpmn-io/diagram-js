import RulesModule from '../rules/index.js';
import DraggingModule from '../dragging/index.js';
import PreviewSupportModule from '../preview-support/index.js';

import Resize from './Resize.js';
import ResizePreview from './ResizePreview.js';
import ResizeHandles from './ResizeHandles.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
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
