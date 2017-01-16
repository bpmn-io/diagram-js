import {
  add as collectionAdd,
  indexOf as collectionIdx
} from '../../../util/Collections';

import { saveClear } from '../../../util/Removal';


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

  var shape = context.shape;

  // Remove labels
  saveClear(shape.labels, function(label) {
    modeling.removeShape(label, { nested: true });
  });

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
      labelTarget = shape.labelTarget,
      oldParent = shape.parent;

  context.oldParent = oldParent;
  context.oldParentIndex = collectionIdx(oldParent.children, shape);

  // clean up on removeShape(label)
  if (labelTarget) {
    context.labelTarget = labelTarget;
    context.oldLabelIndex = collectionIdx(labelTarget.labels, shape);
    shape.labelTarget = null;
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
      labelTarget = context.labelTarget,
      oldLabelIndex = context.oldLabelIndex;

  // restore previous location in old oldParent
  collectionAdd(oldParent.children, shape, oldParentIndex);

  canvas.addShape(shape, oldParent);

  // restore label in old labelTarget
  if (labelTarget) {
    collectionAdd(labelTarget.labels, shape, oldLabelIndex);

    shape.labelTarget = labelTarget;
  }

  return shape;
};

function isConnection(element) {
  return element.waypoints;
}
