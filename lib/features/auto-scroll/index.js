import DraggingModule from '../dragging';
import MouseTrackingModule from '../mouse-tracking';

import AutoScroll from './AutoScroll';


export default {
  __depends__: [
    DraggingModule,
    MouseTrackingModule
  ],
  __init__: [ 'autoScroll' ],
  autoScroll: [ 'type', AutoScroll ]
};