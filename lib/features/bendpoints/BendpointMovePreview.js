import {
  classes as svgClasses,
  remove as svgRemove
} from 'tiny-svg';

import {
  addBendpoint
} from './BendpointUtil';

import {
  filterRedundantWaypoints
} from '../../layout/LayoutUtil';

import { translate } from '../../util/SvgTransformUtil';


var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok',
    MARKER_CONNECT_HOVER = 'connect-hover',
    MARKER_CONNECT_UPDATING = 'djs-updating',
    MARKER_ELEMENT_HIDDEN = 'djs-element-hidden';

var COMMAND_RECONNECT_START = 'connection.reconnectStart',
    COMMAND_RECONNECT_END = 'connection.reconnectEnd';

var HIGH_PRIORITY = 1100;

/**
 * A component that implements moving of bendpoints
 */
export default function BendpointMovePreview(injector, eventBus, canvas) {

  var connectionPreview = injector.get('connectionPreview', false),
      connectionDocking = injector.get('connectionDocking', false);

  // DRAGGING IMPLEMENTATION

  eventBus.on('bendpoint.move.start', function(event) {

    var context = event.context,
        connection = context.connection,
        originalWaypoints = connection.waypoints,
        waypoints = originalWaypoints.slice(),
        insert = context.insert,
        idx = context.bendpointIndex;

    // save waypoints to restore at the end
    context.originalWaypoints = originalWaypoints;

    if (insert) {

      // insert placeholder for bendpoint to-be-added
      waypoints.splice(idx, 0, { x: event.x, y: event.y });
    }

    connection.waypoints = waypoints;

    // add dragger gfx
    context.draggerGfx = addBendpoint(canvas.getLayer('overlays'));
    svgClasses(context.draggerGfx).add('djs-dragging');

    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);
    canvas.addMarker(connection, MARKER_ELEMENT_HIDDEN);
  });

  eventBus.on('bendpoint.move.hover', function(event) {
    var context = event.context,
        allowed = context.allowed,
        hover = context.hover,
        moveType = context.type;

    if (hover) {
      canvas.addMarker(hover, MARKER_CONNECT_HOVER);

      if (
        moveType !== COMMAND_RECONNECT_START &&
        moveType !== COMMAND_RECONNECT_END
      ) {
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

    // remove connect marker
    // if it was added
    var hover = event.context.hover;

    if (hover) {
      canvas.removeMarker(hover, MARKER_CONNECT_HOVER);
      canvas.removeMarker(hover, event.context.target ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('bendpoint.move.move', function(event) {

    var context = event.context,
        moveType = context.type,
        connection = event.connection,
        originalWaypoints = connection.waypoints,
        waypoints = originalWaypoints.slice(),
        bendpoint = { x: event.x, y: event.y },
        hints;

    if (connectionPreview) {
      hints = {
        source: connection.source,
        target: connection.target
      };

      if (moveType === COMMAND_RECONNECT_START) {
        hints.source = context.target;
        hints.connectionStart = bendpoint;
      } else if (moveType === COMMAND_RECONNECT_END) {
        hints.target = context.target;
        hints.connectionEnd = bendpoint;
      } else {
        hints.noCropping = true;
        hints.noLayout = true;
        waypoints[context.bendpointIndex] = bendpoint;
      }

      if (connectionDocking) {

        // (0) temporarily assign new waypoints
        connection.waypoints = waypoints;

        // (1) crop connection with new waypoints and save them
        connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
        waypoints = connection.waypoints;

        // (2) restore original waypoints to not mutate connection directly
        connection.waypoints = originalWaypoints;
      }

      // remove overlapping points
      hints.waypoints = filterRedundantWaypoints(waypoints);

      connectionPreview.drawPreview(context, context.allowed, hints);
    }

    // add dragger gfx
    translate(context.draggerGfx, event.x, event.y);
  });

  eventBus.on([
    'bendpoint.move.end',
    'bendpoint.move.cancel'
  ], HIGH_PRIORITY, function(event) {

    var context = event.context,
        hover = context.hover,
        connection = context.connection;

    // reassign original waypoints
    connection.waypoints = context.originalWaypoints;

    // remove dragger gfx
    svgRemove(context.draggerGfx);

    canvas.removeMarker(connection, MARKER_CONNECT_UPDATING);
    canvas.removeMarker(connection, MARKER_ELEMENT_HIDDEN);

    if (hover) {
      canvas.removeMarker(hover, MARKER_OK);
      canvas.removeMarker(hover, context.target ? MARKER_OK : MARKER_NOT_OK);
    }

    if (connectionPreview) {
      connectionPreview.cleanUp(context);
    }
  });
}

BendpointMovePreview.$inject = [
  'injector',
  'eventBus',
  'canvas'
];
