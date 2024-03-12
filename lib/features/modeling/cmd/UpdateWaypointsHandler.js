/**
 * A handler that implements reversible updating of
 * connection waypoints.
 */
export default function UpdateWaypointsHandler() { }

UpdateWaypointsHandler.prototype.execute = function(context) {

  var connection = context.connection,
      newWaypoints = context.newWaypoints;

  context.oldWaypoints = connection.waypoints;

  connection.waypoints = newWaypoints;

  return connection;
};

UpdateWaypointsHandler.prototype.revert = function(context) {

  var connection = context.connection,
      oldWaypoints = context.oldWaypoints;

  connection.waypoints = oldWaypoints;

  return connection;
};