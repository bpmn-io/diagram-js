import Diagram from '../Diagram';

import DefaultRenderer from './DefaultRenderer';

import ElementFactory from '../core/ElementFactory';
import GraphicsFactory from '../core/GraphicsFactory';

const diagram = new Diagram();

const defaultRenderer = diagram.get<DefaultRenderer>('defaultRenderer');

const elementFactory = diagram.get<ElementFactory>('elementFactory'),
      graphicsFactory = diagram.get<GraphicsFactory>('graphicsFactory');

const shape = elementFactory.createShape(),
      shapeGfx = graphicsFactory.create('shape', shape);

const connection = elementFactory.createConnection(),
      connectionGfx = graphicsFactory.create('connection', connection);

defaultRenderer.canRender(shape);

defaultRenderer.canRender(connection);

defaultRenderer.drawShape(shapeGfx, shape);

defaultRenderer.drawConnection(connectionGfx, connection);

defaultRenderer.getShapePath(shape);

defaultRenderer.getConnectionPath(connection);
