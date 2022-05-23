import {
  assign,
  forEach,
  isArray
} from 'min-dash';

import { setSnapped } from '../snapping/SnapUtil';

import { getClosestPointOnConnection } from './BendpointUtil';

var abs = Math.abs,
    round = Math.round;

var TOLERANCE = 10;


export default function BendpointSnapping(eventBus) {

  function snapTo(values, value) {

    if (isArray(values)) {
      var i = values.length;

      while (i--) if (abs(values[i] - value) <= TOLERANCE) {
        return values[i];
      }
    } else {
      values = +values;
      var rem = value % values;

      if (rem < TOLERANCE) {
        return value - rem;
      }

      if (rem > values - TOLERANCE) {
        return value - rem + values;
      }
    }

    return value;
  }

  function getSnapPoint(element, event) {

    if (element.waypoints) {
      return getClosestPointOnConnection(event, element);
    }

    if (element.width) {
      return {
        x: round(element.width / 2 + element.x),
        y: round(element.height / 2 + element.y)
      };
    }
  }

  // connection segment snapping //////////////////////

  function getConnectionSegmentSnaps(event) {

    var context = event.context,
        snapPoints = context.snapPoints,
        connection = context.connection,
        waypoints = connection.waypoints,
        segmentStart = context.segmentStart,
        segmentStartIndex = context.segmentStartIndex,
        segmentEnd = context.segmentEnd,
        segmentEndIndex = context.segmentEndIndex,
        axis = context.axis;

    if (snapPoints) {
      return snapPoints;
    }

    var referenceWaypoints = [
      waypoints[segmentStartIndex - 1],
      segmentStart,
      segmentEnd,
      waypoints[segmentEndIndex + 1]
    ];

    if (segmentStartIndex < 2) {
      referenceWaypoints.unshift(getSnapPoint(connection.source, event));
    }

    if (segmentEndIndex > waypoints.length - 3) {
      referenceWaypoints.unshift(getSnapPoint(connection.target, event));
    }

    context.snapPoints = snapPoints = { horizontal: [] , vertical: [] };

    forEach(referenceWaypoints, function(p) {

      // we snap on existing bendpoints only,
      // not placeholders that are inserted during add
      if (p) {
        p = p.original || p;

        if (axis === 'y') {
          snapPoints.horizontal.push(p.y);
        }

        if (axis === 'x') {
          snapPoints.vertical.push(p.x);
        }
      }
    });

    return snapPoints;
  }

  eventBus.on('connectionSegment.move.move', 1500, function(event) {
    var snapPoints = getConnectionSegmentSnaps(event),
        x = event.x,
        y = event.y,
        sx, sy;

    if (!snapPoints) {
      return;
    }

    // snap
    sx = snapTo(snapPoints.vertical, x);
    sy = snapTo(snapPoints.horizontal, y);


    // correction x/y
    var cx = (x - sx),
        cy = (y - sy);

    // update delta
    assign(event, {
      dx: event.dx - cx,
      dy: event.dy - cy,
      x: sx,
      y: sy
    });

    // only set snapped if actually snapped
    if (cx || snapPoints.vertical.indexOf(x) !== -1) {
      setSnapped(event, 'x', sx);
    }

    if (cy || snapPoints.horizontal.indexOf(y) !== -1) {
      setSnapped(event, 'y', sy);
    }
  });


  // bendpoint snapping //////////////////////

  function getBendpointSnaps(context) {

    var snapPoints = context.snapPoints,
        waypoints = context.connection.waypoints,
        bendpointIndex = context.bendpointIndex;

    if (snapPoints) {
      return snapPoints;
    }

    var referenceWaypoints = [ waypoints[bendpointIndex - 1], waypoints[bendpointIndex + 1] ];

    context.snapPoints = snapPoints = { horizontal: [] , vertical: [] };

    forEach(referenceWaypoints, function(p) {

      // we snap on existing bendpoints only,
      // not placeholders that are inserted during add
      if (p) {
        p = p.original || p;

        snapPoints.horizontal.push(p.y);
        snapPoints.vertical.push(p.x);
      }
    });

    return snapPoints;
  }

  // Snap Endpoint of new connection
  eventBus.on([
    'connect.hover',
    'connect.move',
    'connect.end'
  ], 1500, function(event) {
    var context = event.context,
        hover = context.hover,
        hoverMid = hover && getSnapPoint(hover, event);

    // only snap on connections, elements can have multiple connect endpoints
    if (!isConnection(hover) || !hoverMid || !hoverMid.x || !hoverMid.y) {
      return;
    }

    setSnapped(event, 'x', hoverMid.x);
    setSnapped(event, 'y', hoverMid.y);
  });

  eventBus.on([ 'bendpoint.move.move', 'bendpoint.move.end' ], 1500, function(event) {

    var context = event.context,
        snapPoints = getBendpointSnaps(context),
        hover = context.hover,
        hoverMid = hover && getSnapPoint(hover, event),
        x = event.x,
        y = event.y,
        sx, sy;

    if (!snapPoints) {
      return;
    }

    // snap to hover mid
    sx = snapTo(hoverMid ? snapPoints.vertical.concat([ hoverMid.x ]) : snapPoints.vertical, x);
    sy = snapTo(hoverMid ? snapPoints.horizontal.concat([ hoverMid.y ]) : snapPoints.horizontal, y);

    // correction x/y
    var cx = (x - sx),
        cy = (y - sy);

    // update delta
    assign(event, {
      dx: event.dx - cx,
      dy: event.dy - cy,
      x: event.x - cx,
      y: event.y - cy
    });

    // only set snapped if actually snapped
    if (cx || snapPoints.vertical.indexOf(x) !== -1) {
      setSnapped(event, 'x', sx);
    }

    if (cy || snapPoints.horizontal.indexOf(y) !== -1) {
      setSnapped(event, 'y', sy);
    }
  });
}


BendpointSnapping.$inject = [ 'eventBus' ];


// helpers //////////////////////

function isConnection(element) {
  return element && !!element.waypoints;
}
