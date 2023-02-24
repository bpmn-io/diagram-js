import { create } from './index';

const connection = create('connection', {
  id: 'foo',
  waypoints: [
    { x: 100, y: 100 },
    { x: 200, y: 100 }
  ],
  source: create('shape', {}),
  target: create('shape', {})
});

connection.businessObject = {};

const label = create('label', {
  id: 'foo',
  x: 100,
  y: 100,
  width: 100,
  height: 100,
  labelTarget: create('shape', {})
});

label.businessObject = {};

const root = create('root', {
  id: 'foo',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

root.businessObject = {};

const shape = create('shape', {
  id: 'foo',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

shape.businessObject = {};