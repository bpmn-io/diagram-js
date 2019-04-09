/* global sinon */

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import bendpointsModule from 'lib/features/bendpoints';
import rulesModule from './rules';
import modelingModule from 'lib/features/modeling';
import selectModule from 'lib/features/selection';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';


describe('features/bendpoints - move', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      bendpointsModule,
      rulesModule,
      modelingModule,
      selectModule
    ]
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, shape1, shape2, shape3, connection, connection2, connection3;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      type: 'A',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(shape1, rootShape);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      type: 'A',
      x: 500, y: 100, width: 100, height: 100
    });

    canvas.addShape(shape2, rootShape);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      type: 'B',
      x: 500, y: 400, width: 100, height: 100
    });

    canvas.addShape(shape3, rootShape);

    connection = elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 250, y: 250 }, { x: 550, y: 250 }, { x: 550, y: 150 } ],
      source: shape1,
      target: shape2
    });

    canvas.addConnection(connection, rootShape);

    connection2 = elementFactory.createConnection({
      id: 'connection2',
      waypoints: [ { x: 250, y: 250 }, { x: 550, y: 450 } ],
      source: shape1,
      target: shape2
    });

    canvas.addConnection(connection2, rootShape);

    connection3 = elementFactory.createConnection({
      id: 'connection3',
      waypoints: [ { x: 575, y: 425 }, { x: 700, y: 350 }, { x: 650, y: 250 }, { x: 575, y: 175 } ],
      source: shape3,
      target: shape2
    });

    canvas.addConnection(connection3, rootShape);

  }));


  describe('dragger', function() {

    it('should show on activate', inject(function(canvas, bendpointMove, dragging) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 400, y: 200 }));

      // then
      var bendpoint = domQuery('.djs-bendpoint.djs-dragging', layer);
      expect(bendpoint).to.exist;
    }));


    it('should update during move', inject(function(canvas, bendpointMove, dragging) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 1);
      dragging.move(canvasEvent({ x: 100, y: 100 }));

      // then
      var bendpoint = domQuery('.djs-bendpoint.djs-dragging', layer);
      expect(bendpoint).to.exist;
    }));


    it('should hide after resize', inject(function(canvas, bendpointMove, dragging) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 2);
      dragging.move(canvasEvent({ x: 100, y: 100 }));

      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.cancel();

      // then
      var bendpoint = domQuery('.djs-bendpoint.djs-dragging', layer);
      expect(bendpoint).to.be.null;
    }));


    it('should connect-hover and out', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.out();
      dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });
      dragging.out();
      dragging.hover({ element: shape3, gfx: canvas.getGraphics(shape3) });
      dragging.out();
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });

      // then
      var hoverNodes = domQueryAll('.connect-hover, .connect-ok, .connect-not-ok', canvas._svg);

      // connect-hover indicator
      expect(hoverNodes.length).to.equal(1);
    }));

  });


  describe('rule integration', function() {

    it('should live-check hover (allowed)', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);
      dragging.move(canvasEvent({ x: 550, y: 150 }));
      dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });
      dragging.move(canvasEvent({ x: 530, y: 120 }));

      // then
      var hoverNode = domQuery('.connect-hover.connect-ok', canvas._svg);

      expect(hoverNode).to.exist;
      expect(hoverNode.getAttribute('data-element-id')).to.equal(shape2.id);
    }));


    it('should live-check hover (rejected)', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);
      dragging.move(canvasEvent({ x: 550, y: 450 }));
      dragging.hover({ element: shape3, gfx: canvas.getGraphics(shape3) });
      dragging.move(canvasEvent({ x: 530, y: 420 }));

      // then
      var hoverNode = domQuery('.connect-hover.connect-not-ok', canvas._svg);

      expect(hoverNode).to.exist;
      expect(hoverNode.getAttribute('data-element-id')).to.equal(shape3.id);
    }));

  });


  describe('hints', function() {

    it('should provide hints object', inject(function(canvas, bendpointMove, dragging, eventBus) {

      // given
      var spy = sinon.spy(function(e) {
        expect(e.context.hints).to.have.property('bendpointMove');
        expect(e.context.hints.bendpointMove).to.be.eql({
          insert: true,
          bendpointIndex: 2
        });
      });

      eventBus.once('commandStack.execute', spy);

      // when
      bendpointMove.start(canvasEvent({ x: 550, y: 200 }), connection, 2, true);

      dragging.hover({
        element: connection,
        gfx: canvas.getGraphics(connection)
      });

      dragging.move(canvasEvent({ x: 400, y: 100 }));
      dragging.end();

      // then
      expect(spy).to.have.been.called;
    }));

  });


  describe('modeling', function() {


    it('should add bendpoint', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 550, y: 200 }), connection, 2, true);

      // need hover for creating new bendpoint
      dragging.hover({
        element: connection,
        gfx: canvas.getGraphics(connection)
      });

      dragging.move(canvasEvent({ x: 400, y: 100 }));
      dragging.end();

      // then
      expect(connection).to.have.waypoints([
        { x: 250, y: 250 },
        { x: 550, y: 250 },
        { x: 400, y: 100 },
        { x: 550, y: 150 }
      ]);
    }));


    it('should update bendpoint', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 1);
      dragging.move(canvasEvent({ x: 450, y: 430 }));
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.move(canvasEvent({ x: 530, y: 420 }));
      dragging.end();

      // then
      expect(connection.waypoints[1]).to.eql({ x: 530, y: 420 });
    }));


    it('should round to pixel values', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 1);
      dragging.move(canvasEvent({ x: 450, y: 430 }));
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.move(canvasEvent({ x: 530.3, y: 419.8 }));
      dragging.end();

      // then
      expect(connection.waypoints[1]).to.eql({ x: 530, y: 420 });
    }));


    it('should reattach target', inject(function(canvas, bendpointMove, dragging) {

      // given
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);
      dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });
      dragging.move(canvasEvent({ x: 530, y: 120 }));

      // when
      dragging.end();

      // then
      var waypoints = connection.waypoints;

      expect(waypoints[waypoints.length - 1]).to.eql({ x: 530, y: 120 });
    }));


    it('should reattach source', inject(function(canvas, bendpointMove, dragging) {

      // given
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 0);
      dragging.hover({ element: shape1, gfx: canvas.getGraphics(shape1) });
      dragging.move(canvasEvent({ x: 230, y: 120 }));

      // when
      dragging.end();

      // then
      expect(connection.waypoints[0]).to.eql({ x: 230, y: 120 });
    }));


    it('should keep one bendpoint, if two are overlapping', inject(function(canvas, bendpointMove, dragging) {

      // given
      bendpointMove.start(canvasEvent({ x: 650, y: 250 }), connection3, 2);

      // when
      dragging.move(canvasEvent({ x: 700, y: 350 }));
      dragging.end();

      // then
      expect(connection3.waypoints).to.eql([
        { x: 575, y: 425 },
        { x: 700, y: 350 },
        { x: 575, y: 175 }
      ]);
    }));

  });

});
