import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';

import { getChildren } from 'lib/features/snapping/SnapUtil';


describe('features/snapping - SnapUtil', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule
    ]
  }));

  var rootElement, shape1, shape2, connection;

  beforeEach(inject(function(canvas, elementFactory) {
    rootElement = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(rootElement);

    shape1 = canvas.addShape(elementFactory.createShape({
      id: 'shape1',
      x: 100, y: 100, width: 100, height: 100
    }));

    shape2 = canvas.addShape(elementFactory.createShape({
      id: 'shape2',
      x: 300, y: 100, width: 100, height: 100
    }));

    connection = canvas.addConnection(elementFactory.createConnection({
      id: 'connection',
      source: shape1,
      target: shape2,
      waypoints: [
        { x: 150, y: 200 },
        { x: 150, y: 300 }
      ]
    }));
  }));


  describe('#getChildren', function() {

    it('root', function() {

      // when
      var children = getChildren(rootElement);

      // then
      expect(children).to.have.length(3);
    });


    it('shape', function() {

      // when
      var children = getChildren(shape1);

      // then
      expect(children).to.have.length(0);
    });


    it('connection', function() {

      // when
      var children = getChildren(connection);

      // then
      expect(children).to.have.length(0);
    });
  });

});