import {
  add as collectionAdd,
  indexOf as collectionIdx
} from '../../../util/Collections';
import { saveClear } from '../../../util/Removal';


/**
 * A handler that implements reversible deletion of Connections.
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
 * - Remove connections
 */
DeleteConnectionHandler.prototype.preExecute = function(context) {

  var modeling = this._modeling;

  var connection = context.connection;

  // remove connections
  saveClear(connection.incoming, function(connection) {

    // To make sure that the connection isn't removed twice
    // For example if a container is removed
    modeling.removeConnection(connection, { nested: true });
  });

  saveClear(connection.outgoing, function(connection) {
    modeling.removeConnection(connection, { nested: true });
  });

};


DeleteConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection,
      parent = connection.parent;

  context.parent = parent;

  // remember containment
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

  // restore containment
  collectionAdd(parent.children, connection, parentIndex);

  this._canvas.addConnection(connection, parent);

  return connection;
};
