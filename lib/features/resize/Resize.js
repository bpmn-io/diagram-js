import {
  pick,
  assign
} from 'min-dash';

import {
  resizeBounds,
  ensureConstraints,
  computeChildrenBBox,
  getMinResizeBounds
} from './ResizeUtil';

import {
  asTRBL,
  getMid,
  roundBounds
} from '../../layout/LayoutUtil';

var DEFAULT_MIN_WIDTH = 10;


/**
 * A component that provides resizing of shapes on the canvas.
 *
 * The following components are part of shape resize:
 *
 *  * adding resize handles,
 *  * creating a visual during resize
 *  * checking resize rules
 *  * committing a change once finished
 *
 *
 * ## Customizing
 *
 * It's possible to customize the resizing behaviour by intercepting 'resize.start'
 * and providing the following parameters through the 'context':
 *
 *   * minDimensions ({ width, height }): minimum shape dimensions
 *
 *   * childrenBoxPadding ({ left, top, bottom, right } || number):
 *     gap between the minimum bounding box and the container
 *
 * f.ex:
 *
 * ```javascript
 * eventBus.on('resize.start', 1500, function(event) {
 *   var context = event.context,
 *
 *  context.minDimensions = { width: 140, height: 120 };
 *
 *  // Passing general padding
 *  context.childrenBoxPadding = 30;
 *
 *  // Passing padding to a specific side
 *  context.childrenBoxPadding.left = 20;
 * });
 * ```
 */
export default function Resize(eventBus, rules, modeling, dragging) {

  this._dragging = dragging;
  this._rules = rules;

  var self = this;


  /**
   * Handle resize move by specified delta.
   *
   * @param {Object} context
   * @param {Point} delta
   */
  function handleMove(context, delta) {

    var shape = context.shape,
        direction = context.direction,
        resizeConstraints = context.resizeConstraints,
        newBounds;

    context.delta = delta;

    newBounds = resizeBounds(shape, direction, delta);

    // ensure constraints during resize
    context.newBounds = ensureConstraints(newBounds, resizeConstraints);

    // update + cache executable state
    context.canExecute = self.canResize(context);
  }

  /**
   * Handle resize start.
   *
   * @param  {Object} context
   */
  function handleStart(context) {

    var resizeConstraints = context.resizeConstraints,

        // evaluate minBounds for backwards compatibility
        minBounds = context.minBounds;

    if (resizeConstraints !== undefined) {
      return;
    }

    if (minBounds === undefined) {
      minBounds = self.computeMinResizeBox(context);
    }

    context.resizeConstraints = {
      min: asTRBL(minBounds)
    };
  }

  /**
   * Handle resize end.
   *
   * @param  {Object} context
   */
  function handleEnd(context) {
    var shape = context.shape,
        canExecute = context.canExecute,
        newBounds = context.newBounds;

    if (canExecute) {

      // ensure we have actual pixel values for new bounds
      // (important when zoom level was > 1 during move)
      newBounds = roundBounds(newBounds);

      if (!boundsChanged(shape, newBounds)) {

        // no resize necessary
        return;
      }

      // perform the actual resize
      modeling.resizeShape(shape, newBounds);
    }
  }


  eventBus.on('resize.start', function(event) {
    handleStart(event.context);
  });

  eventBus.on('resize.move', function(event) {
    var delta = {
      x: event.dx,
      y: event.dy
    };

    handleMove(event.context, delta);
  });

  eventBus.on('resize.end', function(event) {
    handleEnd(event.context);
  });

}


Resize.prototype.canResize = function(context) {
  var rules = this._rules;

  var ctx = pick(context, [ 'newBounds', 'shape', 'delta', 'direction' ]);

  return rules.allowed('shape.resize', ctx);
};

/**
 * Activate a resize operation.
 *
 * You may specify additional contextual information and must specify a
 * resize direction during activation of the resize event.
 *
 * @param {MouseEvent} event
 * @param {djs.model.Shape} shape
 * @param {Object|string} contextOrDirection
 */
Resize.prototype.activate = function(event, shape, contextOrDirection) {
  var dragging = this._dragging,
      context,
      direction;

  if (typeof contextOrDirection === 'string') {
    contextOrDirection = {
      direction: contextOrDirection
    };
  }

  context = assign({ shape: shape }, contextOrDirection);

  direction = context.direction;

  if (!direction) {
    throw new Error('must provide a direction (n|w|s|e|nw|se|ne|sw)');
  }

  dragging.init(event, getReferencePoint(shape, direction), 'resize', {
    autoActivate: true,
    cursor: getCursor(direction),
    data: {
      shape: shape,
      context: context
    }
  });
};

Resize.prototype.computeMinResizeBox = function(context) {
  var shape = context.shape,
      direction = context.direction,
      minDimensions,
      childrenBounds;

  minDimensions = context.minDimensions || {
    width: DEFAULT_MIN_WIDTH,
    height: DEFAULT_MIN_WIDTH
  };

  // get children bounds
  childrenBounds = computeChildrenBBox(shape, context.childrenBoxPadding);

  // get correct minimum bounds from given resize direction
  // basically ensures that the minBounds is max(childrenBounds, minDimensions)
  return getMinResizeBounds(direction, shape, minDimensions, childrenBounds);
};


Resize.$inject = [
  'eventBus',
  'rules',
  'modeling',
  'dragging'
];

// helpers //////////

function boundsChanged(shape, newBounds) {
  return shape.x !== newBounds.x ||
    shape.y !== newBounds.y ||
    shape.width !== newBounds.width ||
    shape.height !== newBounds.height;
}

export function getReferencePoint(shape, direction) {
  var mid = getMid(shape),
      trbl = asTRBL(shape);

  var referencePoint = {
    x: mid.x,
    y: mid.y
  };

  if (direction.indexOf('n') !== -1) {
    referencePoint.y = trbl.top;
  } else if (direction.indexOf('s') !== -1) {
    referencePoint.y = trbl.bottom;
  }

  if (direction.indexOf('e') !== -1) {
    referencePoint.x = trbl.right;
  } else if (direction.indexOf('w') !== -1) {
    referencePoint.x = trbl.left;
  }

  return referencePoint;
}

function getCursor(direction) {
  var prefix = 'resize-';

  if (direction === 'n' || direction === 's') {
    return prefix + 'ns';
  } else if (direction === 'e' || direction === 'w') {
    return prefix + 'ew';
  } else if (direction === 'nw' || direction === 'se') {
    return prefix + 'nwse';
  } else {
    return prefix + 'nesw';
  }
}