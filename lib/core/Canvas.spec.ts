import Diagram from '../Diagram';

import Canvas from './Canvas';
import ElementFactory from './ElementFactory';

const diagram = new Diagram();

const shapeLike = {
  id: 'shapeLike',
  x: 100,
  y: 100,
  width: 100,
  height: 100
};

const connectionLike = {
  id: 'connectionLike',
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

const parentLike = {
  id: 'parentLike',
  x: 100,
  y: 100,
  width: 100,
  height: 100
};

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const shape1 = elementFactory.create('shape', {
  id: 'shape1',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

const shape2 = elementFactory.create('shape', {
  id: 'shape2',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

const connection = elementFactory.create('connection', {
  id: 'connection',
  source: shape1,
  target: shape2,
  waypoints: []
});

const root = elementFactory.create('root', {
  id: 'root'
});

const canvas = diagram.get<Canvas>('canvas');

canvas.addShape(shape1, root);

canvas.addShape(shape1);

canvas.addShape(shape1, root, 1);

canvas.addShape(shapeLike, parentLike);

canvas.addConnection(connection);

canvas.addConnection(connection, root);

canvas.addConnection(connection, root, 1);

canvas.addConnection(connectionLike, parentLike);

canvas.addMarker(shape1, 'foobar');

canvas.addMarker(shapeLike, 'foobar');

canvas.addMarker(connectionLike, 'foobar');

canvas.addRootElement();

canvas.addRootElement(root);

canvas.findRoot(shape1);

canvas.findRoot(shapeLike);

canvas.findRoot(connectionLike);

canvas.getAbsoluteBBox(shape1);

canvas.getAbsoluteBBox(shapeLike);

canvas.getAbsoluteBBox(connectionLike);

canvas.getActiveLayer();

canvas.getDefaultLayer();

canvas.getGraphics(shape1);

canvas.getGraphics(shape1, true);

canvas.getGraphics(shapeLike);

canvas.getGraphics(connectionLike);

canvas.getLayer('foo');

canvas.getLayer('foo', 1);

canvas.getRootElement();

canvas.getRootElements();

canvas.getContainer();

canvas.getSize();

canvas.hasMarker(shape1, 'foo');

canvas.hasMarker(shapeLike, 'foo');

canvas.hasMarker(connectionLike, 'foo');

canvas.hideLayer('foo');

canvas.removeMarker(shape1, 'foo');

canvas.removeMarker(shapeLike, 'foo');

canvas.removeMarker(connectionLike, 'foo');

canvas.removeRootElement('root');

canvas.removeRootElement(root);

canvas.removeRootElement(shapeLike);

canvas.removeShape(shape1);

canvas.removeShape(shapeLike);

canvas.removeConnection(connection);

canvas.removeConnection(connectionLike);

canvas.resized();

canvas.scroll({ dx: 100, dy: 100 });

canvas.scrollToElement('shape');

canvas.scrollToElement(shape1);

canvas.scrollToElement(shape1, 100);

canvas.scrollToElement(shape1, {
  top: 100,
  right: 100,
  bottom: 100,
  left: 100
});

canvas.scrollToElement(shapeLike);

canvas.scrollToElement(connectionLike);

canvas.setRootElement(root);

canvas.showLayer('foo');

canvas.toggleMarker(shape1, 'foo');

canvas.toggleMarker(shapeLike, 'foo');

canvas.toggleMarker(connectionLike, 'foo');

canvas.viewbox();

canvas.viewbox({ x: 100, y: 100, width: 100, height: 100 });

canvas.zoom();

canvas.zoom(1);

canvas.zoom(1, {
  x: 100,
  y: 100
});