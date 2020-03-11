import {
  assign,
  filter,
  forEach,
  isNumber
} from 'min-dash';

import { asTRBL } from '../../layout/LayoutUtil';

import { getBBox } from '../../util/Elements';

import { getDirection } from './SpaceUtil';

import { hasPrimaryModifier } from '../../util/Mouse';

import { set as setCursor } from '../../util/Cursor';

import { selfAndAllChildren } from '../../util/Elements';

var abs = Math.abs,
    round = Math.round;

var AXIS_TO_DIMENSION = {
  x: 'width',
  y: 'height'
};

var CURSOR_CROSSHAIR = 'crosshair';

var DIRECTION_TO_TRBL = {
  n: 'top',
  w: 'left',
  s: 'bottom',
  e: 'right'
};

var HIGH_PRIORITY = 1500;

var DIRECTION_TO_OPPOSITE = {
  n: 's',
  w: 'e',
  s: 'n',
  e: 'w'
};

var PADDING = 20;


/**
 * Add or remove space by moving and resizing elements.
 *
 * @param {Canvas} canvas
 * @param {Dragging} dragging
 * @param {EventBus} eventBus
 * @param {Modeling} modeling
 * @param {Rules} rules
 * @param {toolManager} toolManager
 */
export default function SpaceTool(canvas, dragging, eventBus, modeling, rules, toolManager) {
  this._canvas = canvas;
  this._dragging = dragging;
  this._eventBus = eventBus;
  this._modeling = modeling;
  this._rules = rules;
  this._toolManager = toolManager;

  var self = this;

  toolManager.registerTool('space', {
    tool: 'spaceTool.selection',
    dragging: 'spaceTool'
  });

  eventBus.on('spaceTool.selection.end', function(event) {
    eventBus.once('spaceTool.selection.ended', function() {
      self.activateMakeSpace(event.originalEvent);
    });
  });

  eventBus.on('spaceTool.move', HIGH_PRIORITY , function(event) {
    var context = event.context,
        initialized = context.initialized;

    if (!initialized) {
      initialized = context.initialized = self.init(event, context);
    }

    if (initialized) {
      ensureConstraints(event);
    }
  });

  eventBus.on('spaceTool.end', function(event) {
    var context = event.context,
        axis = context.axis,
        direction = context.direction,
        movingShapes = context.movingShapes,
        resizingShapes = context.resizingShapes,
        start = context.start;

    if (!context.initialized) {
      return;
    }

    ensureConstraints(event);

    var delta = {
      x: 0,
      y: 0
    };

    delta[ axis ] = round(event[ 'd' + axis ]);

    self.makeSpace(movingShapes, resizingShapes, delta, direction, start);

    eventBus.once('spaceTool.ended', function(event) {

      // activate space tool selection after make space
      self.activateSelection(event.originalEvent, true, true);
    });
  });
}

SpaceTool.$inject = [
  'canvas',
  'dragging',
  'eventBus',
  'modeling',
  'rules',
  'toolManager'
];

/**
 * Activate space tool selection.
 *
 * @param {Object} event
 * @param {boolean} autoActivate
 */
SpaceTool.prototype.activateSelection = function(event, autoActivate, reactivate) {
  this._dragging.init(event, 'spaceTool.selection', {
    autoActivate: autoActivate,
    cursor: CURSOR_CROSSHAIR,
    data: {
      context: {
        reactivate: reactivate
      }
    },
    trapClick: false
  });
};

/**
 * Activate space tool make space.
 *
 * @param  {MouseEvent} event
 */
SpaceTool.prototype.activateMakeSpace = function(event) {
  this._dragging.init(event, 'spaceTool', {
    autoActivate: true,
    cursor: CURSOR_CROSSHAIR,
    data: {
      context: {}
    }
  });
};

/**
 * Make space.
 *
 * @param  {Array<djs.model.Shape>} movingShapes
 * @param  {Array<djs.model.Shape>} resizingShapes
 * @param  {Object} delta
 * @param  {number} delta.x
 * @param  {number} delta.y
 * @param  {string} direction
 * @param  {number} start
 */
