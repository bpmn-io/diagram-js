import RulesModule from '../rules/index.js';
import DraggingModule from '../dragging/index.js';
import PreviewSupportModule from '../preview-support/index.js';

import Resize from './Resize.js';
import ResizeElements from './ResizeElements.js';
import ResizeElementsPreview from './ResizeElementsPreview.js';
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
    'resizeElements',
    'resizeElementsPreview',
    'resizeHandles'
  ],
  resize: [ 'type', Resize ],
  resizePreview: [ 'type', ResizePreview ],
  resizeElements: [ 'type', ResizeElements ],
  resizeElementsPreview: [ 'type', ResizeElementsPreview ],
  resizeHandles: [ 'type', ResizeHandles ]
};
