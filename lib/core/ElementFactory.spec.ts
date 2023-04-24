import Diagram from '../Diagram';

import ElementFactory from './ElementFactory';

import {
  Connection,
  Label,
  Root,
  Shape
} from '../model/Types';

const diagram = new Diagram();

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const shape1 = elementFactory.create('shape', {
  id: 'shape1',
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  foo: 'bar'
});

const shape2 = elementFactory.create('shape', {
  id: 'shape2',
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  foo: 'bar'
});

elementFactory.create('connection', {
  id: 'connection',
  source: shape1,
  target: shape2,
  waypoints: [],
  foo: 'bar'
});

elementFactory.create('root', {
  id: 'root',
  foo: 'bar'
});

elementFactory.create('label', {
  id: 'label',
  foo: 'bar'
});

elementFactory.create('connection');

elementFactory.create('label');

elementFactory.create('root');

elementFactory.create('shape');

elementFactory.createConnection();

elementFactory.createLabel();

elementFactory.createRoot();

elementFactory.createShape();

/**
 * Customization
 */

type CustomShape = {
  foo: string;
} & Shape;

class CustomElementFactory extends ElementFactory<Connection, Label, Root, CustomShape> {}

const customElementFactory = diagram.get<CustomElementFactory>('elementFactory');

const customShape = customElementFactory.createShape({ foo: 'bar' });

console.log(customShape.foo);
