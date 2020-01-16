import {
  assign,
  forEach
} from 'min-dash';

import { getDirection } from './SpaceUtil';

import { set as setCursor } from '../../util/Cursor';

import { selfAndAllChildren } from '../../util/Elements';

import { hasPrimaryModifier } from '../../util/Mouse';

var abs = Math.abs,
    round = Math.round;

var AXIS_TO_DIMENSION = {
  x: 'width',
  y: 'height'
};

var CURSOR_CROSSHAIR = 'crosshair';

var HIGH_PRIORITY = 1500;


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
  this._modeling = modeling;
  this._rules = rules;
  this._toolManager = toolManager;

  var self = this;

  toolManager.registerTool('space', {
    tool: 'spaceTool.selection',
    dragging: 'spaceTool'
  });

  eventBus.on('spaceTool.selection.end', function(event) {
    var originalEvent = event.originalEvent,
        target = originalEvent.target;

    eventBus.once('spaceTool.selection.ended', function() {
      self.activateMakeSpace(event.originalEvent);
    });
  });

  eventBus.on('spaceTool.move', HIGH_PRIORITY , function(event) {
    var context = event.context;

    if (!context.initialized) {
      context.initialized = self.init(event, context);
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

    var delta = {
      x: 0,
      y: 0
    };

    delta[ axis ] = round(event[ 'd' + axis ]);

    var makeSpaceAllowed = true;

    // do NOT resize shapes to smaller size than minimum size
    forEach(resizingShapes, function(shape) {

      if ((direction === 'w' && event.x > shape.x + shape.width) ||
          (direction === 'e' && event.x < shape.x) ||
          (direction === 'n' && event.y > shape.y + shape.height) ||
          (direction === 's' && event.y < shape.y)) {

        makeSpaceAllowed = false;
        return;
      }
    });

    if (makeSpaceAllowed) {
      self.makeSpace(movingShapes, resizingShapes, delta, direction, start);
    }

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

  var root = this._canvas.getRootElement();

  var children = selfAndAllChildren(root, true);

  var elements = this.getElements(children, axis, delta, start);

  assign(
    context,
    elements,
    {
      axis: axis,
      direction: getDirection(axis, delta),
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
SpaceTool.prototype.getElements = function(elements, axis, delta, start) {
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

function isConnection(element) {
  return !!element.waypoints;
}