import PreviewSupportModule from '../preview-support/index.js';

import ComplexPreview from './ComplexPreview.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ PreviewSupportModule ],
  __init__: [ 'complexPreview' ],
  complexPreview: [ 'type', ComplexPreview ]
};