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

    if (bounds) {
      self.resizeShape(element, bounds);
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
