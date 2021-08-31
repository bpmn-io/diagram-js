import {
  append as svgAppend,
  attr as svgAttr,
  classes as svgClasses,
  create as svgCreate,
  remove as svgRemove,
  clear as svgClear
} from 'tiny-svg';

import {
  isObject
} from 'min-dash';

import {
  getElementLineIntersection,
  getMid
} from '../../layout/LayoutUtil';


var MARKER_CONNECTION_PREVIEW = 'djs-connection-preview';

/**
 * Draws connection preview. Optionally, this can use layouter and connection docking to draw
 * better looking previews.
 *
 * @param {didi.Injector} injector
 * @param {Canvas} canvas
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementFactory} elementFactory
 */
export default function ConnectionPreview(
    injector,
    canvas,
    graphicsFactory,
    elementFactory
) {
  this._canvas = canvas;
  this._graphicsFactory = graphicsFactory;
  this._elementFactory = elementFactory;

  // optional components
  this._connectionDocking = injector.get('connectionDocking', false);
  this._layouter = injector.get('layouter', false);
}

ConnectionPreview.$inject = [
  'injector',
  'canvas',
  'graphicsFactory',
  'elementFactory'
];

/**
 * Draw connection preview.
 *
 * Provide at least one of <source, connectionStart> and <target, connectionEnd> to create a preview.
 * In the clean up stage, call `connectionPreview#cleanUp` with the context to remove preview.
 *
 * @param {Object} context
 * @param {Object|boolean} canConnect
 * @param {Object} hints
 * @param {djs.model.shape} [hints.source] source element
 * @param {djs.model.shape} [hints.target] target element
 * @param {Point} [hints.connectionStart] connection preview start
 * @param {Point} [hints.connectionEnd] connection preview end
 * @param {Array<Point>} [hints.waypoints] provided waypoints for preview
 * @param {boolean} [hints.noLayout] true if preview should not be laid out
 * @param {boolean} [hints.noCropping] true if preview should not be cropped
 * @param {boolean} [hints.noNoop] true if simple connection should not be drawn
 */
ConnectionPreview.prototype.drawPreview = function(context, canConnect, hints) {

  hints = hints || {};

  var connectionPreviewGfx = context.connectionPreviewGfx,
      getConnection = context.getConnection,
      source = hints.source,
      target = hints.target,
      waypoints = hints.waypoints,
      connectionStart = hints.connectionStart,
      connectionEnd = hints.connectionEnd,
      noLayout = hints.noLayout,
      noCropping = hints.noCropping,
      noNoop = hints.noNoop,
      connection;

  var self = this;

  if (!connectionPreviewGfx) {
    connectionPreviewGfx = context.connectionPreviewGfx = this.createConnectionPreviewGfx();
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

  if (!connection) {
    !noNoop && this.drawNoopPreview(connectionPreviewGfx, hints);
    return;
  }

  connection.waypoints = waypoints || [];

  // optional layout
  if (this._layouter && !noLayout) {
    connection.waypoints = this._layouter.layoutConnection(connection, {
      source: source,
      target: target,
      connectionStart: connectionStart,
      connectionEnd: connectionEnd,
      waypoints: hints.waypoints || connection.waypoints
    });
  }

  // fallback if no waypoints were provided nor created with layouter
  if (!connection.waypoints || !connection.waypoints.length) {
    connection.waypoints = [
      source ? getMid(source) : connectionStart,
      target ? getMid(target) : connectionEnd
    ];
  }

  // optional cropping
  if (this._connectionDocking && (source || target) && !noCropping) {
    connection.waypoints = this._connectionDocking.getCroppedWaypoints(connection, source, target);
  }

  this._graphicsFactory.drawConnection(connectionPreviewGfx, connection);
};

/**
 * Draw simple connection between source and target or provided points.
 *
 * @param {SVGElement} connectionPreviewGfx container for the connection
 * @param {Object} hints
 * @param {djs.model.shape} [hints.source] source element
 * @param {djs.model.shape} [hints.target] target element
 * @param {Point} [hints.connectionStart] required if source is not provided
 * @param {Point} [hints.connectionEnd] required if target is not provided
 */
ConnectionPreview.prototype.drawNoopPreview = function(connectionPreviewGfx, hints) {
  var source = hints.source,
      target = hints.target,
      start = hints.connectionStart || getMid(source),
      end = hints.connectionEnd || getMid(target);

  var waypoints = this.cropWaypoints(start, end, source, target);

  var connection = this.createNoopConnection(waypoints[0], waypoints[1]);

  svgAppend(connectionPreviewGfx, connection);
};

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
ConnectionPreview.prototype.cropWaypoints = function(start, end, source, target) {
  var graphicsFactory = this._graphicsFactory,
      sourcePath = source && graphicsFactory.getShapePath(source),
      targetPath = target && graphicsFactory.getShapePath(target),
      connectionPath = graphicsFactory.getConnectionPath({ waypoints: [ start, end ] });

  start = (source && getElementLineIntersection(sourcePath, connectionPath, true)) || start;
  end = (target && getElementLineIntersection(targetPath, connectionPath, false)) || end;

  return [ start, end ];
};

/**
 * Remove connection preview container if it exists.
 *
 * @param {Object} [context]
 * @param {SVGElement} [context.connectionPreviewGfx] preview container
 */
ConnectionPreview.prototype.cleanUp = function(context) {
  if (context && context.connectionPreviewGfx) {
    svgRemove(context.connectionPreviewGfx);
  }
};

/**
 * Get connection that connects source and target.
 *
 * @param {Object|boolean} canConnect
 *
 * @returns {djs.model.connection}
 */
ConnectionPreview.prototype.getConnection = function(canConnect) {
  var attrs = ensureConnectionAttrs(canConnect);

  return this._elementFactory.createConnection(attrs);
};


/**
 * Add and return preview graphics.
 *
 * @returns {SVGElement}
 */
ConnectionPreview.prototype.createConnectionPreviewGfx = function() {
  var gfx = svgCreate('g');

  svgAttr(gfx, {
    pointerEvents: 'none'
  });

  svgClasses(gfx).add(MARKER_CONNECTION_PREVIEW);

  svgAppend(this._canvas.getActiveLayer(), gfx);

  return gfx;
};

/**
 * Create and return simple connection.
 *
 * @param {Point} start
 * @param {Point} end
 *
 * @returns {SVGElement}
 */
ConnectionPreview.prototype.createNoopConnection = function(start, end) {
  var connection = svgCreate('polyline');

  svgAttr(connection, {
    'stroke': '#333',
    'strokeDasharray': [ 1 ],
    'strokeWidth': 2,
    'pointer-events': 'none'
  });

  svgAttr(connection, { 'points': [ start.x, start.y, end.x, end.y ] });

  return connection;
};

// helpers //////////

/**
 * Returns function that returns cached return values referenced by stringified first argument.
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
