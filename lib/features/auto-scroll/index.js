import DraggingModule from '../dragging/index.js';

import AutoScroll from './AutoScroll.js';


/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [
    DraggingModule,
  ],
  __init__: [ 'autoScroll' ],
  autoScroll: [ 'type', AutoScroll ]
};