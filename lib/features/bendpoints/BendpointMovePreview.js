import {
  classes as svgClasses,
  remove as svgRemove
} from 'tiny-svg';

import { addBendpoint } from './BendpointUtil';

import { translate } from '../../util/SvgTransformUtil';

import { isReverse } from './BendpointMove';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../bendpoints/BendpointMove').default} BendpointMove
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../../core/EventBus').default} EventBus
 */

var RECONNECT_START = 'reconnectStart',
    RECONNECT_END = 'reconnectEnd',
    UPDATE_WAYPOINTS = 'updateWaypoints';

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok',
    MARKER_CONNECT_HOVER = 'connect-hover',
    MARKER_CONNECT_UPDATING = 'djs-updating',
    MARKER_ELEMENT_HIDDEN = 'djs-element-hidden';

var HIGH_PRIORITY = 1100;

/**
 * Preview connection while moving bendpoints.
 *
 * @param {BendpointMove} bendpointMove
 * @param {Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 */
export default function BendpointMovePreview(bendpointMove, injector, eventBus, canvas) {
  this._injector = injector;

  var connectionPreview = injector.get('connectionPreview', false);

  eventBus.on('bendpoint.move.start', function(event) {
    var context = event.context,
        bendpointIndex = context.bendpointIndex,
        connection = context.connection,
        insert = context.insert,
        waypoints = connection.waypoints,
        newWaypoints = waypoints.slice();

    context.waypoints = waypoints;

    if (insert) {

      // insert placeholder for new bendpoint
      newWaypoints.splice(bendpointIndex, 0, { x: event.x, y: event.y });
    }

    connection.waypoints = newWaypoints;

    // add dragger gfx
    var draggerGfx = context.draggerGfx = addBendpoint(canvas.getLayer('overlays'));

    svgClasses(draggerGfx).add('djs-dragging');

    canvas.addMarker(connection, MARKER_ELEMENT_HIDDEN);
    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on('bendpoint.move.hover', function(event) {
    var context = event.context,
        allowed = context.allowed,
        hover = context.hover,
        type = context.type;

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
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        hover = context.hover,
        target = context.target;

    if (hover) {
      canvas.removeMarker(hover, MARKER_CONNECT_HOVER);
      canvas.removeMarker(hover, target ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('bendpoint.move.move', function(event) {
    var context = event.context,
        allowed = context.allowed,
        bendpointIndex = context.bendpointIndex,
        draggerGfx = context.draggerGfx,
        hover = context.hover,
        type = context.type,
        connection = context.connection,
        source = connection.source,
        target = connection.target,
        newWaypoints = connection.waypoints.slice(),
        bendpoint = { x: event.x, y: event.y },
        hints = context.hints || {},
        drawPreviewHints = {};

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
  ], HIGH_PRIORITY, function(event) {
    var context = event.context,
        connection = context.connection,
        draggerGfx = context.draggerGfx,
        hover = context.hover,
        target = context.target,
        waypoints = context.waypoints;

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