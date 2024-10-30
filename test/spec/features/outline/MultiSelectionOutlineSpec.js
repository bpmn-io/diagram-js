import {
  bootstrapDiagram,
  inject,
  getDiagramJS
} from 'test/TestHelper';

import outlineModule from 'lib/features/outline';
import modelingModule from 'lib/features/modeling';

import {
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import { getBBox } from 'lib/util/Elements';


describe('features/outline - MultiSelectionOutline', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      outlineModule,
      modelingModule
    ]
  }));


  var shape1, shape2;

  beforeEach(inject(function(elementFactory, canvas, selection) {
    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 100, y: 100, width: 100, height: 100
    });

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 300, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape1);
    canvas.addShape(shape2);
  }));


  describe('container marker', function() {

    it('should add <djs-multi-select> on multi-selection', inject(
      function(selection, canvas) {

        // given
        var container = canvas.getContainer();

        // when
        selection.select([ shape1, shape2 ]);

        // then
        expect(domClasses(container).has('djs-multi-select')).to.be.true;

        // but when
        selection.select(null);

        // then
        expect(domClasses(container).has('djs-multi-select')).to.be.false;
      }
    ));


    it('should not add <djs-multi-select> for single selection', inject(
      function(selection, canvas) {

        // given
        var element = canvas.getContainer();

        // when
        selection.select([ shape1 ]);

        // then
        expect(domClasses(element).has('djs-multi-select'));
      }
    ));

  });


  describe('selection box', function() {

    it('should show on multi-selection', inject(function(selection) {

      // when
      selection.select([ shape1, shape2 ]);

      // then
      expect(getOutlineGfx()).to.exist;
    }));


    it('should contain all selected elements', inject(function(selection) {

      // when
      selection.select([ shape1, shape2 ]);

      // then
      expectWithinOutlineBounds([ shape1, shape2 ]);
    }));


    it('should react to element changes', inject(function(selection, modeling) {

      // given
      selection.select([ shape1, shape2 ]);

      // when
      modeling.moveElements([ shape1 ], { x: 30, y: 50 });

      // then
      expectWithinOutlineBounds([ shape1, shape2 ]);
    }));


    it('should react to undo/redo', inject(
      function(modeling, commandStack, selection) {

        // given
        selection.select([ shape1, shape2 ]);

        modeling.moveElements([ shape1 ], { x: 30, y: 50 });

        // when
        commandStack.undo();

        // then
        expectWithinOutlineBounds([ shape1, shape2 ]);
      }
    ));

  });

});


// helpers /////

function getBounds(outline) {
  return {
    width: parseInt(outline.getAttribute('width')),
    height: parseInt(outline.getAttribute('height')),
    x: parseInt(outline.getAttribute('x')),
    y: parseInt(outline.getAttribute('y'))
  };
}

function expectShapeToBeWithinLimits(shape, limits) {
  var bbox = getBBox(shape);

  expect(bbox.x).to.be.at.least(limits.x);
  expect(bbox.y).to.be.at.least(limits.y);
  expect(bbox.x + bbox.width).to.be.at.most(limits.x + limits.width);
  expect(bbox.y + bbox.height).to.be.at.most(limits.y + limits.height);
}

function expectWithinOutlineBounds(shapes) {
  if (!Array.isArray(shapes)) {
    shapes = [ shapes ];
  }

  const outlineBounds = getOutlineBounds();

  // then
  for (const shape of shapes) {
    expectShapeToBeWithinLimits(shape, outlineBounds);
  }
}

function getOutlineGfx() {

  return getDiagramJS().invoke(function(canvas) {
    const container = canvas.getContainer();

    const gfx = domQuery('.djs-selection-outline', container);

    expect(gfx, 'selection outline').to.exist;

    return gfx;
  });
}

function getOutlineBounds() {
  return getBounds(getOutlineGfx());
}