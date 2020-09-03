import inherits from 'inherits';

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

import {
  isFrameElement
} from '../util/Elements';

// apply default renderer with lowest possible priority
// so that it only kicks in if noone else could render
const DEFAULT_RENDER_PRIORITY = 1;

/**
 * The default renderer used for shapes and connections.
 *
 * @param {EventBus} eventBus
 * @param {Styles} styles
 */
export default class DefaultRenderer {
  constructor(eventBus, styles) {

    //
    BaseRenderer.call(this, eventBus, DEFAULT_RENDER_PRIORITY);

    this.CONNECTION_STYLE = styles.style([ 'no-fill' ], { strokeWidth: 5, stroke: 'fuchsia' });
    this.SHAPE_STYLE = styles.style({ fill: 'white', stroke: 'fuchsia', strokeWidth: 2 });
    this.FRAME_STYLE = styles.style([ 'no-fill' ], { stroke: 'fuchsia', strokeDasharray: 4, strokeWidth: 2 });
  }

  canRender() {
    return true;
  }

  drawShape(visuals, element) {
    const rect = svgCreate('rect');

    svgAttr(rect, {
      x: 0,
      y: 0,
      width: element.width || 0,
      height: element.height || 0
    });

    if (isFrameElement(element)) {
      svgAttr(rect, this.FRAME_STYLE);
    } else {
      svgAttr(rect, this.SHAPE_STYLE);
    }

    svgAppend(visuals, rect);

    return rect;
  }

  drawConnection(visuals, {waypoints}) {

    const line = createLine(waypoints, this.CONNECTION_STYLE);
    svgAppend(visuals, line);

    return line;
  }

  getShapePath(shape) {
    const x = shape.x;
    const y = shape.y;
    const width = shape.width;
    const height = shape.height;

    const shapePath = [
      ['M', x, y],
      ['l', width, 0],
      ['l', 0, height],
      ['l', -width, 0],
      ['z']
    ];

    return componentsToPath(shapePath);
  }

  getConnectionPath(connection) {
    const waypoints = connection.waypoints;

    let idx;
    let point;
    const connectionPath = [];

    for (idx = 0; (point = waypoints[idx]); idx++) {

      // take invisible docking into account
      // when creating the path
      point = point.original || point;

      connectionPath.push([ idx === 0 ? 'M' : 'L', point.x, point.y ]);
    }

    return componentsToPath(connectionPath);
  }
}

inherits(DefaultRenderer, BaseRenderer);


DefaultRenderer.$inject = [ 'eventBus', 'styles' ];
