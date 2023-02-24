import {
  assign,
  forEach
} from 'min-dash';

import {
  getResizedSourceAnchor,
  getResizedTargetAnchor
} from './helper/AnchorsHelper';

/**
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * A handler that implements reversible resizing of shapes.
 *
 * @param {Modeling} modeling
 */
export default function ResizeShapeHandler(modeling) {
  this._modeling = modeling;
}

ResizeShapeHandler.$inject = [ 'modeling' ];

/**
 * {
 *   shape: {....}
 *   newBounds: {
 *     width:  20,
 *     height: 40,
 *     x:       5,
 *     y:      10
 *   }
 *
 * }
 */
ResizeShapeHandler.prototype.execute = function(context) {
  var shape = context.shape,
      newBounds = context.newBounds,
      minBounds = context.minBounds;

  if (newBounds.x === undefined || newBounds.y === undefined ||
      newBounds.width === undefined || newBounds.height === undefined) {
    throw new Error('newBounds must have {x, y, width, height} properties');
  }

  if (minBounds && (newBounds.width < minBounds.width
    || newBounds.height < minBounds.height)) {
    throw new Error('width and height cannot be less than minimum height and width');
  } else if (!minBounds
    && newBounds.width < 10 || newBounds.height < 10) {
    throw new Error('width and height cannot be less than 10px');
  }

  // save old bbox in context
  context.oldBounds = {
    width:  shape.width,
    height: shape.height,
    x:      shape.x,
    y:      shape.y
  };

  // update shape
  assign(shape, {
    width:  newBounds.width,
    height: newBounds.height,
    x:      newBounds.x,
    y:      newBounds.y
  });

  return shape;
};

ResizeShapeHandler.prototype.postExecute = function(context) {
  var modeling = this._modeling;

  var shape = context.shape,
      oldBounds = context.oldBounds,
      hints = context.hints || {};

  if (hints.layout === false) {
    return;
  }

  forEach(shape.incoming, function(c) {
    modeling.layoutConnection(c, {
      connectionEnd: getResizedTargetAnchor(c, shape, oldBounds)
    });
  });

  forEach(shape.outgoing, function(c) {
    modeling.layoutConnection(c, {
      connectionStart: getResizedSourceAnchor(c, shape, oldBounds)
    });
  });

};

ResizeShapeHandler.prototype.revert = function(context) {

  var shape = context.shape,
      oldBounds = context.oldBounds;

  // restore previous bbox
  assign(shape, {
    width:  oldBounds.width,
    height: oldBounds.height,
    x:      oldBounds.x,
    y:      oldBounds.y
  });

  return shape;
};
