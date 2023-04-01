import { Element, Connection, Shape } from '../model';

import Diagram from '../Diagram';

import ElementFactory from '../core/ElementFactory';
import GraphicsFactory from '../core/GraphicsFactory';

import BaseRenderer from './BaseRenderer';

class CustomRenderer extends BaseRenderer {
  canRender(element: Element): boolean {
    return true;
  }

  drawShape(visuals: SVGElement, shape: Shape): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  }

  drawConnection(visuals: SVGElement, connection: Connection): SVGElement {
    return document.createElementNS('http://www.w3.org/2000/svg', 'rect');
  }

  getShapePath(shape: Shape): string {
    return 'M150 0 L75 200 L225 200 Z';
  }

  getConnectionPath(connection: Connection): string {
    return 'M150 0 L75 200 L225 200 Z';
  }
}

const diagram = new Diagram({
  modules: [
    {
      __init__: [ 'customRenderer' ],
      customRenderer: [ 'type', CustomRenderer ]
    }
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory'),
      graphicsFactory = diagram.get<GraphicsFactory>('graphicsFactory');

const shape = elementFactory.createShape(),
      connection = elementFactory.createConnection();

const shapeGfx = graphicsFactory.create('shape', shape),
      connectionGfx = graphicsFactory.create('connection', connection);

const customRenderer = diagram.get<CustomRenderer>('customRenderer');

customRenderer.canRender(shape);

customRenderer.canRender(connection);

customRenderer.drawShape(shapeGfx, shape);

customRenderer.drawConnection(connectionGfx, connection);

customRenderer.getShapePath(shape);

customRenderer.getConnectionPath(connection);