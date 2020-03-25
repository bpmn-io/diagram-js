import {
  getNewAttachPoint
} from '../../../../util/AttachUtil';

import {
  getOrientation
} from '../../../../layout/LayoutUtil';

import {
  filter,
  map
} from 'min-dash';


export function getResizedSourceAnchor(connection, shape, oldBounds) {

  var waypoints = safeGetWaypoints(connection),
      waypointsInsideNewBounds = getWaypointsInsideBounds(waypoints, shape),
      oldAnchor = waypoints[0];

  // new anchor is the last waypoint enclosed be resized source
  if (waypointsInsideNewBounds.length) {
    return waypointsInsideNewBounds[ waypointsInsideNewBounds.length - 1 ];
  }

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, shape);
}


export function getResizedTargetAnchor(connection, shape, oldBounds) {

  var waypoints = safeGetWaypoints(connection),
      waypointsInsideNewBounds = getWaypointsInsideBounds(waypoints, shape),
      oldAnchor = waypoints[waypoints.length - 1];

  // new anchor is the first waypoint enclosed be resized target
  if (waypointsInsideNewBounds.length) {
    return waypointsInsideNewBounds[ 0 ];
  }

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, shape);
}


export function getMovedSourceAnchor(connection, source, moveDelta) {

  var waypoints = safeGetWaypoints(connection),
      oldBounds = subtract(source, moveDelta),
      oldAnchor = waypoints[ 0 ];

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, source);
}


export function getMovedTargetAnchor(connection, target, moveDelta) {

  var waypoints = safeGetWaypoints(connection),
      oldBounds = subtract(target, moveDelta),
      oldAnchor = waypoints[ waypoints.length - 1 ];

  return getNewAttachPoint(oldAnchor.original || oldAnchor, oldBounds, target);
}


// helpers //////////////////////

function subtract(bounds, delta) {
  return {
    x: bounds.x - delta.x,
    y: bounds.y - delta.y,
    width: bounds.width,
    height: bounds.height
  };
}


/**
 * Return waypoints of given connection; throw if non exists (should not happen!!).
 *
 * @param {Connection} connection
 *
 * @return {Array<Point>}
 */
function safeGetWaypoints(connection) {

  var waypoints = connection.waypoints;

  if (!waypoints.length) {
    throw new Error('connection#' + connection.id + ': no waypoints');
  }

  return waypoints;
}

function getWaypointsInsideBounds(waypoints, bounds) {
  var originalWaypoints = map(waypoints, getOriginal);

  return filter(originalWaypoints, function(waypoint) {
    return isInsideBounds(waypoint, bounds);
  });
}

/**
 * Checks if point is inside bounds, incl. edges.
 *
 * @param {Point} point
 * @param {Bounds} bounds
 */
function isInsideBounds(point, bounds) {
  return getOrientation(bounds, point, 1) === 'intersect';
}

function getOriginal(point) {
  return point.original || point;
}
