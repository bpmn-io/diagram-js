import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - replace shape', function() {

  beforeEach(bootstrapDiagram({ modules: [ modelingModule ] }));

  describe('same size', function() {

    var root, parent, child1, child2;

    beforeEach(inject(function(elementFactory, canvas, modeling) {

      root = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(root);

      parent = elementFactory.createShape({
        id: 'parent',
        x: 20, y: 20, width: 200, height: 200
      });

      child1 = elementFactory.createShape({
        id: 'child1',
        x: 30, y: 30, width: 50, height: 50
      });

      child2 = elementFactory.createShape({
        id: 'child2',
        x: 90, y: 90, width: 50, height: 50
      });

      canvas.addShape(parent, root);
      canvas.addShape(child1, parent);
      canvas.addShape(child2, parent);
    }));


    it('should move children by default', inject(function(elementFactory, modeling) {

      // when
      var newShapeData = { x: 120, y: 120, width: 200, height: 200 };
      var newShape = modeling.replaceShape(parent, newShapeData);

      // then
      expect(newShape.children).to.have.length(2);
    }));


    it('should move children when moveChildren=true', inject(function(elementFactory, modeling) {

      // when
      var newShapeData = { x: 120, y: 120, width: 200, height: 200 };
      var newShape = modeling.replaceShape(parent, newShapeData, { moveChildren: true });

      // then
      expect(newShape.children).to.have.length(2);
    }));


    it('should remove children when moveChildren=false', inject(function(elementFactory, modeling) {

      // when
      var newShapeData = { x: 120, y: 120, width: 200, height: 200 };
      var newShape = modeling.replaceShape(parent, newShapeData, { moveChildren: false });

      // then
      expect(newShape.children).to.be.empty;

    }));

  });

  describe('hints', function() {

    var root, parent, shape1, shape2, connection;

    beforeEach(inject(function(canvas, elementFactory) {
      root = elementFactory.createRoot({
        id: 'root'
      });

      canvas.setRootElement(root);

      shape1 = elementFactory.createShape({
        id: 'shape1',
        x: 0, y: 0, width: 100, height: 100
      });

      canvas.addShape(shape1, root);

      shape2 = elementFactory.createShape({
        id: 'shape2',
        x: 200, y: 0, width: 100, height: 100
      });

      canvas.addShape(shape2, root);

      connection = elementFactory.createConnection({
        id: 'connection',
        source: shape1,
        target: shape2,
        waypoints: [
          { x: 100, y: 50 },
          { x: 200, y: 50 }
        ]
      });

      canvas.addConnection(connection, parent);
    }));


    it('should pass hints', inject(function(modeling) {

      // given
      var newShapeData = { x: 50, y: 50, width: 100, height: 100 },
          hints = { foo: 'foo' };

      var moveElementsSpy = sinon.spy(modeling, 'moveElements'),
          reconnectStartSpy = sinon.spy(modeling, 'reconnectStart');

      // when
      modeling.replaceShape(shape1, newShapeData, hints);

      // then
      expect(moveElementsSpy).to.have.been.called;
      expect(moveElementsSpy.firstCall.args[ 3 ]).to.eql(hints);

      expect(reconnectStartSpy).to.have.been.called;
      expect(reconnectStartSpy.firstCall.args[ 3 ]).to.eql(hints);
    }));

  });

});
