import Diagram from '../Diagram';

import ElementFactory from './ElementFactory';
import GraphicsFactory from './GraphicsFactory';

const diagram = new Diagram();

const elementFactory = diagram.get<ElementFactory>('elementFactory'),
      graphicsFactory = diagram.get<GraphicsFactory>('graphicsFactory');

const shape = elementFactory.createShape();

const shapeGfx = graphicsFactory.create('shape', shape);

graphicsFactory.drawShape(shapeGfx, shape);

graphicsFactory.getShapePath(shape);

graphicsFactory.remove(shape);

graphicsFactory.update('shape', shape, shapeGfx);

graphicsFactory.updateContainments([ shape ]);

const connection = elementFactory.createConnection();

const connectionGfx = graphicsFactory.create('connection', connection);

graphicsFactory.drawConnection(connectionGfx, connection);

graphicsFactory.getConnectionPath(connection);

graphicsFactory.remove(connection);

const shapeLike = {
  id: 'shape',
  x: 100,
  y: 100,
  width: 100,
  height: 100
};

const shapeLikeGfx = graphicsFactory.create('shape', shapeLike);

graphicsFactory.drawShape(shapeLikeGfx, shape);

graphicsFactory.getConnectionPath(connection);

graphicsFactory.remove(shapeLike);

const connectionLike = {
  id: 'connection',
  waypoints: [
    {
      x: 100,
      y: 100
    },
    {
      x: 200,
      y: 100
    }
  ]
};

graphicsFactory.create('connection', connectionLike);

const connectionLikeGfx = graphicsFactory.create('connection', connectionLike);

graphicsFactory.drawConnection(connectionLikeGfx, connectionLike);

graphicsFactory.getConnectionPath(connectionLike);

graphicsFactory.remove(connectionLike);