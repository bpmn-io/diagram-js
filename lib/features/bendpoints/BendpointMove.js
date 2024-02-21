import { filterRedundantWaypoints } from '../../layout/LayoutUtil';

/**
 * @typedef {import('didi').Injector} Injector
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../rules/Rules').default} Rules
 */

var round = Math.round;

var RECONNECT_START = 'reconnectStart',
    RECONNECT_END = 'reconnectEnd',
    UPDATE_WAYPOINTS = 'updateWaypoints';


/**
 * Move bendpoints through drag and drop to add/remove bendpoints or reconnect connection.
 *
 * @param {Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {Dragging} dragging
 * @param {Rules} rules
 * @param {Modeling} modeling
 */
export default function BendpointMove(injector, eventBus, canvas, dragging, rules, modeling) {
  this._injector = injector;

  this.start = function(event, connection, bendpointIndex, insert) {
    var gfx = canvas.getGraphics(connection),
        source = connection.source,
        target = connection.target,
        waypoints = connection.waypoints,
        type;

    if (!insert && bendpointIndex === 0) {
      type = RECONNECT_START;
    } else if (!insert && bendpointIndex === waypoints.length - 1) {
      type = RECONNECT_END;
    } else {
      type = UPDATE_WAYPOINTS;
    }

    var command = type === UPDATE_WAYPOINTS ? 'connection.updateWaypoints' : 'connection.reconnect';

    var allowed = rules.allowed(command, {
      connection: connection,
      source: source,
      target: target
    });

    if (allowed === false) {
      allowed = rules.allowed(command, {
        connection: connection,
        source: target,
        target: source
      });
    }

    if (allowed === false) {
      return;
    }

    dragging.init(event, 'bendpoint.move', {
      data: {
        connection: connection,
        connectionGfx: gfx,
        context: {
          allowed: allowed,
          bendpointIndex: bendpointIndex,
          connection: connection,
          source: source,
          target: target,
          insert: insert,
          type: type
        }
      }
    });
  };

  eventBus.on('bendpoint.move.hover', function(event) {
    var context = event.context,
        connection = context.connection,
        source = connection.source,
        target = connection.target,
        hover = event.hover,
        type = context.type;

    // cache hover state
    context.hover = hover;

    var allowed;

    if (!hover) {
      return;
    }

    var command = type === UPDATE_WAYPOINTS ? 'connection.updateWaypoints' : 'connection.reconnect';

    allowed = context.allowed = rules.allowed(command, {
      connection: connection,
      source: type === RECONNECT_START ? hover : source,
      target: type === RECONNECT_END ? hover : target
    });

    if (allowed) {
      context.source = type === RECONNECT_START ? hover : source;
      context.target = type === RECONNECT_END ? hover : target;

      return;
    }

    if (allowed === false) {
      allowed = context.allowed = rules.allowed(command, {
        connection: connection,
        source: type === RECONNECT_END ? hover : target,
        target: type === RECONNECT_START ? hover : source
      });
    }

    if (allowed) {
      context.source = type === RECONNECT_END ? hover : target;
      context.target = type === RECONNECT_START ? hover : source;
    }
  });

  eventBus.on([ 'bendpoint.move.out', 'bendpoint.move.cleanup' ], function(event) {
    var context = event.context,
        type = context.type;

    context.hover = null;
    context.source = null;
    context.target = null;

    if (type !== UPDATE_WAYPOINTS) {
      context.allowed = false;
    }
  });

  eventBus.on('bendpoint.move.end', function(event) {
    var context = event.context,
        allowed = context.allowed,
        bendpointIndex = context.bendpointIndex,
        connection = context.connection,
        insert = context.insert,
        newWaypoints = connection.waypoints.slice(),
        source = context.source,
        target = context.target,
        type = context.type,
        hints = context.hints || {};

    // ensure integer values (important if zoom level was > 1 during move)
    var docking = {
      x: round(event.x),
      y: round(event.y)
    };

    if (!allowed) {
      return false;
    }

    if (type === UPDATE_WAYPOINTS) {
      if (insert) {

        // insert new bendpoint
        newWaypoints.splice(bendpointIndex, 0, docking);
      } else {

        // swap previous waypoint with moved one
        newWaypoints[bendpointIndex] = docking;
      }

      // pass hints about actual moved bendpoint
      // useful for connection/label layout
      hints.bendpointMove = {
        insert: insert,
        bendpointIndex: bendpointIndex
      };

      newWaypoints = this.cropWaypoints(connection, newWaypoints);

      modeling.updateWaypoints(connection, filterRedundantWaypoints(newWaypoints), hints);
    } else {
      if (type === RECONNECT_START) {
        hints.docking = 'source';

        if (isReverse(context)) {
          hints.docking = 'target';

          hints.newWaypoints = newWaypoints.reverse();
        }
      } else if (type === RECONNECT_END) {
        hints.docking = 'target';

        if (isReverse(context)) {
          hints.docking = 'source';

          hints.newWaypoints = newWaypoints.reverse();
        }
      }

      modeling.reconnect(connection, source, target, docking, hints);
    }
  }, this);
}

BendpointMove.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'dragging',
  'rules',
  'modeling'
];

BendpointMove.prototype.cropWaypoints = function(connection, newWaypoints) {
  var connectionDocking = this._injector.get('connectionDocking', false);

  if (!connectionDocking) {
    return newWaypoints;
  }

  var waypoints = connection.waypoints;

  connection.waypoints = newWaypoints;

  connection.waypoints = connectionDocking.getCroppedWaypoints(connection);

  newWaypoints = connection.waypoints;

  connection.waypoints = waypoints;

  return newWaypoints;
};


// helpers //////////

export function isReverse(context) {
  var hover = context.hover,
      source = context.source,
      target = context.target,
      type = context.type;

  if (type === RECONNECT_START) {
    return hover && target && hover === target && source !== target;
  }

  if (type === RECONNECT_END) {
    return hover && source && hover === source && source !== target;
  }
}