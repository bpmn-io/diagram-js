/**
 * @typedef {import('../../../model/Types').Element} Element
 * @typedef {import('../../../model/Types').Shape} Shape
 *
 * @typedef {import('../../../util/Types').Point} Point
 *
 * @typedef {import('../Modeling').ModelingHints} ModelingHints
 *
 * @typedef {import('../../../core/Canvas').default} Canvas
 * @typedef {import('../../../layout/BaseLayouter').default} Layouter
 */

/**
 * @param {Canvas} canvas
 * @param {Layouter} layouter
 */
export default function CreateConnectionHandler(canvas, layouter) {
  this._canvas = canvas;
  this._layouter = layouter;
}

CreateConnectionHandler.$inject = [ 'canvas', 'layouter' ];


// api //////////////////////


/**
 * Creates a new connection between two elements.
 *
 * @param {Object} context
 * @param {Element} context.source The source.
 * @param {Element} context.target The target.
 * @param {Shape} context.parent The parent.
 * @param {number} [context.parentIndex] The optional index at which to add the
 * connection to the parent's children.
 * @param {ModelingHints} [context.hints] The optional hints.
 */
CreateConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection,
      source = context.source,
      target = context.target,
      parent = context.parent,
      parentIndex = context.parentIndex,
      hints = context.hints;

  if (!source || !target) {
    throw new Error('source and target required');
  }

  if (!parent) {
    throw new Error('parent required');
  }

  connection.source = source;
  connection.target = target;

  if (!connection.waypoints) {
    connection.waypoints = this._layouter.layoutConnection(connection, hints);
  }

  // add connection
  this._canvas.addConnection(connection, parent, parentIndex);

  return connection;
};

CreateConnectionHandler.prototype.revert = function(context) {
  var connection = context.connection;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;

  return connection;
};