'use strict';

var domEvent = require('min-dom/lib/event'),
    BendpointUtil = require('./BendpointUtil');

var pointsAligned = require('../../util/Geometry').pointsAligned,
    getMidPoint = require('../../util/Geometry').getMidPoint;

var BENDPOINT_CLS = BendpointUtil.BENDPOINT_CLS,
    SEGMENT_DRAGGER_CLS = BendpointUtil.SEGMENT_DRAGGER_CLS;

var getApproxIntersection = require('../../util/LineIntersection').getApproxIntersection;


/**
 * A service that adds editable bendpoints to connections.
 */
function Bendpoints(eventBus, canvas, interactionEvents,
                    bendpointMove, connectionSegmentMove) {

  function getConnectionIntersection(waypoints, event) {
    var localPosition = BendpointUtil.toCanvasCoordinates(canvas, event),
        intersection = getApproxIntersection(waypoints, localPosition);

    return intersection;
  }

  function isIntersectionMiddle(intersection, waypoints, treshold) {
    var idx = intersection.index,
        p = intersection.point,
        p0, p1, mid, aligned, xDelta, yDelta;

    if (idx <= 0 || intersection.bendpoint) {
      return false;
    }

    p0 = waypoints[idx - 1];
    p1 = waypoints[idx];
    mid = getMidPoint(p0, p1),
    aligned = pointsAligned(p0, p1);
    xDelta = Math.abs(p.x - mid.x);
    yDelta = Math.abs(p.y - mid.y);

    return aligned && xDelta <= treshold && yDelta <= treshold;
  }

  function activateBendpointMove(event, connection) {
    var waypoints = connection.waypoints,
        intersection = getConnectionIntersection(waypoints, event);

    if (!intersection) {
      return;
    }

    if (isIntersectionMiddle(intersection, waypoints, 10)) {
      connectionSegmentMove.start(event, connection, intersection.index);
    } else {
      bendpointMove.start(event, connection, intersection.index, !intersection.bendpoint);
    }
  }

  function getBendpointsContainer(element, create) {

    var layer = canvas.getLayer('overlays'),
        gfx = layer.select('.djs-bendpoints[data-element-id=' + element.id + ']');

    if (!gfx && create) {
      gfx = layer.group().addClass('djs-bendpoints').attr('data-element-id', element.id);

      domEvent.bind(gfx.node, 'mousedown', function(event) {
        activateBendpointMove(event, element);
      });

      // make sure to select the underlying connection
      // on dragger click. this allows us to select very
      // short connections that would otherwise be
      // overlayed by drag handles.
      domEvent.bind(gfx.node, 'click', function(event) {
        // emit syntetic element.click event on connection
        event.stopPropagation();
      });

      domEvent.bind(gfx.node, 'dblclick', function(event) {
        // emit syntetic element.dblclick event on connection
        eventBus.fire('element.dblclick', {element: element, gfx: gfx, originalEvent: event});
        event.stopPropagation();
      });
    }

    return gfx;
  }

  function createBendpoints(gfx, connection) {
    connection.waypoints.forEach(function(p, idx) {
      BendpointUtil.addBendpoint(gfx).translate(p.x, p.y);
    });

    // add floating bendpoint
    BendpointUtil.addBendpoint(gfx, 'floating');
  }

  function createSegmentDraggers(gfx, connection) {

    var waypoints = connection.waypoints;

    var segmentStart,
        segmentEnd;

    for (var i = 1; i < waypoints.length; i++) {

      segmentStart = waypoints[i - 1];
      segmentEnd = waypoints[i];

      if (pointsAligned(segmentStart, segmentEnd)) {
        BendpointUtil.addSegmentDragger(gfx, segmentStart, segmentEnd);
      }
    }
  }

  function clearBendpoints(gfx) {
    gfx.selectAll('.' + BENDPOINT_CLS).forEach(function(s) {
      s.remove();
    });
  }

  function clearSegmentDraggers(gfx) {
    gfx.selectAll('.' + SEGMENT_DRAGGER_CLS).forEach(function(s) {
      s.remove();
    });
  }

  function addHandles(connection) {

    var gfx = getBendpointsContainer(connection);

    if (!gfx) {
      gfx = getBendpointsContainer(connection, true);

      createBendpoints(gfx, connection);
      createSegmentDraggers(gfx, connection);
    }

    return gfx;
  }

  function updateHandles(connection) {

    var gfx = getBendpointsContainer(connection);

    if (gfx) {
      clearSegmentDraggers(gfx);
      clearBendpoints(gfx);
      createSegmentDraggers(gfx, connection);
      createBendpoints(gfx, connection);
    }
  }

  eventBus.on('connection.changed', function(event) {
    updateHandles(event.element);
  });

  eventBus.on('connection.remove', function(event) {
    var gfx = getBendpointsContainer(event.element);

    if (gfx) {
      gfx.remove();
    }
  });

  eventBus.on('element.marker.update', function(event) {

    var element = event.element,
        bendpointsGfx;

    if (!element.waypoints) {
      return;
    }

    bendpointsGfx = addHandles(element);
    bendpointsGfx[event.add ? 'addClass' : 'removeClass'](event.marker);
  });

  eventBus.on('element.mousemove', function(event) {

    var element = event.element,
        waypoints = element.waypoints,
        bendpointsGfx,
        floating,
        intersection;

    if (waypoints) {

      bendpointsGfx = getBendpointsContainer(element, true);
      floating = bendpointsGfx.select('.floating');

      if (!floating) {
        return;
      }

      intersection = getConnectionIntersection(waypoints, event.originalEvent);

      if (intersection) {
        floating.translate(intersection.point.x, intersection.point.y);
      }
    }
  });

  eventBus.on('element.mousedown', function(event) {

    var originalEvent = event.originalEvent,
        element = event.element,
        waypoints = element.waypoints;

    if (!waypoints) {
      return;
    }

    activateBendpointMove(originalEvent, element, waypoints);
  });

  eventBus.on('selection.changed', function(event) {
    var newSelection = event.newSelection,
        primary = newSelection[0];

    if (primary && primary.waypoints) {
      addHandles(primary);
    }
  });

  eventBus.on('element.hover', function(event) {
    var element = event.element;

    if (element.waypoints) {
      addHandles(element);
      interactionEvents.registerEvent(event.gfx.node, 'mousemove', 'element.mousemove');
    }
  });

  eventBus.on('element.out', function(event) {
    interactionEvents.unregisterEvent(event.gfx.node, 'mousemove', 'element.mousemove');
  });
}

Bendpoints.$inject = [
  'eventBus', 'canvas', 'interactionEvents',
  'bendpointMove', 'connectionSegmentMove'
];

module.exports = Bendpoints;
