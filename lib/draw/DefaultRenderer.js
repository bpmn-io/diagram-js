import inherits from 'inherits-browser';

import BaseRenderer from './BaseRenderer';

import {
  componentsToPath,
  createLine
} from '../util/RenderUtil';

import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate
} from 'tiny-svg';

import { assign } from 'min-dash';

import {
  isFrameElement
} from '../util/Elements';

// apply default renderer with lowest possible priority
// so that it only kicks in if noone else could render
var DEFAULT_RENDER_PRIORITY = 1;

/**
 * The default renderer used for shapes and connections.
 *
 * @param {EventBus} eventBus
 * @param {Styles} styles
 */
export default function DefaultRenderer(eventBus, styles) {

  //
  BaseRenderer.call(this, eventBus, DEFAULT_RENDER_PRIORITY);

  this.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: 'fuchsia' });
  this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });
  this.FRAME_STYLE = styles.style([ 'no-fill' ], { stroke: 'fuchsia', strokeDasharray: 4, strokeWidth: 2 });
}

inherits(DefaultRenderer, BaseRenderer);


DefaultRenderer.prototype.canRender = function() {
  return true;
};

DefaultRenderer.prototype.drawShape = function drawShape(visuals, element, attrs) {
  var rect = svgCreate('rect');

  svgAttr(rect, {
    x: 0,
    y: 0,
    width: element.width || 0,
    height: element.height || 0
  });

  if (isFrameElement(element)) {
    svgAttr(rect, assign({}, this.FRAME_STYLE, attrs || {}));
  } else {
    svgAttr(rect, assign({}, this.SHAPE_STYLE, attrs || {}));
  }

  svgAppend(visuals, rect);

  return rect;
};

DefaultRenderer.prototype.drawConnection = function drawConnection(visuals, connection, attrs) {

  var line = createLine(connection.waypoints, assign({}, this.CONNECTION_STYLE, attrs || {}));
  svgAppend(visuals, line);

  return line;
};

DefaultRenderer.prototype.getShapePath = function getShapePath(shape) {

  var x = shape.x,
      y = shape.y,
      width = shape.width,
      height = shape.height;

  var shapePath = [
    [ 'M', x, y ],
    [ 'l', width, 0 ],
    [ 'l', 0, height ],
    [ 'l', -width, 0 ],
    [ 'z' ]
  ];

  return componentsToPath(shapePath);
};

DefaultRenderer.prototype.getConnectionPath = function getConnectionPath(connection) {
  var waypoints = connection.waypoints;

  var idx, point, connectionPath = [];

  for (idx = 0; (point = waypoints[idx]); idx++) {

    // take invisible docking into account
    // when creating the path
    point = point.original || point;

    connectionPath.push([ idx === 0 ? 'M' : 'L', point.x, point.y ]);
  }

  return componentsToPath(connectionPath);
};


DefaultRenderer.$inject = [ 'eventBus', 'styles' ];
