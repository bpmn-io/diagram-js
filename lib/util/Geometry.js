import {
  every
} from 'min-dash';

/**
 * @typedef {import('../util/Types').Axis} Axis
 * @typedef {import('../util/Types').Point} Point
 * @typedef {import('../util/Types').Rect} Rect
 */

/**
 * Computes the distance between two points.
 *
 * @param {Point} a
 * @param {Point} b
 *
 * @return {number} The distance between the two points.
 */
export function pointDistance(a, b) {
  if (!a || !b) {
    return -1;
  }

  return Math.sqrt(
    Math.pow(a.x - b.x, 2) +
    Math.pow(a.y - b.y, 2)
  );
}


/**
 * Returns true if the point r is on the line between p and q.
 *
 * @param {Point} p
 * @param {Point} q
 * @param {Point} r
 * @param {number} [accuracy=5] The accuracy with which to check (lower is better).
 *
 * @return {boolean}
 */
export function pointsOnLine(p, q, r, accuracy) {

  if (typeof accuracy === 'undefined') {
    accuracy = 5;
  }

  if (!p || !q || !r) {
    return false;
  }

  var val = (q.x - p.x) * (r.y - p.y) - (q.y - p.y) * (r.x - p.x),
      dist = pointDistance(p, q);

  // @see http://stackoverflow.com/a/907491/412190
  return Math.abs(val / dist) <= accuracy;
}


var ALIGNED_THRESHOLD = 2;

/**
 * Check whether two points are horizontally or vertically aligned.
 *
 * @param {Point[]|Point} a
 * @param {Point} [b]
 *
 * @return {string|boolean} If and how the two points are aligned ('h', 'v' or `false`).
 */
export function pointsAligned(a, b) {
  var points = Array.from(arguments).flat();

  const axisMap = {
    'x': 'v',
    'y': 'h'
  };

  for (const [ axis, orientation ] of Object.entries(axisMap)) {
    if (pointsAlignedOnAxis(axis, points)) {
      return orientation;
    }
  }

  return false;
}

/**
 * @param {Axis} axis
 * @param {Point[]} points
 *
 * @return {boolean}
 */
export function pointsAlignedOnAxis(axis, points) {
  const referencePoint = points[0];

  return every(points, function(point) {
    return Math.abs(referencePoint[axis] - point[axis]) <= ALIGNED_THRESHOLD;
  });
}

/**
 * Returns true if the point p is inside the rectangle rect
 *
 * @param {Point} p
 * @param {Rect} rect
 * @param {number} tolerance
 *
 * @return {boolean}
 */
export function pointInRect(p, rect, tolerance) {
  tolerance = tolerance || 0;

  return p.x > rect.x - tolerance &&
         p.y > rect.y - tolerance &&
         p.x < rect.x + rect.width + tolerance &&
         p.y < rect.y + rect.height + tolerance;
}

/**
 * Returns a point in the middle of points p and q
 *
 * @param {Point} p
 * @param {Point} q
 *
 * @return {Point} The mid point between the two points.
 */
export function getMidPoint(p, q) {
  return {
    x: Math.round(p.x + ((q.x - p.x) / 2.0)),
    y: Math.round(p.y + ((q.y - p.y) / 2.0))
  };
}
