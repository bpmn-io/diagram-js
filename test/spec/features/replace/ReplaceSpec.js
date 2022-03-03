import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import replaceModule from 'lib/features/replace';

import {
  query as domQuery
} from 'min-dom';


describe('features/replace', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      replaceModule
    ]
  }));

  var rootShape, parentShape, originalShape;

  beforeEach(inject(function(elementFactory, canvas) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    originalShape = elementFactory.createShape({
      id: 'originalShape',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(originalShape, parentShape);
  }));


  describe('#replaceElement', function() {

    it('should add new shape', inject(function(elementRegistry, replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // when
      var newShape = replace.replaceElement(originalShape, replacement);

      // then
      expect(newShape).to.exist;

      // expect added
      expect(elementRegistry.get('replacement')).to.equal(newShape);
    }));


    it('should define custom attributes on new shape', inject(function(replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200,
        customArray: [ 'FOO', 'BAR' ],
        customString: 'foobar'
      };

      // when
      var newShape = replace.replaceElement(originalShape, replacement);

      // then
      expect(newShape.customArray).to.equal(replacement.customArray);
      expect(newShape.customString).to.equal(replacement.customString);
    }));


    it('should delete old shape', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      expect(originalShape.parent).to.be.null;
    }));


    it('should return new shape', inject(function(elementRegistry, replace) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // shape replacement
      var newShape = replace.replaceElement(originalShape, replacement);

      // then
      expect(newShape).to.exist;
      expect(newShape.id).to.equal('replacement');
    }));


    it('should add correct attributes to new shape', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      var replacementShape = elementRegistry.get('replacement');
      expect(replacementShape.x).to.equal(110);
      expect(replacementShape.y).to.equal(110);
      expect(replacementShape.width).to.equal(200);
      expect(replacementShape.height).to.equal(200);
    }));


    it('should retain position when setting odd height', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 201
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      var replacementShape = elementRegistry.get('replacement');
      expect(replacementShape.x).to.equal(110);
      expect(replacementShape.y).to.equal(110);
      expect(replacementShape.width).to.equal(200);
      expect(replacementShape.height).to.equal(201);
    }));


    it('should retain position when setting odd width', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 201,
        height: 200
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      var replacementShape = elementRegistry.get('replacement');
      expect(replacementShape.x).to.equal(110);
      expect(replacementShape.y).to.equal(110);
      expect(replacementShape.width).to.equal(201);
      expect(replacementShape.height).to.equal(200);
    }));


    it('should retain position when setting odd width and height', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 201,
        height: 201
      };

      // shape replacement
      replace.replaceElement(originalShape, replacement);

      // then
      var replacementShape = elementRegistry.get('replacement');
      expect(replacementShape.x).to.equal(110);
      expect(replacementShape.y).to.equal(110);
      expect(replacementShape.width).to.equal(201);
      expect(replacementShape.height).to.equal(201);
    }));


    it('should replace with new bounds', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200,
        x: 10,
        y: 50
      };

      // shape replacement
      var replacedShape = replace.replaceElement(originalShape, replacement);

      // then
      expect(replacedShape).to.have.bounds({
        width: 200,
        height: 200,
        x: 10,
        y: 50
      });
    }));

  });


  describe('reconnect', function() {

    var sourceShape,
        targetShape,
        connection;

    beforeEach(inject(function(elementFactory, canvas, modeling) {

      sourceShape = originalShape;

      targetShape = elementFactory.createShape({
        id: 'targetShape',
        x: 290, y: 110, width: 100, height: 100
      });

      canvas.addShape(targetShape, parentShape);

      connection = modeling.createConnection(sourceShape, targetShape, {
        id: 'connection',
        waypoints: [ { x: 210, y: 160 }, { x: 290, y: 160 } ]
      }, parentShape);

      // canvas.addConnection(connection);
    }));


    it('should reconnect start', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        width: 120,
        height: 120,
        x: 80,
        y: 80
      };

      // when
      var replacedShape = replace.replaceElement(sourceShape, replacement);

      // then
      expect(replacedShape.outgoing[0]).to.eql(connection);

      expect(connection).to.have.waypoints([
        { x: 200, y: 140 },
        { x: 340, y: 160 }
      ]);
    }));


    it('should reconnect end', inject(function(elementFactory, replace, elementRegistry) {

      // given
      var replacement = {
        id: 'replacement',
        x: 280,
        y: 120,
        width: 80,
        height: 80
      };

      // when
      var replacedShape = replace.replaceElement(targetShape, replacement);

      // then
      expect(replacedShape.incoming[0]).to.eql(connection);

      expect(connection).to.have.waypoints([
        { x: 160, y: 160 },
        { x: 290, y: 160 }
      ]);
    }));


    it('should adopt children', inject(function(elementFactory, replace, elementRegistry, eventBus) {

      // given
      var replacement = {
        id: 'replacement',
        width: 300,
        height: 300
      };

      // when
      var newShape = replace.replaceElement(parentShape, replacement);

      // then
      expect(newShape.children).to.contain(originalShape);
      expect(newShape.children).to.contain(connection);
      expect(newShape.children).to.contain(targetShape);

      expect(originalShape.parent).to.eql(newShape);
      expect(connection.parent).to.eql(newShape);
      expect(targetShape.parent).to.eql(newShape);

      expect(originalShape.outgoing).to.contain(connection);
      expect(targetShape.incoming).to.contain(connection);
    }));


    it('should adopt children and show them in the DOM',
      inject(function(canvas, elementFactory, replace, elementRegistry) {

        // given
        var replacement = {
          id: 'replacement',
          width: 300,
          height: 300
        };

        // when
        replace.replaceElement(parentShape, replacement);

        var newShapeContainer = domQuery('[data-element-id="replacement"]', canvas.getContainer());

        // then
        expect(domQuery('[data-element-id="originalShape"]', newShapeContainer.parentNode)).to.exist;
        expect(domQuery('[data-element-id="targetShape"]', newShapeContainer.parentNode)).to.exist;
      })
    );


    it('should retain moved children in command context', inject(function(replace, eventBus) {

      // given
      var replacement = {
        id: 'replacement',
        width: 300,
        height: 300
      };

      eventBus.on('commandStack.elements.move.postExecuted', function(event) {

        // then
        var shapes = event.context.shapes;
        expect(shapes).not.to.be.empty;
        expect(shapes).to.have.length(3);
      });

      // when
      replace.replaceElement(parentShape, replacement);
    }));

  });


  describe('undo/redo support', function() {

    it('should undo replace', inject(function(elementFactory, replace, elementRegistry, commandStack) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };
      replace.replaceElement(originalShape, replacement);

      // when
      commandStack.undo();

      // then
      var shape = elementRegistry.get('originalShape');
      expect(shape.width).to.equal(100);
    }));


    it('should redo', inject(function(elementFactory, replace, elementRegistry, commandStack) {

      // given
      var replacement = {
        id: 'replacement',
        width: 200,
        height: 200
      };
      replace.replaceElement(originalShape, replacement);

      var replacementShape = elementRegistry.get('replacement');
      var replacement2 = {
        id: 'replacement2',
        width: 280,
        height: 280
      };
      replace.replaceElement(replacementShape, replacement2);

      // when
      commandStack.undo();
      commandStack.undo();

      commandStack.redo();
      commandStack.redo();

      // then
      var redoShape = elementRegistry.get('replacement2');
      expect(redoShape.width).to.equal(280);
    }));

  });

});
