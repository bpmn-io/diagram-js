import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import resizeModule from 'lib/features/resize';
import snappingModule from 'lib/features/snapping';

import SnapContext from 'lib/features/snapping/SnapContext';

import {
  createCanvasEvent as canvasEvent
} from '../../util/MockEvents';


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
          shape: shape1
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
          shape: shape1
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