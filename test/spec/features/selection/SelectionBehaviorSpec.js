import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  assign
} from 'min-dash';

import coreModule from 'lib/core';
import createModule from 'lib/features/create';
import draggingModule from 'lib/features/dragging';
import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';
import connectModule from 'lib/features/connect';
import rulesModule from './rules';
import selectionModule from 'lib/features/selection';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';


describe('features/selection/Selection', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      coreModule,
      draggingModule,
      modelingModule,
      createModule,
      moveModule,
      connectModule,
      rulesModule,
      selectionModule
    ]
  }));

  var shape1, shape2, rootElement;

  beforeEach(inject(function(canvas) {
    rootElement = canvas.getRootElement();

    shape1 = canvas.addShape({
      id: 'shape1',
      x: 10,
      y: 10,
      width: 100,
      height: 100
    });

    shape2 = canvas.addShape({
      id: 'shape2',
      x: 150,
      y: 10,
      width: 100,
      height: 100
    });
  }));


  describe('create.end', function() {

    var newElements,
        shape1,
        shape2,
        rootShape,
        rootGfx;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = canvas.getRootElement(),

      rootGfx = canvas.getGraphics(rootShape);

      newElements = [];

      shape1 = elementFactory.createShape({
        id: 'newShape1',
        x: 0,
        y: 0,
        width: 100,
        height: 100
      });

      newElements.push(shape1);

      shape2 = elementFactory.createShape({
        id: 'newShape2',
        x: 200,
        y: 0,
        width: 100,
        height: 100
      });

      newElements.push(shape2);
    }));


    it('should select all created elements', inject(function(create, dragging, selection) {

      // given
      create.start(canvasEvent({ x: 0, y: 0 }), newElements);

      dragging.hover({ element: rootShape, gfx: rootGfx });

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      // when
      dragging.end();

      // then
      var selected = selection.get();

      expect(selected).to.exist;
      expect(selected).to.eql(newElements);
    }));


    it('should NOT select all created elements', inject(function(create, dragging, selection) {

      // given
      create.start(canvasEvent({ x: 0, y: 0 }), newElements, {
        hints: {
          autoSelect: [ shape1 ]
        }
      });

      dragging.hover({ element: rootShape, gfx: rootGfx });

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      // when
      dragging.end();

      // then
      var selected = selection.get();

      expect(selected).to.exist;
      expect(selected).to.eql([ shape1 ]);
    }));


    it('should NOT select created elements', inject(function(create, dragging, selection) {

      // given
      create.start(canvasEvent({ x: 0, y: 0 }), newElements, {
        hints: {
          autoSelect: false
        }
      });

      dragging.hover({ element: rootShape, gfx: rootGfx });

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      // when
      dragging.end();

      // then
      var selected = selection.get();

      expect(selected).to.exist;
      expect(selected).to.be.empty;
    }));

  });


  describe('connect.end', function() {

    var shape, targetOnly, notConnectable;

    beforeEach(inject(function(canvas) {

      // given
      shape = canvas.addShape({
        id: 'shape',
        x: 10,
        y: 220,
        width: 100,
        height: 100
      });

      targetOnly = canvas.addShape({
        id: 'targetOnly',
        x: 150,
        y: 220,
        width: 100,
        height: 100,
        targetOnly: true
      });

      notConnectable = canvas.addShape({
        id: 'notConnectable',
        x: 10,
        y: 330,
        width: 100,
        height: 100,
        notConnectable: true
      });
    }));


    it('should select connection', inject(
      function(connect, dragging, selection) {

        // given
        connect.start(canvasEvent({ x: 200, y: 60 }), shape);

        dragging.hover({ element: targetOnly });

        dragging.move(canvasEvent({ x: 50, y: 20 }));

        // when
        dragging.end();

        // then
        var selected = selection.get();

        expect(selected).to.exist;
        expect(selected).to.eql([ targetOnly.incoming[0] ]);
        expect(selected).to.eql([ shape.outgoing[0] ]);
      }
    ));


    it('should select connection (reversed connect)', inject(
      function(connect, dragging, selection) {

        // given
        connect.start(canvasEvent({ x: 200, y: 60 }), targetOnly);

        dragging.hover({ element: shape });

        dragging.move(canvasEvent({ x: 50, y: 20 }));

        // when
        dragging.end();

        // then
        var selected = selection.get();

        expect(selected).to.exist;
        expect(selected).to.eql([ targetOnly.incoming[0] ]);
        expect(selected).to.eql([ shape.outgoing[0] ]);
      }
    ));


    it('should NOT select if connection is not created', inject(
      function(connect, dragging, selection) {

        // given
        connect.start(canvasEvent({ x: 200, y: 60 }), targetOnly);

        dragging.hover({ element: notConnectable });

        dragging.move(canvasEvent({ x: 50, y: 20 }));

        // when
        dragging.end();

        // then
        var selected = selection.get();

        expect(selected).to.exist;
        expect(selected).to.eql([]);
      }
    ));

  });


  describe('shape.move.end', function() {

    it('should select moved element if previously not in selection',
      inject(function(dragging, elementRegistry, move, selection) {

        // given
        selection.select(shape1);

        // when
        move.start(canvasEvent({
          x: shape2.x + 10 + shape2.width / 2,
          y: shape2.y + 30 + shape2.height / 2
        }), shape2);

        dragging.hover({
          element: rootElement,
          gfx: elementRegistry.getGraphics(rootElement)
        });

        dragging.move(canvasEvent({ x: 300, y: 300 }));

        dragging.end();

        // then
        var selectedElements = selection.get();

        expect(selectedElements[0]).to.equal(shape2);
        expect(selectedElements.length).to.equal(1);
      })
    );

  });


  describe('element.click', function() {

    it('should select element on PRIMARY click', inject(function(eventBus, selection) {

      // when
      eventBus.fire(clickEvent(shape1));

      // then
      expect(selection.get()).to.have.length(1);
      expect(selection.isSelected(shape1)).to.be.true;
    }));


    it('should NOT select element on AUXILIARY click', inject(function(eventBus, selection) {

      // when
      eventBus.fire(clickEvent(shape1, { button: 1 }));

      // then
      expect(selection.get()).to.be.empty;
    }));


    it('should deselect element on click', inject(function(eventBus, selection) {

      // given
      selection.select(shape1);

      // when
      eventBus.fire(clickEvent(shape1));

      // then
      expect(selection.get()).to.have.length(0);
      expect(selection.isSelected(shape1)).to.be.false;
    }));


    it('should only select element on click', inject(function(eventBus, selection) {

      // given
      selection.select(shape1);

      // when
      eventBus.fire(clickEvent(shape2));

      // then
      expect(selection.get()).to.have.length(1);
      expect(selection.isSelected(shape1)).to.be.false;
      expect(selection.isSelected(shape2)).to.be.true;
    }));


    it('should add element to selection on click + SHIFT',
      inject(function(eventBus, selection) {

        // given
        selection.select(shape1);

        // when
        eventBus.fire(clickEvent(shape2, { shiftKey: true }));

        // then
        expect(selection.get()).to.have.length(2);
        expect(selection.isSelected(shape1)).to.be.true;
        expect(selection.isSelected(shape2)).to.be.true;
      })
    );


    it('should remove selected element from selection on click + SHIFT',
      inject(function(eventBus, selection) {

        // given
        selection.select([ shape1, shape2 ]);

        // when
        eventBus.fire(clickEvent(shape1, { shiftKey: true }));

        // then
        expect(selection.get()).to.have.length(1);
        expect(selection.isSelected(shape1)).to.be.false;
        expect(selection.isSelected(shape2)).to.be.true;
      })
    );

  });

});


// helpers ////////////////

function clickEvent(element, data) {

  return getDiagramJS().invoke(function(eventBus) {
    return eventBus.createEvent({
      type: 'element.click',
      element: element,
      originalEvent: assign({ button: 0 }, data || {})
    });
  });
}