import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  clear as svgClear,
  create as svgCreate,
  remove as svgRemove
} from 'tiny-svg';

import {
  isObject
} from 'min-dash';

import {
  getElementLineIntersection
} from '../../layout/LayoutUtil';

var HIGH_PRIORITY = 1100,
    LOW_PRIORITY = 900;

var MARKER_OK = 'connect-ok',
    MARKER_NOT_OK = 'connect-not-ok';

/**
 * Shows connection preview during connect.
 *
 * @param {Canvas} canvas
 * @param {ElementFactory} elementFactory
 * @param {EventBus} eventBus
 * @param {GraphicsFactory} graphicsFactory
 * @param {didi.Injector} injector
 */
export default function ConnectPreview(
    canvas,
    elementFactory,
    eventBus,
    graphicsFactory,
    injector
) {
  var self = this;

  this._elementFactory = elementFactory;

  var connectionDocking = injector.get('connectionDocking', false),
      layouter = injector.get('layouter', false);

  /**
   * Add and return preview graphics.
   *
   * @returns {SVGElement}
   */
  function createConnectionPreviewGfx() {
    var gfx = svgCreate('g');

    svgAttr(gfx, {
      pointerEvents: 'none'
    });

    svgClasses(gfx).add('djs-dragger');

    svgAppend(canvas.getDefaultLayer(), gfx);

    return gfx;
  }

  /**
   * Return cropped waypoints.
   *
   * @param {Point} start
   * @param {Point} end
   * @param {djs.model.shape} source
   * @param {djs.model.shape} target
   *
   * @returns {Array}
   */
  function cropWaypoints(start, end, source, target) {
    var sourcePath = graphicsFactory.getShapePath(source),
        targetPath = target && graphicsFactory.getShapePath(target),
        connectionPath = graphicsFactory.getConnectionPath({ waypoints: [ start, end ] });

    start = getElementLineIntersection(sourcePath, connectionPath, true) || start;
    end = (target && getElementLineIntersection(targetPath, connectionPath, false)) || end;

    return [ start, end ];
  }

  eventBus.on('connect.move', function(event) {
    var context = event.context,
        source = context.source,
        target = context.target,
        connectionPreviewGfx = context.connectionPreviewGfx,
        canConnect = context.canExecute,
        getConnection = context.getConnection,
        sourcePosition = context.sourcePosition,
        connection,
        waypoints;

    var endPosition = {
      x: event.x,
      y: event.y
    };

    if (!connectionPreviewGfx) {
      connectionPreviewGfx = context.connectionPreviewGfx = createConnectionPreviewGfx();
    }

    svgClear(connectionPreviewGfx);

    if (!getConnection) {
      getConnection = context.getConnection = cacheReturnValues(function(canConnect, source, target) {
        return self.getConnection(canConnect, source, target);
      });
    }

    if (canConnect) {
      connection = getConnection(canConnect, source, target);
    }

    if (connection) {
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

      graphicsFactory.drawConnection(connectionPreviewGfx, connection);
    } else {

      // fall back to noop connection
      waypoints = cropWaypoints(sourcePosition, endPosition, source, target);

      connection = createNoopConnection(waypoints[0], waypoints[1]);

      svgAppend(connectionPreviewGfx, connection);
    }
  });

  eventBus.on('connect.hover', LOW_PRIORITY, function(event) {
    var context = event.context,
        hover = event.hover,
        canExecute = context.canExecute;

    // ignore hover
    if (canExecute === null) {
      return;
    }

    canvas.addMarker(hover, canExecute ? MARKER_OK : MARKER_NOT_OK);
  });

  eventBus.on([ 'connect.out', 'connect.cleanup' ], HIGH_PRIORITY, function(event) {
    var context = event.context;

    // remove marker before target is removed from context
    if (context.target) {
      canvas.removeMarker(context.target, context.canExecute ? MARKER_OK : MARKER_NOT_OK);
    }
  });

  eventBus.on('connect.cleanup', function(event) {
    var context = event.context;

    if (context.connectionPreviewGfx) {
      svgRemove(context.connectionPreviewGfx);
    }
  });
}

/**
 * Get connection that connect source and target once connect is finished.
 *
 * @param {djs.model.shape} source
 * @param {djs.model.shape} target
 * @param {Object|boolean} canConnect
 *
 * @returns {djs.model.connection}
 */
ConnectPreview.prototype.getConnection = function(canConnect, source, target) {
  var attrs = ensureConnectionAttrs(canConnect);

  return this._elementFactory.createConnection(attrs);
};

ConnectPreview.$inject = [
  'canvas',
  'elementFactory',
  'eventBus',
  'graphicsFactory',
  'injector'
];

// helpers //////////

/**
 * Returns function that returns cached return values referenced by stringfied first argument.
 *
 * @param {Function} fn
 *
 * @return {Function}
 */
function cacheReturnValues(fn) {
  var returnValues = {};

  /**
   * Return cached return value referenced by stringified first argument.
   *
   * @returns {*}
   */
  return function(firstArgument) {
    var key = JSON.stringify(firstArgument);

    var returnValue = returnValues[key];

    if (!returnValue) {
      returnValue = returnValues[key] = fn.apply(null, arguments);
    }

    return returnValue;
  };
}

/**
 * Create and return simple connection.
 *
 * @param {Point} start
 * @param {Point} end
 *
 * @returns {SVGElement}
 */
function createNoopConnection(start, end) {
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

/**
 * Ensure connection attributes is object.
 *
 * @param {Object|boolean} canConnect
 *
 * @returns {Object}
 */
function ensureConnectionAttrs(canConnect) {
  if (isObject(canConnect)) {
    return canConnect;
  } else {
    return {};
  }
}