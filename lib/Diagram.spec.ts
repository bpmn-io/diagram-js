import Diagram from './Diagram';

import CommandModule from './command';

import CoreModule from './core';
import EventBus from './core/EventBus';

import ModelingModule from './features/modeling';
import Modeling from './features/modeling/Modeling';

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