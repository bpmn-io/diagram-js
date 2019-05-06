import {
  append as svgAppend,
  attr as svgAttr,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  getElementLineIntersection
} from '../../layout/LayoutUtil';


var HIGH_PRIORITY = 1100,
    LOW_PRIORITY = 900;

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok';


export default function ConnectPreview(eventBus, canvas, graphicsFactory) {

  function crop(start, end, source, target) {

    var sourcePath = graphicsFactory.getShapePath(source),
        targetPath = target && graphicsFactory.getShapePath(target),
        connectionPath = graphicsFactory.getConnectionPath({ waypoints: [ start, end ] });

    start = getElementLineIntersection(sourcePath, connectionPath, true) || start;
    end = (target && getElementLineIntersection(targetPath, connectionPath, false)) || end;

    return [ start, end ];
  }


  // event handlers

  eventBus.on('connect.move', function(event) {

    var context = event.context,
        source = context.source,
        target = context.target,
        visual = context.visual,
        sourcePosition = context.sourcePosition,
        endPosition,
        waypoints;

    // update connection visuals during drag

    endPosition = {
      x: event.x,
      y: event.y
    };

    waypoints = crop(sourcePosition, endPosition, source, target);

    svgAttr(visual, { 'points': [ waypoints[0].x, waypoints[0].y, waypoints[1].x, waypoints[1].y ] });
  });

  eventBus.on('connect.hover', LOW_PRIORITY, function(event) {
    var context = event.context,
        hover = event.hover,
        canExecute = context.canExecute;

    // simply ignore hover
    if (canExecute === null) {
      return;
    }

    canvas.addMarker(hover, canExecute ? MARKER_OK : MARKER_NOT_OK);
  });

  eventBus.on([ 'connect.out', 'connect.cleanup' ], HIGH_PRIORITY, function(event) {
    var context = event.context;

    if (context.target) {
      canvas.removeMarker(context.target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('connect.cleanup', function(event) {
    var context = event.context;

    if (context.visual) {
      svgRemove(context.visual);
    }
  });

  eventBus.on('connect.start', function(event) {
    var context = event.context,
        visual;

    visual = svgCreate('polyline');
    svgAttr(visual, {
      'stroke': '#333',
      'strokeDasharray': [ 1 ],
      'strokeWidth': 2,
      'pointer-events': 'none'
    });

    svgAppend(canvas.getDefaultLayer(), visual);

    context.visual = visual;
  });
}

ConnectPreview.$inject = [
  'eventBus',
  'canvas',
  'graphicsFactory'
];
