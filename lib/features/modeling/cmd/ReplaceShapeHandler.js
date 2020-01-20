import { forEach } from 'min-dash';

import {
  getResizedSourceAnchor,
  getResizedTargetAnchor
} from './helper/AnchorsHelper';

/**
 * Replace shape by adding new shape and removing old shape. Incoming and outgoing connections will
 * be kept if possible.
 *
 * @class
 * @constructor
 *
 * @param {Modeling} modeling
 * @param {Rules} rules
 */
export default function ReplaceShapeHandler(modeling, rules) {
  this._modeling = modeling;
  this._rules = rules;
}

ReplaceShapeHandler.$inject = [ 'modeling', 'rules' ];


/**
 * Add new shape.
 *
 * @param {Object} context
 * @param {djs.model.Shape} context.oldShape
 * @param {Object} context.newData
 * @param {string} context.newData.type
 * @param {number} context.newData.x
 * @param {number} context.newData.y
 * @param {Object} [hints]
 */
ReplaceShapeHandler.prototype.preExecute = function(context) {
  var self = this,
      modeling = this._modeling,
      rules = this._rules;

  var oldShape = context.oldShape,
      newData = context.newData,
      hints = context.hints || {},
      newShape;

  function canReconnect(source, target, connection) {
    return rules.allowed('connection.reconnect', {
      connection: connection,
      source: source,
      target: target
    });
  }

  // (1) add new shape at given position
  var position = {
    x: newData.x,
    y: newData.y
  };

  var oldBounds = {
    x: oldShape.x,
    y: oldShape.y,
    width: oldShape.width,
    height: oldShape.height
  };

  newShape = context.newShape =
    context.newShape ||
    self.createShape(newData, position, oldShape.parent, hints);

  // (2) update host
  if (oldShape.host) {
    modeling.updateAttachment(newShape, oldShape.host);
  }

  // (3) adopt all children from old shape
  var children;

  if (hints.moveChildren !== false) {
    children = oldShape.children.slice();

    modeling.moveElements(children, { x: 0, y: 0 }, newShape, hints);
  }

  // (4) reconnect connections to new shape if possible
  var incoming = oldShape.incoming.slice(),
      outgoing = oldShape.outgoing.slice();

  forEach(incoming, function(connection) {
    var source = connection.source,
        allowed = canReconnect(source, newShape, connection);

    if (allowed) {
      self.reconnectEnd(
        connection, newShape,
        getResizedTargetAnchor(connection, newShape, oldBounds),
        hints
      );
    }
  });

  forEach(outgoing, function(connection) {
    var target = connection.target,
        allowed = canReconnect(newShape, target, connection);

    if (allowed) {
      self.reconnectStart(
        connection, newShape,
        getResizedSourceAnchor(connection, newShape, oldBounds),
        hints
      );
    }
  });
};


/**
 * Remove old shape.
 */
ReplaceShapeHandler.prototype.postExecute = function(context) {
  var oldShape = context.oldShape;

  this._modeling.removeShape(oldShape);
};


ReplaceShapeHandler.prototype.execute = function(context) {};


ReplaceShapeHandler.prototype.revert = function(context) {};


ReplaceShapeHandler.prototype.createShape = function(shape, position, target, hints) {
  return this._modeling.createShape(shape, position, target, hints);
};


ReplaceShapeHandler.prototype.reconnectStart = function(connection, newSource, dockingPoint, hints) {
  this._modeling.reconnectStart(connection, newSource, dockingPoint, hints);
};


ReplaceShapeHandler.prototype.reconnectEnd = function(connection, newTarget, dockingPoint, hints) {
  this._modeling.reconnectEnd(connection, newTarget, dockingPoint, hints);
};
