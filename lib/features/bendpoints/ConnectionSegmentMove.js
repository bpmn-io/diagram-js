import {
  pointsAligned,
  pointsOnLine
} from '../../util/Geometry';

import {
  addSegmentDragger,
  getConnectionIntersection
} from './BendpointUtil';

import {
  getMid,
  getOrientation
} from '../../layout/LayoutUtil';

var MARKER_CONNECT_HOVER = 'connect-hover',
    MARKER_CONNECT_UPDATING = 'djs-updating';

import {
  classes as svgClasses,
  remove as svgRemove
} from 'tiny-svg';

import {
  translate
} from '../../util/SvgTransformUtil';


function axisAdd(point, axis, delta) {
  return axisSet(point, axis, point[axis] + delta);
}

function axisSet(point, axis, value) {
  return {
    x: (axis === 'x' ? value : point.x),
    y: (axis === 'y' ? value : point.y)
  };
}

function axisFenced(position, segmentStart, segmentEnd, axis) {

  var maxValue = Math.max(segmentStart[axis], segmentEnd[axis]),
      minValue = Math.min(segmentStart[axis], segmentEnd[axis]);

  var padding = 20;

  var fencedValue = Math.min(Math.max(minValue + padding, position[axis]), maxValue - padding);

  return axisSet(segmentStart, axis, fencedValue);
}

function flipAxis(axis) {
  return axis === 'x' ? 'y' : 'x';
}

/**
 * Get the docking point on the given element.
 *
 * Compute a reasonable docking, if non exists.
 *
 * @param  {Point} point
 * @param  {djs.model.Shape} referenceElement
 * @param  {String} moveAxis (x|y)
 *
 * @return {Point}
 */
function getDocking(point, referenceElement, moveAxis) {

  var referenceMid,
      inverseAxis;

  if (point.original) {
    return point.original;
  } else {
    referenceMid = getMid(referenceElement);
    inverseAxis = flipAxis(moveAxis);

    return axisSet(point, inverseAxis, referenceMid[inverseAxis]);
  }
}

/**
 * A component that implements moving of bendpoints
 */
