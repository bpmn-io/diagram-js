'use strict';

/* global bootstrapDiagram, inject */


var layoutModule = {
  connectionDocking: [ 'type', require('../../../lib/layout/CroppingConnectionDocking') ]
};


function mid(shape) {
  return {
    x: shape.x + shape.width / 2,
    y: shape.y + shape.height / 2
  };
}


describe('features/layout/CroppingConnectionDocking', function() {

  beforeEach(bootstrapDiagram({ modules: [ layoutModule ] }));

  var topLeftShape,
      bottomRightShape,
      bottomLeftShape,
      topLeft_bottomLeftConnection,
      bottomLeft_bottomRightConnection,
      topLeft_bottomRightConnection,
      topLeft_bottomRightFreeStyleConnection,
      backAndForthConnection,
      unconnectedConnection;

  beforeEach(inject(function(canvas) {

    topLeftShape = canvas.addShape({
      id: 's-topLeft',
      x: 100, y: 100,
      width: 100, height: 100
    });

    bottomLeftShape = canvas.addShape({
      id: 's-bottomLeft',
      x: 100, y: 400,
      width: 100, height: 100
    });

    bottomRightShape = canvas.addShape({
      id: 's-bottomRight',
      x: 400, y: 400,
      width: 100, height: 100
    });

    function createConnection(id, startShape, endShape) {

      return canvas.addConnection({
        id: id,
        waypoints: [ mid(startShape), mid(endShape) ],
        source: startShape,
        target: endShape
      });
    }

    topLeft_bottomLeftConnection = createConnection('c-topLeft-bottomLeft', topLeftShape, bottomLeftShape);
    topLeft_bottomRightConnection = createConnection('c-topLeft-bottomRight', topLeftShape, bottomRightShape);
    bottomLeft_bottomRightConnection = createConnection('c-bottomLeft-bottomRight', bottomLeftShape, bottomRightShape);

    topLeft_bottomRightFreeStyleConnection = canvas.addConnection({
      id: 'c-freestyle',
      waypoints: [ mid(topLeftShape), { x: 250, y: 250 }, { x: 350, y: 250 }, { x: 350, y: 350 }, mid(bottomRightShape) ],
      source: topLeftShape,
      target: bottomRightShape
    });

    backAndForthConnection = canvas.addConnection({
      id: 'c-backandforth',
      waypoints: [ mid(topLeftShape), { x: 300, y: 150 }, { x: 300, y: 200 }, mid(topLeftShape), mid(bottomRightShape) ],
      source: topLeftShape,
      target: bottomRightShape
    });

    unconnectedConnection = canvas.addConnection({
      id: 'c-unconnected',
      waypoints: [ { x: 130, y: 210 }, { x: 130, y: 390 } ],
      source: topLeftShape,
      target: bottomLeftShape
    });

  }));


  describe('#getDockingPoint', function() {

    it('should compute docking points', inject(function(connectionDocking, canvas) {

      function expectDockingPoint(connection, shape, expected) {
        var dockingPoint = connectionDocking.getDockingPoint(connection, shape);

        canvas._svg.circle(dockingPoint.actual.x, dockingPoint.actual.y, 4);

        expect(dockingPoint).to.eql(expected);
      }

      // vertical source docking
      expectDockingPoint(topLeft_bottomLeftConnection, topLeft_bottomLeftConnection.source, {
        point : { x: 150, y: 150 },
        actual : { x : 150, y : 200 },
        idx : 0
      });

      // vertical target docking
      expectDockingPoint(topLeft_bottomLeftConnection, topLeft_bottomLeftConnection.target, {
        point : { x : 150, y : 450 },
        actual : { x : 150, y : 400 },
        idx : 1
      });

      // horizontal source docking
      expectDockingPoint(bottomLeft_bottomRightConnection, bottomLeft_bottomRightConnection.source, {
        point : { x : 150, y : 450 },
        actual : { x : 200, y : 450 },
        idx : 0
      });

      // vertical target docking
      expectDockingPoint(bottomLeft_bottomRightConnection, bottomLeft_bottomRightConnection.target, {
        point : { x : 450, y : 450 },
        actual : { x : 400, y : 450 },
        idx : 1
      });

      // diagonal source docking
      expectDockingPoint(topLeft_bottomRightConnection, topLeft_bottomRightConnection.source, {
        point : { x : 150, y : 150 },
        actual : { x : 200, y : 200 },
        idx : 0
      });

      // vertical target docking
      expectDockingPoint(topLeft_bottomRightConnection, topLeft_bottomRightConnection.target, {
        point : { x : 450, y : 450 },
        actual : { x : 400, y : 400 },
        idx : 1
      });
    }));


    it('should take shape x,y from shape', inject(function(connectionDocking, canvas) {

      function expectDockingPoint(connection, shape, expected) {
        var dockingPoint = connectionDocking.getDockingPoint(connection, shape);

        canvas._svg.circle(dockingPoint.actual.x, dockingPoint.actual.y, 4);

        expect(dockingPoint).to.eql(expected);
      }


      var shape = topLeft_bottomRightConnection.target;

      // simulate position update
      shape.x = shape.x + 20;
      shape.y = shape.y + 20;


      // vertical target docking
      expectDockingPoint(topLeft_bottomRightConnection, shape, {
        point : { x : 450, y : 450 },
        actual : { x : 420, y : 420 },
        idx : 1
      });
    }));


    it('should fallback if no intersection', inject(function(connectionDocking, canvas) {

      function expectDockingPoint(connection, shape, expected) {
        var dockingPoint = connectionDocking.getDockingPoint(connection, shape);

        canvas._svg.circle(dockingPoint.actual.x, dockingPoint.actual.y, 4);

        expect(dockingPoint).to.eql(expected);
      }

      // non intersecting (source)
      expectDockingPoint(unconnectedConnection, unconnectedConnection.source, {
        point : unconnectedConnection.waypoints[0],
        actual : unconnectedConnection.waypoints[0],
        idx : 0
      });

      // non intersecting (target)
      expectDockingPoint(unconnectedConnection, unconnectedConnection.target, {
        point : unconnectedConnection.waypoints[1],
        actual : unconnectedConnection.waypoints[1],
        idx : 1
      });
    }));

  });


  describe('#getCroppedWaypoints', function() {

    it('should crop connection', inject(function(connectionDocking) {

      // vertical connection
      expect(connectionDocking.getCroppedWaypoints(topLeft_bottomLeftConnection)).to.eql([
        { x: 150, y: 200, original: topLeft_bottomLeftConnection.waypoints[0] },
        { x: 150, y: 400, original: topLeft_bottomLeftConnection.waypoints[1]  }
      ]);

      expect(connectionDocking.getCroppedWaypoints(bottomLeft_bottomRightConnection)).to.eql([
        { x: 200, y: 450, original: bottomLeft_bottomRightConnection.waypoints[0] },
        { x: 400, y: 450, original: bottomLeft_bottomRightConnection.waypoints[1] }
      ]);

      expect(connectionDocking.getCroppedWaypoints(topLeft_bottomRightConnection)).to.eql([
        { x: 200, y: 200, original: topLeft_bottomRightConnection.waypoints[0] },
        { x: 400, y: 400, original: topLeft_bottomRightConnection.waypoints[1] }
      ]);

      expect(connectionDocking.getCroppedWaypoints(backAndForthConnection)).to.eql([
        { x: 200, y: 200, original: backAndForthConnection.waypoints[0] },
        backAndForthConnection.waypoints[1],
        backAndForthConnection.waypoints[2],
        backAndForthConnection.waypoints[3],
        { x: 400, y: 400, original: backAndForthConnection.waypoints[4] }
      ]);


      expect(connectionDocking.getCroppedWaypoints(topLeft_bottomRightFreeStyleConnection)).to.eql([
        { x: 200, y: 200, original: topLeft_bottomRightFreeStyleConnection.waypoints[0] },
        topLeft_bottomRightFreeStyleConnection.waypoints[1],
        topLeft_bottomRightFreeStyleConnection.waypoints[2],
        topLeft_bottomRightFreeStyleConnection.waypoints[3],
        { x: 400, y: 400, original: topLeft_bottomRightFreeStyleConnection.waypoints[4] }
      ]);

      // unconnected connection
      expect(connectionDocking.getCroppedWaypoints(unconnectedConnection)).to.eql([
        { x: 130, y: 210, original: unconnectedConnection.waypoints[0] },
        { x: 130, y: 390, original: unconnectedConnection.waypoints[1] }
      ]);

    }));

  });
});


