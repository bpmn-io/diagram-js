import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - remove connection', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));


  var rootShape, parentShape, childShape, childShape2, connection;

  beforeEach(inject(function(elementFactory, canvas, elementRegistry) {

    rootShape = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootShape);

    parentShape = elementFactory.createShape({
      id: 'parent',
      x: 100, y: 100, width: 300, height: 300
    });

    canvas.addShape(parentShape, rootShape);

    childShape = elementFactory.createShape({
      id: 'child',
      x: 110, y: 110, width: 100, height: 100
    });

    canvas.addShape(childShape, parentShape);

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


  it('should remove connection', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeConnection(connection);

    // then
    expect(connection.parent).not.to.exist;
  }));


  it('should clean up incoming/outgoing on connected shapes ', inject(function(modeling, elementRegistry) {

    // when
    modeling.removeConnection(connection);

    // then
    expect(childShape.outgoing).not.to.contain(connection);
    expect(connection.source).not.to.exist;

    expect(childShape2.incoming).not.to.contain(connection);
    expect(connection.target).not.to.exist;
  }));


  describe('undo support', function() {

    it('should revert', inject(function(modeling, elementRegistry, commandStack) {

      // given
      modeling.removeConnection(connection);

      // when
      commandStack.undo();

      // then
      expect(connection.parent).to.equal(parentShape);
    }));


    it('should restore correct source/target', inject(function(modeling, elementRegistry, commandStack) {

      // given
      modeling.removeConnection(connection);

      // when
      commandStack.undo();

      // then
      expect(childShape.outgoing).to.contain(connection);
      expect(connection.source).to.equal(childShape);

      expect(childShape2.incoming).to.contain(connection);
      expect(connection.target).to.equal(childShape2);
    }));


    it('should restore reference after multiple undo', inject(function(modeling, elementRegistry, commandStack) {

      // given
      modeling.removeConnection(connection);
      modeling.removeShape(childShape);

      // when
      commandStack.undo();
      commandStack.undo();

      // then
      expect(childShape.outgoing).to.contain(connection);
      expect(childShape2.incoming).to.contain(connection);
    }));
  });

});
