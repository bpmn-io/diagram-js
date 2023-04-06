import Diagram from '../../Diagram';

import ElementFactory from '../../core/ElementFactory';

import ContextPadModule from '.';
import ContextPad from './ContextPad';

const diagram = new Diagram({
  modules: [
    ContextPadModule
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const shape = elementFactory.createShape();

const contextPad = diagram.get<ContextPad>('overlays');

contextPad.registerProvider({
  getContextPadEntries: (element) => {
    return {
      foo: {
        label: 'Foo',
        action: () => console.log(element)
      },
      bar: {
        label: 'Bar',
        action: () => console.log(element)
      }
    }
  }
});

contextPad.registerProvider({
  getContextPadEntries: (element) => {
    return (entries) => {
      return {
        ...entries,
        baz: {
          label: 'Baz',
          action: () => console.log(element)
        }
      };
    }
  },
  getMultiElementContextPadEntries: (elements) => {
    return {
      foo: {
        label: 'Foo',
        action: () => console.log(elements)
      },
      bar: {
        label: 'Bar',
        action: () => console.log(elements)
      }
    }
  }
});

contextPad.registerProvider({
  getContextPadEntries: (element) => {
    return (entries) => {
      return {
        ...entries,
        baz: {
          label: 'Baz',
          action: () => console.log(element)
        }
      };
    }
  },
  getMultiElementContextPadEntries: (elements) => {
    return (entries) => {
      return {
        ...entries,
        foo: {
          label: 'Foo',
          action: () => console.log(elements)
        },
        bar: {
          label: 'Bar',
          action: () => console.log(elements)
        }
      }
    }
  }
});

contextPad.open(shape);

contextPad.open([ shape ]);

contextPad.getEntries(shape);

const entries = contextPad.getEntries([ shape ]);

for (let key in entries) {
  const entry = entries[ key ];

  console.log(entry.action, entry.label);
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