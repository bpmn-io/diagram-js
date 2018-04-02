import DrawModule from '../draw';

import Canvas from './Canvas';
import ElementRegistry from './ElementRegistry';
import ElementFactory from './ElementFactory';
import EventBus from './EventBus';
import GraphicsFactory from './GraphicsFactory';

export default {
  __depends__: [ DrawModule ],
  __init__: [ 'canvas' ],
  canvas: [ 'type', Canvas ],
  elementRegistry: [ 'type', ElementRegistry ],
  elementFactory: [ 'type', ElementFactory ],
  eventBus: [ 'type', EventBus ],
  graphicsFactory: [ 'type', GraphicsFactory ]
};