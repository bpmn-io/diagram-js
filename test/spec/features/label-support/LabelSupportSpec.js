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

/* global sinon */
var { spy } = sinon;


describe('features/label-support', function() {

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


  var rootShape,
      parentShape,
      childShape,
      label,
      otherLabel;

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

    otherLabel = elementFactory.createLabel({
      id: 'otherLabel',
      width: 80, height: 40
    });

    modeling.createLabel(childShape, { x: 200, y: 300 }, otherLabel, parentShape);
  }));


  describe('modeling', function() {

    it('should move', inject(function(modeling) {
      // when
      modeling.moveElements([ label ], { x: 75, y: 0 }, parentShape);

      // then
      expect(label).to.have.position({ x: 235, y: 230 });
    }));


    it('should move multiple', inject(function(modeling) {
      // when
      modeling.moveElements([ label, otherLabel ], { x: 75, y: 0 });

      // then
      expect(label).to.have.position({ x: 235, y: 230 });
      expect(otherLabel).to.have.position({ x: 235, y: 280 });
    }));


    it('should move with labelTarget', inject(function(modeling) {
      // when
      modeling.moveElements([ childShape ], { x: 75, y: 10 });

      // then
      expect(label).to.have.position({ x: 235, y: 240 });
      expect(otherLabel).to.have.position({ x: 235, y: 290 });
    }));


    describe('should remove with connection', function() {

      var otherChildShape,
          connection,
          connectionLabel,
          otherConnectionLabel;

      beforeEach(inject(function(elementFactory, canvas, modeling) {

        otherChildShape = elementFactory.createShape({
          id: 'otherChildShape',
          x: 200, y: 110,
          width: 100, height: 100
        });

        canvas.addShape(otherChildShape, parentShape);

        connection = elementFactory.createConnection({
          id: 'connection',
          waypoints: [
            { x: 150, y: 150 },
            { x: 150, y: 200 },
            { x: 350, y: 150 }
          ],
          source: childShape,
          target: otherChildShape
        });

        canvas.addConnection(connection, parentShape);

        connectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });
        otherConnectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });
      }));


      it('execute', inject(function(modeling) {

        var connectionLabel = modeling.createLabel(connection, { x: 160, y: 145 });

        // when
        modeling.removeConnection(connection);

        // then
        expect(connectionLabel.parent).not.to.exist;
        expect(connectionLabel.labelTarget).not.to.exist;

        expect(otherConnectionLabel.parent).not.to.exist;
        expect(otherConnectionLabel.labelTarget).not.to.exist;

        expect(connection.labels).to.be.empty;
        expect(connection.label).not.to.exist;
      }));


      it('undo', inject(function(modeling, commandStack) {

        // given
        modeling.removeConnection(connection);

        // when
        commandStack.undo();

        // then
        expect(connectionLabel.parent).to.equal(parentShape);
        expect(connectionLabel.labelTarget).to.equal(connection);
        expect(otherConnectionLabel.parent).to.equal(parentShape);
        expect(otherConnectionLabel.labelTarget).to.equal(connection);

        expect(connection.labels).to.eql([
          connectionLabel,
          otherConnectionLabel
        ]);

        expect(connection.label).to.equal(connectionLabel);
      }));


      it('redo', inject(function(modeling, commandStack) {

        // given
        modeling.removeConnection(connection);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(connectionLabel.parent).not.to.exist;
        expect(connectionLabel.labelTarget).not.to.exist;

        expect(otherConnectionLabel.parent).not.to.exist;
        expect(otherConnectionLabel.labelTarget).not.to.exist;

        expect(connection.labels).to.be.empty;

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

        expect(otherLabel.parent).not.to.exist;
        expect(otherLabel.labelTarget).not.to.exist;

        expect(childShape.labels).to.be.empty;

        expect(childShape.label).not.to.exist;
      }));


      it('undo', inject(function(modeling, commandStack) {

        // given
        modeling.removeShape(childShape);

        // when
        commandStack.undo();

        // then
        expect(label.parent).to.equal(parentShape);
        expect(label.labelTarget).to.equal(childShape);

        expect(otherLabel.parent).to.equal(parentShape);
        expect(otherLabel.labelTarget).to.equal(childShape);

        expect(childShape.labels).to.eql([
          label,
          otherLabel
        ]);

        expect(childShape.label).to.eql(label);
      }));


      it('redo', inject(function(modeling, commandStack) {

        // given
        modeling.removeShape(childShape);

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(label.parent).not.to.exist;
        expect(label.labelTarget).not.to.exist;

        expect(otherLabel.parent).not.to.exist;
        expect(otherLabel.labelTarget).not.to.exist;

        expect(childShape.labels).to.be.empty;

        expect(childShape.label).not.to.exist;
      }));

    });


    it('should move with closure', inject(function(modeling, eventBus) {

      // given
      var listener = spy(function(event) {

        var closure = event.context.closure;

        // labels are part of closure
        expect(closure.allShapes).to.contain.keys(
          label.id,
          otherLabel.id
        );

        // labels did move with closure
        expect(label).to.have.position({ x: 235, y: 240 });
        expect(otherLabel).to.have.position({ x: 235, y: 290 });
      });

      eventBus.once('commandStack.elements.move.postExecuted', 5000, listener);

      // when
      modeling.moveElements([ childShape ], { x: 75, y: 10 });

      // then
      expect(listener).to.have.been.called;
    }));

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


    describe('should drag move with labelTarget', function() {

      it('execute', inject(function(move, dragging) {
        // when
        move.start(canvasEvent({ x: 225, y: 275 }), childShape);

        dragging.move(canvasEvent({ x: 300, y: 285 }));
        dragging.end();

        // then
        expect(label).to.have.position({ x: 235, y: 240 });
        expect(otherLabel).to.have.position({ x: 235, y: 290 });
      }));


      it('undo', inject(function(move, dragging, commandStack) {
        // given
        move.start(canvasEvent({ x: 225, y: 275 }), childShape);

        dragging.move(canvasEvent({ x: 300, y: 285 }));
        dragging.end();

        // when
        commandStack.undo();

        // then
        expect(label).to.have.position({ x: 160, y: 230 });
        expect(otherLabel).to.have.position({ x: 160, y: 280 });
      }));


      it('redo', inject(function(move, dragging, commandStack) {
        // given
        move.start(canvasEvent({ x: 225, y: 275 }), childShape);

        dragging.move(canvasEvent({ x: 300, y: 275 }));
        dragging.end();

        // when
        commandStack.undo();
        commandStack.redo();

        // then
        expect(label).to.have.position({ x: 235, y: 230 });
        expect(otherLabel).to.have.position({ x: 235, y: 280 });
      }));

    });


    it('should keep on top of labelTarget', inject(function(move, dragging) {

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));
      dragging.end();

      var labelIdx = parentShape.children.indexOf(label),
          otherLabelIdx = parentShape.children.indexOf(otherLabel),
          childShapeIdx = parentShape.children.indexOf(childShape);

      // then
      expect(labelIdx).to.be.above(childShapeIdx);
      expect(otherLabelIdx).to.be.above(childShapeIdx);
    }));

  });


  describe('visuals', function() {

    it('should add marker', inject(function(elementRegistry, move, dragging) {
      // given
      var labelGfx = elementRegistry.getGraphics(label),
          otherLabelGfx = elementRegistry.getGraphics(otherLabel);

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));

      // then
      expect(svgClasses(labelGfx).has('djs-dragging')).to.be.true;
      expect(svgClasses(otherLabelGfx).has('djs-dragging')).to.be.true;
    }));


    it('should remove marker', inject(function(elementRegistry, move, dragging) {
      // given
      var labelGfx = elementRegistry.getGraphics(label),
          otherLabelGfx = elementRegistry.getGraphics(otherLabel);

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));
      dragging.end();

      // then
      expect(svgClasses(labelGfx).has('djs-dragging')).to.be.false;
      expect(svgClasses(otherLabelGfx).has('djs-dragging')).to.be.false;
    }));


    it('should be inside dragGroup', inject(function(elementRegistry, move, dragging) {

      // when
      move.start(canvasEvent({ x: 225, y: 275 }), childShape);

      dragging.move(canvasEvent({ x: 225, y: 150 }));

      var ctx = dragging.context().data.context;

      var children = ctx.dragGroup.childNodes;

      // then
      // two labels + shape
      expect(children).to.have.lengthOf(3);
    }));

  });


  describe('space tool integration', function() {

    var hostShape,
        attacherShape,
        attacherLabel;

    var attacherLabelPos;

    beforeEach(inject(function(canvas, modeling, elementFactory) {

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

      attacherLabelPos = {
        x: attacherLabel.x,
        y: attacherLabel.y
      };
    }));


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

});
