import {
  assign,
  find,
  isArray,
  without
} from 'min-dash';

import {
  getOrientation,
  getMid
} from './LayoutUtil';

import {
  pointInRect,
  pointDistance,
  pointsAligned,
  pointsOnLine
} from '../util/Geometry';

var MIN_SEGMENT_LENGTH = 20,
    POINT_ORIENTATION_PADDING = 5;

var round = Math.round;

var INTERSECTION_THRESHOLD = 20,
    ORIENTATION_THRESHOLD = {
      'h:h': 20,
      'v:v': 20,
      'h:v': -10,
      'v:h': -10
    };

function needsTurn(orientation, startDirection) {
  return !{
    t: /top/,
    r: /right/,
    b: /bottom/,
    l: /left/,
    h: /./,
    v: /./
  }[startDirection].test(orientation);
}

function canLayoutStraight(direction, targetOrientation) {
  return {
    t: /top/,
    r: /right/,
    b: /bottom/,
    l: /left/,
    h: /left|right/,
    v: /top|bottom/
  }[direction].test(targetOrientation);
}

function getSegmentBendpoints(a, b, directions) {
  var orientation = getOrientation(b, a, POINT_ORIENTATION_PADDING);

  var startDirection = directions.split(':')[0];

  var xmid = round((b.x - a.x) / 2 + a.x),
      ymid = round((b.y - a.y) / 2 + a.y);

  var segmentEnd, segmentDirections;

  var layoutStraight = canLayoutStraight(startDirection, orientation),
      layoutHorizontal = /h|r|l/.test(startDirection),
      layoutTurn = false;

  var turnNextDirections = false;

  if (layoutStraight) {
    segmentEnd = layoutHorizontal ? { x: xmid, y: a.y } : { x: a.x, y: ymid };

    segmentDirections = layoutHorizontal ? 'h:h' : 'v:v';
  } else {
    layoutTurn = needsTurn(orientation, startDirection);

    segmentDirections = layoutHorizontal ? 'h:v' : 'v:h';

    if (layoutTurn) {

      if (layoutHorizontal) {
        turnNextDirections = ymid === a.y;

        segmentEnd = {
          x: a.x + MIN_SEGMENT_LENGTH * (/l/.test(startDirection) ? -1 : 1),
          y: turnNextDirections ? ymid + MIN_SEGMENT_LENGTH : ymid
        };
      } else {
        turnNextDirections = xmid === a.x;

        segmentEnd = {
          x: turnNextDirections ? xmid + MIN_SEGMENT_LENGTH : xmid,
          y: a.y + MIN_SEGMENT_LENGTH * (/t/.test(startDirection) ? -1 : 1)
        };
      }

    } else {
      segmentEnd = {
        x: xmid,
        y: ymid
      };
    }
  }

  return {
    waypoints: getBendpoints(a, segmentEnd, segmentDirections).concat(segmentEnd),
    directions:  segmentDirections,
    turnNextDirections: turnNextDirections
  };
}

function getStartSegment(a, b, directions) {
  return getSegmentBendpoints(a, b, directions);
}

function getEndSegment(a, b, directions) {
  var invertedSegment = getSegmentBendpoints(b, a, invertDirections(directions));

  return {
    waypoints: invertedSegment.waypoints.slice().reverse(),
    directions: invertDirections(invertedSegment.directions),
    turnNextDirections: invertedSegment.turnNextDirections
  };
}

function getMidSegment(startSegment, endSegment) {

  var startDirection = startSegment.directions.split(':')[1],
      endDirection = endSegment.directions.split(':')[0];

  if (startSegment.turnNextDirections) {
    startDirection = startDirection == 'h' ? 'v' : 'h';
  }

  if (endSegment.turnNextDirections) {
    endDirection = endDirection == 'h' ? 'v' : 'h';
  }

  var directions = startDirection + ':' + endDirection;

  var bendpoints = getBendpoints(
    startSegment.waypoints[startSegment.waypoints.length - 1],
    endSegment.waypoints[0],
    directions
  );

  return {
    waypoints: bendpoints,
    directions: directions
  };
}

