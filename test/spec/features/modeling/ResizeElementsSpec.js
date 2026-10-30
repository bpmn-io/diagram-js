import { expect } from 'chai';

import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';


describe('features/modeling - resize elements', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));


  var shape1, shape2, connection;

  beforeEach(inject(function(elementFactory, canvas) {

    shape1 = canvas.addShape(elementFactory.createShape({
      id: 'shape1',
      x: 100, y: 100,
      width: 100, height: 100
    }));

    shape2 = canvas.addShape(elementFactory.createShape({
      id: 'shape2',
      x: 300, y: 100,
      width: 100, height: 100
    }));

    connection = canvas.addConnection(elementFactory.createConnection({
      id: 'connection',
      waypoints: [ { x: 200, y: 150 }, { x: 300, y: 150 } ],
      source: shape1,
      target: shape2
    }));
  }));


  describe('should resize and move', function() {

    beforeEach(inject(function(modeling) {

      // when
      modeling.resizeElements([ shape1, shape2 ], {
        shape1: { x: 100, y: 100, width: 200, height: 100 },
        shape2: { x: 450, y: 100, width: 100, height: 100 }
      }, 'e');
    }));


    it('<do>', function() {

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
      expect(shape2).to.have.bounds({ x: 450, y: 100, width: 100, height: 100 });

      expect(connection).to.have.waypoints([
        { x: 200, y: 150 },
        { x: 500, y: 150 }
      ]);
    });


    it('<undo>', inject(function(commandStack) {

      // when
      commandStack.undo();

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 100, height: 100 });
      expect(shape2).to.have.bounds({ x: 300, y: 100, width: 100, height: 100 });

      expect(connection).to.have.waypoints([
        { x: 200, y: 150 },
        { x: 300, y: 150 }
      ]);
    }));


    it('<redo>', inject(function(commandStack) {

      // when
      commandStack.undo();
      commandStack.redo();

      // then
      expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
      expect(shape2).to.have.bounds({ x: 450, y: 100, width: 100, height: 100 });
    }));

  });


  it('should move children along', inject(function(elementFactory, canvas, modeling) {

    // given
    var parent = canvas.addShape(elementFactory.createShape({
      id: 'parent',
      x: 100, y: 300,
      width: 300, height: 200
    }));

    var child = canvas.addShape(elementFactory.createShape({
      id: 'child',
      x: 200, y: 350,
      width: 50, height: 50
    }), parent);

    // when
    modeling.resizeElements([ parent ], {
      parent: { x: 0, y: 300, width: 300, height: 300 }
    }, 'nw');

    // then
    expect(child).to.have.bounds({ x: 100, y: 450, width: 50, height: 50 });
  }));


  it('should move children of moved shape along', inject(function(elementFactory, canvas, modeling) {

    // given
    var parent = canvas.addShape(elementFactory.createShape({
      id: 'parent',
      x: 100, y: 300,
      width: 300, height: 200
    }));

    var child = canvas.addShape(elementFactory.createShape({
      id: 'child',
      x: 200, y: 350,
      width: 50, height: 50
    }), parent);

    // when
    modeling.resizeElements([ child, parent ], {
      parent: { x: 200, y: 300, width: 300, height: 200 },
      child: { x: 250, y: 350, width: 50, height: 50 }
    }, 'e');

    // then
    expect(parent).to.have.bounds({ x: 200, y: 300, width: 300, height: 200 });
    expect(child).to.have.bounds({ x: 250, y: 350, width: 50, height: 50 });
  }));


  it('should skip elements without new bounds', inject(function(modeling) {

    // when
    modeling.resizeElements([ shape1, shape2 ], {
      shape1: { x: 100, y: 100, width: 200, height: 100 }
    }, 'e');

    // then
    expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
    expect(shape2).to.have.bounds({ x: 300, y: 100, width: 100, height: 100 });
  }));

});
