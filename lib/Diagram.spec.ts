import Diagram from './Diagram.js';

import CommandModule from 'diagram-js/lib/command';

import CoreModule from 'diagram-js/lib/core';
import EventBus from './core/EventBus.js';

import ModelingModule from 'diagram-js/lib/features/modeling';
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

const untypedEventBus = diagram.get<EventBus>('someService');

untypedEventBus.fire('this-event');

const maybeEventBus = diagram.get<EventBus>('eventBus', false);

// @ts-expect-error possibly null
maybeEventBus.fire('this-event');

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
