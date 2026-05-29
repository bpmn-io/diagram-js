import Diagram from '../../Diagram.js';

import ElementFactory from '../../core/ElementFactory.js';

import SelectionModule from './index.js';
import Selection from './Selection.js';

const diagram = new Diagram({
  modules: [
    SelectionModule
  ]
});

const elementFactory = diagram.get<ElementFactory>('elementFactory');

const shape = elementFactory.createShape();

const selection = diagram.get<Selection>('selection');

selection.deselect(shape);

selection.deselect({});

selection.get();

selection.isSelected(shape);

selection.isSelected({});

selection.select(shape);

selection.select({});

selection.select([ shape ]);

selection.select([ shape ], true);