function invertDirections(directions) {
  return directions.split(':').reverse().join(':');
}

/**
 * Handle simple layouts with maximum two bendpoints.
 */
function getSimpleBendpoints(a, b, directions) {

  var xmid = round((b.x - a.x) / 2 + a.x),
      ymid = round((b.y - a.y) / 2 + a.y);

  // one point, right or left from a
  if (directions === 'h:v') {
    return [ { x: b.x, y: a.y } ];
  }

  // one point, above or below a
  if (directions === 'v:h') {
    return [ { x: a.x, y: b.y } ];
  }

  // vertical segment between a and b
  if (directions === 'h:h') {
    return [
      { x: xmid, y: a.y },
      { x: xmid, y: b.y }
    ];
  }

  // horizontal segment between a and b
  if (directions === 'v:v') {
    return [
      { x: a.x, y: ymid },
      { x: b.x, y: ymid }
    ];
  }

  throw new Error('invalid directions: can only handle varians of [hv]:[hv]');
}


/**
 * Returns the mid points for a manhattan connection between two points.
 *
 * @example h:h (horizontal:horizontal)
 *
 * [a]----[x]
 *         |
 *        [x]----[b]
 *
 * @example h:v (horizontal:vertical)
 *
 * [a]----[x]
 *         |
 *        [b]
 *
 * @example h:r (horizontal:right)
 *
 * [a]----[x]
 *         |
 *    [b]-[x]
 *
 * @param  {Point} a
 * @param  {Point} b
 * @param  {string} directions
 *
 * @return {Array<Point>}
 */
function getBendpoints(a, b, directions) {
  directions = directions || 'h:h';

  if (!isValidDirections(directions)) {
    throw new Error(
      'unknown directions: <' + directions + '>: ' +
      'must be specified as <start>:<end> ' +
      'with start/end in { h,v,t,r,b,l }'
    );
  }

  // compute explicit directions, involving trbl dockings
  // using a three segmented layouting algorithm
  if (isExplicitDirections(directions)) {
    var startSegment = getStartSegment(a, b, directions),
        endSegment = getEndSegment(a, b, directions),
        midSegment = getMidSegment(startSegment, endSegment);

    return [].concat(
      startSegment.waypoints,
      midSegment.waypoints,
      endSegment.waypoints
    );
  }

  // handle simple [hv]:[hv] cases that can be easily computed
  return getSimpleBendpoints(a, b, directions);
}

/**
 * Create a connection between the two points according
 * to the manhattan layout (only horizontal and vertical) edges.
 *
 * @param {Point} a
 * @param {Point} b
 *
 * @param {string} [directions='h:h'] specifies manhattan directions for each point as {adirection}:{bdirection}.
                   A directionfor a point is either `h` (horizontal) or `v` (vertical)
 *
 * @return {Array<Point>}
 */
export function connectPoints(a, b, directions) {

  var points = getBendpoints(a, b, directions);

  points.unshift(a);
  points.push(b);

  return withoutRedundantPoints(points);
}


/**
 * Connect two rectangles using a manhattan layouted connection.
 *
 * @param {Bounds} source source rectangle
 * @param {Bounds} target target rectangle
 * @param {Point} [start] source docking
 * @param {Point} [end] target docking
 *
 * @param {Object} [hints]
 * @param {string} [hints.preserveDocking=source] preserve docking on selected side
 * @param {Array<string>} [hints.preferredLayouts]
 * @param {Point|boolean} [hints.connectionStart] whether the start changed
 * @param {Point|boolean} [hints.connectionEnd] whether the end changed
 *
 * @return {Array<Point>} connection points
 */
