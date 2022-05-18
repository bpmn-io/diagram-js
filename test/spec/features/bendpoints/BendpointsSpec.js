import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import bendpointsModule from 'lib/features/bendpoints';
import rulesModule from './rules';
import interactionModule from 'lib/features/interaction-events';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import {
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  getVisual
} from 'lib/util/GraphicsUtil';


describe('features/bendpoints', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      bendpointsModule,
      interactionModule,
      rulesModule
    ]
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, shape1, shape2, shape3, connection, connection2;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    shape1 = elementFactory.createShape({
      id: 'shape.1',
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
      id: 'connection.1',
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
  }));


  describe('activation', function() {

    it('should show on hover', inject(function(eventBus, canvas, elementRegistry) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      eventBus.fire('element.hover', {
        element: connection,
        gfx: elementRegistry.getGraphics(connection)
      });


      // then
      // 3 visible + 1 invisible bendpoint are shown
      expect(domQueryAll('.djs-bendpoint', layer).length).to.equal(4);
      expect(domQueryAll('.djs-segment-dragger', layer).length).to.equal(2);
    }));


    it('should show on select', inject(function(selection, canvas) {

      // given
      var layer = canvas.getLayer('overlays');

      // when
      selection.select(connection);

      // then
      // 3 visible + 1 invisible bendpoint are shown
      expect(domQueryAll('.djs-bendpoint', layer).length).to.equal(4);
      expect(domQueryAll('.djs-segment-dragger', layer).length).to.equal(2);
    }));


    it('should NOT activate on AUXILIARY mouse button', inject(
      function(dragging, eventBus, elementRegistry) {

        // when
        eventBus.fire('element.hover', {
          element: connection,
          gfx: elementRegistry.getGraphics(connection)
        });
        eventBus.fire('element.mousemove', {
          element: connection,
          originalEvent: canvasEvent({ x: 250, y: 250 })
        });
        eventBus.fire('element.mousedown', {
          element: connection,
          originalEvent: canvasEvent({ x: 250, y: 250 }, { button: 1 })
        });

        var draggingContext = dragging.context();

        // then
        expect(draggingContext).not.to.exist;
      }
    ));


    it('should activate bendpoint move on starting waypoint', inject(
      function(dragging, eventBus, elementRegistry) {

        // when
        eventBus.fire('element.hover', {
          element: connection,
          gfx: elementRegistry.getGraphics(connection)
        });
        eventBus.fire('element.mousemove', {
          element: connection,
          originalEvent: canvasEvent({ x: 250, y: 250 })
        });
        eventBus.fire('element.mousedown', {
          element: connection,
          originalEvent: canvasEvent({ x: 250, y: 250 })
        });

        var draggingContext = dragging.context();

        // then
        expect(draggingContext).to.exist;
        expect(draggingContext.prefix).to.eql('bendpoint.move');
      }
    ));


    it('should activate bendpoint move on intermediate waypoint', inject(
      function(dragging, eventBus, elementRegistry) {

        // when
        eventBus.fire('element.hover', {
          element: connection,
          gfx: elementRegistry.getGraphics(connection)
        });
        eventBus.fire('element.mousemove', {
          element: connection,
          originalEvent: canvasEvent({ x: 550, y: 250 })
        });
        eventBus.fire('element.mousedown', {
          element: connection,
          originalEvent: canvasEvent({ x: 550, y: 250 })
        });

        var draggingContext = dragging.context();

        // then
        expect(draggingContext).to.exist;
        expect(draggingContext.prefix).to.eql('bendpoint.move');
      }
    ));


    it('should active bendpoint move on non-aligned segment', inject(
      function(dragging, eventBus, elementRegistry) {

        // when
        eventBus.fire('element.hover', {
          element: connection2,
          gfx: elementRegistry.getGraphics(connection)
        });
        eventBus.fire('element.mousemove', {
          element: connection2,
          originalEvent: canvasEvent({ x: 361, y: 351 })
        });
        eventBus.fire('element.mousedown', {
          element: connection2,
          originalEvent: canvasEvent({ x: 327, y: 300 })
        });

        var draggingContext = dragging.context();

        // then
        expect(draggingContext).to.exist;
        expect(draggingContext.prefix).to.eql('bendpoint.move');
      }
    ));


    describe('horizontal', function() {

      it('should activate bendpoint move outside two-third-region', inject(
        function(dragging, eventBus, elementRegistry) {

          // when
          eventBus.fire('element.hover', {
            element: connection,
            gfx: elementRegistry.getGraphics(connection)
          });
          eventBus.fire('element.mousemove', {
            element: connection,
            originalEvent: canvasEvent({ x: 525, y: 250 })
          });
          eventBus.fire('element.mousedown', {
            element: connection,
            originalEvent: canvasEvent({ x: 525, y: 250 })
          });

          var draggingContext = dragging.context();

          // then
          expect(draggingContext).to.exist;
          expect(draggingContext.prefix).to.eql('bendpoint.move');
        }
      ));


      it('should activate parallel move on segment center', inject(
        function(dragging, eventBus, elementRegistry) {

          // precondition
          var segmentStart = connection.waypoints[0].x,
              segmentEnd = connection.waypoints[1].x,
              segmentCenter = segmentEnd - (segmentEnd - segmentStart) / 2;

          // when
          eventBus.fire('element.hover', {
            element: connection,
            gfx: elementRegistry.getGraphics(connection)
          });
          eventBus.fire('element.mousemove', {
            element: connection,
            originalEvent: canvasEvent({ x: segmentCenter, y: 250 })
          });
          eventBus.fire('element.mousedown', {
            element: connection,
            originalEvent: canvasEvent({ x: segmentCenter, y: 250 })
          });

          var draggingContext = dragging.context();

          // then
          expect(draggingContext).to.exist;
          expect(draggingContext.prefix).to.eql('connectionSegment.move');
        }
      ));


      it('should activate parallel move in two-third-region', inject(
        function(dragging, eventBus, elementRegistry) {

          // precondition
          var intersectionStart = connection.waypoints[0].x,
              intersectionEnd = connection.waypoints[1].x,
              segmentLength = intersectionEnd - intersectionStart,
              twoThirdStart = intersectionStart + (segmentLength * 0.333) / 2;

          // when
          eventBus.fire('element.hover', {
            element: connection,
            gfx: elementRegistry.getGraphics(connection)
          });
          eventBus.fire('element.mousemove', {
            element: connection,
            originalEvent: canvasEvent({ x: twoThirdStart, y: 250 })
          });
          eventBus.fire('element.mousedown', {
            element: connection,
            originalEvent: canvasEvent({ x: twoThirdStart, y: 250 })
          });

          var draggingContext = dragging.context();

          // then
          expect(draggingContext).to.exist;
          expect(draggingContext.prefix).to.eql('connectionSegment.move');
        }
      ));

    });


    describe('vertical', function() {

      it('should activate bendpoint move outside two-third-region', inject(
        function(dragging, eventBus, elementRegistry) {

          // when
          eventBus.fire('element.hover', {
            element: connection,
            gfx: elementRegistry.getGraphics(connection)
          });
          eventBus.fire('element.mousemove', {
            element: connection,
            originalEvent: canvasEvent({ x: 525, y: 250 })
          });
          eventBus.fire('element.mousedown', {
            element: connection,
            originalEvent: canvasEvent({ x: 525, y: 250 })
          });

          var draggingContext = dragging.context();

          // then
          expect(draggingContext).to.exist;
          expect(draggingContext.prefix).to.eql('bendpoint.move');
        }
      ));


      it('should activate parallel move on segment center', inject(
        function(dragging, eventBus, elementRegistry) {

          // precondition
          var segmentStart = connection.waypoints[1].y,
              segmentEnd = connection.waypoints[2].y,
              segmentCenter = segmentEnd - (segmentEnd - segmentStart) / 2;

          // when
          eventBus.fire('element.hover', {
            element: connection,
            gfx: elementRegistry.getGraphics(connection)
          });
          eventBus.fire('element.mousemove', {
            element: connection,
            originalEvent: canvasEvent({ x: 555, y: segmentCenter })
          });
          eventBus.fire('element.mousedown', {
            element: connection,
            originalEvent: canvasEvent({ x: 555, y: segmentCenter })
          });

          var draggingContext = dragging.context();

          // then
          expect(draggingContext).to.exist;
          expect(draggingContext.prefix).to.eql('connectionSegment.move');
        }
      ));


      it('should activate parallel move in two-third-region', inject(
        function(dragging, eventBus, elementRegistry) {

          // precondition
          var intersectionStart = connection.waypoints[1].y,
              intersectionEnd = connection.waypoints[2].y,
              segmentLength = intersectionEnd - intersectionStart,
              twoThirdStart = intersectionStart + (segmentLength * 0.333) / 2;

          // when
          eventBus.fire('element.hover', {
            element: connection,
            gfx: elementRegistry.getGraphics(connection)
          });
          eventBus.fire('element.mousemove', {
            element: connection,
            originalEvent: canvasEvent({ x: 555, y: twoThirdStart })
          });
          eventBus.fire('element.mousedown', {
            element: connection,
            originalEvent: canvasEvent({ x: 555, y: twoThirdStart })
          });

          var draggingContext = dragging.context();

          // then
          expect(draggingContext).to.exist;
          expect(draggingContext.prefix).to.eql('connectionSegment.move');
        }
      ));

    });


    describe('should trigger interaction events', function() {

      function triggerMouseEvent(type, gfx) {

        var event = document.createEvent('MouseEvent');
        event.initMouseEvent(type, true, true, window, 0, 0, 0, 80, 20, false, false, false, false, 0, null);

        return gfx.dispatchEvent(event);
      }


      var bendpointGfx,
          listenerSpy;

      beforeEach(inject(function(bendpoints) {
        bendpoints.addHandles(connection);

        bendpointGfx = domQuery('.djs-bendpoint', bendpoints.getBendpointsContainer(connection));

        listenerSpy = sinon.spy(function(event) {
          expect(event.originalEvent.target).to.equal(bendpointGfx);
          expect(event.element).to.equal(connection);
        });

      }));


      it('element.click', inject(function(eventBus, bendpoints) {

        // given
        eventBus.once('element.click', listenerSpy);

        // when
        triggerMouseEvent('click', bendpointGfx);

        // then
        expect(listenerSpy).to.have.been.called;
      }));


      it('element.dblclick', inject(function(eventBus, bendpoints) {

        // given
        eventBus.once('element.dblclick', listenerSpy);

        // when
        triggerMouseEvent('dblclick', bendpointGfx);

        // then
        expect(listenerSpy).to.have.been.called;
      }));


      it('element.mousedown', inject(function(eventBus, bendpoints) {

        // given
        eventBus.once('element.mousedown', listenerSpy);

        // when
        triggerMouseEvent('mousedown', bendpointGfx);

        // then
        expect(listenerSpy).to.have.been.called;
      }));

    });

  });


  describe('updating', function() {

    it('should update on element updated ID', inject(
      function(selection, canvas, elementRegistry) {

        // given
        var layer = canvas.getLayer('overlays');

        selection.select(connection);

        // when
        elementRegistry.updateId(connection, 'foo');

        var bendpointContainer = domQuery('.djs-bendpoints', layer);

        // then
        // bendpoint container references element with updated ID
        expect(bendpointContainer.dataset.elementId).to.equal('foo');
      }
    ));


    it('should update floating bendpoint position on mousemove', inject(
      function(selection, canvas, eventBus, elementRegistry) {

        // given
        var layer = canvas.getLayer('overlays');

        selection.select(connection);

        var bendpointContainer = domQuery('.djs-bendpoints', layer),
            floatingBendpointGfx = domQuery('.floating', bendpointContainer),
            oldBounds = floatingBendpointGfx.getBoundingClientRect();

        // when
        eventBus.fire('element.hover', {
          element: connection,
          gfx: elementRegistry.getGraphics(connection)
        });
        eventBus.fire('element.mousemove', {
          element: connection,
          originalEvent: canvasEvent({ x: 525, y: 250 })
        });

        var newBounds = floatingBendpointGfx.getBoundingClientRect();

        // then
        expect(newBounds).to.not.eql(oldBounds);
        expect(newBounds.left).to.be.closeTo(525, 2);
      }
    ));


    it('should update segment dragger position on mousemove', inject(
      function(selection, canvas, eventBus, elementRegistry, bendpoints) {

        // given
        var layer = canvas.getLayer('overlays');

        selection.select(connection);

        var bendpointContainer = domQuery('.djs-bendpoints', layer),
            draggerGfx = bendpoints.getSegmentDragger(1, bendpointContainer),
            draggerVisual = getVisual(draggerGfx.childNodes[0]);

        draggerVisual.style.display = 'block';

        var oldBounds = draggerVisual.getBoundingClientRect();

        // when
        eventBus.fire('element.hover', {
          element: connection,
          gfx: elementRegistry.getGraphics(connection),
          originalEvent: canvasEvent({ x: 450, y: 250 })
        });
        eventBus.fire('element.mousemove', {
          element: connection,
          originalEvent: canvasEvent({ x: 450, y: 250 })
        });

        var newBounds = draggerVisual.getBoundingClientRect();

        // then
        expect(newBounds).to.not.eql(oldBounds);
        expect(newBounds.left).to.be.closeTo(451, 2);
      }
    ));


    it('should NOT update segment dragger position on bendpoint', inject(
      function(selection, canvas, eventBus, elementRegistry, bendpoints) {

        // given
        var layer = canvas.getLayer('overlays');

        selection.select(connection);

        var bendpointContainer = domQuery('.djs-bendpoints', layer),
            draggerGfx = bendpoints.getSegmentDragger(1, bendpointContainer),
            draggerVisual = getVisual(draggerGfx),
            oldBounds = draggerVisual.getBoundingClientRect();

        // when
        eventBus.fire('element.hover', {
          element: connection,
          gfx: elementRegistry.getGraphics(connection)
        });
        eventBus.fire('element.mousemove', {
          element: connection,
          originalEvent: canvasEvent({ x: 250, y: 250 })
        });

        var newBounds = draggerVisual.getBoundingClientRect();

        // then
        expect(newBounds).to.eql(oldBounds);
      }
    ));

  });

});
