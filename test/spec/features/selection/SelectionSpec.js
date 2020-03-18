import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

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


describe('features/selection/Selections', function() {

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

  var shape1, shape2, connection1;

  beforeEach(inject(function(canvas) {

    // given
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

    connection1 = canvas.addConnection({
      id: 'connection1',
      source: 'shape1',
      target: 'shape2',
      waypoints: [ { x: 110, y: 60 }, { x: 150, y: 60 } ]
    });
  }));


  describe('bootstrap', function() {

    it('should bootstrap diagram with component', inject(function(selection) {
      expect(selection).to.exist;
    }));

  });


  describe('#select', function() {

    it('should add shape to selection', inject(function(selection) {

      // when
      selection.select(shape1);

      // then
      var selectedElements = selection.get();
      expect(selectedElements[0]).to.equal(shape1);
    }));


    it('should add connection to selection', inject(function(selection) {

      // when
      selection.select(connection1);

      // then
      var selectedElements = selection.get();
      expect(selectedElements[0]).to.equal(connection1);
    }));


    it('should add multiple elements to selection', inject(function(selection) {

      // when
      selection.select(shape2);
      selection.select(connection1, true);

      // then
      var selectedElements = selection.get();
      expect(selectedElements[0]).to.equal(shape2);
      expect(selectedElements[1]).to.equal(connection1);
    }));


    it('should select moved element if previously not in selection',
      inject(function(dragging, elementRegistry, move, selection) {

        // given
        selection.select(shape1);

        // when
        move.start(canvasEvent({
          x: shape2.x + 10 + shape2.width / 2,
          y: shape2.y + 30 + shape2.height/2
        }), shape2);

        dragging.hover({
          element: shape2,
          gfx: elementRegistry.getGraphics(shape2)
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


  describe('#deselect', function() {

    it('should remove shape from selection', inject(function(selection) {
      selection.select(shape2);
      selection.select(connection1, true);

      selection.deselect(shape2);

      // then
      var selectedElements = selection.get();

      expect(selectedElements[0]).to.equal(connection1);
      expect(selectedElements.length).to.equal(1);
    }));


    it('should remove all elements from selection', inject(function(selection) {
      selection.select(shape2);
      selection.select(connection1, true);

      selection.select();

      // then
      var selectedElements = selection.get();
      expect(selectedElements.length).to.equal(0);
    }));


    it('should not fail on empty selection', inject(function(selection) {
      selection.select();

      var selectedElements = selection.get();

      // then
      expect(selectedElements.length).to.equal(0);
    }));

  });


  describe('clear', function() {

    it('should remove selection', inject(function(selection, eventBus) {

      // given
      selection.select(shape1);

      var changedSpy = sinon.spy(function() {});

      eventBus.on('selection.changed', changedSpy);

      // when
      eventBus.fire('diagram.clear');

      // then
      expect(selection._selectedElements).to.be.empty;

      expect(changedSpy).to.have.been.called;
    }));

  });


  describe('integration', function() {

    describe('create', function() {

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


    describe('connect', function() {

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


      it('should select target of connect interaction', inject(
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
          expect(selected).to.eql([ targetOnly ]);
        }
      ));


      it('should select target of connect interaction - reversed connection', inject(
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
          expect(selected).to.eql([ shape ]);
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
  });



});
