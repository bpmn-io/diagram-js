import Diagram from '../../Diagram';

import ElementFactory from '../../core/ElementFactory';

import SelectionModule from '.';
import Selection from './Selection';

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