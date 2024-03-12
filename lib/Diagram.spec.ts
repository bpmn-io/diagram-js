import Diagram from './Diagram.js';

import CommandModule from './command/index.js';

import CoreModule from './core/index.js';
import EventBus from './core/EventBus.js';

import ModelingModule from './features/modeling/index.js';
import Modeling from './features/modeling/Modeling.js';

let diagram = new Diagram();

diagram = new Diagram({
  modules: [
    CoreModule,
    CommandModule,
    ModelingModule
  ],
  canvas: {
    deferUpdate: true
  }
});

diagram.clear();

diagram.destroy();

diagram.invoke((eventBus: EventBus) => eventBus.fire('foo'));

const foo = diagram.invoke((modeling: Modeling, eventBus: EventBus) => {
  return {
    bar: true
  };
});

foo.bar = false;

type NoneEvent = {};

type EventMap = {
  'diagram.init': NoneEvent
};

type ServiceMap = {
  'eventBus': EventBus<EventMap>
};

const typedDiagram = new Diagram<ServiceMap>();

const eventBus = typedDiagram.get('eventBus');

eventBus.on('diagram.init', (event) => {

  // go forth and react to init (!)
});
