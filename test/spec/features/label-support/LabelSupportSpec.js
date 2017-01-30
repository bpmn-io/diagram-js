import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  createCanvasEvent as canvasEvent
} from '../../../util/MockEvents';

import labelSupportModule from 'lib/features/label-support';
import moveModule from 'lib/features/move';
import modelingModule from 'lib/features/modeling';
import rulesModule from './rules';
import spaceToolModule from 'lib/features/space-tool';

import {
  classes as svgClasses
} from 'tiny-svg';


describe('features/label-support - Label', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      labelSupportModule,
      modelingModule,
      moveModule,
      rulesModule,
      spaceToolModule
    ]
  }));

  beforeEach(inject(function(canvas, dragging) {
    dragging.setOptions({ manual: true });
  }));


  var rootShape, parentShape, childShape, label, hostShape, attacherShape, attacherLabel;

  beforeEach(inject(function(elementFactory, canvas, modeling) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100,
      width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 200, y: 250,
      width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

    label = elementFactory.createLabel({
      id: 'label',
      width: 80, height: 40
    });

    modeling.createLabel(childShape, { x: 200, y: 250 }, label, parentShape);

    hostShape = elementFactory.createShape({
      id: 'host',
      x: 500, y: 100,
      width: 100, height: 100
    });

    canvas.addShape(hostShape, rootShape);

    attacherShape = elementFactory.createShape({
      id: 'attacher',
      x: 525, y: 175,
      width: 50, height: 50,
      parent: rootShape,
      host: hostShape
    });

    canvas.addShape(attacherShape, hostShape);

    attacherLabel = elementFactory.createLabel({
      id: 'attacherLabel',
      width: 80, height: 40,
      type: 'label'
    });

    modeling.createLabel(attacherShape, { x: 550, y: 250 }, attacherLabel, rootShape);
  }));


  var multiParentShape, multiChildShape, label2, label3;

  beforeEach(inject(function(elementFactory, modeling, canvas) {

    // For multi label tests
    multiParentShape = elementFactory.createShape({
      id: 'multiParent',
      x: 200, y: 200,
      width: 300, height: 300
    });

    canvas.addShape(multiParentShape, rootShape);

    multiChildShape = elementFactory.createShape({
      id: 'multiChild',
      x: 300, y: 350,
      width: 100, height: 100
    });

    canvas.addShape(multiChildShape, multiParentShape);

    label2 = elementFactory.createLabel({
      id: 'label2',
      width: 80, height: 40
    });

    modeling.createLabel(multiChildShape, { x: 300, y: 350 }, label2, multiParentShape);

    label3 = elementFactory.createLabel({
      id: 'label3',
      width: 80, height: 40
    });

    modeling.createLabel(multiChildShape, { x: 300, y: 400 }, label3, multiParentShape);
  }));


  describe('deletion', function() {

    describe('should remove with connection', function() {

      var childShape2, connection;

      beforeEach(inject(function(elementFactory, canvas, modeling) {

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
      }));


      describe('single label', function() {

        it('execute', inject(function(modeling) {

          var connectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });

          // when
          modeling.removeConnection(connection);

          // then
          expect(connectionLabel.parent).not.to.exist;
          expect(connectionLabel.labelTarget).not.to.exist;

          expect(connection.label).not.to.exist;
        }));


        it('undo', inject(function(modeling, commandStack) {

          var connectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });

          // when
          modeling.removeConnection(connection);
          commandStack.undo();

          // then
          expect(connectionLabel.parent).to.equal(parentShape);
          expect(connectionLabel.labelTarget).to.equal(connection);

          expect(connection.label).to.equal(connectionLabel);
        }));


        it('redo', inject(function(modeling, commandStack) {

          var connectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });

          // when
          modeling.removeConnection(connection);
          commandStack.undo();
          commandStack.redo();

          // then
          expect(connectionLabel.parent).not.to.exist;
          expect(connectionLabel.labelTarget).not.to.exist;

          expect(connection.label).not.to.exist;
        }));

      });


      describe('multiple labels', function() {

        it('execute', inject(function(modeling) {

          var connectionLabel1 = modeling.createLabel(connection, { x: 160, y: 145 });
          var connectionLabel2 = modeling.createLabel(connection, { x: 160, y: 185 });

          // when
          modeling.removeConnection(connection);

          // then
          expect(connectionLabel1.parent).not.to.exist;
          expect(connectionLabel1.labelTarget).not.to.exist;
          expect(connectionLabel2.parent).not.to.exist;
          expect(connectionLabel2.labelTarget).not.to.exist;

          expect(connection.labels).to.be.empty;
        }));


        it('undo', inject(function(modeling, commandStack) {

          var connectionLabel1 = modeling.createLabel(connection, { x: 160, y: 145 });
          var connectionLabel2 = modeling.createLabel(connection, { x: 160, y: 185 });

          // when
          modeling.removeConnection(connection);
          commandStack.undo();

          // then
          expect(connectionLabel1.parent).to.equal(parentShape);
          expect(connectionLabel1.labelTarget).to.equal(connection);
          expect(connectionLabel2.parent).to.equal(parentShape);
          expect(connectionLabel2.labelTarget).to.equal(connection);

          expect(connection.labels).to.eql([
            connectionLabel1,
            connectionLabel2
          ]);
        }));


        it('redo', inject(function(modeling, commandStack) {

          var connectionLabel1 = modeling.createLabel(connection, { x: 160, y: 145 });
          var connectionLabel2 = modeling.createLabel(connection, { x: 160, y: 185 });

          // when
          modeling.removeConnection(connection);
          commandStack.undo();
          commandStack.redo();

          // then
          expect(connectionLabel1.parent).not.to.exist;
          expect(connectionLabel1.labelTarget).not.to.exist;
          expect(connectionLabel2.parent).not.to.exist;
          expect(connectionLabel2.labelTarget).not.to.exist;

          expect(connection.labels).to.be.empty;
        }));

      });

    });


    describe('should remove with shape', function() {

      describe('single label', function() {

        it('execute', inject(function(modeling) {

          // when
          modeling.removeShape(childShape);

          // then
          expect(label.parent).not.to.exist;
          expect(label.labelTarget).not.to.exist;

          expect(childShape.label).not.to.exist;
          expect(childShape.labels).to.be.empty;
        }));


        it('undo', inject(function(modeling, commandStack) {

          // when
          modeling.removeShape(childShape);
          commandStack.undo();

          // then
          expect(label.parent).to.equal(parentShape);
          expect(label.labelTarget).to.equal(childShape);

          expect(childShape.labels).to.eql([ label ]);
          expect(childShape.label).to.equal(label);
        }));


        it('redo', inject(function(modeling, commandStack) {

          // when
          modeling.removeShape(childShape);
          commandStack.undo();
          commandStack.redo();

          // then
          expect(label.parent).not.to.exist;
          expect(label.labelTarget).not.to.exist;

          expect(childShape.label).not.to.exist;
          expect(childShape.labels).to.be.empty;
        }));

      });


      describe('multiple labels', function() {

        it('execute', inject(function(modeling) {

          var label1 = modeling.createLabel(childShape, { x: 160, y: 145 });
          var label2 = modeling.createLabel(childShape, { x: 160, y: 185 });

          // when
          modeling.removeShape(childShape);

          // then
          expect(label1.parent).not.to.exist;
          expect(label1.labelTarget).not.to.exist;
          expect(label2.parent).not.to.exist;
          expect(label2.labelTarget).not.to.exist;

          expect(childShape.labels).to.be.empty;
        }));


        it('undo', inject(function(modeling, commandStack) {

          var label1 = modeling.createLabel(childShape, { x: 160, y: 145 });
          var label2 = modeling.createLabel(childShape, { x: 160, y: 185 });

          // when
          modeling.removeShape(childShape);
          commandStack.undo();

          // then
          expect(label1.parent).to.equal(parentShape);
          expect(label1.labelTarget).to.equal(childShape);
          expect(label2.parent).to.equal(parentShape);
          expect(label2.labelTarget).to.equal(childShape);

          expect(childShape.labels).to.eql([
            // pre-existing label
            label,
            label1,
            label2
          ]);
        }));


        it('redo', inject(function(modeling, commandStack) {

          var label1 = modeling.createLabel(childShape, { x: 160, y: 145 });
          var label2 = modeling.createLabel(childShape, { x: 160, y: 185 });

          // when
          modeling.removeShape(childShape);
          commandStack.undo();
          commandStack.redo();

          // then
          expect(label1.parent).not.to.exist;
          expect(label1.labelTarget).not.to.exist;
          expect(label2.parent).not.to.exist;
          expect(label2.labelTarget).not.to.exist;

          expect(childShape.labels).to.be.empty;
        }));

      });

    });

  });


  describe('moving', function() {

    it('should move', inject(function(modeling) {
      // when
      modeling.moveElements([ label ], { x: 75, y: 0 }, parentShape);

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
    }));


    it('should move multiple', inject(function(modeling) {
      // when
      modeling.moveElements([ label2, label3 ], { x: 75, y: 0 }, multiParentShape);

      // then
      expect(label2.x).to.eql(335);
      expect(label2.y).to.eql(330);
      expect(label3.x).to.eql(335);
      expect(label3.y).to.eql(380);
    }));


    it('should move with labelTarget', inject(function(modeling) {
      // when
      modeling.moveElements([ childShape ], { x: 75, y: 0 }, parentShape);

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
    }));


    it('should move multiple with labelTarget', inject(function(modeling) {
      // when
      modeling.moveElements([ multiChildShape ], { x: 75, y: 0 }, multiParentShape);

      // then
      expect(label2.x).to.eql(335);
      expect(label2.y).to.eql(330);
      expect(label3.x).to.eql(335);
      expect(label3.y).to.eql(380);
    }));


    it('should not move, if already moved', inject(function(eventBus, modeling) {

      // given
      var labelPosition = {
        x: label.x,
        y: label.y
      };

      eventBus.once('commandStack.shape.move.postExecute', function(e) {

        var shape = e.context.shape;

        var label = shape.label;

        modeling.moveShape(label, { x: 30, y: 0 });
      });

      // when
      modeling.moveElements([ childShape ], { x: 75, y: 0 }, parentShape);

      // then
      // label was not moved by LabelSupport
      expect(label.x).to.eql(labelPosition.x + 30);
      expect(label.y).to.eql(labelPosition.y);
    }));


    describe('should drag move with labelTarget', function() {

      it('execute', inject(function(move, dragging) {
        // when
        move.start(canvasEvent({ x: 225, y: 275 }), childShape);

        dragging.move(canvasEvent({ x: 300, y: 275 }));
        dragging.end();

        // then
        expect(label.x).to.eql(235);
        expect(label.y).to.eql(230);
      }));


      it('undo', inject(function(move, dragging, commandStack) {
        // when
        move.start(canvasEvent({ x: 225, y: 275 }), childShape);

        dragging.move(canvasEvent({ x: 300, y: 275 }));
        dragging.end();

        commandStack.undo();

        // then
        expect(label.x).to.eql(160);
        expect(label.y).to.eql(230);
      }));


      it('redo', inject(function(move, dragging, commandStack) {
        // when
        move.start(canvasEvent({ x: 225, y: 275 }), childShape);

        dragging.move(canvasEvent({ x: 300, y: 275 }));
        dragging.end();

        commandStack.undo();

        commandStack.redo();

        // then
        expect(label.x).to.eql(235);
        expect(label.y).to.eql(230);
      }));

    });


    describe('should drag move multiple with labelTarget', function() {

      it('execute', inject(function(move, dragging) {
        // when
        move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

        dragging.move(canvasEvent({ x: 400, y: 375 }));
        dragging.end();

        // then
        expect(label2.x).to.eql(335);
        expect(label2.y).to.eql(330);
        expect(label3.x).to.eql(335);
        expect(label3.y).to.eql(380);
      }));


      it('undo', inject(function(move, dragging, commandStack) {
        // when
        move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

        dragging.move(canvasEvent({ x: 400, y: 375 }));
        dragging.end();

        commandStack.undo();

        // then
        expect(label2.x).to.eql(260);
        expect(label2.y).to.eql(330);
        expect(label3.x).to.eql(260);
        expect(label3.y).to.eql(380);
      }));


      it('redo', inject(function(move, dragging, commandStack) {
        // when
        move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

        dragging.move(canvasEvent({ x: 400, y: 375 }));
        dragging.end();

        commandStack.undo();

        commandStack.redo();

        // then
        expect(label2.x).to.eql(335);
        expect(label2.y).to.eql(330);
        expect(label3.x).to.eql(335);
        expect(label3.y).to.eql(380);
      }));

    });


    describe('space tool', function() {

      var attacherLabelPos;

      beforeEach(function() {
        attacherLabelPos = {
          x: attacherLabel.x,
          y: attacherLabel.y
        };
      });

      describe('should move label along with its target', function() {

        beforeEach(inject(function(spaceTool, dragging) {
          // when
          spaceTool.activateMakeSpace(canvasEvent({ x: 250, y: 100 }));

          dragging.move(canvasEvent({ x: 250, y: 200 }));
          dragging.end();
        }));

        it('execute', inject(function(spaceTool, dragging) {

          // then
          expect(attacherLabel.x).to.eql(attacherLabelPos.x);
          expect(attacherLabel.y).to.eql(attacherLabelPos.y + 100);
        }));


        it('undo', inject(function(commandStack) {
          // when
          commandStack.undo();

          // then
          expect(attacherLabel.x).to.eql(attacherLabelPos.x);
          expect(attacherLabel.y).to.eql(attacherLabelPos.y);
        }));


        it('redo', inject(function(commandStack) {
          // when
          commandStack.undo();
          commandStack.redo();

          // then
          expect(attacherLabel.x).to.eql(attacherLabelPos.x);
          expect(attacherLabel.y).to.eql(attacherLabelPos.y + 100);
        }));
      });

    });


    it('should keep on top of labelTarget', inject(function(move, dragging) {

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));
      dragging.end();

      var labelIdx = parentShape.children.indexOf(label),
          childShapeIdx = parentShape.children.indexOf(childShape);

      // then
      expect(labelIdx).to.be.above(childShapeIdx);
    }));


    it('should keep multiple on top of labelTarget', inject(function(move, dragging) {

      // when
      move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

      dragging.move(canvasEvent({ x: 325, y: 250 }));
      dragging.end();

      var label1Idx = multiParentShape.children.indexOf(label2),
          label2Idx = multiParentShape.children.indexOf(label3),
          multiChildShapeIdx = multiParentShape.children.indexOf(multiChildShape);

      // then
      expect(label1Idx).to.be.above(multiChildShapeIdx);
      expect(label2Idx).to.be.above(multiChildShapeIdx);
    }));

  });


  describe('visuals', function() {

    it('should add marker', inject(function(elementRegistry, move, dragging) {
      var labelGfx = elementRegistry.getGraphics(label);

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));

      // then
      expect(svgClasses(labelGfx).has('djs-dragging')).to.be.true;
    }));


    it('should remove marker', inject(function(elementRegistry, move, dragging) {

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));
      dragging.end();

      var labelGfx = elementRegistry.getGraphics(label);
      // then
      expect(svgClasses(labelGfx).has('djs-dragging')).to.be.false;
    }));


    it('should be inside dragGroup', inject(function(elementRegistry, move, dragging) {

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));

      var ctx = dragging.context().data.context;

      var children = ctx.dragGroup.childNodes;

      // then
      expect(children).to.have.lengthOf(2);
    }));


    describe('multiple labels', function() {

      it('should add marker', inject(
        function(elementRegistry, move, dragging) {
          var label1Gfx = elementRegistry.getGraphics(label2);
          var label2Gfx = elementRegistry.getGraphics(label3);

          // when
          move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

          dragging.move(canvasEvent({ x: 325, y: 250 }));

          // then
          expect(svgClasses(label1Gfx).has('djs-dragging')).to.be.true;
          expect(svgClasses(label2Gfx).has('djs-dragging')).to.be.true;
        }
      ));


      it('should remove marker', inject(
        function(elementRegistry, move, dragging) {

          // when
          move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

          dragging.move(canvasEvent({ x: 325, y: 250 }));
          dragging.end();

          var label1Gfx = elementRegistry.getGraphics(label2);
          var label2Gfx = elementRegistry.getGraphics(label3);
          // then
          expect(svgClasses(label1Gfx).has('djs-dragging')).to.be.false;
          expect(svgClasses(label2Gfx).has('djs-dragging')).to.be.false;
        }
      ));

    });

  });

});
