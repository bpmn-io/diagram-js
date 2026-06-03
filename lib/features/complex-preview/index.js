import PreviewSupportModule from 'diagram-js/lib/features/preview-support';

import ComplexPreview from './ComplexPreview.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ PreviewSupportModule ],
  __init__: [ 'complexPreview' ],
  complexPreview: [ 'type', ComplexPreview ]
};