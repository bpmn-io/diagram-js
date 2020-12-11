import { forEach } from 'min-dash';

import {
  event as domEvent,
  query as domQuery,
  queryAll as domQueryAll
} from 'min-dom';

import {
  BENDPOINT_CLS,
  SEGMENT_DRAGGER_CLS,
  addBendpoint,
  addSegmentDragger,
  calculateSegmentMoveRegion,
  getConnectionIntersection
} from './BendpointUtil';

import {
  escapeCSS
} from '../../util/EscapeUtil';

import {
  pointsAligned,
  getMidPoint
} from '../../util/Geometry';

import {
  isPrimaryButton
} from '../../util/Mouse';

import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  translate
} from '../../util/SvgTransformUtil';


/**
 * A service that adds editable bendpoints to connections.
 */
export default function Bendpoints(
    eventBus, canvas, interactionEvents,
    bendpointMove, connectionSegmentMove) {

  /**
   * Returns true if intersection point is inside middle region of segment, adjusted by
   * optional threshold
   */
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

  /**
   * Calculates the threshold from a connection's middle which fits the two-third-region
   */
  function calculateIntersectionThreshold(connection, intersection) {
    var waypoints = connection.waypoints,
        relevantSegment, alignment, segmentLength, threshold;

    if (intersection.index <= 0 || intersection.bendpoint) {
      return null;
    }

    // segment relative to connection intersection
    relevantSegment = {
      start: waypoints[intersection.index - 1],
      end: waypoints[intersection.index]
    };

    alignment = pointsAligned(relevantSegment.start, relevantSegment.end);

    if (!alignment) {
      return null;
    }

    if (alignment === 'h') {
      segmentLength = relevantSegment.end.x - relevantSegment.start.x;
    } else {
      segmentLength = relevantSegment.end.y - relevantSegment.start.y;
    }

    // calculate threshold relative to 2/3 of segment length
    threshold = calculateSegmentMoveRegion(segmentLength) / 2;

    return threshold;
  }

  function activateBendpointMove(event, connection) {
    var waypoints = connection.waypoints,
        intersection = getConnectionIntersection(canvas, waypoints, event),
        threshold;

    if (!intersection) {
      return;
    }

    threshold = calculateIntersectionThreshold(connection, intersection);

    if (isIntersectionMiddle(intersection, waypoints, threshold)) {
      connectionSegmentMove.start(event, connection, intersection.index);
    } else {
      bendpointMove.start(event, connection, intersection.index, !intersection.bendpoint);
    }

    // we've handled the event
    return true;
  }

  function bindInteractionEvents(node, eventName, element) {

    domEvent.bind(node, eventName, function(event) {
      interactionEvents.triggerMouseEvent(eventName, event, element);
      event.stopPropagation();
    });
  }

  function getBendpointsContainer(element, create) {

    var layer = canvas.getLayer('overlays'),
        gfx = domQuery('.djs-bendpoints[data-element-id="' + escapeCSS(element.id) + '"]', layer);

    if (!gfx && create) {
      gfx = svgCreate('g');
      svgAttr(gfx, { 'data-element-id': element.id });
      svgClasses(gfx).add('djs-bendpoints');

      svgAppend(layer, gfx);

      bindInteractionEvents(gfx, 'mousedown', element);
      bindInteractionEvents(gfx, 'click', element);
      bindInteractionEvents(gfx, 'dblclick', element);
    }

    return gfx;
  }

  function getSegmentDragger(idx, parentGfx) {
    return domQuery(
      '.djs-segment-dragger[data-segment-idx="' + idx + '"]',
      parentGfx
    );
  }

  function createBendpoints(gfx, connection) {
    connection.waypoints.forEach(function(p, idx) {
      var bendpoint = addBendpoint(gfx);

      svgAppend(gfx, bendpoint);

      translate(bendpoint, p.x, p.y);
    });

    // add floating bendpoint
    addBendpoint(gfx, 'floating');
  }

  function createSegmentDraggers(gfx, connection) {

    var waypoints = connection.waypoints;

    var segmentStart,
        segmentEnd,
        segmentDraggerGfx;

    for (var i = 1; i < waypoints.length; i++) {

      segmentStart = waypoints[i - 1];
      segmentEnd = waypoints[i];

      if (pointsAligned(segmentStart, segmentEnd)) {
        segmentDraggerGfx = addSegmentDragger(gfx, segmentStart, segmentEnd);

        svgAttr(segmentDraggerGfx, { 'data-segment-idx': i });

        bindInteractionEvents(segmentDraggerGfx, 'mousemove', connection);
      }
    }
  }

  function clearBendpoints(gfx) {
    forEach(domQueryAll('.' + BENDPOINT_CLS, gfx), function(node) {
      svgRemove(node);
    });
  }

  function clearSegmentDraggers(gfx) {
    forEach(domQueryAll('.' + SEGMENT_DRAGGER_CLS, gfx), function(node) {
      svgRemove(node);
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

  function updateFloatingBendpointPosition(parentGfx, intersection) {
    var floating = domQuery('.floating', parentGfx),
        point = intersection.point;

    if (!floating) {
      return;
    }

    translate(floating, point.x, point.y);

  }

  function updateSegmentDraggerPosition(parentGfx, intersection, waypoints) {

    var draggerGfx = getSegmentDragger(intersection.index, parentGfx),
        segmentStart = waypoints[intersection.index - 1],
        segmentEnd = waypoints[intersection.index],
        point = intersection.point,
        mid = getMidPoint(segmentStart, segmentEnd),
        alignment = pointsAligned(segmentStart, segmentEnd),
        draggerVisual, relativePosition;

    if (!draggerGfx) {
      return;
    }

    draggerVisual = getDraggerVisual(draggerGfx);

    relativePosition = {
      x: point.x - mid.x,
      y: point.y - mid.y
    };

    if (alignment === 'v') {

      // rotate position
      relativePosition = {
        x: relativePosition.y,
        y: relativePosition.x
      };
    }

    translate(draggerVisual, relativePosition.x, relativePosition.y);
  }

  eventBus.on('connection.changed', function(event) {
    updateHandles(event.element);
  });

  eventBus.on('connection.remove', function(event) {
    var gfx = getBendpointsContainer(event.element);

    if (gfx) {
      svgRemove(gfx);
    }
  });

  eventBus.on('element.marker.update', function(event) {

    var element = event.element,
        bendpointsGfx;

    if (!element.waypoints) {
      return;
    }

    bendpointsGfx = addHandles(element);

    if (event.add) {
      svgClasses(bendpointsGfx).add(event.marker);
    } else {
      svgClasses(bendpointsGfx).remove(event.marker);
    }
  });

  eventBus.on('element.mousemove', function(event) {

    var element = event.element,
        waypoints = element.waypoints,
        bendpointsGfx,
        intersection;

    if (waypoints) {
      bendpointsGfx = getBendpointsContainer(element, true);

      intersection = getConnectionIntersection(canvas, waypoints, event.originalEvent);

      if (!intersection) {
        return;
      }

      updateFloatingBendpointPosition(bendpointsGfx, intersection);

      if (!intersection.bendpoint) {
        updateSegmentDraggerPosition(bendpointsGfx, intersection, waypoints);
      }

    }
  });

  eventBus.on('element.mousedown', function(event) {

    if (!isPrimaryButton(event)) {
      return;
    }

    var originalEvent = event.originalEvent,
        element = event.element;

    if (!element.waypoints) {
      return;
    }

    return activateBendpointMove(originalEvent, element);
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
      interactionEvents.registerEvent(event.gfx, 'mousemove', 'element.mousemove');
    }
  });

  eventBus.on('element.out', function(event) {
    interactionEvents.unregisterEvent(event.gfx, 'mousemove', 'element.mousemove');
  });

  // update bendpoint container data attribute on element ID change
  eventBus.on('element.updateId', function(context) {
    var element = context.element,
        newId = context.newId;

    if (element.waypoints) {
      var bendpointContainer = getBendpointsContainer(element);

      if (bendpointContainer) {
        svgAttr(bendpointContainer, { 'data-element-id': newId });
      }
    }
  });

  // API

  this.addHandles = addHandles;
  this.updateHandles = updateHandles;
  this.getBendpointsContainer = getBendpointsContainer;
  this.getSegmentDragger = getSegmentDragger;
}

Bendpoints.$inject = [
  'eventBus',
  'canvas',
  'interactionEvents',
  'bendpointMove',
  'connectionSegmentMove'
];



// helper /////////////

function getDraggerVisual(draggerGfx) {
  return domQuery('.djs-visual', draggerGfx);
}