import {
  add as collectionAdd,
  indexOf as collectionIdx
} from '../../../util/Collections';

import { saveClear } from '../../../util/Removal';

import {
  forEach
} from 'min-dash';


/**
 * A handler that implements reversible deletion of shapes.
 *
 */
export default function DeleteShapeHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

DeleteShapeHandler.$inject = [ 'canvas', 'modeling' ];


/**
 * - Remove connections
 * - Remove all direct children
 */
DeleteShapeHandler.prototype.preExecute = function(context) {

  var modeling = this._modeling;

  var shape = context.shape,
      labels = shape.labels;

  // Clean up on removeShape(label)
  if (shape.labelTarget) {
    context.labelTarget = shape.labelTarget;
    shape.labelTarget = null;
  }

  // Remove labels
  if (labels && labels.length) {
    forEach(labels, function(label) {
      modeling.removeShape(label, { nested: true });
    });
  }

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
  context.oldParentIndex = collectionIdx(oldParent.children, shape);

  if (shape.labels && shape.labels.length) {
    shape.labels.length = 0;
  }
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
      oldParentIndex = context.oldParentIndex,
      labelTarget = context.labelTarget;

  // restore previous location in old oldParent
  collectionAdd(oldParent.children, shape, oldParentIndex);

  if (labelTarget) {
    labelTarget.labels.push(shape);
  }

  canvas.addShape(shape, oldParent);

  return shape;
};

function isConnection(element) {
  return element.waypoints;
}
