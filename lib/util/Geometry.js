import {
  every,
  isArray
} from 'min-dash';

/**
 * Computes the distance between two points
 *
 * @param  {Point}  p
 * @param  {Point}  q
 *
 * @return {number}  distance
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
 * Returns true if the point r is on the line between p and q
 *
 * @param  {Point}  p
 * @param  {Point}  q
 * @param  {Point}  r
 * @param  {number} [accuracy=5] accuracy for points on line check (lower is better)
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
 * @param {Array<Point>|Point}
 * @param {Point}
 *
 * @return {string|boolean}
 */
export function pointsAligned(a, b) {
  var points;

  if (isArray(a)) {
    points = a;
  } else {
    points = [ a, b ];
  }

  if (pointsAlignedHorizontally(points)) {
    return 'h';
  }

  if (pointsAlignedVertically(points)) {
    return 'v';
  }

  return false;
}

export function pointsAlignedHorizontally(a, b) {
  var points;

  if (isArray(a)) {
    points = a;
  } else {
    points = [ a, b ];
  }

  var firstPoint = points.slice().shift();

  return every(points, function(point) {
    return Math.abs(firstPoint.y - point.y) <= ALIGNED_THRESHOLD;
  });
}

export function pointsAlignedVertically(a, b) {
  var points;

  if (isArray(a)) {
    points = a;
  } else {
    points = [ a, b ];
  }

  var firstPoint = points.slice().shift();

  return every(points, function(point) {
    return Math.abs(firstPoint.x - point.x) <= ALIGNED_THRESHOLD;
  });
}



/**
 * Returns true if the point p is inside the rectangle rect
 *
 * @param  {Point}  p
 * @param  {Rect} rect
 * @param  {number} tolerance
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
 * @param  {Point}  p
 * @param  {Point}  q
 *
 * @return {Point} middle point
 */
export function getMidPoint(p, q) {
  return {
    x: Math.round(p.x + ((q.x - p.x) / 2.0)),
    y: Math.round(p.y + ((q.y - p.y) / 2.0))
  };
}
