import {
  add as collectionAdd,
  indexOf as collectionIdx
} from '../../../util/Collections';

import {
  saveClear
} from '../../../util/Removal';

/**
 * A handler that implements reversible deletion of Connections.
 *
 */
export default function DeleteConnectionHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

DeleteConnectionHandler.$inject = [
  'canvas',
  'modeling'
];


/**
 * - Remove attached labels
 */
DeleteConnectionHandler.prototype.preExecute = function(context) {

  var connection = context.connection;
  var modeling = this._modeling;

  // Remove labels
  saveClear(connection.labels, function(label) {
    modeling.removeShape(label);
  });
};

DeleteConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection,
      parent = connection.parent;

  context.parent = parent;
  context.parentIndex = collectionIdx(parent.children, connection);

  context.source = connection.source;
  context.target = connection.target;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;

  return connection;
};

/**
 * Command revert implementation.
 */
DeleteConnectionHandler.prototype.revert = function(context) {

  var connection = context.connection,
      parent = context.parent,
      parentIndex = context.parentIndex;

  connection.source = context.source;
  connection.target = context.target;

  // restore previous location in old parent
  collectionAdd(parent.children, connection, parentIndex);

  this._canvas.addConnection(connection, parent);

  return connection;
};
