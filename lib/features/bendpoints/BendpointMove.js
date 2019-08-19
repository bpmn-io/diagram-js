import {
  filterRedundantWaypoints
} from '../../layout/LayoutUtil';

var COMMAND_BENDPOINT_UPDATE = 'connection.updateWaypoints',
    COMMAND_RECONNECT_START = 'connection.reconnectStart',
    COMMAND_RECONNECT_END = 'connection.reconnectEnd';

var round = Math.round;


/**
 * A component that implements moving of bendpoints
 */
export default function BendpointMove(injector, eventBus, canvas, dragging, rules, modeling) {

  // optional connection docking integration
  var connectionDocking = injector.get('connectionDocking', false);


  // API
  this.start = function(event, connection, bendpointIndex, insert) {

    var type,
        context,
        waypoints = connection.waypoints,
        gfx = canvas.getGraphics(connection);

    if (!insert && bendpointIndex === 0) {
      type = COMMAND_RECONNECT_START;
    } else
    if (!insert && bendpointIndex === waypoints.length - 1) {
      type = COMMAND_RECONNECT_END;
    } else {
      type = COMMAND_BENDPOINT_UPDATE;
    }

    context = {
      connection: connection,
      bendpointIndex: bendpointIndex,
      insert: insert,
      type: type
    };

    var allowed = context.allowed = rules.allowed(context.type, context);

    if (allowed === false) {
      return;
    }

    dragging.init(event, 'bendpoint.move', {
      data: {
        connection: connection,
        connectionGfx: gfx,
        context: context
      }
    });
  };

  eventBus.on('bendpoint.move.hover', function(event) {
    var context = event.context;

    context.hover = event.hover;

    if (event.hover) {

      // asks whether reconnect / bendpoint move / bendpoint add
      // is allowed at the given position
      var allowed = context.allowed = rules.allowed(context.type, context);

      if (allowed) {
        context.target = context.hover;
      }
    }
  });

  eventBus.on([ 'bendpoint.move.out', 'bendpoint.move.cleanup' ], function(event) {
    var context = event.context;

    context.target = null;
    context.allowed = false;
  });

  eventBus.on('bendpoint.move.end', function(event) {

    var context = event.context,
        connection = context.connection,
        originalWaypoints = connection.waypoints,
        newWaypoints = originalWaypoints.slice(),
        bendpointIndex = context.bendpointIndex,
        allowed = context.allowed,
        insert = context.insert,
        bendpoint,
        hints;

    // ensure we have actual pixel values bendpoint
    // coordinates (important when zoom level was > 1 during move)
    bendpoint = {
      x: round(event.x),
      y: round(event.y)
    };

    if (allowed && context.type === COMMAND_RECONNECT_START) {
      modeling.reconnectStart(context.connection, context.target, bendpoint);
    } else if (allowed && context.type === COMMAND_RECONNECT_END) {
      modeling.reconnectEnd(context.connection, context.target, bendpoint);
    } else if (allowed !== false && context.type === COMMAND_BENDPOINT_UPDATE) {
      if (insert) {

        // insert new bendpoint
        newWaypoints.splice(bendpointIndex, 0, bendpoint);
      } else {

        // swap previous waypoint with the moved one
        newWaypoints[bendpointIndex] = bendpoint;
      }

      // pass hints on the actual moved bendpoint
      // this is useful for connection and label layouting
      hints = {
        bendpointMove: {
          insert: insert,
          bendpointIndex: bendpointIndex
        }
      };

      if (connectionDocking) {

        // (0) temporarily assign new waypoints
        connection.waypoints = newWaypoints;

        // (1) crop connection with new waypoints and save them
        connection.waypoints = connectionDocking.getCroppedWaypoints(connection);
        newWaypoints = connection.waypoints;

        // (2) restore original waypoints to not mutate connection directly
        connection.waypoints = originalWaypoints;
      }

      modeling.updateWaypoints(context.connection, filterRedundantWaypoints(newWaypoints), hints);
    } else {
      return false;
    }
  });
}

BendpointMove.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'dragging',
  'rules',
  'modeling'
];