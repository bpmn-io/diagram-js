import {
  filter,
  forEach,
  isArray,
  some
} from 'min-dash';

import {
  computeChildrenBBox,
  ensureConstraints,
  getMinResizeBounds,
  getMoveDelta,
  resizeBounds
} from './ResizeUtil.js';

import {
  getCursor,
  getReferencePoint
} from './Resize.js';

import {
  asBounds,
  asTRBL,
  getMid
} from '../../layout/LayoutUtil.js';

import { getBBox } from '../../util/Elements.js';

/**
 * @typedef {import('../../core/Types.js').ElementLike} Element
 * @typedef {import('../../core/Types.js').ShapeLike} Shape
 *
 * @typedef {import('../../util/Types.js').Dimensions} Dimensions
 * @typedef {import('../../util/Types.js').Direction} Direction
 * @typedef {import('../../util/Types.js').Point} Point
 * @typedef {import('../../util/Types.js').Rect} Rect
 * @typedef {import('../../util/Types.js').RectTRBL} RectTRBL
 *
 * @typedef { {
 *   min?: Partial<RectTRBL>;
 *   max?: Partial<RectTRBL>;
 * } } ResizeConstraints
 *
 * @typedef {import('../../core/EventBus.js').default} EventBus
 * @typedef {import('../dragging/Dragging.js').default} Dragging
 * @typedef {import('../modeling/Modeling.js').default} Modeling
 * @typedef {import('../rules/Rules.js').default} Rules
 */

var min = Math.min,
    round = Math.round;

var DEFAULT_MIN_DIMENSIONS = { width: 10, height: 10 };

var SCALE_PRIORITY = 1250;


/**
 * A component that resizes multiple shapes together.
 *
 * Positions and sizes of the shapes are scaled relative to their combined
 * bounds. Each shape is moved, along with its children, and resized like
 * a single shape in the same direction. Shapes that cannot be resized are
 * moved, keeping their size.
 *
 * ## Customizing
 *
 * It's possible to customize the resizing behaviour by intercepting
 * 'elements.resize.start' and providing the following parameters, keyed by
 * shape ID, through the 'context':
 *
 *   * minDimensions ({ [id]: { width, height } }): minimum shape dimensions
 *
 *   * resizeConstraints ({ [id]: { min, max } }): bounds a shape must
 *     contain (min) or stay within (max), relative to its current position
 *
 * On 'elements.resize.move', the bounds scaled along with the selection are
 * available as 'context.scaledBounds' ({ [id]: Rect }) to be adjusted, e.g.
 * snapped, before constraints are applied.
 *
 * f.ex:
 *
 * ```javascript
 * eventBus.on('elements.resize.start', 1500, function(event) {
 *   var context = event.context;
 *
 *   context.minDimensions[ 'Shape_1' ] = { width: 140, height: 120 };
 * });
 * ```
 *
 * @param {EventBus} eventBus
 * @param {Rules} rules
 * @param {Modeling} modeling
 * @param {Dragging} dragging
 */
export default function ResizeElements(eventBus, rules, modeling, dragging) {

  this._dragging = dragging;
  this._rules = rules;

  /**
   * Handle resize start.
   *
   * @param {Object} context
   */
  function handleStart(context) {
    var elements = context.elements,
        direction = context.direction,
        minDimensions = context.minDimensions,
        resizeConstraints = context.resizeConstraints,
        resizable = context.resizable = {};

    forEach(elements, function(element) {
      var id = element.id;

      resizable[ id ] = !!rules.allowed('shape.resize', {
        shape: element,
        direction: direction
      });

      if (!minDimensions[ id ]) {
        minDimensions[ id ] = DEFAULT_MIN_DIMENSIONS;
      }

      if (!resizeConstraints[ id ]) {
        resizeConstraints[ id ] = getChildrenConstraints(element, elements);
      }
    });
  }

  /**
   * Scale shapes along with the selection, resized by specified delta.
   *
   * @param {Object} context
   * @param {Point} delta
   */
  function handleScale(context, delta) {
    var elements = context.elements,
        direction = context.direction,
        bounds = context.bounds,
        scaledBounds = context.scaledBounds = {};

    var newSelectionBounds = ensureMinDimensions(
      resizeBounds(bounds, direction, delta),
      DEFAULT_MIN_DIMENSIONS,
      direction
    );

    forEach(elements, function(element) {
      var id = element.id;

      var elementBounds = scaleBounds(element, bounds, newSelectionBounds);

      scaledBounds[ id ] = context.resizable[ id ]
        ? elementBounds
        : centerBounds(element, getMid(elementBounds));
    });
  }

  /**
   * Apply constraints to scaled shapes.
   *
   * @param {Object} context
   */
  function handleMove(context) {
    var elements = context.elements,
        direction = context.direction,
        newBounds = context.newBounds = {};

    forEach(elements, function(element) {
      var id = element.id;

      var scaledBounds = context.scaledBounds[ id ];

      if (!context.resizable[ id ]) {
        newBounds[ id ] = scaledBounds;

        return;
      }

      // shapes smaller than their minimum dimensions do not shrink further
      var minDimensions = {
        width: min(context.minDimensions[ id ].width, element.width),
        height: min(context.minDimensions[ id ].height, element.height)
      };

      newBounds[ id ] = ensureConstraints(
        ensureMinDimensions(scaledBounds, minDimensions, direction),
        translateConstraints(
          context.resizeConstraints[ id ],
          getMoveDelta(element, scaledBounds, direction)
        )
      );
    });
  }

  /**
   * Handle resize end.
   *
   * @param {Object} context
   */
  function handleEnd(context) {
    var elements = context.elements,
        newBounds = context.newBounds;

    var changedElements = filter(elements, function(element) {
      return boundsChanged(element, newBounds[ element.id ]);
    });

    if (!changedElements.length) {

      // no resize necessary
      return;
    }

    modeling.resizeElements(changedElements, newBounds, context.direction);
  }

  eventBus.on('elements.resize.start', function(event) {
    handleStart(event.context);
  });

  eventBus.on('elements.resize.move', SCALE_PRIORITY, function(event) {
    var delta = {
      x: event.dx,
      y: event.dy
    };

    handleScale(event.context, delta);
  });

  eventBus.on('elements.resize.move', function(event) {
    handleMove(event.context);
  });

  eventBus.on('elements.resize.end', function(event) {
    handleEnd(event.context);
  });
}

