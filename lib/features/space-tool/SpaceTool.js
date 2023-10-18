import {
  assign,
  filter,
  forEach,
  isNumber
} from 'min-dash';

import {
  asTRBL,
  getMid
} from '../../layout/LayoutUtil';

import { getBBox } from '../../util/Elements';

import { getDirection } from './SpaceUtil';

import {
  hasPrimaryModifier,
  hasSecondaryModifier
} from '../../util/Mouse';

import { set as setCursor } from '../../util/Cursor';

import { selfAndAllChildren } from '../../util/Elements';

import {
  isConnection,
  isLabel
} from '../../util/ModelUtil';

/**
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../core/Canvas').default} Canvas
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../mouse/Mouse').default} Mouse
 * @typedef {import('../rules/Rules').default} Rules
 * @typedef {import('../tool-manager/ToolManager').default} ToolManager
 *
 * @typedef {import('../../util/Types').Axis} Axis
 * @typedef {import('../../util/Types').Direction} Direction
 * @typedef {import('../../util/Types').Point} Point
 */

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
 * @param {ToolManager} toolManager
 * @param {Mouse} mouse
 */
export default function SpaceTool(
    canvas, dragging, eventBus,
    modeling, rules, toolManager,
    mouse) {

  this._canvas = canvas;
  this._dragging = dragging;
  this._eventBus = eventBus;
  this._modeling = modeling;
  this._rules = rules;
  this._toolManager = toolManager;
  this._mouse = mouse;

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
  'toolManager',
  'mouse'
];

/**
 * Activate space tool selection.
 *
 * @param {MouseEvent|TouchEvent} event
 * @param {boolean} autoActivate
 * @param {boolean} reactivate
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
 * @param {MouseEvent|TouchEvent} event
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
 * @param {Array<Shape>} movingShapes
 * @param {Array<Shape>} resizingShapes
 * @param {Point} delta
 * @param {Direction} direction
 * @param {number} start
 */
SpaceTool.prototype.makeSpace = function(movingShapes, resizingShapes, delta, direction, start) {
  return this._modeling.createSpace(movingShapes, resizingShapes, delta, direction, start);
};

/**
 * Initialize make space and return true if that was successful.
 *
 * @param {MouseEvent|TouchEvent} event
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

  if (!hasSecondaryModifier(event) && event.hover) {
    root = event.hover;
  }

  var children = [
    ...selfAndAllChildren(root, true),
    ...(root.attachers || [])
  ];

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
 * @param {Array<Shape>} elements
 * @param {Axis} axis
 * @param {Point} delta
 * @param {number} start
 *
 * @return {Object}
 */
SpaceTool.prototype.calculateAdjustments = function(elements, axis, delta, start) {
  var rules = this._rules;

  var movingShapes = [],
      resizingShapes = [];

  var attachers = [],
      connections = [];

  function moveShape(shape) {
    if (!movingShapes.includes(shape)) {
      movingShapes.push(shape);
    }

    var label = shape.label;

    // move external label if its label target is moving
    if (label && !movingShapes.includes(label)) {
      movingShapes.push(label);
    }
  }

  function resizeShape(shape) {
    if (!resizingShapes.includes(shape)) {
      resizingShapes.push(shape);
    }
  }

  forEach(elements, function(element) {
    if (!element.parent || isLabel(element)) {
      return;
    }

    // handle connections separately
    if (isConnection(element)) {
      connections.push(element);

      return;
    }

    var shapeStart = element[ axis ],
        shapeEnd = shapeStart + element[ AXIS_TO_DIMENSION[ axis ] ];

    // handle attachers separately
    if (isAttacher(element)
      && ((delta > 0 && getMid(element)[ axis ] > start)
        || (delta < 0 && getMid(element)[ axis ] < start))) {
      attachers.push(element);

      return;
    }

    // move shape if its start is after space tool
    if ((delta > 0 && shapeStart > start)
      || (delta < 0 && shapeEnd < start)) {
      moveShape(element);

      return;
    }

    // resize shape if it's resizable and its start is before and its end is after space tool
    if (shapeStart < start
      && shapeEnd > start
      && rules.allowed('shape.resize', { shape: element })
    ) {
      resizeShape(element);

      return;
    }
  });

  // move attacher if its host is moving
  forEach(movingShapes, function(shape) {
    var attachers = shape.attachers;

    if (attachers) {
      forEach(attachers, function(attacher) {
        moveShape(attacher);
      });
    }
  });

  var allShapes = movingShapes.concat(resizingShapes);

  // move attacher if its mid is after space tool and its host is moving or resizing
  forEach(attachers, function(attacher) {
    var host = attacher.host;

    if (includes(allShapes, host)) {
      moveShape(attacher);
    }
  });

  allShapes = movingShapes.concat(resizingShapes);

  // move external label if its label target's (connection) source and target are moving
  forEach(connections, function(connection) {
    var source = connection.source,
        target = connection.target,
        label = connection.label;

    if (includes(allShapes, source)
      && includes(allShapes, target)
      && label) {
      moveShape(label);
    }
  });

  return {
    movingShapes: movingShapes,
    resizingShapes: resizingShapes
  };
};

