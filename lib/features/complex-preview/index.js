import PreviewSupportModule from '../preview-support';

import ComplexPreview from './ComplexPreview';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ PreviewSupportModule ],
  __init__: [ 'complexPreview' ],
  complexPreview: [ 'type', ComplexPreview ]
};