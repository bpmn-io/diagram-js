import Diagram from '../../Diagram.js';

import ElementFactory from '../../core/ElementFactory.js';

import {
  findFreePosition,
  generateGetNextPosition,
  getConnectedDistance
} from './AutoPlaceUtil.js';

const diagram = new Diagram();

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const source = elementFactory.createShape(),
      element = elementFactory.createShape();

const getNextPosition = generateGetNextPosition({ x: 100, y: 100 });

findFreePosition(source, element, { x: 100, y: 100 }, getNextPosition);

getConnectedDistance(source, {
  defaultDistance: 100,
  direction: 'right',
  filter: (connection) => true,
  getWeight: (connection) => 1,
  maxDistance: 100,
  reference: 'center'
});