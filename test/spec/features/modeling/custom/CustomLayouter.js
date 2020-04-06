import { getMid } from 'lib/layout/LayoutUtil';


/**
 * A base connection layouter implementation
 * that layouts the connection by directly connecting
 * mid(source) + mid(target).
 */
export default function CustomLayouter() {}


/**
 * Return the new layouted waypoints for the given connection.
 *
 * @param {djs.model.Connection} connection
 * @param {Object} [hints]
 * @param {boolean} [hints.connectionStart]
 * @param {boolean} [hints.connectionEnd]
 *
 * @return {Array<Point>} the layouted connection waypoints
 */
CustomLayouter.prototype.layoutConnection = function(connection, hints) {

  hints = hints || {};

  var startMid = hints.connectionStart || getMid(connection.source),
      endMid = hints.connectionEnd || getMid(connection.target);

  var start = {
    x: startMid.x + 50,
    y: startMid.y + 50,
    original: startMid
  };

  var end = {
    x: endMid.x - 50,
    y: endMid.y - 50,
    original: endMid
  };

  return [
    start,
    end
  ];
};
