import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import bendpointsModule from 'lib/features/bendpoints';
import rulesModule from './rules';
import connectModule from 'lib/features/connect';
import modelingModule from 'lib/features/modeling';
import selectModule from 'lib/features/selection';
import connectionPreviewModule from 'lib/features/connection-preview';
import CroppingConnectionDocking from 'lib/layout/CroppingConnectionDocking';

import { getMid } from 'lib/layout/LayoutUtil';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import { isSnapped } from 'lib/features/snapping/SnapUtil';

var testModules = [
  bendpointsModule,
  rulesModule,
  modelingModule,
  selectModule,
  connectModule
];

var HIGH_PRIORITY = 2000;


describe('features/bendpoints - move', function() {

  function setManualDragging(dragging) {
    dragging.setOptions({ manual: true });
  }

  var rootShape, shape1, shape2, shape3, shape4, shape5,
      connection, connection2, connection3, connection4;

  function setupDiagram(elementFactory, canvas) {

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

    shape4 = elementFactory.createShape({
      id: 'shape4',
      type: 'C',
      x: 600, y: 250, width: 100, height: 100
    });

    canvas.addShape(shape4, rootShape);

    shape5 = elementFactory.createShape({
      id: 'shape5',
      type: 'D',
      x: 750, y: 250, width: 100, height: 100
    });

    canvas.addShape(shape5, rootShape);

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


    connection4 = elementFactory.createConnection({
      id: 'connection4',
      waypoints: [ { x: 400, y: 250 }, { x: 250, y: 250 } ],
      source: connection,
      target: connection2
    });

    canvas.addConnection(connection4, rootShape);

  }


  beforeEach(bootstrapDiagram({
    modules: testModules
  }));

  beforeEach(inject(setManualDragging));

  beforeEach(inject(setupDiagram));


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


    describe('hover markers', function() {

      function getMarked(cls) {

        return getDiagramJS().invoke(function(canvas) {
          return Array.prototype.slice.call(domQueryAll(cls, canvas._svg));
        });
      }


      it('should add connect-hover', inject(function(canvas, bendpointMove, dragging) {

        // when
        bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);
        dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });

        // then
        var marked = getMarked('.connect-hover');
        expect(marked).to.have.length(1);
      }));


      it('should remove connect-hover', inject(function(canvas, bendpointMove, dragging) {

        // when
        bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);
        dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
        dragging.out();

        // then
        var marked = getMarked('.connect-hover');
        expect(marked).to.be.empty;
      }));


      describe('reconnect start / end', function() {

        it('should NOT add .connect-ok if disallowed', inject(
          function(canvas, bendpointMove, dragging) {

            // when
            bendpointMove.start(canvasEvent({ x: 250, y: 250 }), connection, 0);
            dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });

            // then
            var marked = getMarked('.connect-ok');
            expect(marked).to.be.empty;
          }
        ));


        it('should add connect-ok if allowed', inject(
          function(canvas, bendpointMove, dragging) {

            // when
            bendpointMove.start(canvasEvent({ x: 250, y: 250 }), connection, 0);
            dragging.hover({ element: shape1, gfx: canvas.getGraphics(shape1) });

            // then
            var marked = getMarked('.connect-ok');
            expect(marked).to.have.length(1);
          }
        ));

      });


      describe('bendpoint move', function() {

        it('should NOT add connect-ok', inject(
          function(canvas, bendpointMove, dragging) {

            // when
            bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 1);
            dragging.move(canvasEvent({ x: 550, y: 550 }));

            dragging.hover({ element: shape1, gfx: canvas.getGraphics(shape1) });

            // then
            var marked = getMarked('.connect-ok');
            expect(marked).to.be.empty;
          }
        ));

      });

    });

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


    it('should set initial value correctly', inject(function(bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);

      var context = dragging.context();

      // then
      expect(context.data.context).to.have.property('allowed');
    }));


    it('should not init dragging if not allowed from start',
      inject(function(eventBus, bendpointMove, dragging) {

        // given
        function rule() {
          return false;
        }

        eventBus.on('commandStack.connection.reconnect.canExecute', Infinity, rule);

        // when
        bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);

        var context = dragging.context();

        // then
        expect(context).to.not.exist;
      })
    );
  });


  describe('hints', function() {

    it('should pass hints (actual moved bendpoint)', inject(function(bendpointMove, canvas, dragging, eventBus) {

      // given
      var executeSpy = sinon.spy(function(event) {
        var context = event.context,
            hints = context.hints;

        expect(hints.bendpointMove).to.exist;

        expect(hints.bendpointMove).to.eql({
          insert: true,
          bendpointIndex: 2
        });
      });

      eventBus.once('commandStack.execute', executeSpy);

      // when
      bendpointMove.start(canvasEvent({ x: 550, y: 200 }), connection, 2, true);

      dragging.hover({
        element: connection,
        gfx: canvas.getGraphics(connection)
      });

      dragging.move(canvasEvent({ x: 400, y: 100 }));

      dragging.end();

      // then
      expect(executeSpy).to.have.been.called;
    }));


    it('should pass hints (connection start)', inject(function(bendpointMove, canvas, dragging, eventBus) {

      // given
      var executeSpy = sinon.spy(function(event) {
        var context = event.context,
            hints = context.hints;

        expect(hints.connectionStart).to.eql({
          x: 0,
          y: 0
        });
      });

      eventBus.once('commandStack.execute', executeSpy);

      eventBus.once('bendpoint.move.move', HIGH_PRIORITY, function(event) {
        var context = event.context;

        context.hints = {
          connectionStart: {
            x: 0,
            y: 0
          }
        };
      });

      // when
      bendpointMove.start(canvasEvent({ x: 550, y: 200 }), connection, 2, true);

      dragging.hover({
        element: connection,
        gfx: canvas.getGraphics(connection)
      });

      dragging.move(canvasEvent({ x: 400, y: 100 }));

      dragging.end();

      // then
      expect(executeSpy).to.have.been.called;
    }));


    it('should pass hints (connection end)', inject(function(bendpointMove, canvas, dragging, eventBus) {

      // given
      var executeSpy = sinon.spy(function(event) {
        var context = event.context,
            hints = context.hints;

        expect(hints.connectionEnd).to.eql({
          x: 0,
          y: 0
        });
      });

      eventBus.once('commandStack.execute', executeSpy);

      eventBus.once('bendpoint.move.move', function(event) {
        var context = event.context;

        context.hints = {
          connectionEnd: {
            x: 0,
            y: 0
          }
        };
      });

      // when
      bendpointMove.start(canvasEvent({ x: 550, y: 200 }), connection, 2, true);

      dragging.hover({
        element: connection,
        gfx: canvas.getGraphics(connection)
      });

      dragging.move(canvasEvent({ x: 400, y: 100 }));

      dragging.end();

      // then
      expect(executeSpy).to.have.been.called;
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


    it('should allow moving bendpoint without hover', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 1);

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });

      dragging.out();

      dragging.move(canvasEvent({ x: 200, y: 200 }));

      dragging.end();

      // then
      expect(connection.waypoints[ 1 ]).to.eql({ x: 200, y: 200 });
    }));

  });


  describe('bendpoint snapping', function() {

    it('should snap to the shape center', function(done) {

      getDiagramJS().invoke(function(bendpointMove, canvas, dragging, eventBus) {

        // given
        eventBus.once('bendpoint.move.move', function(event) {

          // then
          try {
            expect(isSnapped(event, 'x')).to.be.true;
            expect(isSnapped(event, 'y')).to.be.true;
          } catch (error) {
            done(error);
          }

          done();
        });

        var shapeMid = getMid(shape2);

        bendpointMove.start(canvasEvent(shapeMid), connection, 2);

        dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });

        // when
        dragging.move(canvasEvent({
          x: shapeMid.x + 10,
          y: shapeMid.y + 10
        }));
      });

    });


    it('should snap to connection', function(done) {

      getDiagramJS().invoke(function(bendpointMove, canvas, dragging, eventBus) {

        eventBus.once('bendpoint.move.move', function(event) {

          // then
          try {
            expect(isSnapped(event, 'x')).to.be.true;
            expect(isSnapped(event, 'y')).to.be.true;
          } catch (error) {
            done(error);
          }

          done();
        });

        var moveStart = connection2.waypoints[ 0 ];

        bendpointMove.start(canvasEvent(moveStart), connection4, 1);

        dragging.hover({ element: connection2, gfx: canvas.getGraphics(connection) });

        // when
        dragging.move(canvasEvent({
          x: moveStart.x + 10,
          y: moveStart.y + 10
        }));

      });

    });


    it('should snap to connection on connect', function(done) {

      getDiagramJS().invoke(function(connect, canvas, dragging, eventBus) {

        eventBus.once('connect.move', function(event) {

          // then
          try {
            expect(isSnapped(event, 'x')).to.be.true;
            expect(isSnapped(event, 'y')).to.be.true;
          } catch (error) {
            done(error);
          }

          done();
        });

        var moveStart = connection2.waypoints[ 0 ];

        connect.start(canvasEvent(moveStart), connection4);

        dragging.hover({ element: connection2, gfx: canvas.getGraphics(connection) });

        // when
        dragging.move(canvasEvent({
          x: moveStart.x + 10,
          y: moveStart.y + 10
        }));

      });

    });

  });


  describe('connection preview', function() {

    var drawPreviewSpy;

    beforeEach(bootstrapDiagram({
      modules: testModules.concat(
        connectionPreviewModule,
        { connectionDocking: [ 'type', CroppingConnectionDocking ] }
      )
    }));

    beforeEach(inject(setManualDragging));

    beforeEach(inject(setupDiagram));

    beforeEach(inject(function(connectionPreview) {
      drawPreviewSpy = sinon.spy(connectionPreview, 'drawPreview');
    }));

    afterEach(sinon.restore);


    it('should display preview when bendpoint is added', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 550, y: 200 }), connection, 2, true);

      // need hover for creating new bendpoint
      dragging.hover({
        element: connection,
        gfx: canvas.getGraphics(connection)
      });

      dragging.move(canvasEvent({ x: 400, y: 100 }));

      var ctx = dragging.context();

      // then
      expect(ctx.data.context.connectionPreviewGfx.parentNode).to.exist;
    }));


    it('should display preview when bendpoint is moved', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 1);
      dragging.move(canvasEvent({ x: 450, y: 430 }));
      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });
      dragging.move(canvasEvent({ x: 530, y: 420 }));

      var ctx = dragging.context();

      // then
      expect(ctx.data.context.connectionPreviewGfx.parentNode).to.exist;
    }));


    it('should display preview when start is moved', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 0);
      dragging.hover({ element: shape1, gfx: canvas.getGraphics(shape1) });
      dragging.move(canvasEvent({ x: 230, y: 120 }));

      // then
      expect(hasPreview(dragging)).to.be.true;
    }));


    it('should display preview when start is moved (reverse)', inject(
      function(bendpointMove, canvas, dragging) {

        // given
        var firstBendpointIndex = 0,
            firstBendpoint = connection.waypoints[ firstBendpointIndex ];

        // when
        bendpointMove.start(canvasEvent(firstBendpoint), connection, firstBendpointIndex);

        dragging.hover({ element: shape5, gfx: canvas.getGraphics(shape5) });

        dragging.move(canvasEvent(getMid(shape5)));

        // then
        expect(hasPreview(dragging)).to.be.true;

        expect(drawPreviewSpy).to.have.been.calledOnce;

        // expect reverse
        expect(getHints(drawPreviewSpy)).to.include({
          source: connection.target,
          target: shape5
        });
      }
    ));


    it('should display preview when end is moved', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 500, y: 500 }), connection, 2);
      dragging.hover({ element: shape2, gfx: canvas.getGraphics(shape2) });
      dragging.move(canvasEvent({ x: 530, y: 120 }));

      // then
      expect(hasPreview(dragging)).to.be.true;
    }));


    it('should display preview when end is moved (reverse)', inject(
      function(bendpointMove, canvas, dragging) {

        // given
        var lastBendpointIndex = connection.waypoints.length - 1,
            lastBendpoint = connection.waypoints[ lastBendpointIndex ];

        // when
        bendpointMove.start(canvasEvent(lastBendpoint), connection, lastBendpointIndex);

        dragging.hover({ element: shape4, gfx: canvas.getGraphics(shape4) });

        dragging.move(canvasEvent(getMid(shape4)));

        // then
        expect(hasPreview(dragging)).to.be.true;

        expect(drawPreviewSpy).to.have.been.calledOnce;

        // expect reverse
        expect(getHints(drawPreviewSpy)).to.include({
          source: shape4,
          target: connection.source
        });
      }
    ));


    it('should filter out redundant waypoints from preview',
      inject(function(bendpointMove, dragging) {

        // when
        bendpointMove.start(canvasEvent({ x: 500, y: 250 }), connection, 1);
        dragging.move(canvasEvent({ x: 550, y: 250 }));

        var ctx = dragging.context(),
            preview = ctx.data.context.getConnection(true);

        // then
        expect(preview.waypoints).to.have.lengthOf(3);
      })
    );


    it('should display preview without hover', inject(function(canvas, bendpointMove, dragging) {

      // when
      bendpointMove.start(canvasEvent({ x: 0, y: 0 }), connection, 1);

      dragging.move(canvasEvent({ x: 100, y: 100 }));

      dragging.hover({ element: rootShape, gfx: canvas.getGraphics(rootShape) });

      dragging.out();

      dragging.move(canvasEvent({ x: 200, y: 200 }));

      // then
      var ctx = dragging.context();

      expect(ctx.data.context.connectionPreviewGfx.parentNode).to.exist;
    }));

  });

});

// helpers //////////

function getHints(drawPreviewSpy) {
  return drawPreviewSpy.firstCall.args[2];
}

function hasPreview(dragging) {
  var context = dragging.context(),
      connectionPreviewGfx = context.data.context.connectionPreviewGfx;

  return !!connectionPreviewGfx.parentNode;
}