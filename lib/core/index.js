import DrawModule from '../draw/index.js';

import Canvas from './Canvas.js';
import ElementRegistry from './ElementRegistry.js';
import ElementFactory from './ElementFactory.js';
import EventBus from './EventBus.js';
import GraphicsFactory from './GraphicsFactory.js';

/**
 * @type { import('didi').ModuleDeclaration }
 */
export default {
  __depends__: [ DrawModule ],
  __init__: [ 'canvas' ],
  canvas: [ 'type', Canvas ],
  elementRegistry: [ 'type', ElementRegistry ],
  elementFactory: [ 'type', ElementFactory ],
  eventBus: [ 'type', EventBus ],
  graphicsFactory: [ 'type', GraphicsFactory ]
};