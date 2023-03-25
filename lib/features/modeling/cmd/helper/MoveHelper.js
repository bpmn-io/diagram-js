import {
  forEach
} from 'min-dash';

import {
  getMovedSourceAnchor,
  getMovedTargetAnchor
} from './AnchorsHelper';

import MoveClosure from './MoveClosure';

/**
 * @typedef {import('../../../../core/Types').ElementLike} Element
 * @typedef {import('../../../../core/Types').ShapeLike} Shape
 *
 * @typedef {import('../../../../util/Types').Point} Point
 *
 * @typedef {import('../../Modeling').default} Modeling
 */

/**
 * A helper that is able to carry out serialized move
 * operations on multiple elements.
 *
 * @param {Modeling} modeling
 */
export default function MoveHelper(modeling) {
  this._modeling = modeling;
}

/**
 * Move the specified elements and all children by the given delta.
 *
 * This moves all enclosed connections, too and layouts all affected
 * external connections.
 *
 * @template {Element} T
 *
 * @param {T[]} elements
 * @param {Point} delta
 * @param {Shape} newParent The new parent of all elements that are not nested.
 *
 * @return {T[]}
 */
MoveHelper.prototype.moveRecursive = function(elements, delta, newParent) {
  if (!elements) {
    return [];
  } else {
    return this.moveClosure(this.getClosure(elements), delta, newParent);
  }
};

/**
 * Move the given closure of elmements.
 *
 * @param {Object} closure
 * @param {Point} delta
 * @param {Shape} [newParent]
 * @param {Shape} [newHost]
 */
MoveHelper.prototype.moveClosure = function(closure, delta, newParent, newHost, primaryShape) {
  var modeling = this._modeling;

  var allShapes = closure.allShapes,
      allConnections = closure.allConnections,
      enclosedConnections = closure.enclosedConnections,
      topLevel = closure.topLevel,
      keepParent = false;

  if (primaryShape && primaryShape.parent === newParent) {
    keepParent = true;
  }

  // move all shapes
  forEach(allShapes, function(shape) {

    // move the element according to the given delta
    modeling.moveShape(shape, delta, topLevel[shape.id] && !keepParent && newParent, {
      recurse: false,
      layout: false
    });
  });

  // move all child connections / layout external connections
  forEach(allConnections, function(c) {

    var sourceMoved = !!allShapes[c.source.id],
        targetMoved = !!allShapes[c.target.id];

    if (enclosedConnections[c.id] && sourceMoved && targetMoved) {
      modeling.moveConnection(c, delta, topLevel[c.id] && !keepParent && newParent);
    } else {
      modeling.layoutConnection(c, {
        connectionStart: sourceMoved && getMovedSourceAnchor(c, c.source, delta),
        connectionEnd: targetMoved && getMovedTargetAnchor(c, c.target, delta)
      });
    }
  });
};

/**
 * Returns the closure for the selected elements
 *
 * @param {Element[]} elements
 *
 * @return {MoveClosure}
 */
MoveHelper.prototype.getClosure = function(elements) {
  return new MoveClosure().addAll(elements, true);
};