SpaceTool.prototype.toggle = function() {

  if (this.isActive()) {
    return this._dragging.cancel();
  }

  var mouseEvent = this._mouse.getLastMoveEvent();

  this.activateSelection(mouseEvent, !!mouseEvent);
};

SpaceTool.prototype.isActive = function() {
  var context = this._dragging.context();

  if (context) {
    return /^spaceTool/.test(context.prefix);
  }

  return false;
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
    var attachers = resizingShape.attachers,
        children = resizingShape.children;

    var resizingShapeBBox = asTRBL(resizingShape);

    // find children that are not moving or resizing
    var nonMovingResizingChildren = filter(children, function(child) {
      return !isConnection(child) &&
        !isLabel(child) &&
        !includes(movingShapes, child) &&
        !includes(resizingShapes, child);
    });

    // find children that are moving
    var movingChildren = filter(children, function(child) {
      return !isConnection(child) && !isLabel(child) && includes(movingShapes, child);
    });

    var minOrMax,
        nonMovingResizingChildrenBBox,
        movingChildrenBBox,
        movingAttachers = [],
        nonMovingAttachers = [],
        movingAttachersBBox,
        movingAttachersConstraint,
        nonMovingAttachersBBox,
        nonMovingAttachersConstraint;

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

    if (attachers && attachers.length) {
      attachers.forEach(function(attacher) {
        if (includes(movingShapes, attacher)) {
          movingAttachers.push(attacher);
        } else {
          nonMovingAttachers.push(attacher);
        }
      });

      if (movingAttachers.length) {
        movingAttachersBBox = asTRBL(getBBox(movingAttachers.map(getMid)));

        movingAttachersConstraint = resizingShapeBBox[ DIRECTION_TO_TRBL[ DIRECTION_TO_OPPOSITE[ direction ] ] ]
              - (movingAttachersBBox[ DIRECTION_TO_TRBL[ DIRECTION_TO_OPPOSITE[ direction ] ] ] - start);
      }

      if (nonMovingAttachers.length) {
        nonMovingAttachersBBox = asTRBL(getBBox(nonMovingAttachers.map(getMid)));

        nonMovingAttachersConstraint = nonMovingAttachersBBox[ DIRECTION_TO_TRBL[ direction ] ]
              - (resizingShapeBBox[ DIRECTION_TO_TRBL[ direction ] ] - start);
      }

      if (direction === 'n') {
        minOrMax = Math.min(movingAttachersConstraint || Infinity, nonMovingAttachersConstraint || Infinity);

        spaceToolConstraints.bottom = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 'w') {
        minOrMax = Math.min(movingAttachersConstraint || Infinity, nonMovingAttachersConstraint || Infinity);

        spaceToolConstraints.right = max = isNumber(max) ? Math.min(max, minOrMax) : minOrMax;
      } else if (direction === 's') {
        minOrMax = Math.max(movingAttachersConstraint || -Infinity, nonMovingAttachersConstraint || -Infinity);

        spaceToolConstraints.top = min = isNumber(min) ? Math.max(min, minOrMax) : minOrMax;
      } else if (direction === 'e') {
        minOrMax = Math.max(movingAttachersConstraint || -Infinity, nonMovingAttachersConstraint || -Infinity);

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

function isAttacher(element) {
  return !!element.host;
}