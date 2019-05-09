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


var LOW_PRIORITY = 740;


/**
 * Shows connection preview during create.
 *
 * @param {didi.Injector} injector
 * @param {EventBus} eventBus
 * @param {Canvas} canvas
 * @param {GraphicsFactory} graphicsFactory
 * @param {ElementFactory} elementFactory
 */
export default function CreateConnectPreview(
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

  eventBus.on('create.move', LOW_PRIORITY, function(event) {
    var context = event.context,
        source = context.source,
        shape = context.shape,
        connectionPreviewGfx = context.connectionPreviewGfx,
        canExecute = context.canExecute,
        canConnect = canExecute && canExecute.connect,
        getConnection = context.getConnection,
        connection;

    if (!connectionPreviewGfx) {
      connectionPreviewGfx = context.connectionPreviewGfx = createConnectionPreviewGfx();
    }

    svgClear(connectionPreviewGfx);

    if (!getConnection) {
      getConnection = context.getConnection = cacheReturnValues(function(canConnect, source, shape) {
        return self.getConnection(canConnect, source, shape);
      });
    }

    if (canConnect) {
      connection = getConnection(canConnect, source, shape);
    }

    if (!connection) {
      return;
    }

    shape.x = Math.round(event.x - shape.width / 2);
    shape.y = Math.round(event.y - shape.height / 2);

    if (layouter) {
      connection.waypoints = [];

      connection.waypoints = layouter.layoutConnection(connection, {
        source: source,
        target: shape
      });
    } else {
      connection.waypoints = [
        { x: source.x + source.width / 2, y: source.y + source.height / 2 },
        { x: event.x, y: event.y }
      ];
    }

    if (connectionDocking) {
      connection.waypoints = connectionDocking.getCroppedWaypoints(connection, source, shape);
    }

    graphicsFactory.drawConnection(connectionPreviewGfx, connection);
  });


  eventBus.on('create.cleanup', function(event) {
    var context = event.context;

    if (context.connectionPreviewGfx) {
      svgRemove(context.connectionPreviewGfx);
    }
  });

}

CreateConnectPreview.$inject = [
  'canvas',
  'elementFactory',
  'eventBus',
  'graphicsFactory',
  'injector'
];

/**
 * Get connection that connect source and target once connect is finished.
 *
 * @param {djs.model.shape} source
 * @param {djs.model.shape} target
 * @param {Object|boolean} canConnect
 *
 * @returns {djs.model.connection}
 */
CreateConnectPreview.prototype.getConnection = function(canConnect, source, target) {
  var attrs = ensureConnectionAttrs(canConnect);

  return this._elementFactory.createConnection(attrs);
};

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