ResizeElements.$inject = [
  'eventBus',
  'rules',
  'modeling',
  'dragging'
];

/**
 * Check whether the given elements can be resized together
 * in the given direction.
 *
 * @param {Element[]} elements
 * @param {Direction} direction
 *
 * @return {boolean}
 */
ResizeElements.prototype.canResize = function(elements, direction) {
  var rules = this._rules;

  return some(this._getResizableElements(elements), function(element) {
    return rules.allowed('shape.resize', {
      shape: element,
      direction: direction
    });
  });
};

/**
 * Activate resizing the given elements together.
 *
 * @param {MouseEvent|TouchEvent} event
 * @param {Element[]} elements
 * @param {Direction} direction
 */
ResizeElements.prototype.activate = function(event, elements, direction) {
  elements = this._getResizableElements(elements);

  if (!elements.length) {
    return;
  }

  var bounds = getBBox(elements);

  this._dragging.init(event, getReferencePoint(bounds, direction), 'elements.resize', {
    autoActivate: true,
    cursor: getCursor(direction),
    data: {
      context: {
        elements: elements,
        direction: direction,
        bounds: bounds,
        minDimensions: {},
        resizeConstraints: {}
      }
    }
  });
};

/**
 * Get elements that may be resized together.
 *
 * @param {Element[]} elements
 *
 * @return {Shape[]}
 */
ResizeElements.prototype._getResizableElements = function(elements) {

  // connections, labels and attachers follow the elements they belong to
  var filteredElements = filter(elements, function(element) {
    return !(element.waypoints || element.host || element.labelTarget);
  });

  var allowed = this._rules.allowed('elements.resize', {
    elements: filteredElements
  });

  if (isArray(allowed)) {
    return allowed;
  }

  return allowed ? filteredElements : [];
};


// helpers //////////

/**
 * Scale bounds from old to new reference bounds.
 *
 * Edges are rounded individually to keep adjacent shapes adjacent.
 *
 * @param {Rect} bounds
 * @param {Rect} oldReference
 * @param {Rect} newReference
 *
 * @return {Rect}
 */
export function scaleBounds(bounds, oldReference, newReference) {
  var trbl = asTRBL(bounds);

  var scaleX = newReference.width / oldReference.width,
      scaleY = newReference.height / oldReference.height;

  function toX(x) {
    return round(newReference.x + (x - oldReference.x) * scaleX);
  }

  function toY(y) {
    return round(newReference.y + (y - oldReference.y) * scaleY);
  }

  return asBounds({
    top: toY(trbl.top),
    right: toX(trbl.right),
    bottom: toY(trbl.bottom),
    left: toX(trbl.left)
  });
}

/**
 * Grow bounds to the given minimum dimensions in the given direction.
 *
 * @param {Rect} bounds
 * @param {Dimensions} minDimensions
 * @param {Direction} direction
 *
 * @return {Rect}
 */
function ensureMinDimensions(bounds, minDimensions, direction) {
  var minBounds = getMinResizeBounds(direction, bounds, minDimensions);

  return ensureConstraints(bounds, { min: asTRBL(minBounds) });
}

/**
 * Center the shape's bounds at the given point.
 *
 * @param {Shape} shape
 * @param {Point} mid
 *
 * @return {Rect}
 */
function centerBounds(shape, mid) {
  return {
    x: round(mid.x - shape.width / 2),
    y: round(mid.y - shape.height / 2),
    width: shape.width,
    height: shape.height
  };
}

/**
 * Get constraints ensuring a shape keeps containing
 * the children that are not resized along.
 *
 * @param {Shape} shape
 * @param {Shape[]} elements
 *
 * @return {ResizeConstraints|undefined}
 */
function getChildrenConstraints(shape, elements) {
  var children = filter(shape.children, function(child) {
    return !child.waypoints && !child.labelTarget && elements.indexOf(child) === -1;
  });

  var childrenBounds = computeChildrenBBox(children);

  return childrenBounds && { min: asTRBL(childrenBounds) };
}

/**
 * @param {ResizeConstraints} [constraints]
 * @param {Point} delta
 *
 * @return {ResizeConstraints|undefined}
 */
function translateConstraints(constraints, delta) {

  if (!constraints) {
    return;
  }

  return {
    min: translateTRBL(constraints.min, delta),
    max: translateTRBL(constraints.max, delta)
  };
}

/**
 * @param {Partial<RectTRBL>} [trbl]
 * @param {Point} delta
 *
 * @return {Partial<RectTRBL>|undefined}
 */
function translateTRBL(trbl, delta) {

  if (!trbl) {
    return;
  }

  var translated = {};

  forEach(trbl, function(value, key) {
    translated[ key ] = value + (key === 'top' || key === 'bottom' ? delta.y : delta.x);
  });

  return translated;
}

function boundsChanged(shape, newBounds) {
  return shape.x !== newBounds.x ||
    shape.y !== newBounds.y ||
    shape.width !== newBounds.width ||
    shape.height !== newBounds.height;
}
