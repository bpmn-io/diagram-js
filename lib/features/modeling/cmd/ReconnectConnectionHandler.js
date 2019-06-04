import { isArray } from 'min-dash';


/**
 * Reconnect connection handler
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
    throw new Error('newSource or newTarget are required');
  }

  if (newSource && newTarget) {
    throw new Error('must specify either newSource or newTarget');
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
      dockingOrPoints = context.dockingOrPoints,
      newSource = context.newSource,
      movedEnd = newSource ? 'connectionStart' : 'connectionEnd',
      newWaypoint,
      hints = context.hints,
      layoutHints = {};

  if (hints.layoutConnection === false) {
    return;
  }

  if (isArray(dockingOrPoints)) {
    newWaypoint = newSource ? dockingOrPoints[0] : dockingOrPoints[dockingOrPoints.length - 1];
  } else {
    newWaypoint = dockingOrPoints;
  }

  layoutHints[movedEnd] = getDocking(newWaypoint);

  this._modeling.layoutConnection(connection, layoutHints);
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



// helper ///////////////

function getDocking(point) {
  return point.original || point;
}