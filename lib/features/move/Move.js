import {
  assign,
  filter,
  groupBy,
  isObject
} from 'min-dash';

import {
  classes as svgClasses
} from 'tiny-svg';

/**
 * @typedef {import('../../core/Types').ElementLike} Element
 * @typedef {import('../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../dragging/Dragging').default} Dragging
 * @typedef {import('../../core/EventBus').default} EventBus
 * @typedef {import('../modeling/Modeling').default} Modeling
 * @typedef {import('../rules/Rules').default} Rules
 * @typedef {import('../selection/Selection').default} Selection
 */

var LOW_PRIORITY = 500,
    MEDIUM_PRIORITY = 1250,
    HIGH_PRIORITY = 1500;

import { getOriginal as getOriginalEvent } from '../../util/Event';

import {
  isPrimaryButton
} from '../../util/Mouse';

var round = Math.round;

function mid(element) {
  return {
    x: element.x + round(element.width / 2),
    y: element.y + round(element.height / 2)
  };
}

/**
 * A plugin that makes shapes draggable / droppable.
 *
 * @param {EventBus} eventBus
 * @param {Dragging} dragging
 * @param {Modeling} modeling
 * @param {Selection} selection
 * @param {Rules} rules
 */
export default function MoveEvents(
    eventBus, dragging, modeling,
    selection, rules) {

  // rules

  function canMove(shapes, delta, position, target) {

    return rules.allowed('elements.move', {
      shapes: shapes,
      delta: delta,
      position: position,
      target: target
    });
  }


  // move events

  // assign a high priority to this handler to setup the environment
  // others may hook up later, e.g. at default priority and modify
  // the move environment.
  //
  // This sets up the context with
  //
  // * shape: the primary shape being moved
  // * shapes: a list of shapes to be moved
  // * validatedShapes: a list of shapes that are being checked
  //                    against the rules before and during move
  //
  eventBus.on('shape.move.start', HIGH_PRIORITY, function(event) {

    var context = event.context,
        shape = event.shape,
        shapes = selection.get().slice();

    // move only single shape if the dragged element
    // is not part of the current selection
    if (shapes.indexOf(shape) === -1) {
      shapes = [ shape ];
    }

    // ensure we remove nested elements in the collection
    // and add attachers for a proper dragger
    shapes = removeNested(shapes);

    // attach shapes to drag context
    assign(context, {
      shapes: shapes,
      validatedShapes: shapes,
      shape: shape
    });
  });


  // assign a high priority to this handler to setup the environment
  // others may hook up later, e.g. at default priority and modify
  // the move environment
  //
  eventBus.on('shape.move.start', MEDIUM_PRIORITY, function(event) {

    var context = event.context,
        validatedShapes = context.validatedShapes,
        canExecute;

    canExecute = context.canExecute = canMove(validatedShapes);

    // check if we can move the elements
    if (!canExecute) {
      return false;
    }
  });

  // assign a low priority to this handler
  // to let others modify the move event before we update
  // the context
  //
  eventBus.on('shape.move.move', LOW_PRIORITY, function(event) {

    var context = event.context,
        validatedShapes = context.validatedShapes,
        hover = event.hover,
        delta = { x: event.dx, y: event.dy },
        position = { x: event.x, y: event.y },
        canExecute;

    // check if we can move the elements
    canExecute = canMove(validatedShapes, delta, position, hover);

    context.delta = delta;
    context.canExecute = canExecute;

    // simply ignore move over
    if (canExecute === null) {
      context.target = null;

      return;
    }

    context.target = hover;
  });

  eventBus.on('shape.move.end', function(event) {

    var context = event.context;

    var delta = context.delta,
        canExecute = context.canExecute,
        isAttach = canExecute === 'attach',
        shapes = context.shapes;

    if (canExecute === false) {
      return false;
    }

    // ensure we have actual pixel values deltas
    // (important when zoom level was > 1 during move)
    delta.x = round(delta.x);
    delta.y = round(delta.y);

    if (delta.x === 0 && delta.y === 0) {

      // didn't move
      return;
    }

    modeling.moveElements(shapes, delta, context.target, {
      primaryShape: context.shape,
      attach: isAttach
    });
  });


  // move activation

  eventBus.on('element.mousedown', function(event) {

    if (!isPrimaryButton(event)) {
      return;
    }

    var originalEvent = getOriginalEvent(event);

    if (!originalEvent) {
      throw new Error('must supply DOM mousedown event');
    }

    return start(originalEvent, event.element);
  });

  /**
   * Start move.
   *
   * @param {MouseEvent|TouchEvent} event
   * @param {Shape} element
   * @param {boolean} [activate]
   * @param {Object} [context]
   */
  function start(event, element, activate, context) {
    if (isObject(activate)) {
      context = activate;
      activate = false;
    }

    // do not move connections or the root element
    if (element.waypoints || !element.parent) {
      return;
    }

    // ignore non-draggable hits
    if (svgClasses(event.target).has('djs-hit-no-move')) {
      return;
    }

    var referencePoint = mid(element);

    dragging.init(event, referencePoint, 'shape.move', {
      cursor: 'grabbing',
      autoActivate: activate,
      data: {
        shape: element,
        context: context || {}
      }
    });

    // we've handled the event
    return true;
  }

  // API

  this.start = start;
}

MoveEvents.$inject = [
  'eventBus',
  'dragging',
  'modeling',
  'selection',
  'rules'
];


/**
 * Return a filtered list of elements that do not contain
 * those nested into others.
 *
 * @param {Element[]} elements
 *
 * @return {Element[]} filtered
 */
function removeNested(elements) {

  var ids = groupBy(elements, 'id');

  return filter(elements, function(element) {
    while ((element = element.parent)) {

      // parent in selection
      if (ids[element.id]) {
        return false;
      }
    }

    return true;
  });
}
