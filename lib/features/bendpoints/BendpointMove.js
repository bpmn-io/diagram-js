import { filterRedundantWaypoints } from '../../layout/LayoutUtil';

const round = Math.round;

const RECONNECT_START = 'reconnectStart';
const RECONNECT_END = 'reconnectEnd';
const UPDATE_WAYPOINTS = 'updateWaypoints';

/**
 * Move bendpoints through drag and drop to add/remove bendpoints or reconnect connection.
 */
export default class BendpointMove {
  constructor(injector, eventBus, canvas, dragging, rules, modeling) {
    this._injector = injector;

    this.start = (event, connection, bendpointIndex, insert) => {
      const gfx = canvas.getGraphics(connection);
      const source = connection.source;
      const target = connection.target;
      const waypoints = connection.waypoints;
      let type;

      if (!insert && bendpointIndex === 0) {
        type = RECONNECT_START;
      } else
      if (!insert && bendpointIndex === waypoints.length - 1) {
        type = RECONNECT_END;
      } else {
        type = UPDATE_WAYPOINTS;
      }

      const command = type === UPDATE_WAYPOINTS ? 'connection.updateWaypoints' : 'connection.reconnect';

      let allowed = rules.allowed(command, {
        connection,
        source,
        target
      });

      if (allowed === false) {
        allowed = rules.allowed(command, {
          connection,
          source: target,
          target: source
        });
      }

      if (allowed === false) {
        return;
      }

      dragging.init(event, 'bendpoint.move', {
        data: {
          connection,
          connectionGfx: gfx,
          context: {
            allowed,
            bendpointIndex,
            connection,
            source,
            target,
            insert,
            type
          }
        }
      });
    };

    eventBus.on('bendpoint.move.hover', event => {
      const context = event.context;
      const connection = context.connection;
      const source = connection.source;
      const target = connection.target;
      const hover = event.hover;
      const type = context.type;

      // cache hover state
      context.hover = hover;

      let allowed;

      if (!hover) {
        return;
      }

      const command = type === UPDATE_WAYPOINTS ? 'connection.updateWaypoints' : 'connection.reconnect';

      allowed = context.allowed = rules.allowed(command, {
        connection,
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
          connection,
          source: type === RECONNECT_END ? hover : target,
          target: type === RECONNECT_START ? hover : source
        });
      }

      if (allowed) {
        context.source = type === RECONNECT_END ? hover : target;
        context.target = type === RECONNECT_START ? hover : source;
      }
    });

    eventBus.on([ 'bendpoint.move.out', 'bendpoint.move.cleanup' ], event => {
      const context = event.context;

      context.hover = null;
      context.source = null;
      context.target = null;

      context.allowed = false;
    });

    eventBus.on('bendpoint.move.end', function(event) {
      const context = event.context;
      const allowed = context.allowed;
      const bendpointIndex = context.bendpointIndex;
      const connection = context.connection;
      const insert = context.insert;
      let newWaypoints = connection.waypoints.slice();
      const source = context.source;
      const target = context.target;
      const type = context.type;
      const hints = context.hints || {};

      // ensure integer values (important if zoom level was > 1 during move)
      const docking = {
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
          insert,
          bendpointIndex
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

  cropWaypoints(connection, newWaypoints) {
    const connectionDocking = this._injector.get('connectionDocking', false);

    if (!connectionDocking) {
      return newWaypoints;
    }

    const waypoints = connection.waypoints;

    connection.waypoints = newWaypoints;

    connection.waypoints = connectionDocking.getCroppedWaypoints(connection);

    newWaypoints = connection.waypoints;

    connection.waypoints = waypoints;

    return newWaypoints;
  }
}

BendpointMove.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'dragging',
  'rules',
  'modeling'
];


// helpers //////////

export function isReverse(context) {
  const hover = context.hover;
  const source = context.source;
  const target = context.target;
  const type = context.type;

  if (type === RECONNECT_START) {
    return hover && target && hover === target && source !== target;
  }

  if (type === RECONNECT_END) {
    return hover && source && hover === source && source !== target;
  }
}