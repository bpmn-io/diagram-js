import {
  classes as svgClasses,
  remove as svgRemove
} from 'tiny-svg';

import {
  addBendpoint
} from './BendpointUtil';

import { translate } from '../../util/SvgTransformUtil';


var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok',
    MARKER_CONNECT_HOVER = 'connect-hover',
    MARKER_CONNECT_UPDATING = 'djs-updating';

var COMMAND_RECONNECT_START = 'connection.reconnectStart',
    COMMAND_RECONNECT_END = 'connection.reconnectEnd';

var HIGH_PRIORITY = 1100;

/**
 * A component that implements moving of bendpoints
 */
export default function BendpointMove(injector, eventBus, canvas, graphicsFactory) {

  // optional connection docking integration
  var connectionDocking = injector.get('connectionDocking', false);


  // DRAGGING IMPLEMENTATION


  function redrawConnection(data) {
    graphicsFactory.update('connection', data.connection, data.connectionGfx);
  }

  eventBus.on('bendpoint.move.start', function(e) {

    var context = e.context,
        connection = context.connection,
        originalWaypoints = connection.waypoints,
        waypoints = originalWaypoints.slice(),
        insert = context.insert,
        idx = context.bendpointIndex;

    // save waypoints to restore at the end
    context.originalWaypoints = originalWaypoints;

    if (insert) {
      // insert placeholder for bendpoint to-be-added
      waypoints.splice(idx, 0, { x: e.x, y: e.y });
    }

    connection.waypoints = waypoints;

    // add dragger gfx
    context.draggerGfx = addBendpoint(canvas.getLayer('overlays'));
    svgClasses(context.draggerGfx).add('djs-dragging');

    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on('bendpoint.move.hover', function(e) {
    var context = e.context,
        allowed = context.allowed,
        hover = context.hover;

    if (e.hover) {
      canvas.addMarker(hover, MARKER_CONNECT_HOVER);

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
  ], function(e) {

    // remove connect marker
    // if it was added
    var hover = e.context.hover;

    if (hover) {
      canvas.removeMarker(hover, MARKER_CONNECT_HOVER);
      canvas.removeMarker(hover, e.context.target ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('bendpoint.move.move', function(e) {

    var context = e.context,
        moveType = context.type,
        connection = e.connection,
        source, target;

    connection.waypoints[context.bendpointIndex] = { x: e.x, y: e.y };

    if (connectionDocking) {

      if (context.hover) {
        if (moveType === COMMAND_RECONNECT_START) {
          source = context.hover;
        }

        if (moveType === COMMAND_RECONNECT_END) {
          target = context.hover;
        }
      }

      connection.waypoints = connectionDocking.getCroppedWaypoints(connection, source, target);
    }

    // add dragger gfx
    translate(context.draggerGfx, e.x, e.y);

    redrawConnection(e);
  });

  eventBus.on([
    'bendpoint.move.end',
    'bendpoint.move.cancel'
  ], HIGH_PRIORITY, function(e) {

    var context = e.context,
        hover = context.hover,
        connection = context.connection;

    // reassign original waypoints
    connection.waypoints = context.originalWaypoints;

    // remove dragger gfx
    svgRemove(context.draggerGfx);

    canvas.removeMarker(connection, MARKER_CONNECT_UPDATING);

    if (hover) {
      canvas.removeMarker(hover, MARKER_OK);
      canvas.removeMarker(hover, context.target ? MARKER_OK : MARKER_NOT_OK);
    }

    redrawConnection(e);
  });
}

BendpointMove.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'graphicsFactory'
];
