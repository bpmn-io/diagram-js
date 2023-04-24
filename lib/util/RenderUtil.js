import {
  isNumber
} from 'min-dash';

import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';


/**
 * @typedef {(string|number)[]} Component
 *
 * @typedef {import('../util/Types').Point} Point
 */

/**
 * @param {Component[] | Component[][]} elements
 *
 * @return {string}
 */
export function componentsToPath(elements) {
  return elements.flat().join(',').replace(/,?([A-z]),?/g, '$1');
}

/**
 * @param {Point[]} points
 *
 * @return {string}
 */
export function toSVGPoints(points) {
  var result = '';

  for (var i = 0, p; (p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}

/**
 * @param {Point} point
 *
 * @return {Component[]}
 */
function move(point) {
  return [ 'M', point.x, point.y ];
}

/**
 * @param {Point} point
 *
 * @return {Component[]}
 */
function lineTo(point) {
  return [ 'L', point.x, point.y ];
}

/**
 * @param {Point} p1
 * @param {Point} p2
 * @param {Point} p3
 *
 * @return {Component[]}
 */
function curveTo(p1, p2, p3) {
  return [ 'C', p1.x, p1.y, p2.x, p2.y, p3.x, p3.y ];
}

/**
 * @param {Point[]} waypoints
 * @param {number} [cornerRadius]
 * @return {Component[][]}
 */
function drawPath(waypoints, cornerRadius) {
  const pointCount = waypoints.length;

  const path = [ move(waypoints[0]) ];

  for (let i = 1; i < pointCount; i++) {

    const pointBefore = waypoints[i - 1];
    const point = waypoints[i];
    const pointAfter = waypoints[i + 1];

    if (!pointAfter || !cornerRadius) {
      path.push(lineTo(point));

      continue;
    }

    const effectiveRadius = Math.min(
      cornerRadius,
      vectorLength(point.x - pointBefore.x, point.y - pointBefore.y),
      vectorLength(pointAfter.x - point.x, pointAfter.y - point.y)
    );

    if (!effectiveRadius) {
      path.push(lineTo(point));

      continue;
    }

    const beforePoint = getPointAtLength(point, pointBefore, effectiveRadius);
    const beforePoint2 = getPointAtLength(point, pointBefore, effectiveRadius * .5);

    const afterPoint = getPointAtLength(point, pointAfter, effectiveRadius);
    const afterPoint2 = getPointAtLength(point, pointAfter, effectiveRadius * .5);

    path.push(lineTo(beforePoint));
    path.push(curveTo(beforePoint2, afterPoint2, afterPoint));
  }

  return path;
}

function getPointAtLength(start, end, length) {

  const deltaX = end.x - start.x;
  const deltaY = end.y - start.y;

  const totalLength = vectorLength(deltaX, deltaY);

  const percent = length / totalLength;

  return {
    x: start.x + deltaX * percent,
    y: start.y + deltaY * percent
  };
}

function vectorLength(x, y) {
  return Math.sqrt(Math.pow(x, 2) + Math.pow(y, 2));
}

/**
 * @param {Point[]} points
 * @param {number|Object} [attrs]
 * @param {number} [radius]
 *
 * @return {SVGElement}
 */
export function createLine(points, attrs, radius) {

  if (isNumber(attrs)) {
    radius = attrs;
    attrs = null;
  }

  if (!attrs) {
    attrs = {};
  }

  const line = svgCreate('path', attrs);

  if (isNumber(radius)) {
    line.dataset.cornerRadius = String(radius);
  }

  return updateLine(line, points);
}

/**
 * @param {SVGElement} gfx
 * @param {Point[]} points
 *
 * @return {SVGElement}
 */
export function updateLine(gfx, points) {

  const cornerRadius = parseInt(gfx.dataset.cornerRadius, 10) || 0;

  svgAttr(gfx, {
    d: componentsToPath(drawPath(points, cornerRadius))
  });

  return gfx;
}
