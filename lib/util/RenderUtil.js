import {
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';


export function componentsToPath(elements) {
  return elements.join(',').replace(/,?([A-z]),?/g, '$1');
}

export function toSVGPoints(points) {
  var result = '';

  for (var i = 0, p; (p = points[i]); i++) {
    result += p.x + ',' + p.y + ' ';
  }

  return result;
}

export function createLine(points, attrs) {

  var line = svgCreate('polyline');
  svgAttr(line, { points: toSVGPoints(points) });

  if (attrs) {
    svgAttr(line, attrs);
  }

  return line;
}

export function updateLine(gfx, points) {
  svgAttr(gfx, { points: toSVGPoints(points) });

  return gfx;
}
