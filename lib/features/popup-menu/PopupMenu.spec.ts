import Diagram from '../../Diagram';

import ElementFactory from '../../core/ElementFactory';

import PopupMenuModule from '.';
import PopupMenu from './PopupMenu';
import { PopupMenuEntry } from './PopupMenuProvider';

import { FooPopupMenuProvider } from './PopupMenuProvider.spec';

const diagram = new Diagram({
  modules: [
    PopupMenuModule
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const shape = elementFactory.createShape();

const popupMenu = diagram.get<PopupMenu>('popupMenu');

popupMenu.open(shape, 'foo', { x: 100, y: 100 });

popupMenu.open(shape, 'foo', { x: 100, y: 100 }, { width: 100 });

popupMenu.open([ shape ], 'foo', { x: 100, y: 100 });

popupMenu.isEmpty(shape, 'foo');

popupMenu.isEmpty([ shape ], 'foo');

popupMenu.isOpen();

popupMenu.registerProvider('foo', new FooPopupMenuProvider());

popupMenu.registerProvider('foo', 1000, new FooPopupMenuProvider());

popupMenu.reset();

popupMenu.close();

popupMenu.trigger(new Event('click'), {
  action: (event: Event, entry: PopupMenuEntry, action?: string) => {
    console.log(event.target);
    console.log(entry.label);
    console.log(action);
  },
  className: 'foo',
  label: 'Foo'
}, 'foo');