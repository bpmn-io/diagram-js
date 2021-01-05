import {
  query as domQuery
} from 'min-dom';

import { attr as svgAttr } from 'tiny-svg';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import autoResizeModule from 'lib/features/auto-resize';
import autoResizeProviderModule from './auto-resize';
import modelingModule from 'lib/features/modeling';
import rulesModule from './rules';
import spaceToolModule from 'lib/features/space-tool';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import { isMac } from 'lib/util/Platform';

var keyModifier = isMac() ? { metaKey: true } : { ctrlKey: true };

var spy = sinon.spy;


describe('features/space-tool', function() {

  describe('#toggle', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        spaceToolModule
      ]
    }));


    it('should activate and deactivate', inject(function(spaceTool) {

      // given
      spaceTool.toggle();

      // assume
      expect(spaceTool.isActive()).to.be.true;

      // when
      spaceTool.toggle();

      // then
      expect(spaceTool.isActive()).not.to.be.ok;
    }));

  });


  describe('create/remove space', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        rulesModule,
        spaceToolModule
      ]
    }));

    var childShape,
        childShape2,
        connection;

    beforeEach(inject(function(canvas, elementFactory) {
      childShape = elementFactory.createShape({
        id: 'child',
        x: 110, y: 110,
        width: 100, height: 100
      });

      canvas.addShape(childShape);

      childShape2 = elementFactory.createShape({
        id: 'child2',
        x: 400, y: 250,
        width: 100, height: 100
      });

      canvas.addShape(childShape2);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 160, y: 160 },
          { x: 450, y: 300 }
        ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection);
    }));


    describe('basics', function() {

      it('should expose spaceTool', inject(function(spaceTool) {

        // then
        expect(spaceTool).to.exist;
      }));


      it('should reactivate after usage', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateSelection(canvasEvent({ x: 100, y: 225 }));

        dragging.move(canvasEvent({ x: 100, y: 250 }, keyModifier));
        dragging.end();

        // then
        var context = dragging.context();

        expect(context.prefix).to.eql('spaceTool');
        expect(context.active).to.be.true;

        expect(spaceTool.isActive()).to.be.true;
      }));


      it('should not be active on cancel', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateSelection(canvasEvent({ x: 100, y: 225 }));

        dragging.move(canvasEvent({ x: 100, y: 250 }, keyModifier));

        dragging.end();

        dragging.cancel();

        // then
        var context = dragging.context();

        expect(context).not.to.exist;

        expect(spaceTool.isActive()).not.to.exist;
      }));

    });


    describe('create space behaviour', function() {

      beforeEach(inject(function(dragging) {
        dragging.setOptions({ manual: true });
      }));


      it('should show crosshair once activated', inject(function(canvas, dragging, spaceTool) {

        // given
        spaceTool.activateSelection(canvasEvent({ x: 30, y: 30 }));

        // when
        dragging.move(canvasEvent({ x: 50, y: 50 }));

        // then
        var spaceGroup = domQuery('.djs-crosshair-group', canvas.getLayer('space'));

        expect(spaceGroup).to.exist;
      }));


      it('should remove crosshair once deactivated', inject(function(canvas, dragging, spaceTool) {

        // given
        spaceTool.activateSelection(canvasEvent({ x: 30, y: 30 }));

        // when
        dragging.move(canvasEvent({ x: 50, y: 50 }));

        dragging.end();

        // then
        var spaceLayer = domQuery('.djs-crosshair-group', canvas.getLayer('space'));

        expect(spaceLayer).to.be.null;
      }));


      it('should create space on y axis when doing a perfect diagonal', inject(
        function(dragging, spaceTool) {

          // given
          spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 225 }));

          // when
          dragging.move(canvasEvent({ x: 350, y: 275 }));

          dragging.end();

          // then
          expect(childShape.x).to.equal(110);
          expect(childShape.y).to.equal(110);

          expect(childShape2.x).to.equal(400);
          expect(childShape2.y).to.equal(300);

          expect(connection).to.have.waypoints([
            { x: 160, y: 160 },
            { x: 450, y: 350 }
          ]);
        }
      ));


      it('should make space to the right and resize parent', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 350, y: 150 }));

        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(450);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 500, y: 300 }
        ]);
      }));


      it('should round to pixel values', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 350.25, y: 149.75 }));

        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(450);
        expect(childShape2.y).to.equal(250);


        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 500, y: 300 }
        ]);
      }));


      it('should remove space from the left and resize parent', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 200, y: 150 }));

        dragging.move(canvasEvent({ x: 150, y: 150 }));
        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(350);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 400, y: 300 }
        ]);
      }));


      it('should remove space from the top and resize parent', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300,y: 150 }));

        dragging.move(canvasEvent({ x: 300, y: 120 }));

        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(220);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 450, y: 270 }
        ]);
      }));


      it('should make space at the bottom and resize parent', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 300, y: 200 }));

        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(300);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 450, y: 350 }
        ]);
      }));


      it('should remove space with elements to the right', inject(function(spaceTool, dragging) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 350, y: 150 }, keyModifier));
        dragging.end();

        // then
        expect(childShape.x).to.equal(160);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 210, y: 160 },
          { x: 450, y: 300 }
        ]);
      }));


      it('should add space with elements to the left', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 350, y: 150 }));

        dragging.move(canvasEvent({ x: 300, y: 150 }, keyModifier));

        dragging.end();

        // then
        expect(childShape.x).to.equal(60);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 110, y: 160 },
          { x: 450, y: 300 }
        ]);
      }));


      it('should remove space with elements that are above', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 350, y: 230 }));

        dragging.move(canvasEvent({ x: 350, y: 280 }, keyModifier));

        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(160);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 210 },
          { x: 450, y: 300 }
        ]);
      }));


      it('should add space with elements that are below', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 350, y: 230 }));

        dragging.move(canvasEvent({ x: 350, y: 180 }, keyModifier));

        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(60);

        expect(childShape2.x).to.equal(400);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 110 },
          { x: 450, y: 300 }
        ]);
      }));


      it('should re-layout connection end', inject(function(dragging, spaceTool) {

        // given
        connection.waypoints[0].original = { x: 160, y: 160 };
        connection.waypoints[1].original = { x: 450, y: 300 };

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 150 }));

        dragging.move(canvasEvent({ x: 350, y: 150 }));

        dragging.end();

        // then
        expect(childShape.x).to.equal(110);
        expect(childShape.y).to.equal(110);

        expect(childShape2.x).to.equal(450);
        expect(childShape2.y).to.equal(250);

        expect(connection).to.have.waypoints([
          { x: 160, y: 160 },
          { x: 500, y: 300 }
        ]);

        expect(connection.waypoints[1].original).not.to.exist;
      }));

    });

  });


  describe('labels', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        rulesModule,
        spaceToolModule
      ]
    }));

    var childShape,
        childShape2,
        connection,
        label,
        label1;

    beforeEach(inject(function(canvas, elementFactory, modeling) {
      childShape = elementFactory.createShape({
        id: 'child',
        x: 100, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(childShape);

      childShape2 = elementFactory.createShape({
        id: 'child2',
        x: 400, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(childShape2);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 150, y: 150 },
          { x: 450, y: 150 }
        ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection);

      label = elementFactory.createLabel({
        id: 'label',
        width: 80, height: 40
      });

      modeling.createLabel(childShape, { x: 150, y: 250 }, label);

      label1 = elementFactory.createLabel({
        id: 'label1',
        width: 80, height: 40
      });

      modeling.createLabel(connection, { x: 300, y: 200 }, label1);
    }));


    it('should move external labels', inject(function(dragging, spaceTool) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 0 }));

      dragging.move(canvasEvent({ x: 500, y: 0 }));
      dragging.end();

      // then
      expect(label.x).to.equal(610);
      expect(label.y).to.equal(230);

      expect(label1.x).to.equal(760);
      expect(label1.y).to.equal(180);
    }));


    it('should disallow label behavior', inject(function(dragging, eventBus, spaceTool) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 0 }));

      var layoutConnectionSpy = sinon.spy(function(event) {
        var context = event.context,
            hints = context.hints;

        expect(hints.labelBehavior).to.be.false;
      });

      eventBus.on('commandStack.connection.updateWaypoints.execute', layoutConnectionSpy);

      dragging.move(canvasEvent({ x: 500, y: 0 }));
      dragging.end();

      // then
      expect(layoutConnectionSpy).to.have.been.called;
    }));


    it('should allow label behavior', inject(function(dragging, eventBus, spaceTool) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 0 }));

      var layoutConnectionSpy = sinon.spy(function(event) {
        var context = event.context,
            hints = context.hints;

        expect(hints.labelBehavior).to.not.be.false;
      });

      eventBus.on('commandStack.connection.layout.execute', layoutConnectionSpy);

      dragging.move(canvasEvent({ x: 800, y: 0 }));
      dragging.end();

      // then
      expect(layoutConnectionSpy).to.have.been.called;
    }));

  });


  describe('resize containers', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        rulesModule,
        spaceToolModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var childShape,
        childShape2,
        childShape3,
        childShape4,
        connection,
        connection2,
        grandParent,
        greatGrandParent,
        parentShape,
        parentShape2;

    beforeEach(inject(function(canvas, elementFactory) {
      greatGrandParent = elementFactory.createShape({
        id: 'greatGrandParent',
        x: 100, y: 50,
        width: 400, height: 400
      });

      canvas.addShape(greatGrandParent);

      grandParent = elementFactory.createShape({
        id: 'grandParent',
        x: 125, y: 75,
        width: 350, height: 350
      });

      canvas.addShape(grandParent, greatGrandParent);

      parentShape = elementFactory.createShape({
        id: 'parent1',
        x: 200, y: 150,
        width: 200, height: 200
      });

      canvas.addShape(parentShape, grandParent);

      childShape = elementFactory.createShape({
        id: 'child',
        x: 225, y: 175,
        width: 50, height: 50
      });

      canvas.addShape(childShape, parentShape);

      childShape2 = elementFactory.createShape({
        id: 'child2',
        x: 325, y: 275,
        width: 50, height: 50
      });

      canvas.addShape(childShape2, parentShape);

      connection = elementFactory.createConnection({
        id: 'connection',
        waypoints: [
          { x: 250, y: 200 },
          { x: 350, y: 300 }
        ],
        source: childShape,
        target: childShape2
      });

      canvas.addConnection(connection);

      parentShape2 = elementFactory.createShape({
        id: 'parent2',
        x: 800, y: 200,
        width: 250, height: 150
      });

      canvas.addShape(parentShape2);

      childShape3 = elementFactory.createShape({
        id: 'child3',
        x: 990, y: 210,
        width: 50, height: 50
      });

      canvas.addShape(childShape3, parentShape2);

      childShape4 = elementFactory.createShape({
        id: 'child4',
        x: 810, y: 290,
        width: 50, height: 50
      });

      canvas.addShape(childShape4, parentShape2);

      connection2 = elementFactory.createConnection({
        id: 'connection2',
        waypoints: [
          { x: 1015, y: 235 },
          { x: 835, y: 315 }
        ],
        source: childShape3,
        target: childShape4
      });

      canvas.addConnection(connection2);
    }));


    it('should resize parents', inject(function(dragging, spaceTool) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 275, y: 155 }));

      dragging.move(canvasEvent({ x: 400, y: 155 })); // x =/= 125

      dragging.end();

      // then
      expect(greatGrandParent.x).to.equal(100);
      expect(greatGrandParent.y).to.equal(50);
      expect(greatGrandParent.width).to.equal(525); // changes
      expect(greatGrandParent.height).to.equal(400);

      expect(grandParent.x).to.equal(125);
      expect(grandParent.y).to.equal(75);
      expect(grandParent.width).to.equal(475); // changes
      expect(grandParent.height).to.equal(350);

      expect(parentShape.x).to.equal(200);
      expect(parentShape.y).to.equal(150);
      expect(parentShape.width).to.equal(325); // changes
      expect(parentShape.height).to.equal(200);

      expect(childShape.x).to.equal(225);
      expect(childShape.y).to.equal(175);

      expect(childShape2.x).to.equal(450); // changes
      expect(childShape2.y).to.equal(275);

      expect(connection).to.have.waypoints([
        { x: 250, y: 200 },
        { x: 475, y: 300 } // changes
      ]);

      expect(parentShape2.x).to.equal(925); // changes
      expect(parentShape2.y).to.equal(200);
      expect(parentShape2.width).to.equal(250);
      expect(parentShape2.height).to.equal(150);

      expect(childShape3.x).to.equal(1115); // changes
      expect(childShape3.y).to.equal(210);

      expect(childShape4.x).to.equal(935); // changes
      expect(childShape4.y).to.equal(290);

      expect(connection2).to.have.waypoints([
        { x: 1140, y: 235 }, // changes
        { x: 960, y: 315 } // changes
      ]);
    }));


    it('should resize parents (inverted)', inject(function(dragging, spaceTool) {

      // when
      spaceTool.activateMakeSpace(canvasEvent({ x: 280, y: 155 }));

      dragging.move(canvasEvent({ x: 330, y: 155 }, keyModifier)); // x =/= 50

      dragging.end();

      // then
      expect(greatGrandParent.x).to.equal(150); // changes
      expect(greatGrandParent.y).to.equal(50);
      expect(greatGrandParent.width).to.equal(350);
      expect(greatGrandParent.height).to.equal(400);

      expect(grandParent.x).to.equal(175); // changes
      expect(grandParent.y).to.equal(75);
      expect(grandParent.width).to.equal(300);
      expect(grandParent.height).to.equal(350);

      expect(parentShape.x).to.equal(250); // changes
      expect(parentShape.y).to.equal(150);
      expect(parentShape.width).to.equal(150);
      expect(parentShape.height).to.equal(200);

      expect(childShape.x).to.equal(275); // changes
      expect(childShape.y).to.equal(175);
    }));


    describe('children', function() {

      it('should consider children when resizing shape', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 450, y: 0 }));

        dragging.move(canvasEvent({ x: 0, y: 0 }));

        dragging.end();

        // then
        expect(grandParent).to.have.bounds({
          x: 125,
          y: 75,
          width: 295,
          height: 350
        });

        expect(greatGrandParent).to.have.bounds({
          x: 100,
          y: 50,
          width: 345,
          height: 400
        });
      }));

    });


    describe('parents', function() {

      it('should consider parent when moving shape', inject(function(dragging, spaceTool) {

        // when
        spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 0 }));

        dragging.move(canvasEvent({ x: 0, y: 0 }));

        dragging.end();

        // then
        expect(grandParent).to.have.bounds({
          x: 125,
          y: 75,
          width: 245,
          height: 350
        });

        expect(greatGrandParent).to.have.bounds({
          x: 100,
          y: 50,
          width: 295,
          height: 400
        });
      }));

    });


    describe('attachers', function() {

      var parentShape3;

      beforeEach(inject(function(canvas, elementFactory) {
        parentShape3 = elementFactory.createShape({
          id: 'parent3',
          x: 1100, y: 500,
          width: 250, height: 150
        });

        canvas.addShape(parentShape3);
      }));


      describe('moving attachers', function() {

        it('should consider attachers when resizing shape (n)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x - 25,
              y: parentShape3.y + parentShape3.height - 75,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 640 }));

            dragging.move(canvasEvent({ x: 0, y: 1000 }, keyModifier));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1100,
              y: 550,
              width: 250,
              height: 100
            });
          }
        ));


        it('should consider attachers when resizing shape (w)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x + parentShape3.width - 75,
              y: parentShape3.y - 25,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 1340, y: 0 }));

            dragging.move(canvasEvent({ x: 2000, y: 0 }, keyModifier));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1150,
              y: 500,
              width: 200,
              height: 150
            });
          }
        ));


        it('should consider attachers when resizing shape (s)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x - 25,
              y: parentShape3.y + 25,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 510 }));

            dragging.move(canvasEvent({ x: 0, y: 0 }));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1100,
              y: 500,
              width: 250,
              height: 100
            });
          }
        ));


        it('should consider attachers when resizing shape (e)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x + 25,
              y: parentShape3.y - 25,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 1110, y: 0 }));

            dragging.move(canvasEvent({ x: 0, y: 0 }));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1100,
              y: 500,
              width: 200,
              height: 150
            });
          }
        ));

      });


      describe('non-moving attachers', function() {

        it('should consider attachers when resizing shape (n)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x - 25,
              y: parentShape3.y + parentShape3.height - 75,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 510 }));

            dragging.move(canvasEvent({ x: 0, y: 1000 }, keyModifier));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1100,
              y: 600,
              width: 250,
              height: 50
            });
          }
        ));


        it('should consider attachers when resizing shape (w)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x + parentShape3.width - 75,
              y: parentShape3.y - 25,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 1110, y: 0 }));

            dragging.move(canvasEvent({ x: 2000, y: 0 }, keyModifier));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1300,
              y: 500,
              width: 50,
              height: 150
            });
          }
        ));


        it('should consider attachers when resizing shape (s)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x - 25,
              y: parentShape3.y + 25,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 640 }));

            dragging.move(canvasEvent({ x: 0, y: 0 }));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1100,
              y: 500,
              width: 250,
              height: 50
            });
          }
        ));


        it('should consider attachers when resizing shape (e)', inject(
          function(canvas, dragging, elementFactory, spaceTool) {

            // given
            var attacher = elementFactory.createShape({
              id: 'attacher',
              x: parentShape3.x + 25,
              y: parentShape3.y - 25,
              width: 50, height: 50,
              host: parentShape3
            });

            canvas.addShape(attacher);

            // when
            spaceTool.activateMakeSpace(canvasEvent({ x: 1200, y: 0 }));

            dragging.move(canvasEvent({ x: 0, y: 0 }));

            dragging.end();

            // then
            expect(parentShape3).to.have.bounds({
              x: 1100,
              y: 500,
              width: 50,
              height: 150
            });
          }
        ));

      });

    });


    describe('minimum dimensions', function() {

      it('should get minimum dimensions via event bus', inject(
        function(dragging, eventBus, spaceTool) {

          // given
          var getMinimumDimensionsSpy = spy(function(context) {
            expect(context.axis).to.equal('x');
            expect(context.direction).to.equal('e');
            expect(context.shapes).to.have.length(2);
            expect(context.shapes[ 0 ]).to.equal(greatGrandParent);
            expect(context.shapes[ 1 ]).to.equal(grandParent);
            expect(context.start).to.equal(450);
          });

          eventBus.on('spaceTool.getMinDimensions', getMinimumDimensionsSpy);

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 450, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(getMinimumDimensionsSpy).to.have.been.called;
        }
      ));


      describe('should consider minimum width', function() {

        it('resize from right', inject(function(dragging, eventBus, spaceTool) {

          // given
          eventBus.on('spaceTool.getMinDimensions', function() {
            return {
              grandParent: {
                width: 325
              }
            };
          });

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 450, y: 0 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(grandParent).to.have.bounds({
            x: 125,
            y: 75,
            width: 325,
            height: 350
          });

          expect(greatGrandParent).to.have.bounds({
            x: 100,
            y: 50,
            width: 375,
            height: 400
          });
        }));


        it('resize from left', inject(function(dragging, eventBus, spaceTool) {

          // given
          eventBus.on('spaceTool.getMinDimensions', function() {
            return {
              grandParent: {
                width: 325
              }
            };
          });

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 150, y: 0 }));

          dragging.move(canvasEvent({ x: 450, y: 0 }, keyModifier));

          dragging.end();

          // then
          expect(grandParent).to.have.bounds({
            x: 150,
            y: 75,
            width: 325,
            height: 350
          });

          expect(greatGrandParent).to.have.bounds({
            x: 125,
            y: 50,
            width: 375,
            height: 400
          });
        }));

      });


      describe('should consider minimum height', function() {

        it('resize from bottom', inject(function(dragging, eventBus, spaceTool) {

          // given
          eventBus.on('spaceTool.getMinDimensions', function() {
            return {
              grandParent: {
                height: 325
              }
            };
          });

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 350 }));

          dragging.move(canvasEvent({ x: 0, y: 0 }));

          dragging.end();

          // then
          expect(grandParent).to.have.bounds({
            x: 125,
            y: 75,
            width: 350,
            height: 325
          });

          expect(greatGrandParent).to.have.bounds({
            x: 100,
            y: 50,
            width: 400,
            height: 375
          });
        }));


        it('resize from top', inject(function(dragging, eventBus, spaceTool) {

          // given
          eventBus.on('spaceTool.getMinDimensions', function() {
            return {
              grandParent: {
                height: 325
              }
            };
          });

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 0, y: 150 }));

          dragging.move(canvasEvent({ x: 0, y: 350 }, keyModifier));

          dragging.end();

          // then
          expect(grandParent).to.have.bounds({
            x: 125,
            y: 100,
            width: 350,
            height: 325
          });

          expect(greatGrandParent).to.have.bounds({
            x: 100,
            y: 75,
            width: 400,
            height: 375
          });
        }));

      });


      it('should not fail on falsy values (spaceToolConstraints.left = 0)', inject(
        function(canvas, dragging, elementFactory, eventBus, spaceTool) {

          // given
          var shape = elementFactory.createShape({
            id: 'shape',
            x: 0,
            y: 0,
            width: 50,
            height: 50
          });

          canvas.addShape(shape);

          eventBus.on('spaceTool.getMinDimensions', function() {
            return {
              shape: {
                width: 25
              }
            };
          });

          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 25, y: 0 }));

          dragging.move(canvasEvent({ x: -25, y: 0 }));

          dragging.end();

          // then
          expect(shape).to.have.bounds({
            x: 0,
            y: 0,
            width: 25,
            height: 50
          });
        }
      ));

    });

  });


  describe('undo/redo integration', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        rulesModule,
        spaceToolModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var shape1,
        shape2;

    beforeEach(inject(function(canvas, elementFactory) {
      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 50, y: 100,
        width: 100, height: 100
      });

      canvas.addShape(shape1);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 50, y: 250,
        width: 100, height: 100
      });

      canvas.addShape(shape2);
    }));


    it('should undo', inject(function(commandStack, dragging, spaceTool) {

      // given
      spaceTool.activateMakeSpace(canvasEvent({ x: 100, y: 225 }));

      dragging.move(canvasEvent({ x: 100, y: 250 }));

      dragging.end();

      // when
      commandStack.undo();

      // then
      expect(shape1.x).to.equal(50);
      expect(shape1.y).to.equal(100);

      expect(shape2.x).to.equal(50);
      expect(shape2.y).to.equal(250);
    }));


    it('should redo', inject(function(commandStack, dragging, spaceTool) {

      // given
      spaceTool.activateMakeSpace(canvasEvent({ x: 100, y: 225 }));

      dragging.move(canvasEvent({ x: 100, y: 250 }));

      dragging.end();

      commandStack.undo();

      // when
      commandStack.redo();

      // then
      expect(shape1.x).to.equal(50);
      expect(shape1.y).to.equal(100);

      expect(shape2.x).to.equal(50);
      expect(shape2.y).to.equal(275);
    }));

  });


  describe('integration', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        autoResizeModule,
        autoResizeProviderModule,
        modelingModule,
        spaceToolModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));


    var child1,
        child2,
        connection,
        parent;

    beforeEach(inject(function(canvas, elementFactory) {
      parent = elementFactory.createShape({
        id: 'parent',
        x: 0,
        y: 0,
        width: 400,
        height: 200
      });

      canvas.addShape(parent);

      child1 = elementFactory.createShape({
        id: 'child1',
        x: 50,
        y: 50,
        width: 100,
        height: 100
      });

      canvas.addShape(child1, parent);

      child2 = elementFactory.createShape({
        id: 'child2',
        x: 250,
        y: 50,
        width: 100,
        height: 100
      });

      canvas.addShape(child2, parent);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: child1,
        target: child2,
        waypoints: [
          { x: 150, y: 150 },
          { x: 250, y: 150 }
        ]
      });
    }));


    it('should not auto-resize', inject(function(spaceTool) {

      // when
      spaceTool.makeSpace([ child2 ], [], { x: 100, y: 0 }, 'e', 200);

      // then
      // expect parent with original bounds
      expect(parent).to.have.bounds({
        x: 0,
        y: 0,
        width: 400,
        height: 200
      });
    }));


    it('should provide move hints', inject(function(eventBus, spaceTool) {

      // given
      var moveShapeSpy = spy(function(event) {
        var context = event.context,
            hints = context.hints;

        // then
        expect(hints).to.eql({
          autoResize: false,
          layout: false,
          recurse: false
        });
      });

      eventBus.on('commandStack.shape.move.execute', moveShapeSpy);

      // when
      spaceTool.makeSpace([ child2 ], [], { x: 100, y: 0 }, 'e', 200);

      // then
      expect(moveShapeSpy).to.have.been.called;
    }));


    it('should provide resize hints', inject(function(eventBus, spaceTool) {

      // given
      var resizeShapeSpy = spy(function(event) {
        var context = event.context,
            hints = context.hints;

        // then
        expect(hints).to.eql({
          attachSupport: false,
          autoResize: false,
          layout: false
        });
      });

      eventBus.on('commandStack.shape.resize.execute', resizeShapeSpy);

      // when
      spaceTool.makeSpace([], [ parent ], { x: 100, y: 0 }, 'e', 200);

      // then
      expect(resizeShapeSpy).to.have.been.called;
    }));


    it('should provide updateWaypoints hints', inject(function(eventBus, spaceTool) {

      // given
      var updateWaypointsSpy = spy(function(event) {
        var context = event.context,
            hints = context.hints,
            _connection = context.connection;

        // then
        expect(_connection).to.equal(connection);

        expect(hints).to.eql({
          labelBehavior: false
        });
      });

      eventBus.on('commandStack.connection.updateWaypoints.execute', updateWaypointsSpy);

      // when
      spaceTool.makeSpace([ child1, child2 ], [ parent ], { x: 100, y: 0 }, 'e', 10);

      // then
      expect(updateWaypointsSpy).to.have.been.called;
    }));


    it('should keep connection start if only source is moved', inject(
      function(eventBus, spaceTool) {

        // given
        var updateWaypointsSpy = spy(),
            originalWaypoints = connection.waypoints.slice();

        eventBus.on('commandStack.connection.updateWaypoints.execute', updateWaypointsSpy);

        // when
        spaceTool.makeSpace([], [ child1, parent ], { x: 0, y: 100 }, 's', 200);

        // then
        expect(updateWaypointsSpy).not.to.have.been.called;
        expect(connection.waypoints[ 0 ]).to.eql(originalWaypoints[ 0 ]);
      }
    ));


    it('should keep connection end if only target is moved', inject(
      function(eventBus, spaceTool) {

        // given
        var updateWaypointsSpy = spy(),
            originalWaypoints = connection.waypoints.slice();

        eventBus.on('commandStack.connection.updateWaypoints.execute', updateWaypointsSpy);

        // when
        spaceTool.makeSpace([], [ child2, parent ], { x: 0, y: 100 }, 's', 200);

        // then
        expect(updateWaypointsSpy).not.to.have.been.called;
        expect(connection.waypoints[ 1 ]).to.eql(originalWaypoints[ 1 ]);
      }
    ));

  });


  describe('preview', function() {

    beforeEach(bootstrapDiagram({
      modules: [
        modelingModule,
        rulesModule,
        spaceToolModule
      ]
    }));

    beforeEach(inject(function(dragging) {
      dragging.setOptions({ manual: true });
    }));

    var shape1,
        shape2,
        shape3;

    beforeEach(inject(function(elementFactory, canvas) {
      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 100, y: 100,
        width: 500, height: 200
      });

      canvas.addShape(shape1);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 150, y: 150,
        width: 100, height: 100
      });

      canvas.addShape(shape2, shape1);

      shape3 = elementFactory.createShape({
        id: 'shape3',
        x: 450, y: 150,
        width: 100, height: 100
      });

      canvas.addShape(shape3, shape1);
    }));


    it('should add previews', inject(function(dragging, spaceTool) {

      // given
      spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 100 }));

      // when
      dragging.move(canvasEvent({ x: 400, y: 100 }));

      // then
      var context = dragging.context().data.context,
          dragGroup = context.dragGroup,
          frameGroup = context.frameGroup;

      expect(dragGroup.childNodes).to.have.length(1);
      expect(frameGroup.childNodes).to.have.length(1);

      expect(domQuery('[data-element-id="shape3"]', dragGroup)).to.exist;

      expect(svgAttr(frameGroup.firstChild, 'width')).to.equal('600');
    }));


    it('should add previews (inverted)', inject(function(dragging, spaceTool) {

      // given
      spaceTool.activateMakeSpace(canvasEvent({ x: 300, y: 100 }));

      // when
      dragging.move(canvasEvent({ x: 400, y: 100 }, keyModifier));

      // then
      var context = dragging.context().data.context,
          dragGroup = context.dragGroup,
          frameGroup = context.frameGroup;

      expect(dragGroup.childNodes).to.have.length(1);
      expect(frameGroup.childNodes).to.have.length(1);

      expect(domQuery('[data-element-id="shape2"]', dragGroup)).to.exist;

      expect(svgAttr(frameGroup.firstChild, 'width')).to.equal('400');
    }));

  });

});
