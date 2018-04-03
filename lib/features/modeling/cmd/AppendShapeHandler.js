import { some } from 'min-dash';


/**
 * A handler that implements reversible appending of shapes
 * to a source shape.
 *
 * @param {canvas} Canvas
 * @param {elementFactory} ElementFactory
 * @param {modeling} Modeling
 */
export default function AppendShapeHandler(modeling) {
  this._modeling = modeling;
}

AppendShapeHandler.$inject = [ 'modeling' ];


// api //////////////////////


/**
 * Creates a new shape
 *
 * @param {Object} context
 * @param {ElementDescriptor} context.shape the new shape
 * @param {ElementDescriptor} context.source the source object
 * @param {ElementDescriptor} context.parent the parent object
 * @param {Point} context.position position of the new element
 */
AppendShapeHandler.prototype.preExecute = function(context) {

  var source = context.source;

  if (!source) {
    throw new Error('source required');
  }

  var target = context.target || source.parent,
      shape = context.shape;

  shape = context.shape =
    this._modeling.createShape(
      shape,
      context.position,
      target, { attach: context.attach });

  context.shape = shape;
};

AppendShapeHandler.prototype.postExecute = function(context) {
  var parent = context.connectionParent || context.shape.parent;

  if (!existsConnection(context.source, context.shape)) {

    // create connection
    this._modeling.connect(context.source, context.shape, context.connection, parent);
  }
};


function existsConnection(source, target) {
  return some(source.outgoing, function(c) {
    return c.target === target;
  });
}