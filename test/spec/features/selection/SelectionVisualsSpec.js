import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import selectionModule from 'lib/features/selection';
import modelingModule from 'lib/features/modeling';

import {
  classes as domClasses,
  query as domQuery
} from 'min-dom';

import { getBBox } from 'lib/util/Elements';

import {
  resizeBounds
} from 'lib/features/resize/ResizeUtil';


describe('features/selection/SelectionVisuals', function() {

  beforeEach(bootstrapDiagram({ modules: [ selectionModule, modelingModule ] }));

  describe('bootstrap', function() {

    beforeEach(bootstrapDiagram({ modules: [ selectionModule ] }));

    it('should bootstrap diagram with component', inject(function() {

    }));

  });


  describe('selection box', function() {

    var shape, shape2, connection;

    beforeEach(inject(function(elementFactory, canvas) {

      shape = elementFactory.createShape({
        id: 'child',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape);

      shape2 = elementFactory.createShape({
        id: 'child2',
        x: 300, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape2);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
        source: shape,
        target: shape2
      });

      canvas.addConnection(connection);
    }));


    describe('single element', function() {

      it('should show box on select', inject(function(selection, canvas) {

        // when
        selection.select(connection);

        // then
        var gfx = canvas.getGraphics(connection),
            outline = domQuery('.djs-outline', gfx);

        expect(outline).to.exist;
      }));


      it('should not add djs-multi-select marker', inject(function(canvas) {

        // when
        var element = canvas.getContainer();

        // then
        expect(domClasses(element).has('djs-multi-select'));
      }));

    });


    describe('multi element', function() {

      var selectedShapes, outline, bounds;

      beforeEach(inject(function(selection) {

        selectedShapes = [ connection, shape2 ];
        selection.select(selectedShapes);

        outline = domQuery('.djs-selection-outline');

        bounds = getBounds(outline);
      }));


      it('should show box', inject(function() {
        expect(outline).to.exist;
      }));


      it('should add djs-multi-select marker', inject(function(selection, canvas) {

        // when
        var element = canvas.getContainer();

        // then
        expect(domClasses(element).has('djs-multi-select')).to.be.true;

        // but when
        selection.select(null);

        // then
        expect(domClasses(element).has('djs-multi-select')).to.be.false;
      }));


      it('selection box should contain all selected elements', inject(function() {

        // then
        selectedShapes.forEach(function(shape) {
          var bbox = getBBox(shape);

          expect(bbox.x).to.be.at.least(bounds.x);
          expect(bbox.y).to.be.at.least(bounds.y);
          expect(bbox.x + bbox.width).to.be.at.most(bounds.x + bounds.width);
          expect(bbox.y + bbox.height).to.be.at.most(bounds.y + bounds.height);
        });
      }));


      it('selection box should react to element changes', inject(function(modeling) {

        // when
        modeling.resizeShape(shape2, resizeBounds(bounds, 'nw', { x: 10, y: 20 }));

        outline = domQuery('.djs-selection-outline');

        var newBounds = getBounds(outline);

        // then
        expect(newBounds).to.not.eql(bounds);

        // then
        selectedShapes.forEach(function(shape) {
          var bbox = getBBox(shape);

          expect(bbox.x).to.be.at.least(newBounds.x);
          expect(bbox.y).to.be.at.least(newBounds.y);
          expect(bbox.x + bbox.width).to.be.at.most(newBounds.x + newBounds.width);
          expect(bbox.y + bbox.height).to.be.at.most(newBounds.y + newBounds.height);
        });

      }));


      it('selection box should react to undo/redo', inject(function(modeling, commandStack) {

        // given
        modeling.resizeShape(shape2, resizeBounds(shape, 'nw', { x: 10, y: 20 }));

        var outline = domQuery('.djs-selection-outline');

        var bounds = getBounds(outline);

        // when
        commandStack.undo();

        outline = domQuery('.djs-selection-outline');

        var newBounds = getBounds(outline);

        // then
        expect(bounds).to.not.eql(newBounds);

        // then
        selectedShapes.forEach(function(shape) {
          expectShapeToBeWithinLimits(shape, newBounds);
        });

      }));

    });

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