export default function ConnectionSegmentMove(
    injector, eventBus, canvas,
    dragging, graphicsFactory, modeling) {

  // optional connection docking integration
  var connectionDocking = injector.get('connectionDocking', false);


  // API

  this.start = function(event, connection, idx) {

    var context,
        gfx = canvas.getGraphics(connection),
        segmentStartIndex = idx - 1,
        segmentEndIndex = idx,
        waypoints = connection.waypoints,
        segmentStart = waypoints[segmentStartIndex],
        segmentEnd = waypoints[segmentEndIndex],
        intersection = getConnectionIntersection(canvas, waypoints, event),
        direction, axis, dragPosition;

    direction = pointsAligned(segmentStart, segmentEnd);

    // do not move diagonal connection
    if (!direction) {
      return;
    }

    // the axis where we are going to move things
    axis = direction === 'v' ? 'x' : 'y';

    if (segmentStartIndex === 0) {
      segmentStart = getDocking(segmentStart, connection.source, axis);
    }

    if (segmentEndIndex === waypoints.length - 1) {
      segmentEnd = getDocking(segmentEnd, connection.target, axis);
    }

    if (intersection) {
      dragPosition = intersection.point;
    } else {

      // set to segment center as default
      dragPosition = {
        x: (segmentStart.x + segmentEnd.x) / 2,
        y: (segmentStart.y + segmentEnd.y) / 2
      };
    }

    context = {
      connection: connection,
      segmentStartIndex: segmentStartIndex,
      segmentEndIndex: segmentEndIndex,
      segmentStart: segmentStart,
      segmentEnd: segmentEnd,
      axis: axis,
      dragPosition: dragPosition
    };

    dragging.init(event, dragPosition, 'connectionSegment.move', {
      cursor: axis === 'x' ? 'resize-ew' : 'resize-ns',
      data: {
        connection: connection,
        connectionGfx: gfx,
        context: context
      }
    });
  };

  /**
   * Crop connection if connection cropping is provided.
   *
   * @param {Connection} connection
   * @param {Array<Point>} newWaypoints
   *
   * @return {Array<Point>} cropped connection waypoints
   */
  function cropConnection(connection, newWaypoints) {

    // crop connection, if docking service is provided only
    if (!connectionDocking) {
      return newWaypoints;
    }

    var oldWaypoints = connection.waypoints,
        croppedWaypoints;

    // temporary set new waypoints
    connection.waypoints = newWaypoints;

    croppedWaypoints = connectionDocking.getCroppedWaypoints(connection);

    // restore old waypoints
    connection.waypoints = oldWaypoints;

    return croppedWaypoints;
  }

  // DRAGGING IMPLEMENTATION

  function redrawConnection(data) {
    graphicsFactory.update('connection', data.connection, data.connectionGfx);
  }

  function updateDragger(context, segmentOffset, event) {

    var newWaypoints = context.newWaypoints,
        segmentStartIndex = context.segmentStartIndex + segmentOffset,
        segmentStart = newWaypoints[segmentStartIndex],
        segmentEndIndex = context.segmentEndIndex + segmentOffset,
        segmentEnd = newWaypoints[segmentEndIndex],
        axis = flipAxis(context.axis);

    // make sure the dragger does not move
    // outside the connection
    var draggerPosition = axisFenced(event, segmentStart, segmentEnd, axis);

    // update dragger
    translate(context.draggerGfx, draggerPosition.x, draggerPosition.y);
  }

  /**
   * Filter waypoints for redundant ones (i.e. on the same axis).
   * Returns the filtered waypoints and the offset related to the segment move.
   *
   * @param {Array<Point>} waypoints
   * @param {Integer} segmentStartIndex of moved segment start
   *
   * @return {Object} { filteredWaypoints, segmentOffset }
   */
  function filterRedundantWaypoints(waypoints, segmentStartIndex) {

    var segmentOffset = 0;

    var filteredWaypoints = waypoints.filter(function(r, idx) {
      if (pointsOnLine(waypoints[idx - 1], waypoints[idx + 1], r)) {

        // remove point and increment offset
        segmentOffset = idx <= segmentStartIndex ? segmentOffset - 1 : segmentOffset;
        return false;
      }

      // dont remove point
      return true;
    });

    return {
      waypoints: filteredWaypoints,
      segmentOffset: segmentOffset
    };
  }

  eventBus.on('connectionSegment.move.start', function(event) {

    var context = event.context,
        connection = event.connection,
        layer = canvas.getLayer('overlays');

    context.originalWaypoints = connection.waypoints.slice();

    // add dragger gfx
    context.draggerGfx = addSegmentDragger(layer, context.segmentStart, context.segmentEnd);
    svgClasses(context.draggerGfx).add('djs-dragging');

    canvas.addMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on('connectionSegment.move.move', function(event) {

    var context = event.context,
        connection = context.connection,
        segmentStartIndex = context.segmentStartIndex,
        segmentEndIndex = context.segmentEndIndex,
        segmentStart = context.segmentStart,
        segmentEnd = context.segmentEnd,
        axis = context.axis;

    var newWaypoints = context.originalWaypoints.slice(),
        newSegmentStart = axisAdd(segmentStart, axis, event['d' + axis]),
        newSegmentEnd = axisAdd(segmentEnd, axis, event['d' + axis]);

    // original waypoint count and added / removed
    // from start waypoint delta. We use the later
    // to retrieve the updated segmentStartIndex / segmentEndIndex
    var waypointCount = newWaypoints.length,
        segmentOffset = 0;

    // move segment start / end by axis delta
    newWaypoints[segmentStartIndex] = newSegmentStart;
    newWaypoints[segmentEndIndex] = newSegmentEnd;

    var sourceToSegmentOrientation,
        targetToSegmentOrientation;

    // handle first segment
    if (segmentStartIndex < 2) {
      sourceToSegmentOrientation = getOrientation(connection.source, newSegmentStart);

      // first bendpoint, remove first segment if intersecting
      if (segmentStartIndex === 1) {

        if (sourceToSegmentOrientation === 'intersect') {
          newWaypoints.shift();
          newWaypoints[0] = newSegmentStart;
          segmentOffset--;
        }
      }

      // docking point, add segment if not intersecting anymore
      else {
        if (sourceToSegmentOrientation !== 'intersect') {
          newWaypoints.unshift(segmentStart);
          segmentOffset++;
        }
      }
    }

    // handle last segment
    if (segmentEndIndex > waypointCount - 3) {
      targetToSegmentOrientation = getOrientation(connection.target, newSegmentEnd);

      // last bendpoint, remove last segment if intersecting
      if (segmentEndIndex === waypointCount - 2) {

        if (targetToSegmentOrientation === 'intersect') {
          newWaypoints.pop();
          newWaypoints[newWaypoints.length - 1] = newSegmentEnd;
        }
      }

      // last bendpoint, remove last segment if intersecting
      else {
        if (targetToSegmentOrientation !== 'intersect') {
          newWaypoints.push(segmentEnd);
        }
      }
    }

    // update connection waypoints
    context.newWaypoints = connection.waypoints = cropConnection(connection, newWaypoints);

    // update dragger position
    updateDragger(context, segmentOffset, event);

    // save segmentOffset in context
    context.newSegmentStartIndex = segmentStartIndex + segmentOffset;

    // redraw connection
    redrawConnection(event);
  });

  eventBus.on('connectionSegment.move.hover', function(event) {

    event.context.hover = event.hover;
    canvas.addMarker(event.hover, MARKER_CONNECT_HOVER);
  });

  eventBus.on([
    'connectionSegment.move.out',
    'connectionSegment.move.cleanup'
  ], function(event) {

    // remove connect marker
    // if it was added
    var hover = event.context.hover;

    if (hover) {
      canvas.removeMarker(hover, MARKER_CONNECT_HOVER);
    }
  });

  eventBus.on('connectionSegment.move.cleanup', function(event) {

    var context = event.context,
        connection = context.connection;

    // remove dragger gfx
    if (context.draggerGfx) {
      svgRemove(context.draggerGfx);
    }

    canvas.removeMarker(connection, MARKER_CONNECT_UPDATING);
  });

  eventBus.on([
    'connectionSegment.move.cancel',
    'connectionSegment.move.end'
  ], function(event) {
    var context = event.context,
        connection = context.connection;

    connection.waypoints = context.originalWaypoints;

    redrawConnection(event);
  });

  eventBus.on('connectionSegment.move.end', function(event) {

    var context = event.context,
        connection = context.connection,
        newWaypoints = context.newWaypoints,
        newSegmentStartIndex = context.newSegmentStartIndex;

    // ensure we have actual pixel values bendpoint
    // coordinates (important when zoom level was > 1 during move)
    newWaypoints = newWaypoints.map(function(p) {
      return {
        original: p.original,
        x: Math.round(p.x),
        y: Math.round(p.y)
      };
    });

    // apply filter redunant waypoints
    var filtered = filterRedundantWaypoints(newWaypoints, newSegmentStartIndex);

    // get filtered waypoints
    var filteredWaypoints = filtered.waypoints,
        croppedWaypoints = cropConnection(connection, filteredWaypoints),
        segmentOffset = filtered.segmentOffset;

    var hints = {
      segmentMove: {
        segmentStartIndex: context.segmentStartIndex,
        newSegmentStartIndex: newSegmentStartIndex + segmentOffset
      }
    };

    modeling.updateWaypoints(connection, croppedWaypoints, hints);
  });
}

ConnectionSegmentMove.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'dragging',
  'graphicsFactory',
  'modeling'
];