export function connectRectangles(source, target, start, end, hints) {

  var preferredLayouts = hints && hints.preferredLayouts || [];

  var preferredLayout = without(preferredLayouts, 'straight')[0] || 'h:h';

  var threshold = ORIENTATION_THRESHOLD[preferredLayout] || 0;

  var orientation = getOrientation(source, target, threshold);

  var directions = getDirections(orientation, preferredLayout);

  start = start || getMid(source);
  end = end || getMid(target);

  var directionSplit = directions.split(':');

  // compute actual docking points for start / end
  // this ensures we properly layout only parts of the
  // connection that lies in between the two rectangles
  var startDocking = getDockingPoint(start, source, directionSplit[0], invertOrientation(orientation)),
      endDocking = getDockingPoint(end, target, directionSplit[1], orientation);

  return connectPoints(startDocking, endDocking, directions);
}


/**
 * Repair the connection between two rectangles, of which one has been updated.
 *
 * @param {Bounds} source
 * @param {Bounds} target
 * @param {Point} [start]
 * @param {Point} [end]
 * @param {Array<Point>} [waypoints]
 * @param {Object} [hints]
 * @param {Array<string>} [hints.preferredLayouts] list of preferred layouts
 * @param {boolean} [hints.connectionStart]
 * @param {boolean} [hints.connectionEnd]
 *
 * @return {Array<Point>} repaired waypoints
 */
export function repairConnection(source, target, start, end, waypoints, hints) {

  if (isArray(start)) {
    waypoints = start;
    hints = end;

    start = getMid(source);
    end = getMid(target);
  }

  hints = assign({ preferredLayouts: [] }, hints);
  waypoints = waypoints || [];

  var preferredLayouts = hints.preferredLayouts,
      preferStraight = preferredLayouts.indexOf('straight') !== -1,
      repairedWaypoints;

  // just layout non-existing or simple connections
  // attempt to render straight lines, if required

  // attempt to layout a straight line
  repairedWaypoints = preferStraight && tryLayoutStraight(source, target, start, end, hints);

  if (repairedWaypoints) {
    return repairedWaypoints;
  }

  // try to layout from end
  repairedWaypoints = hints.connectionEnd && tryRepairConnectionEnd(target, source, end, waypoints);

  if (repairedWaypoints) {
    return repairedWaypoints;
  }

  // try to layout from start
  repairedWaypoints = hints.connectionStart && tryRepairConnectionStart(source, target, start, waypoints);

  if (repairedWaypoints) {
    return repairedWaypoints;
  }

  // or whether nothing seems to have changed
  if (!hints.connectionStart && !hints.connectionEnd && waypoints && waypoints.length) {
    return waypoints;
  }

  // simply reconnect if nothing else worked
  return connectRectangles(source, target, start, end, hints);
}


function inRange(a, start, end) {
  return a >= start && a <= end;
}

function isInRange(axis, a, b) {
  var size = {
    x: 'width',
    y: 'height'
  };

  return inRange(a[axis], b[axis], b[axis] + b[size[axis]]);
}

/**
 * Layout a straight connection
 *
 * @param {Bounds} source
 * @param {Bounds} target
 * @param {Point} start
 * @param {Point} end
 * @param {Object} [hints]
 *
 * @return {Array<Point>|null} waypoints if straight layout worked
 */
