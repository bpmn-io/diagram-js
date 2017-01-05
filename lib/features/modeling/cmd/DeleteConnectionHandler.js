'use strict';

var Collections = require('../../../util/Collections'),
    forEach = require('lodash/collection/forEach');


/**
 * A handler that implements reversible deletion of Connections.
 *
 */
function DeleteConnectionHandler(canvas, modeling) {
  this._canvas = canvas;
  this._modeling = modeling;
}

DeleteConnectionHandler.$inject = [ 'canvas', 'modeling' ];

module.exports = DeleteConnectionHandler;


/**
 * - Remove attached labels
 */
DeleteConnectionHandler.prototype.preExecute = function(context) {

  var connection = context.connection;
  var modeling = this._modeling;
  
  // Remove labels
  if (connection.labels && connection.labels.length) {
    forEach(connection.labels, function(label) {
      modeling.removeShape(label);  
    });
  }
};

DeleteConnectionHandler.prototype.execute = function(context) {

  var connection = context.connection,
      parent = connection.parent;

  context.parent = parent;
  context.parentIndex = Collections.indexOf(parent.children, connection);

  context.source = connection.source;
  context.target = connection.target;

  this._canvas.removeConnection(connection);

  connection.source = null;
  connection.target = null;

  if (connection.labels && connection.labels.length) {
    connection.labels.length = 0;
  }

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
  Collections.add(parent.children, connection, parentIndex);

  this._canvas.addConnection(connection, parent);

  return connection;
};