SpaceTool.prototype.makeSpace = function(movingShapes, resizingShapes, delta, direction, start) {
  return this._modeling.createSpace(movingShapes, resizingShapes, delta, direction, start);
};

/**
 * Initialize make space and return true if that was successful.
 *
 * @param {Object} event
 * @param {Object} context
 *
 * @return {boolean}
 */
SpaceTool.prototype.init = function(event, context) {
  var axis = abs(event.dx) > abs(event.dy) ? 'x' : 'y',
      delta = event[ 'd' + axis ],
      start = event[ axis ] - delta;

  if (abs(delta) < 5) {
    return false;
  }

  // invert delta to remove space when moving left
  if (delta < 0) {
    delta *= -1;
  }

  // invert delta to add/remove space when removing/adding space if modifier key is pressed
  if (hasPrimaryModifier(event)) {
    delta *= -1;
  }

  var direction = getDirection(axis, delta);

  var root = this._canvas.getRootElement();

  var children = selfAndAllChildren(root, true);

  var elements = this.calculateAdjustments(children, axis, delta, start);

  var minDimensions = this._eventBus.fire('spaceTool.getMinDimensions', {
    axis: axis,
    direction: direction,
    shapes: elements.resizingShapes,
    start: start
  });

  var spaceToolConstraints = getSpaceToolConstraints(elements, axis, direction, start, minDimensions);

  assign(
    context,
    elements,
    {
      axis: axis,
      direction: direction,
      spaceToolConstraints: spaceToolConstraints,
      start: start
    }
  );

  setCursor('resize-' + (axis === 'x' ? 'ew' : 'ns'));

  return true;
};

/**
 * Get elements to be moved and resized.
 *
 * @param  {Array<djs.model.Shape>} elements
 * @param  {string} axis
 * @param  {number} delta
 * @param  {number} start
 *
 * @return {Object}
 */
SpaceTool.prototype.calculateAdjustments = function(elements, axis, delta, start) {
  var rules = this._rules;

  var movingShapes = [],
      resizingShapes = [];

  forEach(elements, function(element) {
    if (!element.parent || isConnection(element)) {
      return;
    }

    var shapeStart = element[ axis ],
        shapeEnd = shapeStart + element[ AXIS_TO_DIMENSION[ axis ] ];

    // shape to be moved
    if ((delta > 0 && shapeStart > start) || (delta < 0 && shapeEnd < start)) {
      return movingShapes.push(element);
    }

    // shape to be resized
    if (shapeStart < start &&
      shapeEnd > start &&
      rules.allowed('shape.resize', { shape: element })
    ) {

      return resizingShapes.push(element);
    }
  });

  return {
    movingShapes: movingShapes,
    resizingShapes: resizingShapes
  };
};

SpaceTool.prototype.toggle = function() {
  if (this.isActive()) {
    this._dragging.cancel();
  } else {
    this.activateSelection();
  }
};

SpaceTool.prototype.isActive = function() {
  var context = this._dragging.context();

  return context && /^spaceTool/.test(context.prefix);
};

// helpers //////////

function addPadding(trbl) {
  return {
    top: trbl.top - PADDING,
    right: trbl.right + PADDING,
    bottom: trbl.bottom + PADDING,
    left: trbl.left - PADDING
  };
}

function ensureConstraints(event) {
  var context = event.context,
      spaceToolConstraints = context.spaceToolConstraints;

  if (!spaceToolConstraints) {
    return;
  }

  var x, y;

  if (isNumber(spaceToolConstraints.left)) {
    x = Math.max(event.x, spaceToolConstraints.left);

    event.dx = event.dx + x - event.x;
    event.x = x;
  }

  if (isNumber(spaceToolConstraints.right)) {
    x = Math.min(event.x, spaceToolConstraints.right);

    event.dx = event.dx + x - event.x;
    event.x = x;
  }

  if (isNumber(spaceToolConstraints.top)) {
    y = Math.max(event.y, spaceToolConstraints.top);

    event.dy = event.dy + y - event.y;
    event.y = y;
  }

  if (isNumber(spaceToolConstraints.bottom)) {
    y = Math.min(event.y, spaceToolConstraints.bottom);

    event.dy = event.dy + y - event.y;
    event.y = y;
  }
}

