import Diagram from '../../Diagram.js';

import ElementFactory from '../../core/ElementFactory.js';

import ContextPadModule from './index.js';
import ContextPad from './ContextPad.js';

import { FooContextPadProvider } from './ContextPadProvider.spec.js';

const diagram = new Diagram({
  modules: [
    ContextPadModule
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const shape = elementFactory.createShape();

const contextPad = diagram.get<ContextPad>('contextPad');

contextPad.registerProvider(new FooContextPadProvider());

contextPad.registerProvider(1000, new FooContextPadProvider());

contextPad.open(shape);

contextPad.open([ shape ]);

contextPad.getEntries(shape);

const entries = contextPad.getEntries([ shape ]);

for (const key in entries) {
  const entry = entries[ key ];

  console.log(entry.action, entry.title);
}

contextPad.trigger('foo', new Event('click'));

contextPad.trigger('foo', new Event('click'), true);

contextPad.triggerEntry('foo', 'bar', new Event('click'));

contextPad.triggerEntry('foo', 'bar', new Event('click'), true);

contextPad.getPad(shape);

contextPad.getPad([ shape ]);

contextPad.close();

contextPad.isOpen();

contextPad.isShown();