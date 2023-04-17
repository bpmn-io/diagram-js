/**
 * @typedef {import('../../core/Types').ConnectionLike} Connection
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../util/Types').Axis} Axis
 * @typedef {import('../../util/Types').Direction} Direction
 * @typedef {import('../../util/Types').Point} Point
 * @typedef {import('../../util/Types').Rect} Rect
 */

import { forEach } from 'min-dash';

/**
 * Return direction given axis and delta.
 *
 * @param {Axis} axis
 * @param {number} delta
 *
 * @return {Direction}
 */
export function getDirection(axis, delta) {

  if (axis === 'x') {
    if (delta > 0) {
      return 'e';
    }

    if (delta < 0) {
      return 'w';
    }
  }

  if (axis === 'y') {
    if (delta > 0) {
      return 's';
    }

    if (delta < 0) {
      return 'n';
    }
  }

  return null;
}

/**
 * Returns connections whose waypoints are to be updated. Waypoints are to be updated if start
 * or end is to be moved or resized.
 *
 * @param {Array<Shape>} movingShapes
 * @param {Array<Shape>} resizingShapes
 *
 * @return {Array<Connection>}
 */
export function getWaypointsUpdatingConnections(movingShapes, resizingShapes) {
  var waypointsUpdatingConnections = [];

  forEach(movingShapes.concat(resizingShapes), function(shape) {
    var incoming = shape.incoming,
        outgoing = shape.outgoing;

    forEach(incoming.concat(outgoing), function(connection) {
      var source = connection.source,
          target = connection.target;

      if (includes(movingShapes, source) ||
        includes(movingShapes, target) ||
        includes(resizingShapes, source) ||
        includes(resizingShapes, target)) {

        if (!includes(waypointsUpdatingConnections, connection)) {
          waypointsUpdatingConnections.push(connection);
        }
      }
    });
  });

  return waypointsUpdatingConnections;
}

function includes(array, item) {
  return array.indexOf(item) !== -1;
}

/**
 * Resize bounds.
 *
 * @param {Rect} bounds
 * @param {Direction} direction
 * @param {Point} delta
 *
 * @return {Rect}
 */
export function resizeBounds(bounds, direction, delta) {
  var x = bounds.x,
      y = bounds.y,
      width = bounds.width,
      height = bounds.height,
      dx = delta.x,
      dy = delta.y;

  switch (direction) {
  case 'n':
    return {
      x: x,
      y: y + dy,
      width: width,
      height: height - dy
    };
  case 's':
    return {
      x: x,
      y: y,
      width: width,
      height: height + dy
    };
  case 'w':
    return {
      x: x + dx,
      y: y,
      width: width - dx,
      height: height
    };
  case 'e':
    return {
      x: x,
      y: y,
      width: width + dx,
      height: height
    };
  default:
    throw new Error('unknown direction: ' + direction);
  }
}