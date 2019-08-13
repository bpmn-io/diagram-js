import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import createModule from 'lib/features/create';
import modelingModule from 'lib/features/modeling';
import moveModule from 'lib/features/move';
import snappingModule from 'lib/features/snapping';

import SnapContext from 'lib/features/snapping/SnapContext';

import {
  bottomRight,
  mid,
  topLeft
} from 'lib/features/snapping/SnapUtil';

import {
  createCanvasEvent as canvasEventMid
} from '../../util/MockEvents';


describe('features/snapping - CreateMoveSnapping', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      createModule,
      modelingModule,
      moveModule,
      snappingModule
    ]
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));

  var rootElement,
      rootElementGfx,
      shape1;

  beforeEach(inject(function(canvas, elementFactory) {
    rootElement = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootElement);

    rootElementGfx = canvas.getGraphics(rootElement);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 100,
      y: 100,
      width: 100,
      height: 100
    });

    canvas.addShape(shape1, rootElement);
  }));


  describe('#initSnap', function() {

    it('should create snap context', inject(function(createMoveSnapping, eventBus) {

      // given
      var event = eventBus.createEvent({
        x: 100,
        y: 100,
        context: {
          shape: shape1
        }
      });

      // when
      var snapContext = createMoveSnapping.initSnap(event);

      // then
      expect(snapContext).to.exist;
      expect(event.context.snapContext).to.equal(snapContext);
    }));


    it('should NOT create snap context', inject(function(createMoveSnapping) {

      // given
      var originalSnapContext = new SnapContext();

      var event = {
        x: 100,
        y: 100,
        context: {
          shape: shape1,
          snapContext: originalSnapContext
        }
      };

      // when
      var snapContext = createMoveSnapping.initSnap(event);

      // then
      expect(snapContext).to.equal(originalSnapContext);
    }));

  });


  describe('snapping', function() {

    var connection,
        label1,
        label2,
        shape2;

    beforeEach(inject(function(canvas, elementFactory) {
      label1 = elementFactory.createLabel({
        id: 'label1',
        x: 325,
        y: 325,
        width: 50,
        height: 50,
        labelTarget: shape1
      });

      canvas.addShape(label1, rootElement);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 500,
        y: 500,
        width: 100,
        height: 100
      });

      canvas.addShape(shape2, rootElement);

      label2 = elementFactory.createLabel({
        id: 'label2',
        x: 725,
        y: 725,
        width: 50,
        height: 50,
        labelTarget: shape2
      });

      canvas.addShape(label2, rootElement);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: shape1,
        target: shape2,
        waypoints: [
          { x: 900, y: 900 },
          { x: 1000, y: 1000 },
          { x: 1100, y: 1100 }
        ]
      });

      canvas.addConnection(connection, rootElement);
    }));


    describe('create', function() {

      var shape3;

      beforeEach(inject(function(create, dragging, elementFactory) {
        shape3 = elementFactory.createShape({
          id: 'shape3',
          width: 50,
          height: 50
        });

        create.start(canvasEventMid({ x: 0, y: 0 }), shape3);

        dragging.hover({ element: rootElement, gfx: rootElementGfx });
      }));


      it('should init on create.start', inject(function(eventBus) {

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
        eventBus.fire('create.start', event);

        // then
        var snapContext = event.context.snapContext;

        expect(snapContext).to.exist;

        expect(snapContext.getSnapOrigin('top-left')).to.exist;
        expect(snapContext.getSnapOrigin('mid')).to.exist;
        expect(snapContext.getSnapOrigin('bottom-right')).to.exist;
      }));


      describe('snap to shape', function() {

        it('should snap mid, mid', inject(function(dragging) {

          // when
          dragging.move(canvasEventMid({ x: 145, y: 545 }));

          dragging.end();

          // then
          expect(mid(shape3)).to.have.eql({
            x: 150, // 145 snapped to 150 (mid of shape1)
            y: 550 // 545 snapped to 550 (mid of shape2)
          });
        }));

      });


      describe('snap to diagram origin', function() {

        it('should NOT snap to (0, 0)', inject(function(dragging) {

          // when
          dragging.move(canvasEventMid({ x: 5, y: 5 }));

          dragging.end();

          // then
          expect(mid(shape3)).to.have.eql({
            x: 5, // NOT snapped
            y: 5 // NOT snapped
          });
        }));

      });


      describe('snap to connection', function() {

        it('should NOT snap mid, mid (1st waypoint)', inject(function(dragging) {

          // when
          dragging.move(canvasEventMid({ x: 895, y: 895 }));

          dragging.end();

          // then
          expect(mid(shape3)).to.have.eql({
            x: 895, // NOT snapped
            y: 895 // NOT snapped
          });
        }));


        it('should snap mid, mid', inject(function(dragging) {

          // when
          dragging.move(canvasEventMid({ x: 995, y: 995 }));

          dragging.end();

          // then
          expect(mid(shape3)).to.have.eql({
            x: 1000, // 995 snapped to 1000 (2nd waypoint of connection)
            y: 1000 // 995 snapped to 1000 (2nd waypoint of connection)
          });
        }));


        it('should NOT snap mid, mid (last waypoint)', inject(function(dragging) {

          // when
          dragging.move(canvasEventMid({ x: 1095, y: 1095 }));

          dragging.end();

          // then
          expect(mid(shape3)).to.have.eql({
            x: 1095, // NOT snapped
            y: 1095 // NOT snapped
          });
        }));

      });


      describe('snap to label', function() {

        it('should NOT snap mid, mid', inject(function(dragging) {

          // when
          dragging.move(canvasEventMid({ x: 345, y: 345 }));

          dragging.end();

          // then
          expect(mid(shape3)).to.have.eql({
            x: 345, // NOT snapped
            y: 345 // NOT snapped
          });
        }));

      });

    });


    describe('move', function() {

      it('should init on shape.move.start', inject(function(eventBus) {

        // given
        var event = eventBus.createEvent({
          x: 100,
          y: 100,
          shape: shape1,
          context: {}
        });

        // when
        eventBus.fire('shape.move.start', event);

        // then
        var snapContext = event.context.snapContext;

        expect(snapContext).to.exist;

        expect(snapContext.getSnapOrigin('top-left')).to.exist;
        expect(snapContext.getSnapOrigin('mid')).to.exist;
        expect(snapContext.getSnapOrigin('bottom-right')).to.exist;
      }));


      describe('shape', function() {

        var shape3;

        beforeEach(inject(function(canvas, dragging, elementFactory, move) {
          shape3 = elementFactory.createShape({
            id: 'shape3',
            x: 0,
            y: 0,
            width: 50,
            height: 50
          });

          canvas.addShape(shape3, rootElement);

          move.start(canvasEventMid({ x: 25, y: 25 }), shape3, true);

          dragging.hover({ element: rootElement, gfx: rootElementGfx });

          dragging.move(canvasEventMid({ x: 0, y: 0 }));
        }));


        describe('snap to self', function() {

          it('should snap mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 20, y: 20 }));

            dragging.end();

            // then
            expect(mid(shape3)).to.have.eql({
              x: 25, // 20 snapped to 25 (mid of shape3)
              y: 25 // 20 snapped to 25 (mid of shape3)
            });
          }));

        });


        describe('snap to shape', function() {

          it('should snap mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 145, y: 545 }));

            dragging.end();

            // then
            expect(mid(shape3)).to.have.eql({
              x: 150, // 145 snapped to 150 (mid of shape1)
              y: 550 // 545 snapped to 550 (mid of shape2)
            });
          }));

        });


        describe('snap to connection', function() {

          it('should snap mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 995, y: 995 }));

            dragging.end();

            // then
            expect(mid(shape3)).to.have.eql({
              x: 1000, // 995 snapped to 1000 (2nd waypoint of connection)
              y: 1000 // 995 snapped to 1000 (2nd waypoint of connection)
            });
          }));

        });


        describe('snap to label', function() {

          it('should NOT snap to mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 345, y: 745 }, shape3));

            dragging.end();

            // then
            expect(mid(shape3)).to.have.eql({
              x: 345, // NOT snapped
              y: 745 // NOT snapped
            });
          }));

        });

      });


      describe('label', function() {

        var label3;

        beforeEach(inject(function(canvas, dragging, elementFactory, move) {
          label3 = elementFactory.createLabel({
            id: 'label3',
            x: 0,
            y: 0,
            width: 50,
            height: 50,
            labelTarget: shape1
          });

          canvas.addShape(label3, rootElement);

          move.start(canvasEventMid({ x: 25, y: 25 }), label3, true);

          dragging.hover({ element: rootElement, gfx: rootElementGfx });

          dragging.move(canvasEventMid({ x: 0, y: 0 }));
        }));


        describe('snap to self', function() {

          it('should snap mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 20, y: 20 }));

            dragging.end();

            // then
            expect(mid(label3)).to.have.eql({
              x: 25, // 20 snapped to 25 (mid of label3)
              y: 25 // 20 snapped to 25 (mid of label3)
            });
          }));

        });


        describe('snap to shape', function() {

          it('should NOT snap top, left', inject(function(dragging) {

            // when
            dragging.move(canvasEventTopLeft({ x: 95, y: 495 }, label3));

            dragging.end();

            // then
            expect(topLeft(label3)).to.have.eql({
              x: 95, // NOT snapped
              y: 495 // NOT snapped
            });
          }));


          it('should snap mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 145, y: 545 }));

            dragging.end();

            // then
            expect(mid(label3)).to.have.eql({
              x: 150, // 145 snapped to 150 (mid of shape1)
              y: 550 // 545 snapped to 550 (mid of shape2)
            });
          }));


          it('should NOT snap bottom, right', inject(function(dragging) {

            // when
            dragging.move(canvasEventBottomRight({ x: 195, y: 595 }, label3));

            dragging.end();

            // then
            expect(bottomRight(label3)).to.have.eql({
              x: 195, // NOT snapped
              y: 595 // NOT snapped
            });
          }));

        });


        describe('snap to connection', function() {

          it('should snap mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 995, y: 995 }));

            dragging.end();

            // then
            expect(mid(label3)).to.have.eql({
              x: 1000, // 995 snapped to 1000
              y: 1000 // 995 snapped to 1000
            });
          }));

        });


        describe('snap to label', function() {

          it('should snap mid, mid', inject(function(dragging) {

            // when
            dragging.move(canvasEventMid({ x: 345, y: 745 }));

            dragging.end();

            // then
            expect(mid(label3)).to.have.eql({
              x: 350, // 345 snapped to 350 (mid of label1)
              y: 750 // 745 snapped to 750 (mid of label2)
            });
          }));

        });

      });

    });

  });

});

// helpers //////////

function canvasEventTopLeft(position, shape) {
  return canvasEventMid({
    x: position.x + shape.width / 2,
    y: position.y + shape.height / 2
  });
}

function canvasEventBottomRight(position, shape) {
  return canvasEventMid({
    x: position.x - shape.width / 2,
    y: position.y - shape.height / 2
  });
}