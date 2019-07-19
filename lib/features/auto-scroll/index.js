import DraggingModule from '../dragging';

import AutoScroll from './AutoScroll';


export default {
  __depends__: [
    DraggingModule,
  ],
  __init__: [ 'autoScroll' ],
  autoScroll: [ 'type', AutoScroll ]
};