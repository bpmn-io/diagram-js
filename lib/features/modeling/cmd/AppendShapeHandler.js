import { some } from 'min-dash';

/**
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').Parent} Parent
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('../../../util/Types').Point} Point
 *
 * @typedef {import('../Modeling').default} Modeling
 */

/**
 * A handler that implements reversible appending of shapes
 * to a source shape.
 *
 * @param {Modeling} modeling
 */
export default function AppendShapeHandler(modeling) {
  this._modeling = modeling;
}

AppendShapeHandler.$inject = [ 'modeling' ];


// api //////////////////////


/**
 * Creates a new shape.
 *
 * @param {Object} context
 * @param {Partial<Shape>} context.shape The new shape.
 * @param {Element} context.source The element to which to append the new shape to.
 * @param {Parent} context.parent The parent.
 * @param {Point} context.position The position at which to create the new shape.
 */
AppendShapeHandler.prototype.preExecute = function(context) {

  var source = context.source;

  if (!source) {
    throw new Error('source required');
  }

  var target = context.target || source.parent,
      shape = context.shape,
      hints = context.hints || {};

  shape = context.shape =
    this._modeling.createShape(
      shape,
      context.position,
      target, { attach: hints.attach });

  context.shape = shape;
};

AppendShapeHandler.prototype.postExecute = function(context) {
  var hints = context.hints || {};

  if (!existsConnection(context.source, context.shape)) {

    // create connection
    if (hints.connectionTarget === context.source) {
      this._modeling.connect(context.shape, context.source, context.connection);
    } else {
      this._modeling.connect(context.source, context.shape, context.connection);
    }
  }
};


function existsConnection(source, target) {
  return some(source.outgoing, function(c) {
    return c.target === target;
  });
}