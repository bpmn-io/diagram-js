'use strict';

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */


var labelSupportModule = require('../../../../lib/features/label-support'),
    modelingModule = require('../../../../lib/features/modeling'),
    rulesModule = require('./rules');

var svgClasses = require('tiny-svg/lib/classes');


describe('features/label-support', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      labelSupportModule,
      modelingModule,
      rulesModule
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

        // TODO(nikku): restore #connectionLabel as the primary label
        expect(connection.labels).to.eql([
          otherConnectionLabel,
          connectionLabel
        ]);

        expect(connection.label).to.equal(otherConnectionLabel);
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

        // when
        modeling.removeShape(childShape);
        commandStack.undo();

        // then
        expect(label.parent).to.equal(parentShape);
        expect(label.labelTarget).to.equal(childShape);

        expect(otherLabel.parent).to.equal(parentShape);
        expect(otherLabel.labelTarget).to.equal(childShape);

        // TODO(nikku): restore #label as the primary label
        expect(childShape.labels).to.eql([
          otherLabel,
          label
        ]);

        expect(childShape.label).to.equal(otherLabel);
      }));


      it('redo', inject(function(modeling, commandStack) {

        // when
        modeling.removeShape(childShape);
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

  });


  describe('moving', function() {

    describe('should move with labelTarget', function() {

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

});
