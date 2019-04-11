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

var layoutModule = {
  connectionDocking: [ 'type', CroppingConnectionDocking ]
};

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

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
          modelingModule,
          gridSnappingModule,
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
        newShape,
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

      var shape3 = elementFactory.createShape({
        id: 'shape3',
        x: 300, y: 100, width: 100, height: 100
      });

      canvas.addShape(shape3, rootShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: shape1,
        target: shape3,
        waypoints: [
          { x: 150, y: 150 },
          { x: 350, y: 150 }
        ]
      });

      canvas.addConnection(connection, rootShape);

      connectionGfx = elementRegistry.getGraphics(connection);

      newShape = elementFactory.createShape({
        id: 'newShape',
        x: 0, y: 0, width: 100, height: 100
      });
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


    it('<create>', inject(function(create, dragging, eventBus) {

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

  });


  describe('grid', function() {

    it('should be visible by default', function() {

      // when
      bootstrapDiagram({
        modules: [
          modelingModule,
          gridSnappingModule,
          moveModule
        ]
      })();

      // then
      var grid = getDiagramJS().get('grid'),
          gfx = grid._getParent();

      expect(grid.isVisible()).to.be.true;
      expect(gfx.childNodes).to.have.length(1);
    });


    it('should NOT be visible (grid.visible = false)', function() {

      // when
      bootstrapDiagram({
        modules: [
          modelingModule,
          gridSnappingModule,
          moveModule
        ],
        grid: {
          visible: false
        }
      })();

      // then
      var grid = getDiagramJS().get('grid'),
          gfx = grid._getParent();

      expect(grid.isVisible()).to.be.false;
      expect(gfx.childNodes).to.have.length(0);
    });


    it('should NOT be visible (gridSnapping.active = false)', function() {

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
      var grid = getDiagramJS().get('grid'),
          gfx = grid._getParent();

      expect(grid.isVisible()).to.be.false;
      expect(gfx.childNodes).to.have.length(0);
    });


    describe('api', function() {

      beforeEach(bootstrapDiagram({
        modules: [
          modelingModule,
          gridSnappingModule,
          moveModule
        ]
      }));


      it('#isVisible', inject(function(grid) {

        // then
        expect(grid.isVisible()).to.be.true;

        // when
        grid.setVisible(false);

        // then
        expect(grid.isVisible()).to.be.false;
      }));


      it('#setVisible', inject(function(grid) {

        // when
        grid.setVisible(false);

        // then
        var gfx = grid._getParent();

        expect(grid.isVisible()).to.be.false;
        expect(gfx.childNodes).to.have.length(0);
      }));


      it('#toggleVisible', inject(function(grid) {

        // when
        grid.toggleVisible();

        // then
        var gfx = grid._getParent();

        expect(grid.isVisible()).to.be.false;
        expect(gfx.childNodes).to.have.length(0);

        // when
        grid.toggleVisible();

        // then
        expect(grid.isVisible()).to.be.true;
        expect(gfx.childNodes).to.have.length(1);
      }));

    });

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

function position(event) {
  return {
    x: event.x,
    y: event.y
  };
}