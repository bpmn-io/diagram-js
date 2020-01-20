import {
  assign,
  forEach,
  map
} from 'min-dash';

import {
  getWaypointsUpdatingConnections,
  resizeBounds
} from '../../space-tool/SpaceUtil';


/**
 * Add or remove space by moving and resizing shapes and updating connection waypoints.
 */
export default function SpaceToolHandler(modeling) {
  this._modeling = modeling;
}

SpaceToolHandler.$inject = [ 'modeling' ];

SpaceToolHandler.prototype.preExecute = function(context) {
  var delta = context.delta,
      direction = context.direction,
      movingShapes = context.movingShapes,
      resizingShapes = context.resizingShapes,
      start = context.start;

  // (1) move shapes
  this.moveShapes(movingShapes, delta);

  // (2) resize shapes
  this.resizeShapes(resizingShapes, delta, direction);

  // (3) update connection waypoints
  this.updateConnectionWaypoints(
    getWaypointsUpdatingConnections(movingShapes, resizingShapes),
    delta,
    direction,
    start,
    movingShapes,
    resizingShapes
  );
};

SpaceToolHandler.prototype.execute = function() {};
SpaceToolHandler.prototype.revert = function() {};

SpaceToolHandler.prototype.moveShapes = function(shapes, delta) {
  var self = this;

  forEach(shapes, function(element) {
    self._modeling.moveShape(element, delta, null, {
      autoResize: false,
      layout: false,
      recurse: false
    });
  });
};

SpaceToolHandler.prototype.resizeShapes = function(shapes, delta, direction) {
  var self = this;

  forEach(shapes, function(shape) {
    var newBounds = resizeBounds(shape, direction, delta);

    self._modeling.resizeShape(shape, newBounds, null, {
      attachSupport: false,
      autoResize: false,
      layout: false
    });
  });
};

SpaceToolHandler.prototype.updateConnectionWaypoints = function(
    connections,
    delta,
    direction,
    start,
    movingShapes,
    resizingShapes
) {
  var self = this;

  forEach(connections, function(connection) {
    var source = connection.source,
        target = connection.target,
        waypoints = copyWaypoints(connection);

    var axis = getAxisFromDirection(direction);

    // move waypoints
    waypoints = map(waypoints, function(waypoint, index) {
      var isFirstWaypoint = index === 0,
          isLastWaypoint = index === waypoints.length - 1;

      // do NOT move first/last waypoint if source/target NOT moving or resizing
      if ((isFirstWaypoint && !includes(movingShapes.concat(resizingShapes), source)) ||
        (isLastWaypoint && !includes(movingShapes.concat(resizingShapes), target))) {

        return waypoint;
      }

      if ((waypoint[ axis ] > start && /e|s/.test(direction)) ||
        (waypoint[ axis ] < start) && /n|w/.test(direction)) {

        // move waypoint
        waypoint[ axis ] = waypoint[ axis ] + delta[ axis ];
      }

      if (waypoint.original) {
        if ((waypoint.original[ axis ] > start && /e|s/.test(direction)) ||
          (waypoint.original[ axis ] < start) && /n|w/.test(direction)) {

          // move waypoint original
          waypoint.original[ axis ] = waypoint.original[ axis ] + delta[ axis ];
        }
      }

      return waypoint;
    });

    self._modeling.updateWaypoints(connection, waypoints, {
      labelBehavior: false
    });
  });
};


// helpers //////////

function copyWaypoint(waypoint) {
  return assign({}, waypoint);
}

function copyWaypoints(connection) {
  return map(connection.waypoints, function(waypoint) {

    waypoint = copyWaypoint(waypoint);

    if (waypoint.original) {
      waypoint.original = copyWaypoint(waypoint.original);
    }

    return waypoint;
  });
}

function getAxisFromDirection(direction) {
  switch (direction) {
  case 'n':
    return 'y';
  case 'w':
    return 'x';
  case 's':
    return 'y';
  case 'e':
    return 'x';
  }
}

function includes(array, item) {
  return array.indexOf(item) !== -1;
}