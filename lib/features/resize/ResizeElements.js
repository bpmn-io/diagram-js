import {
  filter,
  forEach,
  isArray
} from 'min-dash';

import {
  computeChildrenBBox,
  ensureConstraints,
  getMinResizeBounds,
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

var abs = Math.abs,
    min = Math.min,
    round = Math.round;

var DEFAULT_MIN_DIMENSIONS = { width: 10, height: 10 };

var SCALE_PRIORITY = 1250;


/**
 * A component that resizes multiple shapes together.
 *
 * Positions and sizes of the shapes resizable in the given direction are
 * scaled relative to their combined bounds. Other shapes beyond a resized
 * shape keep their distance to its dragged edge. Shapes inside resized
 * shapes and children stay in place; resized shapes keep containing their
 * children.
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
 *     contain (min) or stay within (max)
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
        minDimensions = context.minDimensions,
        resizeConstraints = context.resizeConstraints;

    forEach(elements, function(element) {
      var id = element.id;

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
      scaledBounds[ element.id ] = scaleBounds(element, bounds, newSelectionBounds);
    });
  }

  /**
   * Apply constraints to scaled shapes and push other shapes.
   *
   * @param {Object} context
   */
  function handleMove(context) {
    var elements = context.elements,
        direction = context.direction,
        newBounds = context.newBounds = {};

    forEach(elements, function(element) {
      var id = element.id;

      // shapes smaller than their minimum dimensions do not shrink further
      var minDimensions = {
        width: min(context.minDimensions[ id ].width, element.width),
        height: min(context.minDimensions[ id ].height, element.height)
      };

      newBounds[ id ] = ensureConstraints(
        ensureMinDimensions(context.scaledBounds[ id ], minDimensions, direction),
        context.resizeConstraints[ id ]
      );
    });

    forEach(context.otherElements, function(element) {
      var delta = getPushDelta(element, elements, newBounds, direction);

      if (delta.x || delta.y) {
        newBounds[ element.id ] = {
          x: element.x + delta.x,
          y: element.y + delta.y,
          width: element.width,
          height: element.height
        };
      }
    });
  }

  /**
   * Handle resize end.
   *
   * @param {Object} context
   */
  function handleEnd(context) {
    var elements = context.elements.concat(context.otherElements),
        newBounds = context.newBounds;

    var changedElements = filter(elements, function(element) {
      return newBounds[ element.id ] && boundsChanged(element, newBounds[ element.id ]);
    });

    if (!changedElements.length) {

      // no resize necessary
      return;
    }

    modeling.resizeElements(changedElements, newBounds);
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
 * Get the elements that can be resized together in the given direction.
 *
 * @param {Element[]} elements
 * @param {Direction} direction
 *
 * @return {Shape[]}
 */
ResizeElements.prototype.getResizableElements = function(elements, direction) {
  var rules = this._rules;

  return filter(this._getElements(elements), function(element) {
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
  var resizableElements = this.getResizableElements(elements, direction);

  if (!resizableElements.length) {
    return;
  }

  var otherElements = filter(this._getElements(elements), function(element) {
    return resizableElements.indexOf(element) === -1;
  });

  var bounds = getBBox(resizableElements);

  this._dragging.init(event, getReferencePoint(bounds, direction), 'elements.resize', {
    autoActivate: true,
    cursor: getCursor(direction),
    data: {
      context: {
        elements: resizableElements,
        otherElements: otherElements,
        direction: direction,
        bounds: bounds,
        minDimensions: {},
        resizeConstraints: {}
      }
    }
  });
};

/**
 * Get the elements that may take part in resizing elements together.
 *
 * @param {Element[]} elements
 *
 * @return {Shape[]}
 */
ResizeElements.prototype._getElements = function(elements) {

  // connections, labels and attachers follow the elements they belong to
  var filteredElements = filter(elements, function(element) {
    return !(element.waypoints || element.host || element.labelTarget);
  });

  var allowed = this._rules.allowed('elements.resize', {
    elements: filteredElements
  });

  if (!allowed) {
    return [];
  }

  return isArray(allowed) ? allowed : filteredElements;
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
 * Get the delta by which a shape is pushed, keeping its distance to the
 * nearest dragged edge of resized shapes before it. Shapes inside resized
 * shapes are not pushed.
 *
 * @param {Shape} shape
 * @param {Shape[]} resizedShapes
 * @param {Record<string, Rect>} newBounds
 * @param {Direction} direction
 *
 * @return {Point}
 */
function getPushDelta(shape, resizedShapes, newBounds, direction) {
  var mid = getMid(shape),
      trbl = asTRBL(shape);

  var isInside = resizedShapes.some(function(resizedShape) {
    var resizedTrbl = asTRBL(resizedShape);

    return mid.x >= resizedTrbl.left && mid.x <= resizedTrbl.right &&
      mid.y >= resizedTrbl.top && mid.y <= resizedTrbl.bottom;
  });

  if (isInside) {
    return { x: 0, y: 0 };
  }

  function getDisplacement(edge, position) {
    var increasing = edge === 'right' || edge === 'bottom',
        nearest,
        displacement = 0;

    forEach(resizedShapes, function(resizedShape) {
      var value = asTRBL(resizedShape)[ edge ];

      if (increasing ? value > position : value < position) {
        return;
      }

      var newDisplacement = asTRBL(newBounds[ resizedShape.id ])[ edge ] - value;

      var isNearer = nearest === undefined || (increasing ? value > nearest : value < nearest),
          isFurther = value === nearest && abs(newDisplacement) > abs(displacement);

      if (isNearer || isFurther) {
        nearest = value;
        displacement = newDisplacement;
      }
    });

    return displacement;
  }

  return {
    x: direction.indexOf('e') !== -1
      ? getDisplacement('right', trbl.left)
      : direction.indexOf('w') !== -1 ? getDisplacement('left', trbl.right) : 0,
    y: direction.indexOf('s') !== -1
      ? getDisplacement('bottom', trbl.top)
      : direction.indexOf('n') !== -1 ? getDisplacement('top', trbl.bottom) : 0
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

function boundsChanged(shape, newBounds) {
  return shape.x !== newBounds.x ||
    shape.y !== newBounds.y ||
    shape.width !== newBounds.width ||
    shape.height !== newBounds.height;
}
