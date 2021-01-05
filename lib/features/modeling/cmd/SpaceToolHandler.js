import {
  assign,
  forEach,
  map
} from 'min-dash';

import {
  getWaypointsUpdatingConnections,
  resizeBounds
} from '../../space-tool/SpaceUtil';

import {
  getMovedSourceAnchor,
  getMovedTargetAnchor,
  getResizedSourceAnchor,
  getResizedTargetAnchor
} from './helper/AnchorsHelper';


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
      start = context.start,
      oldBounds = {};

  // (1) move shapes
  this.moveShapes(movingShapes, delta);

  // (2a) save old bounds of resized shapes
  forEach(resizingShapes, function(shape) {
    oldBounds[shape.id] = getBounds(shape);
  });

  // (2b) resize shapes
  this.resizeShapes(resizingShapes, delta, direction);

  // (3) update connection waypoints
  this.updateConnectionWaypoints(
    getWaypointsUpdatingConnections(movingShapes, resizingShapes),
    delta,
    direction,
    start,
    movingShapes,
    resizingShapes,
    oldBounds
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

/**
 * Update connections waypoints according to the rules:
 *   1. Both source and target are moved/resized => move waypoints by the delta
 *   2. Only one of source and target is moved/resized => re-layout connection with moved start/end
 */
SpaceToolHandler.prototype.updateConnectionWaypoints = function(
    connections,
    delta,
    direction,
    start,
    movingShapes,
    resizingShapes,
    oldBounds
) {
  var self = this,
      affectedShapes = movingShapes.concat(resizingShapes);

  forEach(connections, function(connection) {
    var source = connection.source,
        target = connection.target,
        waypoints = copyWaypoints(connection),
        axis = getAxisFromDirection(direction),
        layoutHints = {};

    if (includes(affectedShapes, source) && includes(affectedShapes, target)) {

      // move waypoints
      waypoints = map(waypoints, function(waypoint) {
        if (shouldMoveWaypoint(waypoint, start, direction)) {

          // move waypoint
          waypoint[ axis ] = waypoint[ axis ] + delta[ axis ];
        }

        if (waypoint.original && shouldMoveWaypoint(waypoint.original, start, direction)) {

          // move waypoint original
          waypoint.original[ axis ] = waypoint.original[ axis ] + delta[ axis ];
        }

        return waypoint;
      });

      self._modeling.updateWaypoints(connection, waypoints, {
        labelBehavior: false
      });
    } else if (includes(affectedShapes, source) || includes(affectedShapes, target)) {

      // re-layout connection with moved start/end
      if (includes(movingShapes, source)) {
        layoutHints.connectionStart = getMovedSourceAnchor(connection, source, delta);
      } else if (includes(movingShapes, target)) {
        layoutHints.connectionEnd = getMovedTargetAnchor(connection, target, delta);
      } else if (includes(resizingShapes, source)) {
        layoutHints.connectionStart = getResizedSourceAnchor(
          connection, source, oldBounds[source.id]
        );
      } else if (includes(resizingShapes, target)) {
        layoutHints.connectionEnd = getResizedTargetAnchor(
          connection, target, oldBounds[target.id]
        );
      }

      self._modeling.layoutConnection(connection, layoutHints);
    }
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

function shouldMoveWaypoint(waypoint, start, direction) {
  var relevantAxis = getAxisFromDirection(direction);

  if (/e|s/.test(direction)) {
    return waypoint[ relevantAxis ] > start;
  } else if (/n|w/.test(direction)) {
    return waypoint[ relevantAxis ] < start;
  }
}

function includes(array, item) {
  return array.indexOf(item) !== -1;
}

function getBounds(shape) {
  return {
    x: shape.x,
    y: shape.y,
    height: shape.height,
    width: shape.width
  };
}
