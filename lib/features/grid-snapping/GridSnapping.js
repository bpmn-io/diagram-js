import {
  setSnapped,
  isSnapped
} from '../snapping/SnapUtil';

import { isCmd } from '../keyboard/KeyboardUtil';

import {
  assign,
  isNumber
} from 'min-dash';

var SPACING = 10,
    LOWER_PRIORITY = 1200;

/**
 * Basic grid snapping that covers connecting, creating, moving, resizing shapes, moving bendpoints
 * and connection segments.
 */
export default function GridSnapping(
    eventBus,
    config,
    grid
) {
  this._grid = grid;

  if (config) {
    this.active = config.active === false ? false : true;
  } else {
    this.active = true;
  }

  var self = this;

  eventBus.on('diagram.init', LOWER_PRIORITY, function() {
    self.setActive(self.active);

    if (!self.active) {
      grid.setVisible(false);
    }
  });

  eventBus.on([
    'create.move',
    'create.end',
    'bendpoint.move.move',
    'bendpoint.move.end',
    'connect.move',
    'connect.end',
    'connectionSegment.move.move',
    'connectionSegment.move.end',
    'resize.move',
    'resize.end',
    'shape.move.move',
    'shape.move.end'
  ], LOWER_PRIORITY, function(event) {
    var originalEvent = event.originalEvent;

    if (!self.active || (originalEvent && isCmd(originalEvent))) {
      return;
    }

    var context = event.context;

    [ 'x', 'y' ].forEach(function(axis) {
      var options = {};

      // allow snapping with offset
      if (context.gridSnappingContext && context.gridSnappingContext.snapLocation) {
        assign(options, {
          offset: getSnapOffset(event, axis)
        });
      }

      // allow snapping with min and max
      var snapConstraints = getSnapConstraints(event, axis);

      if (snapConstraints) {
        assign(options, snapConstraints);
      }

      if (!isSnapped(event, axis)) {
        self.snapEvent(event, axis, options);
      }
    });
  });
}

/**
 * Snap an events x or y with optional min, max and offset.
 *
 * @param {Object} event
 * @param {string} axis
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @param {number} [options.offset]
 */
GridSnapping.prototype.snapEvent = function(event, axis, options) {
  var snappedValue = this.snapValue(event[ axis ], options);

  setSnapped(event, axis, snappedValue);
};

/**
 * Snap value with optional min, max and offset.
 *
 * @param {number} value
 * @param {Object} options
 * @param {number} [options.min]
 * @param {number} [options.max]
 * @param {number} [options.offset]
 */
GridSnapping.prototype.snapValue = function(value, options) {
  var offset = 0;

  if (options && options.offset) {
    offset = options.offset;
  }

  value += offset;

  value = quantize(value, SPACING);

  var min, max;

  if (options && options.min) {
    min = options.min;

    if (isNumber(min)) {
      min = quantize(min + offset, SPACING, 'ceil');

      value = Math.max(value, min);
    }
  }

  if (options && options.max) {
    max = options.max;

    if (isNumber(max)) {
      max = quantize(max + offset, SPACING, 'floor');

      value = Math.min(value, max);
    }
  }

  value -= offset;

  return value;
};

GridSnapping.prototype.isActive = function() {
  return this.active;
};

GridSnapping.prototype.setActive = function(active) {
  this.active = active;
};

GridSnapping.prototype.toggleActive = function() {
  this.setActive(!this.active);
};

GridSnapping.$inject = [
  'eventBus',
  'config.gridSnapping',
  'grid'
];

// helpers //////////

/**
 * Get minimum and maximum snap constraints.
 *
 * @param {Object} event
 * @param {Object} event.context
 * @param {Object} [event.context.resizeConstraints]
 * @param {number} [event.context.resizeConstraints.min]
 * @param {number} [event.context.resizeConstraints.max]
 * @param {string} axis
 *
 * @returns {Object}
 */
function getSnapConstraints(event, axis) {
  var context = event.context,
      resizeConstraints = context.resizeConstraints;

  if (!resizeConstraints) {
    return null;
  }

  var direction = context.direction;

  var minResizeConstraints = resizeConstraints.min,
      maxResizeConstraints = resizeConstraints.max;

  var snapConstraints = {};

  // resize
  if (minResizeConstraints) {

    if (isHorizontal(axis)) {

      if (isWest(direction)) {
        snapConstraints.max = minResizeConstraints.left;
      } else {
        snapConstraints.min = minResizeConstraints.right;
      }

    } else {

      if (isNorth(direction)) {
        snapConstraints.max = minResizeConstraints.top;
      } else {
        snapConstraints.min = minResizeConstraints.bottom;
      }

    }
  }

  if (maxResizeConstraints) {

    if (isHorizontal(axis)) {

      if (isWest(direction)) {
        snapConstraints.min = maxResizeConstraints.left;
      } else {
        snapConstraints.max = maxResizeConstraints.right;
      }

    } else {

      if (isNorth(direction)) {
        snapConstraints.min = maxResizeConstraints.top;
      } else {
        snapConstraints.max = maxResizeConstraints.bottom;
      }

    }
  }

  return snapConstraints;
}

/**
 * Get snap offset assuming that event is at center of shape.
 *
 * @param {Object} event
 * @param {string} axis
 *
 * @returns {number}
 */
function getSnapOffset(event, axis) {
  var context = event.context,
      shape = event.shape,
      gridSnappingContext = context.gridSnappingContext || {},
      snapLocation = gridSnappingContext.snapLocation;

  if (!shape || !snapLocation) {
    return 0;
  }

  if (axis === 'x') {
    if (/left/.test(snapLocation)) {
      return -shape.width / 2;
    }

    if (/right/.test(snapLocation)) {
      return shape.width / 2;
    }
  } else {
    if (/top/.test(snapLocation)) {
      return -shape.height / 2;
    }

    if (/bottom/.test(snapLocation)) {
      return shape.height / 2;
    }
  }

  return 0;
}

function isHorizontal(axis) {
  return axis === 'x';
}

function isNorth(direction) {
  return direction.charAt(0) === 'n';
}

function isWest(direction) {
  return direction.charAt(1) === 'w';
}

function quantize(value, quantum, fn) {
  if (!fn) {
    fn = 'round';
  }

  return Math[ fn ](value / quantum) * quantum;
}