export function tryLayoutStraight(source, target, start, end, hints) {
  var axis = {},
      primaryAxis,
      orientation;

  orientation = getOrientation(source, target);

  // only layout a straight connection if shapes are
  // horizontally or vertically aligned
  if (!/^(top|bottom|left|right)$/.test(orientation)) {
    return null;
  }

  if (/top|bottom/.test(orientation)) {
    primaryAxis = 'x';
  }

  if (/left|right/.test(orientation)) {
    primaryAxis = 'y';
  }

  if (hints.preserveDocking === 'target') {

    if (!isInRange(primaryAxis, end, source)) {
      return null;
    }

    axis[primaryAxis] = end[primaryAxis];

    return [
      {
        x: axis.x !== undefined ? axis.x : start.x,
        y: axis.y !== undefined ? axis.y : start.y,
        original: {
          x: axis.x !== undefined ? axis.x : start.x,
          y: axis.y !== undefined ? axis.y : start.y
        }
      },
      {
        x: end.x,
        y: end.y
      }
    ];

  } else {

    if (!isInRange(primaryAxis, start, target)) {
      return null;
    }

    axis[primaryAxis] = start[primaryAxis];

    return [
      {
        x: start.x,
        y: start.y
      },
      {
        x: axis.x !== undefined ? axis.x : end.x,
        y: axis.y !== undefined ? axis.y : end.y,
        original: {
          x: axis.x !== undefined ? axis.x : end.x,
          y: axis.y !== undefined ? axis.y : end.y
        }
      }
    ];
  }

}

/**
 * Repair a connection from start.
 *
 * @param {Bounds} moved
 * @param {Bounds} other
 * @param {Point} newDocking
 * @param {Array<Point>} points originalPoints from moved to other
 *
 * @return {Array<Point>|null} the repaired points between the two rectangles
 */
function tryRepairConnectionStart(moved, other, newDocking, points) {
  return _tryRepairConnectionSide(moved, other, newDocking, points);
}

/**
 * Repair a connection from end.
 *
 * @param {Bounds} moved
 * @param {Bounds} other
 * @param {Point} newDocking
 * @param {Array<Point>} points originalPoints from moved to other
 *
 * @return {Array<Point>|null} the repaired points between the two rectangles
 */
function tryRepairConnectionEnd(moved, other, newDocking, points) {
  var waypoints = points.slice().reverse();

  waypoints = _tryRepairConnectionSide(moved, other, newDocking, waypoints);

  return waypoints ? waypoints.reverse() : null;
}

/**
 * Repair a connection from one side that moved.
 *
 * @param {Bounds} moved
 * @param {Bounds} other
 * @param {Point} newDocking
 * @param {Array<Point>} points originalPoints from moved to other
 *
 * @return {Array<Point>} the repaired points between the two rectangles
 */
function _tryRepairConnectionSide(moved, other, newDocking, points) {

  function needsRelayout(points) {
    if (points.length < 3) {
      return true;
    }

    if (points.length > 4) {
      return false;
    }

    // relayout if two points overlap
    // this is most likely due to
    return !!find(points, function(p, idx) {
      var q = points[idx - 1];

      return q && pointDistance(p, q) < 3;
    });
  }

  function repairBendpoint(candidate, oldPeer, newPeer) {

    var alignment = pointsAligned(oldPeer, candidate);

    switch (alignment) {
    case 'v':

      // repair horizontal alignment
      return { x: newPeer.x, y: candidate.y };
    case 'h':

      // repair vertical alignment
      return { x: candidate.x, y: newPeer.y };
    }

    return { x: candidate.x, y: candidate. y };
  }

  function removeOverlapping(points, a, b) {
    var i;

    for (i = points.length - 2; i !== 0; i--) {

      // intersects (?) break, remove all bendpoints up to this one and relayout
      if (pointInRect(points[i], a, INTERSECTION_THRESHOLD) ||
          pointInRect(points[i], b, INTERSECTION_THRESHOLD)) {

        // return sliced old connection
        return points.slice(i);
      }
    }

    return points;
  }

  // (0) only repair what has layoutable bendpoints

  // (1) if only one bendpoint and on shape moved onto other shapes axis
  //     (horizontally / vertically), relayout

  if (needsRelayout(points)) {
    return null;
  }

  var oldDocking = points[0],
      newPoints = points.slice(),
      slicedPoints;

  // (2) repair only last line segment and only if it was layouted before

  newPoints[0] = newDocking;
  newPoints[1] = repairBendpoint(newPoints[1], oldDocking, newDocking);


  // (3) if shape intersects with any bendpoint after repair,
  //     remove all segments up to this bendpoint and repair from there
  slicedPoints = removeOverlapping(newPoints, moved, other);

  if (slicedPoints !== newPoints) {
    newPoints = _tryRepairConnectionSide(moved, other, newDocking, slicedPoints);
  }

  // (4) do NOT repair if repaired bendpoints are aligned
  if (newPoints && pointsAligned(newPoints)) {
    return null;
  }

  return newPoints;
}