describe('get one intersection point', function () {

  beforeEach(bootstrapDiagram({ modules: [ layoutModule ] }));

  var rootShape, shapeA, shapeB;

  beforeEach(inject(function(canvas) {

    shapeA = canvas.addShape({
      id: 'shapeA',
      x: 100, y: 100,
      width: 100, height: 100
    });

    shapeB = canvas.addShape({
      id: 'shapeB',
      x: 300, y: 100,
      width: 100, height: 100
    });

  }));


  it('should ignore the second intersection point from the right', inject(function(canvas, connectionDocking) {

    // given
    var connection = canvas.addConnection({
      id: 'connection',
      waypoints: [
        { x: 300, y: 150 },
        { x: 95, y: 150}
      ],
      source: shapeB,
      target: shapeA 
    });

    // then
    expect(connectionDocking.getCroppedWaypoints(connection)).to.eql([
      { x: 300, y: 150, original: connection.waypoints[0] },
      { x: 200, y: 150, original: connection.waypoints[1] }
    ]);

  }));;


  it('should ignore the second intersection point from the left', inject(function(canvas, connectionDocking) {

    //given
    var connection = canvas.addConnection({
      id: 'connection2',
      waypoints: [
        { x: 200, y: 150 },
        { x: 405, y: 150}
      ],
      source: shapeA,
      target: shapeB 
    });

    // then 
    expect(connectionDocking.getCroppedWaypoints(connection)).to.eql([
      { x: 200, y: 150, original: connection.waypoints[0] },
      { x: 300, y: 150, original: connection.waypoints[1] }
    ]);

  }));

});