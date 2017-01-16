'use strict';

var canvasEvent = require('../../../util/MockEvents').createCanvasEvent;

/* global bootstrapDiagram, inject */


var labelSupportModule = require('../../../../lib/features/label-support'),
    modelingModule = require('../../../../lib/features/modeling'),
    rulesModule = require('./rules');

var svgClasses = require('tiny-svg/lib/classes');


describe('features/label-support - Label', function() {

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


  var rootShape, parentShape, childShape, label;

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
  }));


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

  });


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


    describe('with shape', function() {

      it('should remove label', inject(function(modeling) {

        var label = modeling.createLabel(childShape, { x: 160, y: 145 });

        // when
        modeling.removeShape(childShape);

        // then
        expect(label.parent).not.to.exist;
        expect(label.labelTarget).not.to.exist;

        expect(childShape.label).not.to.exist;
      }));


      it('should undo remove label', inject(function(modeling, commandStack) {

        var label = modeling.createLabel(childShape, { x: 160, y: 145 });

        // when
        modeling.removeShape(childShape);
        commandStack.undo();

        // then
        expect(label.parent).to.equal(parentShape);
        expect(label.labelTarget).to.equal(childShape);

        expect(childShape.label).to.equal(label);
      }));


      it('should redo remove label', inject(function(modeling, commandStack) {

        var label = modeling.createLabel(childShape, { x: 160, y: 145 });

        // when
        modeling.removeShape(childShape);
        commandStack.undo();
        commandStack.redo();

        // then
        expect(label.parent).not.to.exist;
        expect(label.labelTarget).not.to.exist;

        expect(childShape.label).not.to.exist;
      }));

    });

  });


  describe('moving', function() {

    describe('should move with labelTarget', function() {

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
