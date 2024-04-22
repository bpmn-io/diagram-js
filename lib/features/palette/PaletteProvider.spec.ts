import PaletteProvider, { PaletteEntries, PaletteEntriesCallback } from './PaletteProvider';

export class FooPaletteProvider implements PaletteProvider {
  getPaletteEntries(): PaletteEntries {
    return {
      foo: {
        action: (event, autoActivate) => {
          console.log(event.target);
          console.log(autoActivate);
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

export class BarPaletteProvider implements PaletteProvider {
  getPaletteEntries(): PaletteEntriesCallback {
    return function(entries) {
      return {
        ...entries,
        bar: {
          action: {
            click: (event, autoActivate) => {
              console.log(event.target);
              console.log(autoActivate);
            },
            dragstart: (event, autoActivate) => {
              console.log(event.target);
              console.log(autoActivate);
            }
          },
          className: 'bar',
          group: 'bar',
          html: '<marquee>Bar</marquee>',
          imageUrl: 'data:image/svg+xml;',
          title: 'Bar'
        }
      };
    };
  }
}
