import { expect } from 'chai';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import selectionModule from 'lib/features/selection';

import {
  classes as svgClasses,
} from 'tiny-svg';


describe('features/selection/SelectionVisuals', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      selectionModule
    ]
  }));


  describe('selection markers', function() {

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


    it('should mark selected shape', inject(function(selection, canvas, elementRegistry) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      selection.select(shape);

      // then
      var gfx = elementRegistry.getGraphics(shape);

      expect(svgClasses(gfx).has('selected')).to.be.true;
    }));


    it('should mark selected connection', inject(function(selection, canvas, elementRegistry) {

      // given
      var connection = canvas.addConnection({ id: 'select1', waypoints: [ { x: 25, y: 25 }, { x: 115, y: 115 } ] });

      // when
      selection.select(connection);

      // then
      var gfx = elementRegistry.getGraphics(connection);

      expect(svgClasses(gfx).has('selected')).to.be.true;
    }));


    it('should unmark deselected shape', inject(function(selection, canvas, elementRegistry) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      selection.select(shape);
      selection.deselect(shape);

      // then
      var gfx = elementRegistry.getGraphics(shape);

      expect(svgClasses(gfx).has('selected')).to.be.false;
    }));


    it('should mark hovered shape', inject(function(canvas, elementRegistry, eventBus) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      eventBus.fire('element.hover', { element: shape, gfx: canvas.getGraphics(shape) });

      // then
      var gfx = elementRegistry.getGraphics(shape);

      expect(svgClasses(gfx).has('hover')).to.be.true;
    }));


    it('should unmark unhovered shape', inject(function(canvas, elementRegistry, eventBus) {

      // given
      var shape = canvas.addShape({
        id: 'test',
        x: 10,
        y: 10,
        width: 100,
        height: 100
      });

      // when
      eventBus.fire('element.hover', { element: shape, gfx: canvas.getGraphics(shape) });
      eventBus.fire('element.out', { element: shape, gfx: canvas.getGraphics(shape) });

      // then
      var gfx = elementRegistry.getGraphics(shape);

      expect(svgClasses(gfx).has('hover')).to.be.false;
    }));

  });

});