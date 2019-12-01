import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - create shape', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));


  var rootShape, parentShape, newShape;

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

    newShape = elementFactory.createShape({
      id: 'newShape',
      x: 0, y: 0, width: 100, height: 100
    });

  }));

  var position = {
    x: 175,
    y: 175
  };


  describe('basics', function() {

    describe('should create', function() {

      it('execute', inject(function(modeling, elementRegistry) {

        // when
        modeling.createShape(newShape, position, parentShape);

        var shape = elementRegistry.get('newShape');

        // then
        expect(shape).to.include({
          id: 'newShape',
          x: 125, y: 125,
          width: 100, height: 100
        });

      }));


      it('undo', inject(function(modeling, commandStack, elementRegistry) {

        // given
        modeling.createShape(newShape, position, parentShape);

        // when
        commandStack.undo();

        var shape = elementRegistry.get('newShape');

        // then
        expect(shape).not.to.exist;
        expect(newShape.parent).not.to.exist;

        expect(parentShape.children).not.to.contain(newShape);
      }));


      it('redo', inject(function(modeling, commandStack, elementRegistry) {

        // given
        modeling.createShape(newShape, position, parentShape);

        commandStack.undo();

        // when
        commandStack.redo();

        var shape = elementRegistry.get('newShape');

        // then
        expect(shape).to.include({
          id: 'newShape',
          x: 125, y: 125,
          width: 100, height: 100
        });
      }));

    });


    it('should mark as changed', inject(function(eventBus, modeling, commandStack) {

      // given
      var changedSpy = sinon.spy(function(event) {
        expect(event.elements).to.have.length(1);
      });

      eventBus.on('elements.changed', changedSpy);

      // when
      modeling.createShape(newShape, position, parentShape);

      commandStack.undo();
      commandStack.redo();

      // then
      expect(changedSpy).to.have.been.calledThrice;
    }));


    it('should have a parent', inject(function(modeling) {

      // given
      modeling.createShape(newShape, position, parentShape);

      // when
      var parent = newShape.parent;

      // then
      expect(parent).to.equal(parentShape);
    }));


    it('should have parentIndex', inject(function(modeling) {

      // given
      modeling.createShape(newShape, position, rootShape, 0);

      // when
      var children = rootShape.children;

      // then
      expect(children).to.eql([
        newShape,
        parentShape
      ]);
    }));


    it('should return a graphics element', inject(function(modeling, elementRegistry) {

      // given
      modeling.createShape(newShape, position, parentShape);

      // when
      var shape = elementRegistry.getGraphics(newShape);

      // then
      expect(shape).to.exist;
    }));

  });

});
