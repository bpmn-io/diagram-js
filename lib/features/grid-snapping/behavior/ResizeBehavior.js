import inherits from 'inherits-browser';

import CommandInterceptor from '../../../command/CommandInterceptor';

import {
  assign,
  isString
} from 'min-dash';

/**
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('../../../util/Types').Rect} Rect
 *
 * @typedef {import('../../../core/EventBus').default} EventBus
 * @typedef {import('../../grid-snapping/GridSnapping').default} GridSnapping
 */

/**
 * Integrates resizing with grid snapping.
 *
 * @param {EventBus} eventBus
 * @param {GridSnapping} gridSnapping
 */
export default function ResizeBehavior(eventBus, gridSnapping) {
  CommandInterceptor.call(this, eventBus);

  this._gridSnapping = gridSnapping;

  var self = this;

  this.preExecute('shape.resize', function(event) {
    var context = event.context,
        hints = context.hints || {},
        autoResize = hints.autoResize;

    if (!autoResize) {
      return;
    }

    var shape = context.shape,
        newBounds = context.newBounds;

    if (isString(autoResize)) {
      context.newBounds = self.snapComplex(newBounds, autoResize);
    } else {
      context.newBounds = self.snapSimple(shape, newBounds);
    }
  });
}

ResizeBehavior.$inject = [
  'eventBus',
  'gridSnapping',
  'modeling'
];

inherits(ResizeBehavior, CommandInterceptor);

/**
 * Snap width and height in relation to center.
 *
 * @param {Shape} shape
 * @param {Rect} newBounds
 *
 * @return {Rect} Snapped bounds.
 */
ResizeBehavior.prototype.snapSimple = function(shape, newBounds) {
  var gridSnapping = this._gridSnapping;

  newBounds.width = gridSnapping.snapValue(newBounds.width, {
    min: newBounds.width
  });

  newBounds.height = gridSnapping.snapValue(newBounds.height, {
    min: newBounds.height
  });

  newBounds.x = shape.x + (shape.width / 2) - (newBounds.width / 2);
  newBounds.y = shape.y + (shape.height / 2) - (newBounds.height / 2);

  return newBounds;
};

/**
 * Snap x, y, width and height according to given directions.
 *
 * @param {Rect} newBounds
 * @param {string} directions - Directions as {n|w|s|e}.
 *
 * @return {Rect} Snapped bounds.
 */
ResizeBehavior.prototype.snapComplex = function(newBounds, directions) {
  if (/w|e/.test(directions)) {
    newBounds = this.snapHorizontally(newBounds, directions);
  }

  if (/n|s/.test(directions)) {
    newBounds = this.snapVertically(newBounds, directions);
  }

  return newBounds;
};

/**
 * Snap in one or both directions horizontally.
 *
 * @param {Rect} newBounds
 * @param {string} directions - Directions as {n|w|s|e}.
 *
 * @return {Rect} Snapped bounds.
 */
ResizeBehavior.prototype.snapHorizontally = function(newBounds, directions) {
  var gridSnapping = this._gridSnapping,
      west = /w/.test(directions),
      east = /e/.test(directions);

  var snappedNewBounds = {};

  snappedNewBounds.width = gridSnapping.snapValue(newBounds.width, {
    min: newBounds.width
  });

  if (east) {

    // handle <we>
    if (west) {
      snappedNewBounds.x = gridSnapping.snapValue(newBounds.x, {
        max: newBounds.x
      });

      snappedNewBounds.width += gridSnapping.snapValue(newBounds.x - snappedNewBounds.x, {
        min: newBounds.x - snappedNewBounds.x
      });
    }

    // handle <e>
    else {
      newBounds.x = newBounds.x + newBounds.width - snappedNewBounds.width;
    }
  }

  // assign snapped x and width
  assign(newBounds, snappedNewBounds);

  return newBounds;
};

/**
 * Snap in one or both directions vertically.
 *
 * @param {Rect} newBounds
 * @param {string} directions - Directions as {n|w|s|e}.
 *
 * @return {Rect} Snapped bounds.
 */
ResizeBehavior.prototype.snapVertically = function(newBounds, directions) {
  var gridSnapping = this._gridSnapping,
      north = /n/.test(directions),
      south = /s/.test(directions);

  var snappedNewBounds = {};

  snappedNewBounds.height = gridSnapping.snapValue(newBounds.height, {
    min: newBounds.height
  });

  if (north) {

    // handle <ns>
    if (south) {
      snappedNewBounds.y = gridSnapping.snapValue(newBounds.y, {
        max: newBounds.y
      });

      snappedNewBounds.height += gridSnapping.snapValue(newBounds.y - snappedNewBounds.y, {
        min: newBounds.y - snappedNewBounds.y
      });
    }

    // handle <n>
    else {
      newBounds.y = newBounds.y + newBounds.height - snappedNewBounds.height;
    }
  }

  // assign snapped y and height
  assign(newBounds, snappedNewBounds);

  return newBounds;
};