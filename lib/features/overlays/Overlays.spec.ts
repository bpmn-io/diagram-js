import Diagram from '../../Diagram';

import ElementFactory from '../../core/ElementFactory';

import OverlaysModule from '.';
import Overlays, { OverlayAttrs } from './Overlays';

const diagram = new Diagram({
  modules: [
    OverlaysModule
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const shape = elementFactory.createShape();

const overlays = diagram.get<Overlays>('overlays');

const overlay: OverlayAttrs = {
  html: '<h1>Foo</h1>',
  position: {
    top: 0,
    right: 0
  },
  show: {
    minZoom: 1
  },
  scale: true
};

overlays.add('shape', overlay);

overlays.add('shape', 'foo', overlay);

overlays.get({ id: 'shape' });

overlays.get({ element: shape });

overlays.get({ type: 'foo' });

overlays.get('foo');

overlays.remove({ id: 'shape' });

overlays.remove({ element: shape });

overlays.remove({ type: 'foo' });

overlays.remove('foo');

overlays.hide();

overlays.show();

overlays.isShown();