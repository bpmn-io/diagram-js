var DEFAULT_RENDER_PRIORITY = 1000;

/**
 * The base implementation of shape and connection renderers.
 *
 * @param {EventBus} eventBus
 * @param {number} [renderPriority=1000]
 */
export default function BaseRenderer(eventBus, renderPriority) {
  var self = this;

  renderPriority = renderPriority || DEFAULT_RENDER_PRIORITY;

  eventBus.on([ 'render.shape', 'render.connection' ], renderPriority, function(evt, context) {
    var type = evt.type,
        element = context.element,
        visuals = context.gfx,
        attrs = context.attrs;

    if (self.canRender(element)) {
      if (type === 'render.shape') {
        return self.drawShape(visuals, element, attrs);
      } else {
        return self.drawConnection(visuals, element, attrs);
      }
    }
  });

  eventBus.on([ 'render.getShapePath', 'render.getConnectionPath' ], renderPriority, function(evt, element) {
    if (self.canRender(element)) {
      if (evt.type === 'render.getShapePath') {
        return self.getShapePath(element);
      } else {
        return self.getConnectionPath(element);
      }
    }
  });
}

/**
 * Should check whether *this* renderer can render
 * the element/connection.
 *
 * @param {element} element
 *
 * @returns {boolean}
 */
BaseRenderer.prototype.canRender = function() {};

/**
 * Provides the shape's snap svg element to be drawn on the `canvas`.
 *
 * @param {djs.Graphics} visuals
 * @param {Shape} shape
 *
 * @returns {Snap.svg} [returns a Snap.svg paper element ]
 */
BaseRenderer.prototype.drawShape = function() {};

/**
 * Provides the shape's snap svg element to be drawn on the `canvas`.
 *
 * @param {djs.Graphics} visuals
 * @param {Connection} connection
 *
 * @returns {Snap.svg} [returns a Snap.svg paper element ]
 */
BaseRenderer.prototype.drawConnection = function() {};

/**
 * Gets the SVG path of a shape that represents it's visual bounds.
 *
 * @param {Shape} shape
 *
 * @return {string} svg path
 */
BaseRenderer.prototype.getShapePath = function() {};

/**
 * Gets the SVG path of a connection that represents it's visual bounds.
 *
 * @param {Connection} connection
 *
 * @return {string} svg path
 */
BaseRenderer.prototype.getConnectionPath = function() {};
