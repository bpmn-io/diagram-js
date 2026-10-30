import {
  forEach,
  sortBy
} from 'min-dash';

import { getMoveDelta } from '../../resize/ResizeUtil.js';

/**
 * @typedef {import('../../../model/Types.js').Element} Element
 * @typedef {import('../../../model/Types.js').Shape} Shape
 *
 * @typedef {import('../../../util/Types.js').Rect} Rect
 *
 * @typedef {import('../Modeling.js').default} Modeling
 */

/**
 * A handler that resizes multiple shapes to their new bounds.
 *
 * Each shape is moved, along with its children, and resized in the given
 * direction. Shapes that keep their size are moved only.
 *
 * @param {Modeling} modeling
 */
export default function ResizeElementsHandler(modeling) {
  this._modeling = modeling;
}

ResizeElementsHandler.$inject = [ 'modeling' ];


ResizeElementsHandler.prototype.preExecute = function(context) {
  var self = this;

  var direction = context.direction,
      newBounds = context.newBounds;

  // move parents before their children, as children move along
  var elements = sortBy(context.elements, getDepth);

  forEach(elements, function(element) {
    var bounds = newBounds[ element.id ];

    if (!bounds) {
      return;
    }

    var resize = bounds.width !== element.width || bounds.height !== element.height;

    var delta = resize ? getMoveDelta(element, bounds, direction) : {
      x: bounds.x - element.x,
      y: bounds.y - element.y
    };

    if (delta.x || delta.y) {
      self._modeling.moveElements([ element ], delta, element.parent);
    }

    if (resize) {
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


// helpers //////////

/**
 * @param {Element} element
 *
 * @return {number}
 */
function getDepth(element) {
  var depth = 0;

  while ((element = element.parent)) {
    depth++;
  }

  return depth;
}
