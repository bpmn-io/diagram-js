import { PopupMenuTarget } from './PopupMenu';

import PopupMenuProvider, {
  PopupMenuEntries,
  PopupMenuHeaderEntries,
  PopupMenuEntriesCallback,
  PopupMenuProviderHeaderEntriesCallback
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
  getPopupMenuEntries(target: PopupMenuTarget): PopupMenuEntriesCallback {
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
        title: 'Bar'
      }
    ];
  }
}

export class BazPopupMenuProvider implements PopupMenuProvider {
  getPopupMenuEntries(_: PopupMenuTarget): PopupMenuEntries {
    return {};
  }

  getHeaderEntries(target: PopupMenuTarget): PopupMenuProviderHeaderEntriesCallback {
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
    }
  }
}