import DraggingModule from '../dragging';

import AutoScroll from './AutoScroll';


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