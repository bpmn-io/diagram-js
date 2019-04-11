import {
  setSnapped,
  isSnapped
} from '../snapping/SnapUtil';

import { isCmd } from '../keyboard/KeyboardUtil';

import { isNumber } from 'min-dash';

var SPACING = 10,
    LOWER_PRIORITY = 1200;


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
    'shape.move.move',
    'shape.move.end',
    'create.move',
    'create.end',
    'connect.move',
    'connect.end',
    'resize.move',
    'resize.end',
    'bendpoint.move.move',
    'bendpoint.move.end',
    'connectionSegment.move.move',
    'connectionSegment.move.end'
  ], LOWER_PRIORITY, function(event) {
    var originalEvent = event.originalEvent;

    if (!self.active || (originalEvent && isCmd(originalEvent))) {
      return;
    }

    [ 'x', 'y' ].forEach(function(axis) {
      if (!isSnapped(event, axis)) {
        self.snap(event, axis);
      }
    });
  });
}

GridSnapping.prototype.snap = function(event, axis) {
  var snapConstraints = getSnapConstraints(event, axis);

  var snappedValue = this._getSnappedValue(event[ axis ], snapConstraints);

  setSnapped(event, axis, snappedValue);
};

GridSnapping.prototype._getSnappedValue = function(value, snapConstraints) {
  value = quantize(value, SPACING);

  var min, max;

  if (snapConstraints) {
    min = snapConstraints.min;
    max = snapConstraints.max;

    if (isNumber(min)) {
      min = quantize(min, SPACING, 'ceil');

      value = Math.max(value, min);
    }

    if (isNumber(max)) {
      max = quantize(max, SPACING, 'floor');

      value = Math.min(value, max);
    }
  }

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
 * @param {Object} event - Event.
 * @param {String} axis - Axis.
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