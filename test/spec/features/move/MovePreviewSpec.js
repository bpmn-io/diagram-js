import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';
import attachSupportModule from 'lib/features/attach-support';
import rulesModule from './rules';
import rendererModule from './renderer';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  classes as svgClasses
} from 'tiny-svg';


describe('features/move - MovePreview', function() {

  describe('general', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        attachSupportModule,
        modelingModule,
        moveModule,
        rulesModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var rootShape, parentShape, childShape, childShape2, connection, ignoreShape;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      parentShape = elementFactory.createShape({
        id: 'parent',
        x: 100, y: 100, width: 300, height: 300
      });

      canvas.addShape(parentShape, rootShape);

      childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110, width: 100, height: 100
      });

      canvas.addShape(childShape, parentShape);

      childShape2 = elementFactory.createShape({
        id: 'child2',
        x: 200, y: 110, width: 100, height: 100
      });

      canvas.addShape(childShape2, parentShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [ { x: 150, y: 150 }, { x: 150, y: 200 }, { x: 350, y: 150 } ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection, parentShape);

      ignoreShape = elementFactory.createShape({
        id: 'ignore',
        x: 450, y: 100, width: 300, height: 300
      });

      canvas.addShape(ignoreShape);

    }));


    describe('style integration via <djs-dragging>', function() {

      it('should append class to shape + outgoing connections', inject(function(move, dragging, elementRegistry) {

        // given
        move.start(canvasEvent({ x: 10, y: 10 }), childShape);

        // when
        dragging.move(canvasEvent({ x: 20, y: 20 }));

        // then
        expect(svgClasses(elementRegistry.getGraphics(childShape)).has('djs-dragging')).to.equal(true);
        expect(svgClasses(elementRegistry.getGraphics(connection)).has('djs-dragging')).to.equal(true);
      }));


      it('should append class to shape + incoming connections', inject(function(move, dragging, elementRegistry) {

        // given
        move.start(canvasEvent({ x: 10, y: 10 }), childShape2);

        // when
        dragging.move(canvasEvent({ x: 20, y: 20 }));

        // then
        expect(svgClasses(elementRegistry.getGraphics(childShape2)).has('djs-dragging')).to.equal(true);
        expect(svgClasses(elementRegistry.getGraphics(connection)).has('djs-dragging')).to.equal(true);
      }));


      it('should remove class on drag end', inject(function(move, dragging, elementRegistry) {

        // given
        move.start(canvasEvent({ x: 10, y: 10 }), childShape2);

        // when
        dragging.move(canvasEvent({ x: 30, y: 30 }));
        dragging.end();

        // then
        expect(svgClasses(elementRegistry.getGraphics(childShape2)).has('djs-dragging')).to.equal(false);
        expect(svgClasses(elementRegistry.getGraphics(connection)).has('djs-dragging')).to.equal(false);
      }));

    });


    describe('drop markup', function() {

      it('should indicate drop allowed', inject(function(move, dragging, elementRegistry) {

        // given
        move.start(canvasEvent({ x: 10, y: 10 }), childShape);

        // when
        dragging.move(canvasEvent({ x: 20, y: 20 }));
        dragging.hover(canvasEvent({ x: 20, y: 20 }, {
          element: parentShape,
          gfx: elementRegistry.getGraphics(parentShape)
        }));

        dragging.move(canvasEvent({ x: 22, y: 22 }));

        // then
        var ctx = dragging.context();
        expect(ctx.data.context.canExecute).to.equal(true);

        expect(svgClasses(elementRegistry.getGraphics(parentShape)).has('drop-ok')).to.equal(true);
      }));


      it('should indicate drop not allowed', inject(function(move, dragging, elementRegistry) {

        // given
        move.start(canvasEvent({ x: 10, y: 10 }), childShape);

        // when
        dragging.move(canvasEvent({ x: 20, y: 20 }));
        dragging.hover(canvasEvent({ x: 20, y: 20 }, {
          element: childShape,
          gfx: elementRegistry.getGraphics(childShape)
        }));

        dragging.move(canvasEvent({ x: 22, y: 22 }));

        // then
        var ctx = dragging.context();
        expect(ctx.data.context.canExecute).to.equal(false);

        expect(svgClasses(elementRegistry.getGraphics(childShape)).has('drop-not-ok')).to.equal(true);
      }));

    });


    describe('drop markup on target change', function() {

      var differentShape;

      beforeEach(inject(function(elementFactory, canvas) {

        differentShape = elementFactory.createShape({
          id: 'differentShape',
          x: 10, y: 110, width: 50, height: 50
        });

        canvas.addShape(differentShape, rootShape);

      }));


      it('should indicate new target, if selected shapes have different parents',
        inject(function(move, dragging, elementRegistry, selection) {

          // given
          selection.select([ childShape, differentShape ]);

          move.start(canvasEvent({ x: 10, y: 10 }), differentShape);

          // when
          dragging.move(canvasEvent({ x: 200, y: 200 }));
          dragging.hover(canvasEvent({ x: 200, y: 200 }, {
            element: parentShape,
            gfx: elementRegistry.getGraphics(parentShape)
          }));

          dragging.move(canvasEvent({ x: 120, y: 180 }));

          // then
          var ctx = dragging.context();
          expect(ctx.data.context.differentParents).to.equal(true);

          expect(svgClasses(elementRegistry.getGraphics(parentShape)).has('new-parent')).to.equal(true);
        })
      );


      it('should not indicate new target, if target does not change',
        inject(function(move, dragging, elementRegistry, selection) {

          // given
          selection.select([ childShape, differentShape ]);

          move.start(canvasEvent({ x: 10, y: 10 }), childShape);

          // when
          dragging.move(canvasEvent({ x: 200, y: 200 }));
          dragging.hover(canvasEvent({ x: 200, y: 200 }, {
            element: parentShape,
            gfx: elementRegistry.getGraphics(parentShape)
          }));

          dragging.move(canvasEvent({ x: 120, y: 180 }));

          // then
          var ctx = dragging.context();
          expect(ctx.data.context.differentParents).to.equal(true);

          expect(svgClasses(elementRegistry.getGraphics(parentShape)).has('drop-new-target')).to.equal(false);
        })
      );


      it('should not indicate new target, if drop is not allowed',
        inject(function(move, dragging, elementRegistry, selection) {

          // given
          selection.select([ childShape, differentShape ]);

          move.start(canvasEvent({ x: 10, y: 10 }), differentShape);

          // when
          dragging.move(canvasEvent({ x: 200, y: 200 }));
          dragging.hover(canvasEvent({ x: 200, y: 200 }, {
            element: childShape,
            gfx: elementRegistry.getGraphics(childShape)
          }));

          dragging.move(canvasEvent({ x: 150, y: 15 }));

          // then
          var ctx = dragging.context();
          expect(ctx.data.context.differentParents).to.equal(true);

          var childGfx = elementRegistry.getGraphics(childShape);
          expect(svgClasses(childGfx).has('drop-new-target')).to.equal(false);
          expect(svgClasses(childGfx).has('drop-not-ok')).to.equal(true);
        })
      );


      it('should visually ignore new target, if canExecute reveals null',
        inject(function(move, dragging, elementRegistry) {

          // given
          move.start(canvasEvent({ x: 10, y: 10 }), childShape);

          var targetGfx = elementRegistry.getGraphics(ignoreShape);

          // when
          dragging.move(canvasEvent({ x: 450, y: 10 }));
          dragging.hover(canvasEvent({ x: 450, y: 10 }, {
            element: ignoreShape,
            gfx: elementRegistry.getGraphics(childShape)
          }));

          dragging.move(canvasEvent({ x: 450, y: 12 }));

          // then
          var ctx = dragging.context();
          expect(ctx.data.context.canExecute).to.equal(null);

          expect(svgClasses(targetGfx).has('drop-new-target')).to.equal(false);

        })
      );

    });


    describe('drag group', function() {

      var shape;

      beforeEach(inject(function(elementFactory, canvas) {

        shape = elementFactory.createShape({
          id: 'shape',
          x: 500, y: 500, width: 100, height: 100
        });

        canvas.addShape(shape, rootShape);
      }));


      it('should create drag group on move', inject(function(canvas, move) {

        // when
        move.start(canvasEvent({ x: 550, y: 550 }), shape, true);

        // then
        expect(domQuery('.djs-drag-group', canvas.getContainer())).to.exist;
      }));


      it('should remove drag group after move', inject(function(canvas, dragging, move) {

        // given
        move.start(canvasEvent({ x: 550, y: 550 }), shape, true);

        dragging.move(canvasEvent({ x: 600, y: 600 }));

        // when
        dragging.end();

        // then
        expect(domQuery('.djs-drag-group', canvas.getContainer())).not.to.exist;
      }));

    });

    describe('frame elements', function() {

      var frameShape;

      beforeEach(inject(function(elementFactory, canvas) {

        frameShape = elementFactory.createShape({
          id: 'frameShape',
          x: 450, y: 50, width: 400, height: 200,
          isFrame: true
        });

        canvas.addShape(frameShape, rootShape);
      }));


      it('should indicate drop not allowed', inject(function(move, dragging, elementRegistry) {

        // given
        move.start(canvasEvent({ x: 10, y: 10 }), childShape);

        var targetGfx = elementRegistry.getGraphics(frameShape);

        // when
        dragging.move(canvasEvent({ x: 300, y: 20 }));
        dragging.hover(canvasEvent({ x: 300, y: 20 }, {
          element: frameShape,
          gfx: elementRegistry.getGraphics(childShape)
        }));

        dragging.move(canvasEvent({ x: 300, y: 22 }));

        // then
        var ctx = dragging.context();
        expect(ctx.data.context.canExecute).to.equal(false);

        expect(svgClasses(targetGfx).has('djs-frame')).to.equal(true);
        expect(svgClasses(targetGfx).has('drop-not-ok')).to.equal(true);
      }));

    });


    describe('connections', function() {

      var host, attacher, parentShape2, shape, connectionA, connectionB;

      beforeEach(inject(function(elementFactory, canvas, modeling) {

        parentShape2 = elementFactory.createShape({
          id: 'parentShape2',
          x: 450, y: 50, width: 400, height: 200
        });

        canvas.addShape(parentShape2, rootShape);

        host = elementFactory.createShape({
          id: 'host',
          x: 500, y: 100, width: 100, height: 100
        });

        canvas.addShape(host, parentShape2);

        attacher = elementFactory.createShape({
          id: 'attacher',
          x: 0, y: 0, width: 50, height: 50
        });

        modeling.createShape(attacher, { x: 600, y: 100 }, host, true);

        shape = elementFactory.createShape({
          id: 'shape',
          x: 700, y: 100, width: 100, height: 100
        });

        canvas.addShape(shape, parentShape2);

        connectionA = elementFactory.createConnection({
          id: 'connectionA',
          waypoints: [ { x: 500, y: 100 }, { x: 750, y: 150 } ],
          source: host,
          target: shape
        });

        canvas.addConnection(connectionA, parentShape2);

        connectionB = elementFactory.createConnection({
          id: 'connectionB',
          waypoints: [ { x: 600, y: 100 }, { x: 750, y: 150 } ],
          source: attacher,
          target: shape
        });

        canvas.addConnection(connectionB, parentShape2);
      }));


      it('should add connections to dragGroup',
        inject(function(move, dragging, elementRegistry, selection) {

          var rootGfx = elementRegistry.getGraphics(rootShape),
              dragGroup;

          // when
          selection.select([ host, shape ]);


          move.start(canvasEvent({ x: 0, y: 0 }), host);

          dragging.hover({
            element: rootShape,
            gfx: rootGfx
          });

          dragging.move(canvasEvent({ x: 150, y: 200 }));

          dragGroup = dragging.context().data.context.dragGroup;

          // then
          expect(domQuery('[data-element-id="connectionA"]', dragGroup)).to.exist;
          expect(domQuery('[data-element-id="connectionB"]', dragGroup)).to.exist;
        })
      );

    });

  });


  describe('markers', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        attachSupportModule,
        modelingModule,
        moveModule,
        rendererModule,
        rulesModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var rootShape, shape1, shape2, shape3, connection1, connection2, connection3;

    beforeEach(inject(function(elementFactory, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 400, y: 300, width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);

      shape3 = elementFactory.createShape({
        id: 'shape3',
        x: 100, y: 300, width: 100, height: 100
      });

      canvas.addShape(shape3, rootShape);

      connection1 = elementFactory.createConnection({
        id: 'connection1',
        waypoints: [ { x: 200, y: 150 }, { x: 450, y: 150 }, { x: 450, y: 300 } ],
        source: shape1,
        target: shape2,
        marker: {
          start: true,
          end: true
        }
      });

      canvas.addConnection(connection1, rootShape);

      connection2 = elementFactory.createConnection({
        id: 'connection2',
        waypoints: [ { x: 450, y: 400 }, { x: 450, y: 450 }, { x: 150, y: 450 }, { x: 150, y: 400 } ],
        source: shape1,
        target: shape2,
        marker: {
          start: true,
          mid: true
        }
      });

      canvas.addConnection(connection2, rootShape);

      connection3 = elementFactory.createConnection({
        id: 'connection3',
        waypoints: [ { x: 150, y: 300 }, { x: 150, y: 200 } ],
        source: shape1,
        target: shape2,
        marker: {
          mid: true,
          end: true
        }
      });

      canvas.addConnection(connection3, rootShape);
    }));


    it('should clone markers', inject(function(canvas, dragging, move, selection) {

      // when
      selection.select([ shape1, shape2, shape3 ]);

      move.start(canvasEvent({ x: 0, y: 0 }), shape2);

      dragging.move(canvasEvent({ x: 100, y: 50 }));

      var dragGroup = dragging.context().data.context.dragGroup;

      // then
      var container = canvas.getContainer();

      var clonedMarkers = domQueryAll('marker.djs-dragger-marker', container);

      expect(clonedMarkers).to.have.length(3);

      var markerStartClone = domQuery('marker#marker-start-clone', container),
          markerMidClone = domQuery('marker#marker-mid-clone', container),
          markerEndClone = domQuery('marker#marker-end-clone', container);

      expect(markerStartClone).to.exist;
      expect(markerMidClone).to.exist;
      expect(markerEndClone).to.exist;

      var connection1Polyline = domQuery('[data-element-id="connection1"] polyline', dragGroup);

      expect(idToReferenceFormatOptions(markerStartClone.id)).to.deep.include(connection1Polyline.style.markerStart);
      expect(idToReferenceFormatOptions(markerEndClone.id)).to.deep.include(connection1Polyline.style.markerEnd);

      var connection2Polyline = domQuery('[data-element-id="connection2"] polyline', dragGroup);

      expect(idToReferenceFormatOptions(markerStartClone.id)).to.deep.include(connection2Polyline.style.markerStart);
      expect(idToReferenceFormatOptions(markerMidClone.id)).to.deep.include(connection2Polyline.style.markerMid);

      var connection3Polyline = domQuery('[data-element-id="connection3"] polyline', dragGroup);

      expect(idToReferenceFormatOptions(markerMidClone.id)).to.deep.include(connection3Polyline.style.markerMid);
      expect(idToReferenceFormatOptions(markerEndClone.id)).to.deep.include(connection3Polyline.style.markerEnd);
    }));


    it('should remove markers on cleanup', inject(function(canvas, dragging, move, selection) {

      // when
      selection.select([ shape1, shape2, shape3 ]);

      move.start(canvasEvent({ x: 0, y: 0 }), shape2);

      dragging.move(canvasEvent({ x: 100, y: 50 }));

      dragging.end();

      // then
      var clonedMarkers = domQueryAll('marker.djs-dragger-marker', canvas.getContainer());

      expect(clonedMarkers).to.have.length(0);
    }));

  });

});

// helpers //////////

/**
 * Get functional IRI reference for given ID of fragment within current document.
 *
 * @param {string} id
 * @param {string} [quoteSymbol='']
 *
 * @returns {string}
 */
function idToReference(id, quoteSymbol) {
  quoteSymbol = quoteSymbol ? quoteSymbol : '';
  return 'url(' + quoteSymbol + '#' + id + quoteSymbol + ')';
}

/**
 * Get functional IRI reference in all syntactical valid options according to W3C.
 * (See https://www.w3.org/TR/CSS2/syndata.html#uri). This will include one
 * unquoted and two quoted (<'> and <">) variants and allows for testing on
 * different browser environments.
 *
 * @param {string} id
 *
 * @returns {string[]}
 */
function idToReferenceFormatOptions(id) {
  return [ '', '\'', '"' ].map(function(quoteSymbol) {
    return idToReference(id, quoteSymbol);
  });
}