function getSpaceToolConstraints(elements, axis, direction, start, minDimensions) {
  var movingShapes = elements.movingShapes,
      resizingShapes = elements.resizingShapes;

  if (!resizingShapes.length) {
    return;
  }

  var spaceToolConstraints = {},
      min,
      max;

  forEach(resizingShapes, function(resizingShape) {
    var resizingShapeBBox = asTRBL(resizingShape);

    // find children that are not moving or resizing
    var nonMovingResizingChildren = filter(resizingShape.children, function(child) {
      return !isConnection(child) &&
        !isLabel(child) &&
        !includes(movingShapes, child) &&
        !includes(resizingShapes, child);
    });

    // find children that are moving
    var movingChildren = filter(resizingShape.children, function(child) {
      return !isConnection(child) && !isLabel(child) && includes(movingShapes, child);
    });

    var minOrMax,
        nonMovingResizingChildrenBBox,
        movingChildrenBBox;

    if (nonMovingResizingChildren.length) {
      nonMovingResizingChildrenBBox = addPadding(asTRBL(getBBox(nonMovingResizingChildren)));

      minOrMax = start -
        resizingShapeBBox[ DIRECTION_TO_TRBL[ direction ] ] +
        nonMovingResizingChildrenBBox[ DIRECTION_TO_TRBL[ direction ] ];

      if (direction === 'n') {
        spaceToolConstraints.bottom = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 'w') {
        spaceToolConstraints.right = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 's') {
        spaceToolConstraints.top = min = isNumber(min) ? Math.max(min, minOrMax) : minOrMax;
      } else if (direction === 'e') {
        spaceToolConstraints.left = min = isNumber(min) ? Math.max(min, minOrMax) : minOrMax;
      }
    }

    if (movingChildren.length) {
      movingChildrenBBox = addPadding(asTRBL(getBBox(movingChildren)));

      minOrMax = start -
        movingChildrenBBox[ DIRECTION_TO_TRBL[ DIRECTION_TO_OPPOSITE[ direction ] ] ] +
        resizingShapeBBox[ DIRECTION_TO_TRBL[ DIRECTION_TO_OPPOSITE[ direction ] ] ];

      if (direction === 'n') {
        spaceToolConstraints.bottom = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 'w') {
        spaceToolConstraints.right = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 's') {
        spaceToolConstraints.top = min = isNumber(min) ? Math.max(min, minOrMax) : minOrMax;
      } else if (direction === 'e') {
        spaceToolConstraints.left = min = isNumber(min) ? Math.max(min, minOrMax) : minOrMax;
      }
    }

    var resizingShapeMinDimensions = minDimensions && minDimensions[ resizingShape.id ];

    if (resizingShapeMinDimensions) {
      if (direction === 'n') {
        minOrMax = start +
          resizingShape[ AXIS_TO_DIMENSION [ axis ] ] -
          resizingShapeMinDimensions[ AXIS_TO_DIMENSION[ axis ] ];

        spaceToolConstraints.bottom = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 'w') {
        minOrMax = start +
          resizingShape[ AXIS_TO_DIMENSION [ axis ] ] -
          resizingShapeMinDimensions[ AXIS_TO_DIMENSION[ axis ] ];

        spaceToolConstraints.right = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 's') {
        minOrMax = start -
          resizingShape[ AXIS_TO_DIMENSION [ axis ] ] +
          resizingShapeMinDimensions[ AXIS_TO_DIMENSION[ axis ] ];

        spaceToolConstraints.top = min = isNumber(min) ? Math.max(min, minOrMax) : minOrMax;
      } else if (direction === 'e') {
        minOrMax = start -
          resizingShape[ AXIS_TO_DIMENSION [ axis ] ] +
          resizingShapeMinDimensions[ AXIS_TO_DIMENSION[ axis ] ];

        spaceToolConstraints.left = min = isNumber(min) ? Math.max(min, minOrMax) : minOrMax;
      }
    }
  });

  return spaceToolConstraints;
}

function includes(array, item) {
  return array.indexOf(item) !== -1;
}

function isConnection(element) {
  return !!element.waypoints;
}

function isLabel(element) {
  return !!element.labelTarget;
}