/**
 * Returns the manhattan directions connecting two rectangles
 * with the given orientation.
 *
 * Will always return the default layout, if it is specific
 * regarding sides already (trbl).
 *
 * @example
 *
 * getDirections('top'); // -> 'v:v'
 * getDirections('intersect'); // -> 't:t'
 *
 * getDirections('top-right', 'v:h'); // -> 'v:h'
 * getDirections('top-right', 'h:h'); // -> 'h:h'
 *
 *
 * @param {string} orientation
 * @param {string} defaultLayout
 *
 * @return {string}
 */
function getDirections(orientation, defaultLayout) {

  // don't override specific trbl directions
  if (isExplicitDirections(defaultLayout)) {
    return defaultLayout;
  }

  switch (orientation) {
  case 'intersect':
    return 't:t';

  case 'top':
  case 'bottom':
    return 'v:v';

  case 'left':
  case 'right':
    return 'h:h';

  // 'top-left'
  // 'top-right'
  // 'bottom-left'
  // 'bottom-right'
  default:
    return defaultLayout;
  }
}

function isValidDirections(directions) {
  return directions && /^h|v|t|r|b|l:h|v|t|r|b|l$/.test(directions);
}

function isExplicitDirections(directions) {
  return directions && /t|r|b|l/.test(directions);
}

function invertOrientation(orientation) {
  return {
    'top': 'bottom',
    'bottom': 'top',
    'left': 'right',
    'right': 'left',
    'top-left': 'bottom-right',
    'bottom-right': 'top-left',
    'top-right': 'bottom-left',
    'bottom-left': 'top-right',
  }[orientation];
}

function getDockingPoint(point, rectangle, dockingDirection, targetOrientation) {

  // ensure we end up with a specific docking direction
  // based on the targetOrientation, if <h|v> is being passed

  if (dockingDirection === 'h') {
    dockingDirection = /left/.test(targetOrientation) ? 'l' : 'r';
  }

  if (dockingDirection === 'v') {
    dockingDirection = /top/.test(targetOrientation) ? 't' : 'b';
  }

  if (dockingDirection === 't') {
    return { original: point, x: point.x, y: rectangle.y };
  }

  if (dockingDirection === 'r') {
    return { original: point, x: rectangle.x + rectangle.width, y: point.y };
  }

  if (dockingDirection === 'b') {
    return { original: point, x: point.x, y: rectangle.y + rectangle.height };
  }

  if (dockingDirection === 'l') {
    return { original: point, x: rectangle.x, y: point.y };
  }

  throw new Error('unexpected dockingDirection: <' + dockingDirection + '>');
}


/**
 * Return list of waypoints with redundant ones filtered out.
 *
 * @example
 *
 * Original points:
 *
 *   [x] ----- [x] ------ [x]
 *                         |
 *                        [x] ----- [x] - [x]
 *
 * Filtered:
 *
 *   [x] ---------------- [x]
 *                         |
 *                        [x] ----------- [x]
 *
 * @param  {Array<Point>} waypoints
 *
 * @return {Array<Point>}
 */
export function withoutRedundantPoints(waypoints) {
  return waypoints.reduce(function(points, p, idx) {

    var previous = points[points.length - 1],
        next = waypoints[idx + 1];

    if (!pointsOnLine(previous, next, p, 0)) {
      points.push(p);
    }

    return points;
  }, []);
}
