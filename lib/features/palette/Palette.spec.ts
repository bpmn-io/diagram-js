import Diagram from '../../Diagram';

import PaletteModule from '.';
import Palette from './Palette';

import { FooPaletteProvider } from './PaletteProvider.spec';

const diagram = new Diagram({
  modules: [
    PaletteModule
  ]
});

const palette = diagram.get<Palette>('palette');

palette.open();

palette.close();

palette.isOpen();

palette.toggle();

palette.isActiveTool('foo');

palette.registerProvider(new FooPaletteProvider());

const entries = palette.getEntries();

for (const key in entries) {
  const entry = entries[ key ];

  console.log(entry.action);
}

palette.trigger('foo', new Event('click'));

palette.trigger('foo', new Event('click'), true);

palette.triggerEntry('foo', 'bar', new Event('click'));

palette.triggerEntry('foo', 'bar', new Event('click'), true);

palette.updateToolHighlight('foo');