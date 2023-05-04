import {
  isObject,
  sortBy
} from 'min-dash';

import {
  pointDistance,
  pointsOnLine
} from '../util/Geometry';

import intersectPaths from 'path-intersection';

import { isConnection } from '../util/ModelUtil';

/**
 * @typedef {import('../core/Types').ElementLike} Element
 * @typedef {import('../core/Types').ConnectionLike} Connection
 *
 * @typedef {import('../util/Types').DirectionTRBL} DirectionTRBL
 * @typedef {import('../util/Types').Point} Point
 * @typedef {import('../util/Types').Rect} Rect
 * @typedef {import('../util/Types').RectTRBL} RectTRBL
 */

/**
 * @param {Rect} bounds
 *
 * @returns {Rect}
 */
export function roundBounds(bounds) {
  return {
    x: Math.round(bounds.x),
    y: Math.round(bounds.y),
    width: Math.round(bounds.width),
    height: Math.round(bounds.height)
  };
}

/**
 * @param {Point} point
 *
 * @returns {Point}
 */
export function roundPoint(point) {

  return {
    x: Math.round(point.x),
    y: Math.round(point.y)
  };
}


/**
 * Convert the given bounds to a { top, left, bottom, right } descriptor.
 *
 * @param {Point|Rect} bounds
 *
 * @return {RectTRBL}
 */
export function asTRBL(bounds) {
  return {
    top: bounds.y,
    right: bounds.x + (bounds.width || 0),
    bottom: bounds.y + (bounds.height || 0),
    left: bounds.x
  };
}


/**
 * Convert a { top, left, bottom, right } to an objects bounds.
 *
 * @param {RectTRBL} trbl
 *
 * @return {Rect}
 */
export function asBounds(trbl) {
  return {
    x: trbl.left,
    y: trbl.top,
    width: trbl.right - trbl.left,
    height: trbl.bottom - trbl.top
  };
}


/**
 * Get the mid of the given bounds or point.
 *
 * @param {Point|Rect} bounds
 *
 * @return {Point}
 */
export function getBoundsMid(bounds) {
  return roundPoint({
    x: bounds.x + (bounds.width || 0) / 2,
    y: bounds.y + (bounds.height || 0) / 2
  });
}


/**
 * Get the mid of the given Connection.
 *
 * @param {Connection} connection
 *
 * @return {Point}
 */
export function getConnectionMid(connection) {
  var waypoints = connection.waypoints;

  // calculate total length and length of each segment
  var parts = waypoints.reduce(function(parts, point, index) {

    var lastPoint = waypoints[index - 1];

    if (lastPoint) {
      var lastPart = parts[parts.length - 1];

      var startLength = lastPart && lastPart.endLength || 0;
      var length = distance(lastPoint, point);

      parts.push({
        start: lastPoint,
        end: point,
        startLength: startLength,
        endLength: startLength + length,
        length: length
      });
    }

    return parts;
  }, []);

  var totalLength = parts.reduce(function(length, part) {
    return length + part.length;
  }, 0);

  // find which segement contains middle point
  var midLength = totalLength / 2;

  var i = 0;
  var midSegment = parts[i];

  while (midSegment.endLength < midLength) {
    midSegment = parts[++i];
  }

  // calculate relative position on mid segment
  var segmentProgress = (midLength - midSegment.startLength) / midSegment.length;

  var midPoint = {
    x: midSegment.start.x + (midSegment.end.x - midSegment.start.x) * segmentProgress,
    y: midSegment.start.y + (midSegment.end.y - midSegment.start.y) * segmentProgress
  };

  return midPoint;
}


/**
 * Get the mid of the given Element.
 *
 * @param {Element} element
 *
 * @return {Point}
 */
export function getMid(element) {
  if (isConnection(element)) {
    return getConnectionMid(element);
  }

  return getBoundsMid(element);
}

// orientation utils //////////////////////

/**
 * Get orientation of the given rectangle with respect to
 * the reference rectangle.
 *
 * A padding (positive or negative) may be passed to influence
 * horizontal / vertical orientation and intersection.
 *
 * @param {Rect} rect
 * @param {Rect} reference
 * @param {Point|number} padding
 *
 * @return {DirectionTRBL} the orientation; one of top, top-left, left, ..., bottom, right or intersect.
 */
export function getOrientation(rect, reference, padding) {

  padding = padding || 0;

  // make sure we can use an object, too
  // for individual { x, y } padding
  if (!isObject(padding)) {
    padding = { x: padding, y: padding };
  }


  var rectOrientation = asTRBL(rect),
      referenceOrientation = asTRBL(reference);

  var top = rectOrientation.bottom + padding.y <= referenceOrientation.top,
      right = rectOrientation.left - padding.x >= referenceOrientation.right,
      bottom = rectOrientation.top - padding.y >= referenceOrientation.bottom,
      left = rectOrientation.right + padding.x <= referenceOrientation.left;

  var vertical = top ? 'top' : (bottom ? 'bottom' : null),
      horizontal = left ? 'left' : (right ? 'right' : null);

  if (horizontal && vertical) {
    return vertical + '-' + horizontal;
  } else {
    return horizontal || vertical || 'intersect';
  }
}


// intersection utils //////////////////////

/**
 * Get intersection between an element and a line path.
 *
 * @param {string} elementPath
 * @param {string} linePath
 * @param {boolean} cropStart Whether to crop start or end.
 *
 * @return {Point}
 */
export function getElementLineIntersection(elementPath, linePath, cropStart) {

  var intersections = getIntersections(elementPath, linePath);

  // recognize intersections
  // only one -> choose
  // two close together -> choose first
  // two or more distinct -> pull out appropriate one
  // none -> ok (fallback to point itself)
  if (intersections.length === 1) {
    return roundPoint(intersections[0]);
  } else if (intersections.length === 2 && pointDistance(intersections[0], intersections[1]) < 1) {
    return roundPoint(intersections[0]);
  } else if (intersections.length > 1) {

    // sort by intersections based on connection segment +
    // distance from start
    intersections = sortBy(intersections, function(i) {
      var distance = Math.floor(i.t2 * 100) || 1;

      distance = 100 - distance;

      distance = (distance < 10 ? '0' : '') + distance;

      // create a sort string that makes sure we sort
      // line segment ASC + line segment position DESC (for cropStart)
      // line segment ASC + line segment position ASC (for cropEnd)
      return i.segment2 + '#' + distance;
    });

    return roundPoint(intersections[cropStart ? 0 : intersections.length - 1]);
  }

  return null;
}


export function getIntersections(a, b) {
  return intersectPaths(a, b);
}


export function filterRedundantWaypoints(waypoints) {

  // alter copy of waypoints, not original
  waypoints = waypoints.slice();

  var idx = 0,
      point,
      previousPoint,
      nextPoint;

  while (waypoints[idx]) {
    point = waypoints[idx];
    previousPoint = waypoints[idx - 1];
    nextPoint = waypoints[idx + 1];

    if (pointDistance(point, nextPoint) === 0 ||
        pointsOnLine(previousPoint, nextPoint, point)) {

      // remove point, if overlapping with {nextPoint}
      // or on line with {previousPoint} -> {point} -> {nextPoint}
      waypoints.splice(idx, 1);
    } else {
      idx++;
    }
  }

  return waypoints;
}

// helpers //////////////////////

function distance(a, b) {
  return Math.sqrt(Math.pow(a.x - b.x, 2) + Math.pow(a.y - b.y, 2));
}