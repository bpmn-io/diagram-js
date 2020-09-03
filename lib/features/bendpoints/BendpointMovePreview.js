import {
  classes as svgClasses,
  remove as svgRemove
} from 'tiny-svg';

import { addBendpoint } from './BendpointUtil';

import { translate } from '../../util/SvgTransformUtil';

import { isReverse } from './BendpointMove';

const RECONNECT_START = 'reconnectStart';
const RECONNECT_END = 'reconnectEnd';
const UPDATE_WAYPOINTS = 'updateWaypoints';
const MARKER_OK = 'connect-ok';
const MARKER_NOT_OK = 'connect-not-ok';
const MARKER_CONNECT_HOVER = 'connect-hover';
const MARKER_CONNECT_UPDATING = 'djs-updating';
const MARKER_ELEMENT_HIDDEN = 'djs-element-hidden';

const HIGH_PRIORITY = 1100;

/**
 * Preview connection while moving bendpoints.
 */
export default function BendpointMovePreview(bendpointMove, injector, eventBus, canvas) {
  this._injector = injector;

  const connectionPreview = injector.get('connectionPreview', false);

  eventBus.on('bendpoint.move.start', event => {
    const context = event.context;
    const bendpointIndex = context.bendpointIndex;
    const connection = context.connection;
    const insert = context.insert;
    const waypoints = connection.waypoints;
    const newWaypoints = waypoints.slice();

    context.waypoints = waypoints;

    if (insert) {

      // insert placeholder for new bendpoint
      newWaypoints.splice(bendpointIndex, 0, { x: event.x, y: event.y });
    }

    connection.waypoints = newWaypoints;

    // add dragger gfx
    const draggerGfx = context.draggerGfx = addBendpoint(canvas.getLayer('overlays'));

    svgClasses(draggerGfx).add('djs-dragging');

    canvas.addMarker(connection, MARKER_ELEMENT_HIDDEN);
    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on('bendpoint.move.hover', event => {
    const context = event.context;
    const allowed = context.allowed;
    const hover = context.hover;
    const type = context.type;

    if (hover) {
      canvas.addMarker(hover, MARKER_CONNECT_HOVER);

      if (type === UPDATE_WAYPOINTS) {
        return;
      }

      if (allowed) {
        canvas.removeMarker(hover, MARKER_NOT_OK);
        canvas.addMarker(hover, MARKER_OK);
      } else if (allowed === false) {
        canvas.removeMarker(hover, MARKER_OK);
        canvas.addMarker(hover, MARKER_NOT_OK);
      }
    }
  });

  eventBus.on([
    'bendpoint.move.out',
    'bendpoint.move.cleanup'
  ], HIGH_PRIORITY, event => {
    const context = event.context;
    const hover = context.hover;
    const target = context.target;

    if (hover) {
      canvas.removeMarker(hover, MARKER_CONNECT_HOVER);
      canvas.removeMarker(hover, target ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('bendpoint.move.move', event => {
    const context = event.context;
    const allowed = context.allowed;
    const bendpointIndex = context.bendpointIndex;
    const draggerGfx = context.draggerGfx;
    const hover = context.hover;
    const type = context.type;
    const connection = context.connection;
    const source = connection.source;
    const target = connection.target;
    let newWaypoints = connection.waypoints.slice();
    const bendpoint = { x: event.x, y: event.y };
    const hints = context.hints || {};
    const drawPreviewHints = {};

    if (connectionPreview) {
      if (hints.connectionStart) {
        drawPreviewHints.connectionStart = hints.connectionStart;
      }

      if (hints.connectionEnd) {
        drawPreviewHints.connectionEnd = hints.connectionEnd;
      }


      if (type === RECONNECT_START) {
        if (isReverse(context)) {
          drawPreviewHints.connectionEnd = drawPreviewHints.connectionEnd || bendpoint;

          drawPreviewHints.source = target;
          drawPreviewHints.target = hover || source;

          newWaypoints = newWaypoints.reverse();
        } else {
          drawPreviewHints.connectionStart = drawPreviewHints.connectionStart || bendpoint;

          drawPreviewHints.source = hover || source;
          drawPreviewHints.target = target;
        }
      } else if (type === RECONNECT_END) {
        if (isReverse(context)) {
          drawPreviewHints.connectionStart = drawPreviewHints.connectionStart || bendpoint;

          drawPreviewHints.source = hover || target;
          drawPreviewHints.target = source;

          newWaypoints = newWaypoints.reverse();
        } else {
          drawPreviewHints.connectionEnd = drawPreviewHints.connectionEnd || bendpoint;

          drawPreviewHints.source = source;
          drawPreviewHints.target = hover || target;
        }

      } else {
        drawPreviewHints.noCropping = true;
        drawPreviewHints.noLayout = true;
        newWaypoints[ bendpointIndex ] = bendpoint;
      }

      if (type === UPDATE_WAYPOINTS) {
        newWaypoints = bendpointMove.cropWaypoints(connection, newWaypoints);
      }

      drawPreviewHints.waypoints = newWaypoints;

      connectionPreview.drawPreview(context, allowed, drawPreviewHints);
    }

    translate(draggerGfx, event.x, event.y);
  }, this);

  eventBus.on([
    'bendpoint.move.end',
    'bendpoint.move.cancel'
  ], HIGH_PRIORITY, event => {
    const context = event.context;
    const connection = context.connection;
    const draggerGfx = context.draggerGfx;
    const hover = context.hover;
    const target = context.target;
    const waypoints = context.waypoints;

    connection.waypoints = waypoints;

    // remove dragger gfx
    svgRemove(draggerGfx);

    canvas.removeMarker(connection, MARKER_CONNECT_UPDATING);
    canvas.removeMarker(connection, MARKER_ELEMENT_HIDDEN);

    if (hover) {
      canvas.removeMarker(hover, MARKER_OK);
      canvas.removeMarker(hover, target ? MARKER_OK : MARKER_NOT_OK);
    }

    if (connectionPreview) {
      connectionPreview.cleanUp(context);
    }
  });
}

BendpointMovePreview.$inject = [
  'bendpointMove',
  'injector',
  'eventBus',
  'canvas'
];