import { PopupMenuTarget } from './PopupMenu';

import PopupMenuProvider, {
  PopupMenuEntries,
  PopupMenuHeaderEntries,
  PopupMenuEntriesProvider,
  PopupMenuProviderHeaderEntriesProvider
} from './PopupMenuProvider';

export class FooPopupMenuProvider implements PopupMenuProvider {
  getPopupMenuEntries(target: PopupMenuTarget): PopupMenuEntries {
    return {
      foo: {
        action: (event, entry) => {
          console.log(event.target);
          console.log(entry.label);

          if (Array.isArray(target)) {
            target.forEach(({ id }) => console.log(id));
          } else {
            console.log(target.id);
          }
        },
        className: 'foo',
        label: 'Foo'
      }
    };
  }
}

export class BarPopupMenuProvider implements PopupMenuProvider {
  getPopupMenuEntries(target: PopupMenuTarget): PopupMenuEntriesProvider {
    return function(entries) {
      return {
        ...entries,
        foo: {
          action: (event, entry) => {
            console.log(event.target);
            console.log(entry.label);

            if (Array.isArray(target)) {
              target.forEach(({ id }) => console.log(id));
            } else {
              console.log(target.id);
            }
          },
          className: 'foo',
          imageUrl: 'https://example.com/',
          imageHtml: '<img src="https://example.com/" />',
          label: 'Foo'
        }
      };
    };
  }

  getHeaderEntries(target: PopupMenuTarget): PopupMenuHeaderEntries {
    return [
      {
        action: (event, entry) => {
          console.log(event.target);
          console.log(entry.title);

          if (Array.isArray(target)) {
            target.forEach(({ id }) => console.log(id));
          } else {
            console.log(target.id);
          }
        },
        active: false,
        className: 'bar',
        id: 'bar',
        imageUrl: 'https://example.com/',
        imageHtml: '<img src="https://example.com/" />',
        label: 'Bar',
        title: 'Bar',
      }
    ];
  }
}

export class BazPopupMenuProvider implements PopupMenuProvider {
  getPopupMenuEntries(target: PopupMenuTarget): PopupMenuEntries {
    console.log(target);

    return {};
  }

  getHeaderEntries(target: PopupMenuTarget): PopupMenuProviderHeaderEntriesProvider {
    return function(entries) {
      return [
        ...entries,
        {
          action: (event, entry) => {
            console.log(event.target);
            console.log(entry.title);

            if (Array.isArray(target)) {
              target.forEach(({ id }) => console.log(id));
            } else {
              console.log(target.id);
            }
          },
          active: false,
          className: 'baz',
          id: 'baz',
          title: 'Baz'
        }
      ];
    };
  }
}