import {
  setSnapped,
  isSnapped
} from '../snapping/SnapUtil';

import { isCmd } from '../keyboard/KeyboardUtil';

import {
  assign,
  isNumber
} from 'min-dash';

import {
  SPACING,
  quantize
} from './GridUtil';

/**
 * @typedef {import('../../core/ElementRegistry').default} ElementRegistry
 * @typedef {import('../../core/EventBus').default} EventBus
 */

var LOWER_PRIORITY = 1200;
var LOW_PRIORITY = 800;

/**
 * Basic grid snapping that covers connecting, creating, moving, resizing shapes, moving bendpoints
 * and connection segments.
 *
 * @param {ElementRegistry} elementRegistry
 * @param {EventBus} eventBus
 * @param {Object} config
 */
export default function GridSnapping(elementRegistry, eventBus, config) {

  var active = !config || config.active !== false;

  this._eventBus = eventBus;

  var self = this;

  eventBus.on('diagram.init', LOW_PRIORITY, function() {
    self.setActive(active);
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

    var context = event.context,
        gridSnappingContext = context.gridSnappingContext;

    if (!gridSnappingContext) {
      gridSnappingContext = context.gridSnappingContext = {};
    }

    [ 'x', 'y' ].forEach(function(axis) {
      var options = {};

      // allow snapping with offset
      var snapOffset = getSnapOffset(event, axis, elementRegistry);

      if (snapOffset) {
        options.offset = snapOffset;
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
 * Expose grid spacing for third parties (i.e. extensions).
 *
 * @return {number} spacing of grid dots
 */
GridSnapping.prototype.getGridSpacing = function() {
  return SPACING;
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

  this._eventBus.fire('gridSnapping.toggle', { active: active });
};

GridSnapping.prototype.toggleActive = function() {
  this.setActive(!this.active);
};

GridSnapping.$inject = [
  'elementRegistry',
  'eventBus',
  'config.gridSnapping'
];

// helpers //////////

/**
 * Get minimum and maximum snap constraints.
 * Constraints are cached.
 *
 * @param {Object} event
 * @param {Object} event.context
 * @param {string} axis
 *
 * @return {boolean|Object}
 */
function getSnapConstraints(event, axis) {
  var context = event.context,
      createConstraints = context.createConstraints,
      resizeConstraints = context.resizeConstraints || {},
      gridSnappingContext = context.gridSnappingContext,
      snapConstraints = gridSnappingContext.snapConstraints;

  // cache snap constraints
  if (snapConstraints && snapConstraints[ axis ]) {
    return snapConstraints[ axis ];
  }

  if (!snapConstraints) {
    snapConstraints = gridSnappingContext.snapConstraints = {};
  }

  if (!snapConstraints[ axis ]) {
    snapConstraints[ axis ] = {};
  }

  var direction = context.direction;

  // create
  if (createConstraints) {
    if (isHorizontal(axis)) {
      snapConstraints.x.min = createConstraints.left;
      snapConstraints.x.max = createConstraints.right;
    } else {
      snapConstraints.y.min = createConstraints.top;
      snapConstraints.y.max = createConstraints.bottom;
    }
  }

  // resize
  var minResizeConstraints = resizeConstraints.min,
      maxResizeConstraints = resizeConstraints.max;

  if (minResizeConstraints) {
    if (isHorizontal(axis)) {

      if (isWest(direction)) {
        snapConstraints.x.max = minResizeConstraints.left;
      } else {
        snapConstraints.x.min = minResizeConstraints.right;
      }

    } else {

      if (isNorth(direction)) {
        snapConstraints.y.max = minResizeConstraints.top;
      } else {
        snapConstraints.y.min = minResizeConstraints.bottom;
      }

    }
  }

  if (maxResizeConstraints) {
    if (isHorizontal(axis)) {

      if (isWest(direction)) {
        snapConstraints.x.min = maxResizeConstraints.left;
      } else {
        snapConstraints.x.max = maxResizeConstraints.right;
      }

    } else {

      if (isNorth(direction)) {
        snapConstraints.y.min = maxResizeConstraints.top;
      } else {
        snapConstraints.y.max = maxResizeConstraints.bottom;
      }

    }
  }

  return snapConstraints[ axis ];
}

/**
 * Get snap offset.
 * Offset is cached.
 *
 * @param {Object} event
 * @param {string} axis
 * @param {ElementRegistry} elementRegistry
 *
 * @return {number}
 */
function getSnapOffset(event, axis, elementRegistry) {
  var context = event.context,
      shape = event.shape,
      gridSnappingContext = context.gridSnappingContext,
      snapLocation = gridSnappingContext.snapLocation,
      snapOffset = gridSnappingContext.snapOffset;

  // cache snap offset
  if (snapOffset && isNumber(snapOffset[ axis ])) {
    return snapOffset[ axis ];
  }

  if (!snapOffset) {
    snapOffset = gridSnappingContext.snapOffset = {};
  }

  if (!isNumber(snapOffset[ axis ])) {
    snapOffset[ axis ] = 0;
  }

  if (!shape) {
    return snapOffset[ axis ];
  }

  if (!elementRegistry.get(shape.id)) {

    if (isHorizontal(axis)) {
      snapOffset[ axis ] += shape[ axis ] + shape.width / 2;
    } else {
      snapOffset[ axis ] += shape[ axis ] + shape.height / 2;
    }
  }

  if (!snapLocation) {
    return snapOffset[ axis ];
  }

  if (axis === 'x') {
    if (/left/.test(snapLocation)) {
      snapOffset[ axis ] -= shape.width / 2;
    } else if (/right/.test(snapLocation)) {
      snapOffset[ axis ] += shape.width / 2;
    }
  } else {
    if (/top/.test(snapLocation)) {
      snapOffset[ axis ] -= shape.height / 2;
    } else if (/bottom/.test(snapLocation)) {
      snapOffset[ axis ] += shape.height / 2;
    }
  }

  return snapOffset[ axis ];
}

function isHorizontal(axis) {
  return axis === 'x';
}

function isNorth(direction) {
  return direction.indexOf('n') !== -1;
}

function isWest(direction) {
  return direction.indexOf('w') !== -1;
}