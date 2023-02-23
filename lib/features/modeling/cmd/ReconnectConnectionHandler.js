import { isArray } from 'min-dash';

/**
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * Reconnect connection handler.
 *
 * @param {Modeling} modeling
 */
export default function ReconnectConnectionHandler(modeling) {
  this._modeling = modeling;
}

ReconnectConnectionHandler.$inject = [ 'modeling' ];

ReconnectConnectionHandler.prototype.execute = function(context) {
  var newSource = context.newSource,
      newTarget = context.newTarget,
      connection = context.connection,
      dockingOrPoints = context.dockingOrPoints;

  if (!newSource && !newTarget) {
    throw new Error('newSource or newTarget required');
  }

  if (isArray(dockingOrPoints)) {
    context.oldWaypoints = connection.waypoints;
    connection.waypoints = dockingOrPoints;
  }

  if (newSource) {
    context.oldSource = connection.source;
    connection.source = newSource;
  }

  if (newTarget) {
    context.oldTarget = connection.target;
    connection.target = newTarget;
  }

  return connection;
};

ReconnectConnectionHandler.prototype.postExecute = function(context) {
  var connection = context.connection,
      newSource = context.newSource,
      newTarget = context.newTarget,
      dockingOrPoints = context.dockingOrPoints,
      hints = context.hints || {};

  var layoutConnectionHints = {};

  if (hints.connectionStart) {
    layoutConnectionHints.connectionStart = hints.connectionStart;
  }

  if (hints.connectionEnd) {
    layoutConnectionHints.connectionEnd = hints.connectionEnd;
  }

  if (hints.layoutConnection === false) {
    return;
  }

  if (newSource && (!newTarget || hints.docking === 'source')) {
    layoutConnectionHints.connectionStart = layoutConnectionHints.connectionStart
      || getDocking(isArray(dockingOrPoints) ? dockingOrPoints[ 0 ] : dockingOrPoints);
  }

  if (newTarget && (!newSource || hints.docking === 'target')) {
    layoutConnectionHints.connectionEnd = layoutConnectionHints.connectionEnd
      || getDocking(isArray(dockingOrPoints) ? dockingOrPoints[ dockingOrPoints.length - 1 ] : dockingOrPoints);
  }

  if (hints.newWaypoints) {
    layoutConnectionHints.waypoints = hints.newWaypoints;
  }

  this._modeling.layoutConnection(connection, layoutConnectionHints);
};

ReconnectConnectionHandler.prototype.revert = function(context) {
  var oldSource = context.oldSource,
      oldTarget = context.oldTarget,
      oldWaypoints = context.oldWaypoints,
      connection = context.connection;

  if (oldSource) {
    connection.source = oldSource;
  }

  if (oldTarget) {
    connection.target = oldTarget;
  }

  if (oldWaypoints) {
    connection.waypoints = oldWaypoints;
  }

  return connection;
};



// helpers //////////

function getDocking(point) {
  return point.original || point;
}