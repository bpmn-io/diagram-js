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


  describe('should resize', function() {

    beforeEach(inject(function(modeling) {

      // when
      modeling.resizeElements([ shape1, shape2 ], {
        shape1: { x: 100, y: 100, width: 200, height: 100 },
        shape2: { x: 450, y: 100, width: 100, height: 100 }
      });
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


  it('should skip elements without new bounds', inject(function(modeling) {

    // when
    modeling.resizeElements([ shape1, shape2 ], {
      shape1: { x: 100, y: 100, width: 200, height: 100 }
    });

    // then
    expect(shape1).to.have.bounds({ x: 100, y: 100, width: 200, height: 100 });
    expect(shape2).to.have.bounds({ x: 300, y: 100, width: 100, height: 100 });
  }));

});
