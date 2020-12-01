import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import resizeModule from 'lib/features/resize';
import snappingModule from 'lib/features/snapping';

import SnapContext from 'lib/features/snapping/SnapContext';

import { getReferencePoint } from 'lib/features/resize/Resize';

import {
  createCanvasEvent as canvasEvent
} from '../../util/MockEvents';

var VERY_LOW_PRIORITY = 100;

var spy = sinon.spy;


describe('features/snapping - ResizeSnapping', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      resizeModule,
      snappingModule
    ]
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));

  var rootElement,
      shape1;

  beforeEach(inject(function(canvas, elementFactory) {
    rootElement = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootElement);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 100,
      y: 100,
      width: 100,
      height: 100,
      resizable: 'always'
    });

    canvas.addShape(shape1, rootElement);

    var shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 300,
      y: 300,
      width: 100,
      height: 100
    });

    canvas.addShape(shape2, rootElement);

    var connection = elementFactory.createConnection({
      id: 'connection',
      source: shape1,
      target: shape2,
      waypoints: [
        { x: 500, y: 500 },
        { x: 600, y: 600 },
        { x: 700, y: 700 }
      ]
    });

    canvas.addConnection(connection, rootElement);

    var label = elementFactory.createLabel({
      id: 'label',
      x: 800,
      y: 800,
      width: 100,
      height: 100,
      labelTarget: shape2
    });

    canvas.addShape(label, rootElement);
  }));


  describe('#initSnap', function() {

    it('should create snap context', inject(function(resizeSnapping, eventBus) {

      // given
      var event = eventBus.createEvent({
        x: 100,
        y: 100,
        shape: shape1,
        context: {
          shape: shape1,
          direction: 'nw'
        }
      });

      // when
      var snapContext = resizeSnapping.initSnap(event);

      // then
      expect(snapContext).to.exist;
      expect(event.context.snapContext).to.equal(snapContext);
    }));


    it('should NOT create snap context', inject(function(resizeSnapping) {

      // given
      var originalSnapContext = new SnapContext();

      var event = {
        x: 100,
        y: 100,
        shape: shape1,
        context: {
          shape: shape1,
          direction: 'nw',
          snapContext: originalSnapContext
        }
      };

      // when
      var snapContext = resizeSnapping.initSnap(event);

      // then
      expect(snapContext).to.equal(originalSnapContext);
    }));

  });


  describe('snapping', function() {

    it('should init on resize.start', inject(function(eventBus) {

      // given
      var event = eventBus.createEvent({
        x: 100,
        y: 100,
        shape: shape1,
        context: {
          shape: shape1,
          direction: 'nw'
        }
      });

      // when
      eventBus.fire('resize.start', event);

      // then
      expect(event.context.snapContext).to.exist;
    }));


    it('snap to self', inject(function(dragging, resize) {

      // when
      resize.activate(canvasEvent({ x: 200, y: 200 }), shape1, 'se');

      dragging.move(canvasEvent({ x: 205, y: 205 }));

      dragging.end();

      // then
      expect(shape1).to.have.bounds({
        x: 100,
        y: 100,
        width: 100,
        height: 100
      });
    }));


    describe('snap to shape', function() {

      it('should snap', inject(function(dragging, resize) {

        // when
        resize.activate(canvasEvent({ x: 200, y: 200 }), shape1, 'se');

        dragging.move(canvasEvent({ x: 305, y: 305 }));

        dragging.end();

        // then
        expect(shape1).to.have.bounds({
          x: 100,
          y: 100,
          width: 200, // 205 snapped to 200 (left of shape2)
          height: 200 // 205 snapped to 200 (top of shape2)
        });
      }));

    });


    describe('snap horizontally', function() {

      it('should NOT snap y', inject(function(dragging, eventBus, resize) {

        // given
        var resizeSpy = spy(function(event) {
          expect(event.x).to.equal(300);
          expect(event.y).to.equal(305); // y has NOT been snapped
        });

        // when
        resize.activate(canvasEvent(getReferencePoint(shape1, 'e')), shape1, 'e');

        eventBus.on('resize.move', VERY_LOW_PRIORITY, resizeSpy);

        dragging.move(canvasEvent({ x: 305, y: 305 }));

        // then
        expect(resizeSpy).to.have.been.called;
      }));

    });


    describe('snap vertically', function() {

      it('should NOT snap x', inject(function(dragging, eventBus, resize) {

        // given
        var resizeSpy = spy(function(event) {
          expect(event.x).to.equal(305); // x has NOT been snapped
          expect(event.y).to.equal(300);
        });

        // when
        resize.activate(canvasEvent(getReferencePoint(shape1, 's')), shape1, 's');

        eventBus.on('resize.move', VERY_LOW_PRIORITY, resizeSpy);

        dragging.move(canvasEvent({ x: 305, y: 305 }));

        // then
        expect(resizeSpy).to.have.been.called;
      }));

    });


    describe('snap to connection', function() {

      it('should NOT snap', inject(function(dragging, resize) {

        // when
        resize.activate(canvasEvent({ x: 200, y: 200 }), shape1, 'se');

        dragging.move(canvasEvent({ x: 605, y: 605 }));

        dragging.end();

        // then
        expect(shape1).to.have.bounds({
          x: 100,
          y: 100,
          width: 505, // NOT snapped
          height: 505 // NOT snapped
        });
      }));

    });


    describe('snap to label', function() {

      it('should NOT snap', inject(function(dragging, resize) {

        // when
        resize.activate(canvasEvent({ x: 200, y: 200 }), shape1, 'se');

        dragging.move(canvasEvent({ x: 805, y: 805 }));

        dragging.end();

        // then
        expect(shape1).to.have.bounds({
          x: 100,
          y: 100,
          width: 705, // NOT snapped
          height: 705 // NOT snapped
        });
      }));

    });

  });

});