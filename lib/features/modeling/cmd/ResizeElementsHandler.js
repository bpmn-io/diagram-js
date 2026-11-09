import { forEach } from 'min-dash';

/**
 * @typedef {import('../../../model/Types.js').Shape} Shape
 *
 * @typedef {import('../../../util/Types.js').Rect} Rect
 *
 * @typedef {import('../Modeling.js').default} Modeling
 */

/**
 * A handler that resizes multiple shapes to their new bounds.
 *
 * Shapes that keep their size are moved.
 *
 * @param {Modeling} modeling
 */
export default function ResizeElementsHandler(modeling) {
  this._modeling = modeling;
}

ResizeElementsHandler.$inject = [ 'modeling' ];


ResizeElementsHandler.prototype.preExecute = function(context) {
  var self = this;

  var newBounds = context.newBounds;

  forEach(context.elements, function(element) {
    var bounds = newBounds[ element.id ];

    if (!bounds) {
      return;
    }

    if (bounds.width !== element.width || bounds.height !== element.height) {
      return self.resizeShape(element, bounds);
    }

    var delta = {
      x: bounds.x - element.x,
      y: bounds.y - element.y
    };

    if (delta.x || delta.y) {
      self._modeling.moveElements([ element ], delta, element.parent);
    }
  });
};

/**
 * Resize a single shape.
 *
 * @param {Shape} shape
 * @param {Rect} newBounds
 */
ResizeElementsHandler.prototype.resizeShape = function(shape, newBounds) {
  this._modeling.resizeShape(shape, newBounds);
};
