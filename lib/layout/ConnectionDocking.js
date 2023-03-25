/**
 * @typedef {import('../../core/Types').ElementLike} Element
 * @typedef {import('../../core/Types').ConnectionLike} Connection
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../util/Types').Point} Point
 */

/**
 * @typedef {Object} DockingPointDescriptor
 * @property {Point} point
 * @property {Point} actual
 * @property {number} idx
 */

/**
 * A layout component for connections that retrieves waypoint information.
 *
 * @class
 * @constructor
 */
export default function ConnectionDocking() {}


/**
 * Return the actual waypoints of the connection (visually).
 *
 * @param {Connection} connection
 * @param {Element} [source]
 * @param {Element} [target]
 *
 * @return {Point[]}
 */
ConnectionDocking.prototype.getCroppedWaypoints = function(connection, source, target) {
  return connection.waypoints;
};

/**
 * Return the connection docking point on the specified shape
 *
 * @param {Connection} connection
 * @param {Shape} shape
 * @param {boolean} [dockStart=false]
 *
 * @return {DockingPointDescriptor}
 */
ConnectionDocking.prototype.getDockingPoint = function(connection, shape, dockStart) {

  var waypoints = connection.waypoints,
      dockingIdx,
      dockingPoint;

  dockingIdx = dockStart ? 0 : waypoints.length - 1;
  dockingPoint = waypoints[dockingIdx];

  return {
    point: dockingPoint,
    actual: dockingPoint,
    idx: dockingIdx
  };
};