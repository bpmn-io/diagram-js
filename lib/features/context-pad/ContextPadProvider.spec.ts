import ContextPadProvider, { ContextPadEntries, ContextPadEntryAction } from './ContextPadProvider';

import { Element } from '../../model';

export class FooContextPadProvider implements ContextPadProvider {
  getContextPadEntries(element: Element): ContextPadEntries {
    return {
      foo: {
        action: (event, target, autoActivate) => {
          console.log(event.target);

          if (Array.isArray(target)) {
            target.forEach(({ id }) => console.log(id));
          } else {
            console.log(target.id);
          }

          console.log(autoActivate);
          console.log(element.id);
        },
        className: 'foo',
        group: 'foo',
        html: '<marquee>Foo</marquee>',
        imageUrl: 'data:image/svg+xml;',
        title: 'Foo'
      }
    };
  }
}

export class BarContextPadProvider implements ContextPadProvider {
  getMultiElementContextPadEntries(elements: Element[]): ContextPadEntries {
    const action: ContextPadEntryAction = (event, target, autoActivate) => {
      console.log(event.target);

      if (Array.isArray(target)) {
        target.forEach(({ id }) => console.log(id));
      } else {
        console.log(target.id);
      }

      console.log(autoActivate);

      elements.forEach(element => console.log(element.id));
    };

    return {
      bar: {
        action: {
          click: action,
          hover: action
        },
        className: 'bar',
        group: 'bar',
        html: '<marquee>Bar</marquee>',
        imageUrl: 'data:image/svg+xml;',
        title: 'Bar'
      }
    };
  }
}

/**
 * Customization
 */

type CustomElement = {
  foo: 'bar'
} & Element;

export class CustomContextPadProvider implements ContextPadProvider<CustomElement> {
  getMultiElementContextPadEntries(elements: Element[]): ContextPadEntries {
    return {
      baz: {
        action: (event, target, autoActivate) => {
          console.log(event.target);

          if (Array.isArray(target)) {
            target.forEach(({ foo }) => console.log(foo));
          } else {
            console.log(target.foo);
          }

          console.log(autoActivate);

          elements.forEach(element => console.log(element.id));
        },
        className: 'baz',
        group: 'baz',
        html: '<marquee>Baz</marquee>',
        imageUrl: 'data:image/svg+xml;',
        title: 'Baz'
      }
    };
  }
}