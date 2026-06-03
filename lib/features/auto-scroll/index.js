import DraggingModule from 'diagram-js/lib/features/dragging';

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