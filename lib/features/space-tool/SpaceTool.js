import {
  getDirection
} from './SpaceUtil';

import {
  set as cursorSet
} from '../../util/Cursor';

import {
  hasPrimaryModifier
} from '../../util/Mouse';

var abs = Math.abs,
    round = Math.round;

var HIGH_PRIORITY = 1500,
    SPACE_TOOL_CURSOR = 'crosshair';

var AXIS_TO_DIMENSION = { x: 'width', y: 'height' },
    AXIS_INVERTED = { x: 'y', y: 'x' };

import {
  selfAndAllChildren as getAllChildren
} from '../../util/Elements';

import {
  assign,
  forEach
} from 'min-dash';


/**
 * A tool that allows users to create and remove space in a diagram.
 *
 * The tool needs to be activated manually via {@link SpaceTool#activate(MouseEvent)}.
 */
export default function SpaceTool(
    eventBus, dragging, canvas,
    modeling, rules, toolManager) {

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
    var target = event.originalEvent.target;

    // only reactive on diagram click
    // on some occasions, event.hover is not set and we have to check if the target is an svg
    if (!event.hover && !(target instanceof SVGElement)) {
      return;
    }

    eventBus.once('spaceTool.selection.ended', function() {
      self.activateMakeSpace(event.originalEvent);
    });
  });


  eventBus.on('spaceTool.move', HIGH_PRIORITY , function(event) {

    var context = event.context;

    if (!context.initialized) {
      context.initialized = self.initializeMakeSpace(event, context);
    }
  });


  eventBus.on('spaceTool.end', function(event) {

    var context = event.context,
        axis = context.axis,
        direction = context.direction,
        movingShapes = context.movingShapes,
        resizingShapes = context.resizingShapes,
        start = context.start;

    // skip if create space has not been initialized yet
    if (!context.initialized) {
      return;
    }

    var delta = { x: round(event.dx), y: round(event.dy) };
    delta[ AXIS_INVERTED[ axis ] ] = 0;

    var insideBounds = true;

    // check if the space tool cursor is inside of bounds of
    // any of the shapes that would be resized.
    forEach(resizingShapes, function(shape) {

      if ((direction === 'w' && event.x > shape.x + shape.width) ||
          (direction === 'e' && event.x < shape.x) ||
          (direction === 'n' && event.y > shape.y + shape.height) ||
          (direction === 's' && event.y < shape.y)) {

        insideBounds = false;
        return;
      }
    });

    if (insideBounds) {

      // make space only if the cursor is inside bounds
      self.makeSpace(movingShapes, resizingShapes, delta, direction, start);
    }

    eventBus.once('spaceTool.ended', function(event) {

      // reactivate space tool after usage
      self.activateSelection(event.originalEvent, true, true);
    });

  });
}

SpaceTool.$inject = [
  'eventBus',
  'dragging',
  'canvas',
  'modeling',
  'rules',
  'toolManager'
];


/**
 * Activate space tool selection
 *
 * @param  {MouseEvent} event
 * @param  {Boolean} autoActivate
 */
SpaceTool.prototype.activateSelection = function(event, autoActivate, reactivate) {
  this._dragging.init(event, 'spaceTool.selection', {
    trapClick: false,
    cursor: SPACE_TOOL_CURSOR,
    autoActivate: autoActivate,
    data: {
      context: {
        reactivate: reactivate
      }
    }
  });
};

/**
 * Activate make space
 *
 * @param  {MouseEvent} event
 */
SpaceTool.prototype.activateMakeSpace = function(event) {
  this._dragging.init(event, 'spaceTool', {
    autoActivate: true,
    cursor: SPACE_TOOL_CURSOR,
    data: {
      context: {}
    }
  });
};

/**
 * Actually make space on the diagram
 *
 * @param  {Array<djs.model.Shape>} movingShapes
 * @param  {Array<djs.model.Shape>} resizingShapes
 * @param  {Point} delta
 * @param  {String} direction
 */
SpaceTool.prototype.makeSpace = function(movingShapes, resizingShapes, delta, direction, start) {
  return this._modeling.createSpace(movingShapes, resizingShapes, delta, direction, start);
};

/**
 * Initialize make space and return true if that was successful.
 *
 * @param {Event} event
 * @param {Object} context
 *
 * @return {Boolean} true, if successful
 */
SpaceTool.prototype.initializeMakeSpace = function(event, context) {

  var axis = abs(event.dx) > abs(event.dy) ? 'x' : 'y',
      delta = event[ 'd' + axis ],
      start = event[ axis ] - delta;

  if (abs(delta) < 5) {
    return false;
  }

  // invert the offset in order to remove space when moving left
  if (delta < 0) {
    delta *= -1;
  }

  // inverts the offset to choose the shapes
  // on the opposite side of the resizer if
  // a key modifier is pressed
  if (hasPrimaryModifier(event)) {
    delta *= -1;
  }

  var rootShape = this._canvas.getRootElement();

  var allShapes = getAllChildren(rootShape, true);

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

  cursorSet('resize-' + (axis === 'x' ? 'ew' : 'ns'));

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

    // element to be moved
    if ((delta > 0 && shapeStart > start) || (delta < 0 && shapeEnd < start)) {
      return movingShapes.push(element);
    }

    // element to be resized
    if (shapeStart < start &&
        shapeEnd > start &&
        rules.allowed('shape.resize', { shape: element })) {

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