import {
  bootstrapDiagram,
  getDiagramJS,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import gridSnappingModule from 'lib/features/grid-snapping';
import bendpointsModule from 'lib/features/bendpoints';
import connectModule from 'lib/features/connect';
import createModule from 'lib/features/create';
import moveModule from 'lib/features/move';
import resizeModule from 'lib/features/resize';

import CroppingConnectionDocking from 'lib/layout/CroppingConnectionDocking';

import { asTRBL } from 'lib/layout/LayoutUtil';

import { SPACING } from 'lib/features/grid-snapping/GridUtil';

var layoutModule = {
  connectionDocking: [ 'type', CroppingConnectionDocking ]
};

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import { isString } from 'min-dash';

import { mid } from 'lib/features/snapping/SnapUtil';

var LOW_PRIORITY = 500;


describe('features/grid-snapping', function() {

  describe('init', function() {

    it('should init as active by default', function() {

      // when
      bootstrapDiagram({
        modules: [
          modelingModule,
          gridSnappingModule,
          moveModule
        ]
      })();

      // then
      var gridSnapping = getDiagramJS().get('gridSnapping');

      expect(gridSnapping.isActive()).to.be.true;
    });


    it('should init as NOT active', function() {

      // when
      bootstrapDiagram({
        modules: [
          modelingModule,
          gridSnappingModule,
          moveModule
        ],
        gridSnapping: {
          active: false
        }
      })();

      // then
      var gridSnapping = getDiagramJS().get('gridSnapping');

      expect(gridSnapping.isActive()).to.be.false;
    });


    describe('api', function() {

      beforeEach(bootstrapDiagram({
        modules: [
          gridSnappingModule,
          modelingModule,
          moveModule
        ]
      }));


      it('#isActive', inject(function(gridSnapping) {

        // then
        expect(gridSnapping.isActive()).to.be.true;

        // when
        gridSnapping.setActive(false);

        // then
        expect(gridSnapping.isActive()).to.be.false;
      }));


      it('#setActive', inject(function(gridSnapping) {

        // when
        gridSnapping.setActive(false);

        // then
        expect(gridSnapping.isActive()).to.be.false;
      }));


      it('#toggleActive', inject(function(gridSnapping) {

        // when
        gridSnapping.toggleActive();

        // then
        expect(gridSnapping.isActive()).to.be.false;

        // when
        gridSnapping.toggleActive();

        // then
        expect(gridSnapping.isActive()).to.be.true;
      }));

    });

  });


  describe('snapping', function() {
    var rootShape,
        rootShapeGfx,
        shape1,
        shape2,
        shape3,
        connection,
        connectionGfx;

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule,
        bendpointsModule,
        connectModule,
        createModule,
        moveModule,
        resizeModule,
        layoutModule
      ]
    }));

    beforeEach(inject(function(elementFactory, elementRegistry, canvas) {

      rootShape = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(rootShape);

      rootShapeGfx = elementRegistry.getGraphics(rootShape);

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 100, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape1, rootShape);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 250, y: 250, width: 100, height: 100
      });

      canvas.addShape(shape2, rootShape);

      shape3 = elementFactory.createShape({
        id: 'shape3',
        x: 100, y: 250, width: 95, height: 95
      });

      canvas.addShape(shape3, rootShape);

      var shape4 = elementFactory.createShape({
        id: 'shape4',
        x: 300, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape4, rootShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: shape1,
        target: shape4,
        waypoints: [
          { x: 150, y: 150 },
          { x: 350, y: 150 }
        ]
      });

      canvas.addConnection(connection, rootShape);

      connectionGfx = elementRegistry.getGraphics(connection);
    }));


    describe('<move>', function() {

      it('should snap', inject(function(dragging, eventBus, move) {

        // given
        var events = recordEvents(eventBus, [
          'shape.move.move',
          'shape.move.end'
        ]);

        move.start(canvasEvent({ x: 150, y: 150 }), shape1);

        // when
        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        dragging.move(canvasEvent({ x: 156, y: 153 }));
        dragging.move(canvasEvent({ x: 162, y: 156 }));
        dragging.move(canvasEvent({ x: 168, y: 159 }));
        dragging.move(canvasEvent({ x: 174, y: 162 }));
        dragging.move(canvasEvent({ x: 180, y: 165 }));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 160, y: 150 }, // move
          { x: 160, y: 160 }, // move
          { x: 170, y: 160 }, // move
          { x: 170, y: 160 }, // move
          { x: 180, y: 170 }, // move
          { x: 180, y: 170 } // end
        ]);

        expect(shape1.x + shape1.width / 2).to.equal(180);
        expect(shape1.y + shape1.height / 2).to.equal(170);
      }));


      it('should NOT snap (cmd)', inject(function(dragging, eventBus, move) {

        // given
        var events = recordEvents(eventBus, [
          'shape.move.move',
          'shape.move.end'
        ]);

        var data = { ctrlKey: true };

        move.start(canvasEvent({ x: 150, y: 150 }, data), shape1);

        // when
        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        dragging.move(canvasEvent({ x: 156, y: 153 }, data));
        dragging.move(canvasEvent({ x: 162, y: 156 }, data));
        dragging.move(canvasEvent({ x: 168, y: 159 }, data));
        dragging.move(canvasEvent({ x: 174, y: 162 }, data));
        dragging.move(canvasEvent({ x: 180, y: 165 }, data));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 156, y: 153 }, // move
          { x: 162, y: 156 }, // move
          { x: 168, y: 159 }, // move
          { x: 174, y: 162 }, // move
          { x: 180, y: 165 }, // move
          { x: 180, y: 165 } // end
        ]);

        expect(shape1.x + shape1.width / 2).to.equal(180);
        expect(shape1.y + shape1.height / 2).to.equal(165);
      }));

    });


    describe('<create> shape', function() {

      var newShape;

      beforeEach(inject(function(elementFactory) {
        newShape = elementFactory.createShape({
          id: 'newShape',
          x: 0, y: 0, width: 100, height: 100
        });
      }));


      it('without constraints', inject(function(create, dragging, eventBus) {

        // given
        var events = recordEvents(eventBus, [
          'create.move',
          'create.end'
        ]);

        create.start(canvasEvent({ x: 150, y: 250 }), newShape);

        // when
        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        dragging.move(canvasEvent({ x: 156, y: 253 }));
        dragging.move(canvasEvent({ x: 162, y: 256 }));
        dragging.move(canvasEvent({ x: 168, y: 259 }));
        dragging.move(canvasEvent({ x: 174, y: 262 }));
        dragging.move(canvasEvent({ x: 180, y: 265 }));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 150, y: 250 }, // move (triggered on create.start thanks to autoActivate)
          { x: 160, y: 250 }, // move
          { x: 160, y: 260 }, // move
          { x: 170, y: 260 }, // move
          { x: 170, y: 260 }, // move
          { x: 180, y: 270 }, // move
          { x: 180, y: 270 } // end
        ]);

        expect(newShape.x + newShape.width / 2).to.equal(180);
        expect(newShape.y + newShape.height / 2).to.equal(270);
      }));


      it('with constraints', inject(function(create, dragging, eventBus) {

        // given
        var events = recordEvents(eventBus, [
          'create.move',
          'create.end'
        ]);

        create.start(canvasEvent({ x: 150, y: 250 }), newShape, {
          createConstraints: {
            top: 250,
            right: 170,
            bottom: 260,
            left: 150
          }
        });

        // when
        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        dragging.move(canvasEvent({ x: 156, y: 253 }));
        dragging.move(canvasEvent({ x: 162, y: 256 }));
        dragging.move(canvasEvent({ x: 168, y: 259 }));
        dragging.move(canvasEvent({ x: 174, y: 262 }));
        dragging.move(canvasEvent({ x: 180, y: 265 }));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 150, y: 250 }, // move (triggered on create.start thanks to autoActivate)
          { x: 160, y: 250 }, // move
          { x: 160, y: 260 }, // move
          { x: 170, y: 260 }, // move
          { x: 170, y: 260 }, // move
          { x: 170, y: 260 }, // move
          { x: 170, y: 260 } // end
        ]);

        expect(newShape.x + newShape.width / 2).to.equal(170);
        expect(newShape.y + newShape.height / 2).to.equal(260);
      }));

    });


    describe('<create> elements', function() {

      var newElements,
          newShape1;

      beforeEach(inject(function(elementFactory) {
        newShape1 = elementFactory.createShape({
          id: 'newShape1',
          x: 0, y: 0, width: 90, height: 90
        });

        var newShape2 = elementFactory.createShape({
          id: 'newShape2',
          x: 110, y: 110, width: 100, height: 100
        });

        newElements = [ newShape1, newShape2 ];
      }));


      it('without constraints', inject(function(create, dragging, eventBus) {

        // given
        var events = recordEvents(eventBus, [
          'create.move',
          'create.end'
        ]);

        create.start(canvasEvent({ x: 150, y: 250 }), newElements);

        // relative mid during create
        var relativeMid = mid(newShape1);

        // when
        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        dragging.move(canvasEvent({ x: 156, y: 253 }));
        dragging.move(canvasEvent({ x: 162, y: 256 }));
        dragging.move(canvasEvent({ x: 168, y: 259 }));
        dragging.move(canvasEvent({ x: 174, y: 262 }));
        dragging.move(canvasEvent({ x: 180, y: 265 }));

        dragging.end();

        // then
        expect(events.map(position).map(addPosition(relativeMid))).to.eql([
          { x: 90, y: 190 }, // move (triggered on create.start thanks to autoActivate)
          { x: 100, y: 190 }, // move
          { x: 100, y: 200 }, // move
          { x: 110, y: 200 }, // move
          { x: 110, y: 200 }, // move
          { x: 120, y: 210 }, // move
          { x: 120, y: 210 } // end
        ]);

        expect(mid(newShape1)).to.eql({
          x: 120,
          y: 210
        });
      }));


      it('with constraints', inject(function(create, dragging, eventBus) {

        // given
        var events = recordEvents(eventBus, [
          'create.move',
          'create.end'
        ]);

        create.start(canvasEvent({ x: 150, y: 250 }), newElements, {
          createConstraints: {
            top: 250,
            right: 170,
            bottom: 260,
            left: 150
          }
        });

        // relative mid during create
        var relativeMid = mid(newShape1);

        // when
        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        dragging.move(canvasEvent({ x: 156, y: 253 }));
        dragging.move(canvasEvent({ x: 162, y: 256 }));
        dragging.move(canvasEvent({ x: 168, y: 259 }));
        dragging.move(canvasEvent({ x: 174, y: 262 }));
        dragging.move(canvasEvent({ x: 180, y: 265 }));

        dragging.end();

        // then
        expect(events.map(position).map(addPosition(relativeMid))).to.eql([
          { x: 90, y: 190 }, // move (triggered on create.start thanks to autoActivate)
          { x: 100, y: 190 }, // move
          { x: 100, y: 200 }, // move
          { x: 110, y: 200 }, // move
          { x: 110, y: 200 }, // move
          { x: 110, y: 200 }, // move
          { x: 110, y: 200 } // end
        ]);

        expect(mid(newShape1)).to.eql({
          x: 110,
          y: 200
        });
      }));

    });


    it('<connect>', inject(function(connect, dragging, eventBus) {

      // given
      var events = recordEvents(eventBus, [
        'connect.move',
        'connect.end'
      ]);

      connect.start(canvasEvent({ x: 250, y: 250 }), shape1);

      // when
      dragging.move(canvasEvent({ x: 256, y: 253 }));
      dragging.move(canvasEvent({ x: 262, y: 256 }));
      dragging.move(canvasEvent({ x: 268, y: 259 }));
      dragging.move(canvasEvent({ x: 274, y: 262 }));
      dragging.move(canvasEvent({ x: 280, y: 265 }));

      dragging.hover({ element: shape2 });

      dragging.end();

      // then
      expect(events.map(position)).to.eql([
        { x: 260, y: 250 },
        { x: 260, y: 260 },
        { x: 270, y: 260 },
        { x: 270, y: 260 },
        { x: 280, y: 270 },
        { x: 280, y: 270 }
      ]);

      expect(shape1.outgoing[1].waypoints.map(position)).to.eql([
        { x: 150, y: 150 },
        { x: 280, y: 270 }
      ]);
    }));


    describe('<resize>', function() {

      var events;

      beforeEach(inject(function(eventBus) {
        events = recordEvents(eventBus, [
          'resize.move',
          'resize.end'
        ]);
      }));


      it('without constraints', inject(function(dragging, resize) {

        // given
        resize.activate(canvasEvent({ x: 100, y: 200 }), shape1, 'sw');

        // when
        dragging.move(canvasEvent({ x: 106, y: 203 }));
        dragging.move(canvasEvent({ x: 112, y: 206 }));
        dragging.move(canvasEvent({ x: 118, y: 209 }));
        dragging.move(canvasEvent({ x: 124, y: 212 }));
        dragging.move(canvasEvent({ x: 130, y: 215 }));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 100, y: 200 }, // move (triggered on resize.activate thanks to autoActivate)
          { x: 110, y: 200 }, // move
          { x: 110, y: 210 }, // move
          { x: 120, y: 210 }, // move
          { x: 120, y: 210 }, // move
          { x: 130, y: 220 }, // move
          { x: 130, y: 220 } // end
        ]);

        expect(shape1.width).to.equal(70);
        expect(shape1.height).to.equal(120);
      }));


      it('with constraints (min)', inject(function(dragging, resize) {

        // given
        resize.activate(canvasEvent({ x: 100, y: 200 }), shape1, {
          direction: 'sw',
          resizeConstraints: {
            min: asTRBL({
              x: 125,
              y: 125,
              width: 70,
              height: 70
            })
          }
        });

        // when
        dragging.move(canvasEvent({ x: 112, y: 203 }));
        dragging.move(canvasEvent({ x: 124, y: 206 }));
        dragging.move(canvasEvent({ x: 136, y: 209 }));
        dragging.move(canvasEvent({ x: 148, y: 212 }));
        dragging.move(canvasEvent({ x: 160, y: 215 }));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 100, y: 200 }, // move (triggered on resize.activate thanks to autoActivate)
          { x: 110, y: 200 }, // move
          { x: 120, y: 210 }, // move
          { x: 120, y: 210 }, // move
          { x: 120, y: 210 }, // move
          { x: 120, y: 220 }, // move
          { x: 120, y: 220 } // end
        ]);

        expect(shape1.width).to.equal(80);
        expect(shape1.height).to.equal(120);
      }));


      it('with constraints (max)', inject(function(dragging, resize) {

        // given
        resize.activate(canvasEvent({ x: 100, y: 200 }), shape1, {
          direction: 'sw',
          resizeConstraints: {
            max: asTRBL({
              x: 75,
              y: 75,
              width: 150,
              height: 150
            })
          }
        });

        // when
        dragging.move(canvasEvent({ x: 88, y: 203 }));
        dragging.move(canvasEvent({ x: 76, y: 206 }));
        dragging.move(canvasEvent({ x: 64, y: 209 }));
        dragging.move(canvasEvent({ x: 52, y: 212 }));
        dragging.move(canvasEvent({ x: 40, y: 215 }));

        dragging.end();

        // then
        expect(events.map(position)).to.eql([
          { x: 100, y: 200 }, // move (triggered on resize.activate thanks to autoActivate)
          { x: 90, y: 200 }, // move
          { x: 80, y: 210 }, // move
          { x: 80, y: 210 }, // move
          { x: 80, y: 210 }, // move
          { x: 80, y: 220 }, // move
          { x: 80, y: 220 } // end
        ]);

        expect(shape1.width).to.equal(120);
        expect(shape1.height).to.equal(120);
      }));

    });


    it('<bendpoint.move>', inject(function(bendpointMove, dragging, eventBus) {

      // given
      var events = recordEvents(eventBus, [
        'bendpoint.move.move',
        'bendpoint.move.end'
      ]);

      bendpointMove.start(canvasEvent({ x: 250, y: 150 }), connection, 1, true);

      dragging.hover({ element: connection, gfx: connectionGfx });

      // when
      dragging.move(canvasEvent({ x: 250, y: 162 }));
      dragging.move(canvasEvent({ x: 250, y: 174 }));
      dragging.move(canvasEvent({ x: 250, y: 186 }));
      dragging.move(canvasEvent({ x: 250, y: 198 }));
      dragging.move(canvasEvent({ x: 250, y: 210 }));

      dragging.end();

      // then
      expect(events.map(position)).to.eql([
        { x: 250, y: 160 }, // move
        { x: 250, y: 170 }, // move
        { x: 250, y: 190 }, // move
        { x: 250, y: 200 }, // move
        { x: 250, y: 210 }, // move
        { x: 250, y: 210 } // end
      ]);

      expect(shape1.outgoing[0].waypoints.map(position)).to.eql([
        { x: 200, y: 180 },
        { x: 250, y: 210 },
        { x: 300, y: 180 }
      ]);
    }));


    it('<connectionSegment.move>', inject(function(connectionSegmentMove, dragging, eventBus) {

      // given
      var events = recordEvents(eventBus, [
        'connectionSegment.move.move',
        'connectionSegment.move.end'
      ]);

      connectionSegmentMove.start(canvasEvent({ x: 250, y: 150 }), connection, 1);

      // when
      dragging.move(canvasEvent({ x: 250, y: 162 }));
      dragging.move(canvasEvent({ x: 250, y: 174 }));
      dragging.move(canvasEvent({ x: 250, y: 186 }));
      dragging.move(canvasEvent({ x: 250, y: 198 }));
      dragging.move(canvasEvent({ x: 250, y: 210 }));

      dragging.end();

      // then
      expect(events.map(position)).to.eql([
        { x: 250, y: 160 }, // move
        { x: 250, y: 170 }, // move
        { x: 250, y: 190 }, // move
        { x: 250, y: 200 }, // move
        { x: 250, y: 210 }, // move
        { x: 250, y: 210 } // end
      ]);

      expect(shape1.outgoing[0].waypoints.map(position)).to.eql([
        { x: 150, y: 200 },
        { x: 150, y: 210 },
        { x: 350, y: 210 },
        { x: 350, y: 200 }
      ]);
    }));


    describe('snap offset', function() {

      it('should snap with offset (top-left)', inject(function(dragging, eventBus, move) {

        // given
        var events = recordEvents(eventBus, [
          'shape.move.move',
          'shape.move.end'
        ]);

        move.start(canvasEvent({ x: 147.5, y: 297.5 }), shape3, {
          gridSnappingContext: {
            snapLocation: 'top-left'
          }
        });

        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        // when
        dragging.move(canvasEvent({ x: 156, y: 262 }));
        dragging.move(canvasEvent({ x: 162, y: 274 }));
        dragging.move(canvasEvent({ x: 168, y: 286 }));
        dragging.move(canvasEvent({ x: 174, y: 298 }));
        dragging.move(canvasEvent({ x: 180, y: 310 }));

        dragging.end();

        // then
        expect(events.map(position('top-left'))).to.eql([
          { x: 110, y: 220 }, // move
          { x: 120, y: 230 }, // move
          { x: 120, y: 240 }, // move
          { x: 130, y: 250 }, // move
          { x: 130, y: 260 }, // move
          { x: 130, y: 260 } // end
        ]);

        // expect snapped to top-left
        expect(shape3.x).to.equal(130);
        expect(shape3.y).to.equal(260);
      }));


      it('should snap with offset (bottom)', inject(function(dragging, eventBus, move) {

        // given
        var events = recordEvents(eventBus, [
          'shape.move.move',
          'shape.move.end'
        ]);

        move.start(canvasEvent({ x: 147.5, y: 297.5 }), shape3, {
          gridSnappingContext: {
            snapLocation: 'bottom'
          }
        });

        dragging.hover({ element: rootShape, gfx: rootShapeGfx });

        // when
        dragging.move(canvasEvent({ x: 156, y: 312 }));
        dragging.move(canvasEvent({ x: 162, y: 324 }));
        dragging.move(canvasEvent({ x: 168, y: 336 }));
        dragging.move(canvasEvent({ x: 174, y: 348 }));
        dragging.move(canvasEvent({ x: 180, y: 360 }));

        dragging.end();

        // then
        expect(events.map(position('bottom'))).to.eql([
          { x: 160, y: 360 }, // move
          { x: 160, y: 370 }, // move
          { x: 170, y: 380 }, // move
          { x: 180, y: 400 }, // move
          { x: 180, y: 410 }, // move
          { x: 180, y: 410 } // end
        ]);

        // expect snapped to bottom-center
        expect(shape3.x + shape3.width / 2).to.equal(179.5);
        expect(shape3.y + shape3.height).to.equal(410);
      }));

    });

  });


  describe('api', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        gridSnappingModule
      ]
    }));

    it('should expose gridSpacing', inject(function(gridSnapping) {
      expect(gridSnapping.getGridSpacing()).to.eql(SPACING);
    }));

  });

});


// helpers //////////

function recordEvents(eventBus, eventTypes) {
  var events = [];

  eventTypes.forEach(function(eventType) {
    eventBus.on(eventType, LOW_PRIORITY, function(event) {
      events.push(event);
    });
  });

  return events;
}

/**
 * Returns x and y of an event. If called with string that specifies orientation if will return
 * x and y of specified orientation.
 *
 * @param {Object|string} event - Event or orientation <top|right|bottom|left>
 *
 * @return {Object}
 */
function position(event) {
  var orientation;

  if (isString(event)) {
    orientation = event;

    return function(event) {
      var shape = event.shape;

      var x = event.x,
          y = event.y;

      if (/top/.test(orientation)) {
        y -= shape.height / 2;
      }

      if (/right/.test(orientation)) {
        x += shape.width / 2;
      }

      if (/bottom/.test(orientation)) {
        y += shape.height / 2;
      }

      if (/left/.test(orientation)) {
        x -= shape.width / 2;
      }

      return {
        x: x,
        y: y
      };
    };
  }

  return {
    x: event.x,
    y: event.y
  };
}

function addPosition(a) {
  return function(b) {
    return {
      x: a.x + b.x,
      y: a.y + b.y
    };
  };
}