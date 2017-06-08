'use strict';

var Collections = require('../../../util/Collections');

var saveClear = require('../../../util/Removal').saveClear;


/**
 * A handler that implements reversible deletion of shapes.
 *
 */
function DeleteShapeHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

DeleteShapeHandler.$inject = [ 'canvas', 'modeling' ];

module.exports = DeleteShapeHandler;


/**
 * - Remove connections
 * - Remove all direct children
 */
DeleteShapeHandler.prototype.preExecute = function(context) {

  var modeling = this._modeling;

  var shape = context.shape;

  // remove connections
  saveClear(shape.incoming, function(connection) {
    // To make sure that the connection isn't removed twice
    // For example if a container is removed
    modeling.removeConnection(connection, { nested: true });
  });

  saveClear(shape.outgoing, function(connection) {
    modeling.removeConnection(connection, { nested: true });
  });

  // remove child shapes and connections
  saveClear(shape.children, function(child) {
    if (isConnection(child)) {
      modeling.removeConnection(child, { nested: true });
    } else {
      modeling.removeShape(child, { nested: true });
    }
  });
};

/**
 * Remove shape and remember the parent
 */
DeleteShapeHandler.prototype.execute = function(context) {
  var canvas = this._canvas;

  var shape = context.shape,
      oldParent = shape.parent;

  context.oldParent = oldParent;

  // remove containment
  context.oldParentIndex = Collections.indexOf(oldParent.children, shape);

  // remove shape
  canvas.removeShape(shape);

  return shape;
};


/**
 * Command revert implementation
 */
DeleteShapeHandler.prototype.revert = function(context) {

  var canvas = this._canvas;

  var shape = context.shape,
      oldParent = context.oldParent,
      oldParentIndex = context.oldParentIndex;

  // restore containment
  Collections.add(oldParent.children, shape, oldParentIndex);

  canvas.addShape(shape, oldParent);

  return shape;
};

function isConnection(element) {
  return element.waypoints;
}
