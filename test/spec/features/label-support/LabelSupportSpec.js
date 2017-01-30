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
  var multiParentShape, multiChildShape, label2, label3; // Variables for multi label test cases  

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
    
    label3 = elementFactory.createLabel({
      id: 'label3',
      width: 80, height: 40
    });

    modeling.createLabel(multiChildShape, { x: 300, y: 350 }, label2, multiParentShape);
    modeling.createLabel(multiChildShape, { x: 300, y: 400 }, label3, multiParentShape);

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

    
    it('should move multiple labels', inject(function(modeling) {
      // when
      modeling.moveElements([ label2, label3 ], { x: 75, y: 0 }, multiParentShape);
        
      // then
      expect(label2.x).to.eql(335);
      expect(label2.y).to.eql(330);
      expect(label3.x).to.eql(335);
      expect(label3.y).to.eql(380);
        
    }));
    
    
    it('should move multiple labels with labelTarget', inject(function(modeling) {
      // when
      modeling.moveElements([ multiChildShape ], { x: 75, y: 0 }, multiParentShape);
        
      // then
      expect(label2.x).to.eql(335);
      expect(label2.y).to.eql(330);
      expect(label3.x).to.eql(335);
      expect(label3.y).to.eql(380);
      
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
      
      
      it('should remove multi labels with connection', inject(function(modeling) {

        var connectionLabel1 = modeling.createLabel(connection, { x: 160, y: 145 });
        var connectionLabel2 = modeling.createLabel(connection, { x: 160, y: 185 });

        // when
        modeling.removeConnection(connection);

        // then
        expect(connectionLabel1.parent).not.to.exist;
        expect(connectionLabel1.labelTarget).not.to.exist;
        expect(connectionLabel2.parent).not.to.exist;
        expect(connectionLabel2.labelTarget).not.to.exist;

        expect(connection.labels[0]).not.to.exist;
        expect(connection.labels[1]).not.to.exist;
      }));


      it('should undo remove multi labels', inject(function(modeling, commandStack) {

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

        expect(connection.labels[0]).to.equal(connectionLabel2);
        expect(connection.labels[1]).to.equal(connectionLabel1);
      }));


      it('should redo remove multi labels', inject(function(modeling, commandStack) {

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

        expect(connection.labels[0]).not.to.exist;
        expect(connection.labels[1]).not.to.exist;
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
      
      
      it('should remove multi labels', inject(function(modeling) {

        var label1 = modeling.createLabel(childShape, { x: 160, y: 145 });
        var label2 = modeling.createLabel(childShape, { x: 160, y: 185 });

        // when
        modeling.removeShape(childShape);

        // then
        expect(label1.parent).not.to.exist;
        expect(label1.labelTarget).not.to.exist;
        expect(label2.parent).not.to.exist;
        expect(label2.labelTarget).not.to.exist;

        expect(childShape.labels[0]).not.to.exist;
        expect(childShape.labels[1]).not.to.exist;
      }));


      it('should undo remove multi labels', inject(function(modeling, commandStack) {

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

        expect(childShape.labels[0]).to.equal(label2);
        expect(childShape.labels[1]).to.equal(label1);
      }));


      it('should redo remove multi labels', inject(function(modeling, commandStack) {

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

        expect(childShape.labels[0]).not.to.exist;
        expect(childShape.labels[1]).not.to.exist;
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
    
    describe('should move with labelTarget with multi labels', function() {

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
    
    
    it('should keep on top of labelTarget with multi labels', inject(function(move, dragging) {

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
    
    
    it('should add marker with multi labels', inject(function(elementRegistry, move, dragging) {
      var label1Gfx = elementRegistry.getGraphics(label2);
      var label2Gfx = elementRegistry.getGraphics(label3);

      // when
      move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

      dragging.move(canvasEvent({ x: 325, y: 250 }));

      // then
      expect(svgClasses(label1Gfx).has('djs-dragging')).to.be.true;
      expect(svgClasses(label2Gfx).has('djs-dragging')).to.be.true;
    }));


    it('should remove marker with multi labels', inject(function(elementRegistry, move, dragging) {

      // when
      move.start(canvasEvent({ x: 325, y: 375 }), multiChildShape);

      dragging.move(canvasEvent({ x: 325, y: 250 }));
      dragging.end();

      var label1Gfx = elementRegistry.getGraphics(label2);
      var label2Gfx = elementRegistry.getGraphics(label3);
      // then
      expect(svgClasses(label1Gfx).has('djs-dragging')).to.be.false;
      expect(svgClasses(label2Gfx).has('djs-dragging')).to.be.false;
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
