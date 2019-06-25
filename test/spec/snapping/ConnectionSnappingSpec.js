import {
  bootstrapDiagram,
  inject
} from 'test/TestHelper';

import modelingModule from 'lib/features/modeling';
import bendpointsModule from 'lib/features/bendpoints';
import connectModule from 'lib/features/connect';
import snappingModule from 'lib/features/snapping';

import {
  createCanvasEvent as canvasEvent
} from 'test/util/MockEvents';



describe('features/snapping - ConnectionSnapping', function() {

  beforeEach(bootstrapDiagram({
    modules: [
      modelingModule,
      bendpointsModule,
      connectModule,
      snappingModule
    ]
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));

  var root,
      shape1,
      shape2,
      shape3,
      connection;

  beforeEach(inject(function(canvas, elementFactory) {
    root = elementFactory.createRoot({
      id: 'root'
    });

    canvas.setRootElement(root);

    shape1 = elementFactory.createShape({
      id: 'shape1',
      x: 100,
      y: 100,
      width: 100,
      height: 100
    });

    canvas.addShape(shape1, root);

    shape2 = elementFactory.createShape({
      id: 'shape2',
      x: 300,
      y: 100,
      width: 100,
      height: 100
    });

    canvas.addShape(shape2, root);

    connection = elementFactory.createConnection({
      id: 'connection',
      source: shape1,
      target: shape2,
      waypoints: [
        { x: 150, y: 150 },
        { x: 350, y: 150 }
      ]
    });

    canvas.addConnection(connection, root);

    shape3 = elementFactory.createShape({
      id: 'shape3',
      x: 100,
      y: 300,
      width: 100,
      height: 100
    });

    canvas.addShape(shape3, root);
  }));

  beforeEach(inject(function(dragging) {
    dragging.setOptions({ manual: true });
  }));



  describe('reconnect start', function() {

    it('should snap to target middle if reconnecting start outside of shape',
      inject(function(bendpointMove, dragging, canvas) {

        // given
        var movedWaypoint = getFirstWaypoint(connection),
            targetPosition = { x: shape3.x - 5, y: shape3.y - 5 };

        // when
        bendpointMove.start(canvasEvent(movedWaypoint), connection, 0);

        dragging.move(canvasEvent(targetPosition));

        dragging.hover({ element: shape3, gfx: canvas.getGraphics(shape3) });
        dragging.move(canvasEvent(targetPosition));

        dragging.end();

        // then
        var newConnection = shape3.outgoing[0];

        expectToBeInside(getFirstWaypoint(newConnection), shape3);
      })
    );
  });


  describe('reconnect end', function() {

    it('should snap to target middle if reconnecting end outside of shape',
      inject(function(bendpointMove, dragging, canvas) {

        // given
        var movedWaypoint = getLastWaypoint(connection),
            targetPosition = { x: shape3.x - 5, y: shape3.y - 5 };

        // when
        bendpointMove.start(canvasEvent(movedWaypoint), connection, 1);

        dragging.move(canvasEvent(targetPosition));

        dragging.hover({ element: shape3, gfx: canvas.getGraphics(shape3) });
        dragging.move(canvasEvent(targetPosition));

        dragging.end();

        // then
        var newConnection = shape3.incoming[0];

        expectToBeInside(getLastWaypoint(newConnection), shape3);
      })
    );
  });


  describe('connect', function() {

    it('should snap to target middle if outside of shape',
      inject(function(connect, dragging) {

        // when
        connect.start(canvasEvent({ x: shape1.x + shape1.width, y: shape1.y }), shape1);

        dragging.move(canvasEvent({ x: shape3.x - 5, y: shape3.y - 5 }));

        dragging.hover(canvasEvent({ x: shape3.x - 5, y: shape3.y - 5 }, { element: shape3 }));
        dragging.end();

        // then
        var newConnection = shape3.incoming[0];

        expectToBeInside(getLastWaypoint(newConnection), shape3);
      })
    );
  });

});



// helper //////
function getFirstWaypoint(connection) {
  return connection.waypoints[0];
}

function getLastWaypoint(connection) {
  return connection.waypoints[ connection.waypoints.length - 1 ];
}

function expectToBeInside(point, shape) {
  var x = point.x,
      y = point.y;

  expect(
    x >= shape.x && x <= shape.x + shape.width &&
    y >= shape.y && y <= shape.y + shape.height,
    'Expected ' + point + ' to be inside ' + shape
  ).to.be.true;
}