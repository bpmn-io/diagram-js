import {
  assign,
  forEach,
  pick
} from 'min-dash';

import MoveHelper from './helper/MoveHelper';

import {
  add as collectionAdd,
  remove as collectionRemove
} from '../../../util/Collections';

import {
  getMovedSourceAnchor,
  getMovedTargetAnchor
} from './helper/AnchorsHelper';


/**
 * A handler that implements reversible moving of shapes.
 */
export default function MoveShapeHandler(modeling) {
  this._modeling = modeling;

  this._helper = new MoveHelper(modeling);
}

MoveShapeHandler.$inject = [ 'modeling' ];


MoveShapeHandler.prototype.execute = function(context) {

  var shape = context.shape,
      delta = context.delta,
      newParent = context.newParent || shape.parent,
      newParentIndex = context.newParentIndex,
      oldParent = shape.parent;

  context.oldBounds = pick(shape, [ 'x', 'y', 'width', 'height' ]);

  // save old parent in context
  context.oldParent = oldParent;
  context.oldParentIndex = collectionRemove(oldParent.children, shape);

  // add to new parent at position
  collectionAdd(newParent.children, shape, newParentIndex);

  // update shape parent + position
  assign(shape, {
    parent: newParent,
    x: shape.x + delta.x,
    y: shape.y + delta.y
  });

  return shape;
};

MoveShapeHandler.prototype.postExecute = function(context) {

  var shape = context.shape,
      delta = context.delta,
      hints = context.hints;

  var modeling = this._modeling;

  if (hints.layout !== false) {

    forEach(shape.incoming, function(c) {
      modeling.layoutConnection(c, {
        connectionEnd: getMovedTargetAnchor(c, shape, delta)
      });
    });

    forEach(shape.outgoing, function(c) {
      modeling.layoutConnection(c, {
        connectionStart: getMovedSourceAnchor(c, shape, delta)
      });
    });
  }

  if (hints.recurse !== false) {
    this.moveChildren(context);
  }
};

MoveShapeHandler.prototype.revert = function(context) {

  var shape = context.shape,
      oldParent = context.oldParent,
      oldParentIndex = context.oldParentIndex,
      delta = context.delta;

  // restore previous location in old parent
  collectionAdd(oldParent.children, shape, oldParentIndex);

  // revert to old position and parent
  assign(shape, {
    parent: oldParent,
    x: shape.x - delta.x,
    y: shape.y - delta.y
  });

  return shape;
};

MoveShapeHandler.prototype.moveChildren = function(context) {

  var delta = context.delta,
      shape = context.shape;

  this._helper.moveRecursive(shape.children, delta, null);
};

MoveShapeHandler.prototype.getNewParent = function(context) {
  return context.newParent || context.shape.parent;
};
