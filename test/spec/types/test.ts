import {
  Base,
  Connection,
  Label,
  Root,
  Shape
} from "../../../lib/model";

import Diagram from '../../../lib/Diagram';

import CoreModule from '../../../lib/core';
import ModelingModule from '../../../lib/features/modeling';

import CommandInterceptor from "../../../lib/command/CommandInterceptor";

import Canvas from "../../../lib/core/Canvas";
import ElementFactory from "../../../lib/core/ElementFactory";
import ElementRegistry from "../../../lib/core/ElementRegistry";
import EventBus from "../../../lib/core/EventBus";
import GraphicsFactory from "../../../lib/core/GraphicsFactory";
import Modeling from "../../../lib/features/modeling/Modeling";

class MyCommandInterceptor extends CommandInterceptor {
  _eventBus: EventBus;
  _modeling: Modeling;

  constructor(eventBus: EventBus, modeling: Modeling) {
    super(eventBus);

    this._eventBus = eventBus;
    this._modeling = modeling;

    this.postExecuted([ 'foobar' ], (context) => {
      const { shape } = context;

      modeling.moveShape(shape, { x: 100, y: 100 });

      // @ts-expect-error
      modeling.moveShape({ x: 100, y: 100 });
    }, true);
  }
}


MyCommandInterceptor.$inject = [ 'eventBus', 'modeling' ];

const diagram = new Diagram({
  modules: [
    CoreModule,
    ModelingModule
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const connection = elementFactory.create<Connection>('connection', {
  id: 'connection',
  source: new Base({ id: 'shape1' }),
  target: new Base({ id: 'shape2' }),
  waypoints: []
});

const label = elementFactory.create<Label>('label', {
  id: 'label'
});

const root = elementFactory.create<Root>('root', {
  id: 'root'
});

const shape = elementFactory.create<Shape>('shape', {
  id: 'shape',
  x: 100,
  y: 100,
  width: 100,
  height: 100
});

const graphicsFactory = diagram.get<GraphicsFactory>('graphicsFactory');

const gfx = graphicsFactory.create('shape', shape);

const elementRegistry = diagram.get<ElementRegistry>('elementRegistry');

elementRegistry.add(connection, gfx);

const canvas = diagram.get<Canvas>('canvas');

canvas.addMarker(shape, 'foobar');

canvas.findRoot(shape);