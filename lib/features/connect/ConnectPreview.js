import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  clear as svgClear,
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


export default function ConnectPreview(injector, eventBus, canvas, graphicsFactory, elementFactory) {

  // optional components

  var connectionDocking = injector.get('connectionDocking', false);
  var layouter = injector.get('layouter', false);

  function createConnectVisual() {

    var visual = getPreviewVisual();

    svgAppend(canvas.getDefaultLayer(), visual);

    return visual;
  }

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
        connectVisual = context.connectVisual,
        canConnect = context.canExecute,
        getConnection = context.getConnection,
        sourcePosition = context.sourcePosition,
        endPosition,
        connection,
        waypoints;

    // update connection visuals during drag


    if (!getConnection) {
      getConnection = context.getConnection = Cacher(function(attrs) {
        return elementFactory.create('connection', attrs);
      });
    }

    if (!connectVisual) {
      connectVisual = context.connectVisual = createConnectVisual();
    }

    svgClear(connectVisual);

    endPosition = {
      x: event.x,
      y: event.y
    };

    if (canConnect) {

      connection = getConnection(connectionAttrs(canConnect));

      if (layouter) {
        connection.waypoints = [];

        connection.waypoints = layouter.layoutConnection(connection, {
          source: source,
          target: target,
          connectionEnd: endPosition
        });
      } else {
        connection.waypoints = [
          { x: source.x + source.width / 2, y: source.y + source.height / 2 },
          endPosition
        ];
      }

      if (connectionDocking) {
        connection.waypoints = connectionDocking.getCroppedWaypoints(connection, source, target);
      }

      graphicsFactory.drawConnection(connectVisual, connection);

    } else {
      // display noop connection

      waypoints = crop(sourcePosition, endPosition, source, target);

      connection = getNoopConnection(waypoints[0], waypoints[1]);

      svgAppend(connectVisual, connection);
    }
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

    // remove marker before target is removed from the context
    if (context.target) {
      canvas.removeMarker(context.target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('connect.cleanup', function(event) {
    var context = event.context;

    if (context.connectVisual) {
      svgRemove(context.connectVisual);
    }
  });
}

ConnectPreview.$inject = [
  'injector',
  'eventBus',
  'canvas',
  'graphicsFactory',
  'elementFactory'
];



// helpers //////////////

function getPreviewVisual() {
  var visual = svgCreate('g');

  svgAttr(visual, {
    'pointer-events': 'none'
  });

  svgClasses(visual).add('djs-dragger');

  return visual;
}

function connectionAttrs(connect) {

  if (typeof connect === 'boolean') {
    return {};
  } else {
    return connect;
  }
}


function Cacher(createFn) {

  var entries = {};

  return function(attrs) {

    var key = JSON.stringify(attrs);

    var e = entries[key];

    if (!e) {
      e = entries[key] = createFn(attrs);
    }

    return e;
  };
}


function getNoopConnection(start, end) {
  var connection = svgCreate('polyline');

  svgAttr(connection, {
    'stroke': '#333',
    'strokeDasharray': [ 1 ],
    'strokeWidth': 2,
    'pointer-events': 'none'
  });

  svgAttr(connection, { 'points': [ start.x, start.y, end.x, end.y ] });

  return connection;
}