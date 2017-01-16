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


  describe('deletion', function() {

    describe('with connection', function() {

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


      it('should remove with connection', inject(function(modeling) {

        var connectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });

        // when
        modeling.removeConnection(connection);

        // then
        expect(connectionLabel.parent).not.to.exist;
        expect(connectionLabel.labelTarget).not.to.exist;

        expect(connection.label).not.to.exist;
      }));


      it('should undo remove label', inject(function(modeling, commandStack) {

        var connectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });

        // when
        modeling.removeConnection(connection);
        commandStack.undo();

        // then
        expect(connectionLabel.parent).to.equal(parentShape);
        expect(connectionLabel.labelTarget).to.equal(connection);

        expect(connection.label).to.equal(connectionLabel);
      }));


      it('should redo remove label', inject(function(modeling, commandStack) {

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


    describe('should remove with shape', function() {

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

        console.log(childShape.label.id, label.id);

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

  });


  describe('moving', function() {

    it('should move', inject(function(modeling) {
      // when
      modeling.moveElements([ label ], { x: 75, y: 0 }, parentShape);

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
    }));


    it('should move with labelTarget', inject(function(modeling) {
      // when
      modeling.moveElements([ childShape ], { x: 75, y: 0 }, parentShape);

      // then
      expect(label.x).to.eql(235);
      expect(label.y).to.eql(230);
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


    describe('space tool', function() {

      var attacherLabelPos;

      beforeEach(function() {
        attacherLabelPos = { x: attacherLabel.x, y: attacherLabel.y };
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

  });

});
