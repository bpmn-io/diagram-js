import Diagram from '../../Diagram';

import ElementFactory from '../../core/ElementFactory';

import ModelingModule from '.';
import Modeling from './Modeling';

import {
  Connection,
  Element,
  Label,
  Root,
  Shape
} from '../../model';

const diagram = new Diagram({
  modules: [
    ModelingModule
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const connection = elementFactory.createConnection(),
      label = elementFactory.createLabel(),
      root = elementFactory.createRoot(),
      shape = elementFactory.createShape();

const modeling = diagram.get<Modeling>('modeling');

modeling.moveShape(shape, { x: 100, y: 100 });

modeling.moveShape(shape, { x: 100, y: 100 }, root);

modeling.moveShape(shape, { x: 100, y: 100 }, root, 1);

modeling.moveShape(shape, { x: 100, y: 100 }, root, 1, { foo: 'bar' });

modeling.updateAttachment(shape);

modeling.updateAttachment(shape, elementFactory.createShape());

modeling.moveElements([ shape ], { x: 100, y: 100 });

modeling.moveElements([ shape ], { x: 100, y: 100 }, root);

modeling.moveElements([ shape ], { x: 100, y: 100 }, root, { attach: true });

modeling.moveConnection(connection, { x: 100, y: 100 });

modeling.moveConnection(connection, { x: 100, y: 100 }, root);

modeling.moveConnection(connection, { x: 100, y: 100 }, root, 1);

modeling.moveConnection(connection, { x: 100, y: 100 }, root, 1, { foo: 'bar' });

modeling.layoutConnection(connection);

modeling.layoutConnection(connection, { foo: 'bar' });

modeling.createConnection(shape, elementFactory.createShape(), { id: 'foo' }, root);

modeling.createConnection(shape, elementFactory.createShape(), connection, root);

modeling.createConnection(shape, elementFactory.createShape(), 10, connection, root);

modeling.createConnection(shape, elementFactory.createShape(), connection, root, { foo: 'bar' });

modeling.createShape({ id: 'foo' }, { x: 100, y: 100 }, root);

modeling.createShape(shape, { x: 100, y: 100 }, root);

modeling.createShape(shape, { x: 100, y: 100 }, root, {
  attach: true
});

modeling.createShape(shape, { x: 100, y: 100 }, root, 10, {
  attach: true
});

modeling.createShape(shape, { x: 100, y: 100 }, root, 10);

modeling.createElements([
  shape,
  elementFactory.createShape()
], { x: 100, y: 100 }, root);

modeling.createElements([
  shape,
  elementFactory.createShape()
], { x: 100, y: 100 }, root, 1);

modeling.createElements([
  shape,
  elementFactory.createShape()
], { x: 100, y: 100 }, root, 1, { foo: 'bar' });

modeling.createLabel(shape, { x: 100, y: 100 }, label);

modeling.createLabel(shape, { x: 100, y: 100 }, label, root);

modeling.appendShape(
  shape, elementFactory.createShape(), { x: 100, y: 100 }, root);

modeling.appendShape(shape, elementFactory.createShape(), { x: 100, y: 100 }, root, { foo: 'bar' });

modeling.removeElements([ shape ]);

modeling.distributeElements([
  {
    elements: [ shape ],
    range: {
      min: 100,
      max: 200
    }
  }
], 'x', 'width');

modeling.removeShape(shape);

modeling.removeShape(shape, { foo: 'bar' });

modeling.removeConnection(connection);

modeling.removeConnection(connection, { foo: 'bar' });

modeling.replaceShape(shape, { id: 'foo' });

modeling.replaceShape(shape, elementFactory.createShape());

modeling.replaceShape(shape, elementFactory.createShape(), { foo: 'bar' });

modeling.alignElements([ shape, connection ], {
  top: 100,
  right: 100,
  left: 100,
  bottom: 100,
  center: 100,
  middle: 100
});

modeling.resizeShape(shape, { x: 100, y: 100, width: 100, height: 100 });

modeling.resizeShape(shape, { x: 100, y: 100, width: 100, height: 100 },
  { width: 100, height: 100 });

modeling.resizeShape(shape, { x: 100, y: 100, width: 100, height: 100 },
  { width: 100, height: 100 }, { foo: 'bar' });

modeling.createSpace([ shape ], [], { x: 100, y: 100 }, 'e', 100);

modeling.updateWaypoints(connection, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.updateWaypoints(connection, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
], { foo: 'bar' });

modeling.reconnect(
  connection, shape, elementFactory.createShape(), { x: 100, y: 100 });

modeling.reconnect(
  connection, shape, elementFactory.createShape(), { x: 100, y: 100 }, {
    foo: 'bar'
  });

modeling.reconnect(connection, shape, elementFactory.createShape(), [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.reconnectStart(connection, shape, { x: 100, y: 100 });

modeling.reconnectStart(connection, shape, { x: 100, y: 100 }, {
  foo: 'bar'
});

modeling.reconnectStart(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.reconnectStart(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
], {
  foo: 'bar'
});

modeling.reconnectEnd(connection, shape, { x: 100, y: 100 });

modeling.reconnectEnd(connection, shape, { x: 100, y: 100 }, {
  foo: 'bar'
});

modeling.reconnectEnd(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
]);

modeling.reconnectEnd(connection, shape, [
  { x: 100, y: 100 },
  { x: 200, y: 100 }
], {
  foo: 'bar'
});

modeling.connect(shape, elementFactory.createShape());

modeling.toggleCollapse(shape);

modeling.toggleCollapse(shape, {
  layoutConnection: false
});

/**
 * Customization
 */

type CustomElement = {
  foo: string;
} & Element;

type CustomShape = {
  bar: string;
} & Shape & CustomElement;

class CustomModeling extends Modeling<Connection, CustomElement, Label, Root, CustomShape> {}

const customModeling = diagram.get<CustomModeling>('modeling');

const customShape = customModeling.createShape({ bar: 'bar' }, { x: 100, y: 100 }, root);

customModeling.distributeElements([
  {
    elements: [ customShape ],
    range: {
      min: 100,
      max: 200
    }
  }
], 'x', 'width');
