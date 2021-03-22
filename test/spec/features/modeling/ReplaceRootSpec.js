import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import {
  Root
} from '../../../../lib/model';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - replace root', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));

  var root, child1, child2;

  beforeEach(inject(function(elementFactory, canvas) {

    root = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(root);

    child1 = elementFactory.createShape({
      id: 'child1',
      x: 30, y: 30, width: 50, height: 50
    });

    child2 = elementFactory.createShape({
      id: 'child2',
      x: 90, y: 90, width: 50, height: 50
    });

    canvas.addShape(child1, root);
    canvas.addShape(child2, root);
  }));


  describe('basics', function() {

    it('should return new root', inject(function(canvas, modeling) {

      // given
      var newRootData = {
        id: 'rootNew'
      };

      // when
      var newRoot = modeling.replaceRoot(root, newRootData);

      // then
      var canvasRoot = canvas.getRootElement();

      expect(newRoot).to.equal(canvasRoot);
    }));


    it('should create new root object', inject(function(modeling) {

      // given
      var newRootData = {
        id: 'rootNew'
      };

      // when
      var newRoot = modeling.replaceRoot(root, newRootData);

      // then
      expect(newRoot).to.be.an.instanceof(Root);
    }));


    it('should re-use given root object', inject(function(elementFactory, modeling) {

      // given
      var newRoot = elementFactory.create('root', {
        id: 'rootNew'
      });

      // when
      var newRootReturned = modeling.replaceRoot(root, newRoot);

      // then
      expect(newRootReturned).to.equal(newRoot);
    }));


    it('should move children', inject(function(modeling) {

      // given
      var newRootData = {
        id: 'rootNew'
      };

      // when
      var newRoot = modeling.replaceRoot(root, newRootData);

      // then
      expect(newRoot.children).to.have.length(2);
    }));


    it('should pass custom attributes', inject(function(modeling) {

      // given
      var newRootData = {
        id: 'rootNew',
        foo: 'bar'
      };

      // when
      var newRoot = modeling.replaceRoot(root, newRootData);

      // then
      expect(newRoot.foo).to.equal('bar');
    }));

  });


  describe('should update the commandStack', function() {

    it('undo', inject(function(canvas, commandStack, modeling) {

      // given
      var newRootData = {
        id: 'rootNew'
      };
      modeling.replaceRoot(root, newRootData);

      // when
      commandStack.undo();

      // then
      var rootCanvas = canvas.getRootElement();

      expect(rootCanvas).to.equal(root);
    }));


    it('redo', inject(function(canvas, modeling, commandStack) {

      // given
      var newRootData = {
        id: 'rootNew'
      };
      var newRoot = modeling.replaceRoot(root, newRootData);

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      var rootCanvas = canvas.getRootElement();

      expect(rootCanvas).to.equal(newRoot);
    }));

  });

});
