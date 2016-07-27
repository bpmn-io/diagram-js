'use strict';

var forEach = require('lodash/collection/forEach');

var model = require('../../model');


/**
 * The basic modeling entry point.
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
function Modeling(eventBus, elementFactory, commandStack) {
  this._eventBus = eventBus;
  this._elementFactory = elementFactory;
  this._commandStack = commandStack;

  var self = this;

  eventBus.on('diagram.init', function() {
    // register modeling handlers
    self.registerHandlers(commandStack);
  });
}

Modeling.$inject = [ 'eventBus', 'elementFactory', 'commandStack' ];

module.exports = Modeling;


Modeling.prototype.getHandlers = function() {
  return {
    'shape.append': require('./cmd/AppendShapeHandler'),
    'shape.create': require('./cmd/CreateShapeHandler'),
    'shape.delete': require('./cmd/DeleteShapeHandler'),
    'shape.move': require('./cmd/MoveShapeHandler'),
    'shape.resize': require('./cmd/ResizeShapeHandler'),
    'shape.replace': require('./cmd/ReplaceShapeHandler'),

    'spaceTool': require('./cmd/SpaceToolHandler'),

    'label.create': require('./cmd/CreateLabelHandler'),

    'connection.create': require('./cmd/CreateConnectionHandler'),
    'connection.delete': require('./cmd/DeleteConnectionHandler'),
    'connection.move': require('./cmd/MoveConnectionHandler'),
    'connection.layout': require('./cmd/LayoutConnectionHandler'),

    'connection.updateWaypoints': require('./cmd/UpdateWaypointsHandler'),

    'connection.reconnectStart': require('./cmd/ReconnectConnectionHandler'),
    'connection.reconnectEnd': require('./cmd/ReconnectConnectionHandler'),

    'elements.move': require('./cmd/MoveElementsHandler'),
    'elements.delete': require('./cmd/DeleteElementsHandler'),

    'elements.distribute': require('./cmd/DistributeElementsHandler'),
    'elements.align': require('./cmd/AlignElementsHandler'),

    'element.updateAttachment': require('./cmd/UpdateAttachmentHandler'),

    'elements.paste': require('./cmd/PasteHandler')
  };
};

/**
 * Register handlers with the command stack
 *
 * @param {CommandStack} commandStack
 */
Modeling.prototype.registerHandlers = function(commandStack) {
  forEach(this.getHandlers(), function(handler, id) {
    commandStack.registerHandler(id, handler);
  });
};


///// modeling helpers /////////////////////////////////////////

Modeling.prototype.moveShape = function(shape, delta, newParent, newParentIndex, hints) {
  this._throwIfReadOnly();

  if (typeof newParentIndex === 'object') {
    hints = newParentIndex;
    newParentIndex = null;
  }

  var context = {
    shape: shape,
    delta:  delta,
    newParent: newParent,
    newParentIndex: newParentIndex,
    hints: hints || {}
  };

  this._commandStack.execute('shape.move', context);
};


/**
 * Update the attachment of the given shape.
 *
 * @param  {djs.mode.Base} shape
 * @param  {djs.model.Base} [newHost]
 */
Modeling.prototype.updateAttachment = function(shape, newHost) {
  this._throwIfReadOnly();

  var context = {
    shape: shape,
    newHost: newHost
  };

  this._commandStack.execute('element.updateAttachment', context);
};

/**
 * Move a number of shapes to a new target, either setting it as
 * the new parent or attaching it.
 *
 * @param {Array<djs.mode.Base>} shapes
 * @param {Point} delta
 * @param {djs.model.Base} [target]
 * @param {Boolean} [isAttach=false]
 * @param {Object} [hints]
 */
Modeling.prototype.moveElements = function(shapes, delta, target, isAttach, hints) {
  this._throwIfReadOnly();

  if (typeof isAttach === 'object') {
    hints = isAttach;
    isAttach = undefined;
  }

  var newParent = target,
      newHost;

  if (isAttach === true) {
    newHost = target;
    newParent = target.parent;
  }

  if (isAttach === false) {
    newHost = null;
  }

  var context = {
    shapes: shapes,
    delta: delta,
    newParent: newParent,
    newHost: newHost,
    hints: hints || {}
  };

  this._commandStack.execute('elements.move', context);
};

Modeling.prototype.moveConnection = function(connection, delta, newParent, newParentIndex, hints) {
  this._throwIfReadOnly();

  if (typeof newParentIndex === 'object') {
    hints = newParentIndex;
    newParentIndex = undefined;
  }

  var context = {
    connection: connection,
    delta: delta,
    newParent: newParent,
    newParentIndex: newParentIndex,
    hints: hints || {}
  };

  this._commandStack.execute('connection.move', context);
};


Modeling.prototype.layoutConnection = function(connection, hints) {
  this._throwIfReadOnly();

  var context = {
    connection: connection,
    hints: hints || {}
  };

  this._commandStack.execute('connection.layout', context);
};

/**
 * Create connection.
 *
 * @param {djs.model.Base} source
 * @param {djs.model.Base} target
 * @param {Number} [targetIndex]
 * @param {Object|djs.model.Connection} connection
 * @param {djs.model.Base} parent
 * @param {Object} hints
 *
 * @return {djs.model.Connection} the created connection.
 */
Modeling.prototype.createConnection = function(source, target, targetIndex, connection, parent, hints) {
  this._throwIfReadOnly();

  if (typeof targetIndex === 'object') {
    hints = parent;
    parent = connection;
    connection = targetIndex;
    targetIndex = undefined;
  }

  connection = this._create('connection', connection);

  var context = {
    source: source,
    target: target,
    parent: parent,
    parentIndex: targetIndex,
    connection: connection,
    hints: hints
  };

  this._commandStack.execute('connection.create', context);

  return context.connection;
};

Modeling.prototype.createShape = function(shape, position, target, targetIndex, isAttach, hints) {
  this._throwIfReadOnly();

  if (typeof targetIndex !== 'number') {
    hints = isAttach;
    isAttach = targetIndex;
  }

  if (typeof isAttach !== 'boolean') {
    hints = isAttach;
    isAttach = false;
  }

  shape = this._create('shape', shape);

  var context = {
    position: position,
    shape: shape,
    parent: target,
    parentIndex: targetIndex,
    host: shape.host,
    hints: hints || {}
  };

  if (isAttach) {
    context.parent = target.parent;
    context.host = target;
  }

  this._commandStack.execute('shape.create', context);

  return context.shape;
};


Modeling.prototype.createLabel = function(labelTarget, position, label, parent) {
  this._throwIfReadOnly();

  label = this._create('label', label);

  var context = {
    labelTarget: labelTarget,
    position: position,
    parent: parent || labelTarget.parent,
    shape: label
  };

  this._commandStack.execute('label.create', context);

  return context.shape;
};


Modeling.prototype.appendShape = function(source, shape, position, parent, connection, connectionParent) {
  this._throwIfReadOnly();

  shape = this._create('shape', shape);

  var context = {
    source: source,
    position: position,
    parent: parent,
    shape: shape,
    connection: connection,
    connectionParent: connectionParent
  };

  this._commandStack.execute('shape.append', context);

  return context.shape;
};


Modeling.prototype.removeElements = function(elements) {
  this._throwIfReadOnly();

  var context = {
    elements: elements
  };

  this._commandStack.execute('elements.delete', context);
};


Modeling.prototype.distributeElements = function(groups, axis, dimension) {
  this._throwIfReadOnly();

  var context = {
    groups: groups,
    axis: axis,
    dimension: dimension
  };

  this._commandStack.execute('elements.distribute', context);
};


Modeling.prototype.removeShape = function(shape, hints) {
  this._throwIfReadOnly();

  var context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.delete', context);
};


Modeling.prototype.removeConnection = function(connection, hints) {
  this._throwIfReadOnly();

  var context = {
    connection: connection,
    hints: hints || {}
  };

  this._commandStack.execute('connection.delete', context);
};

Modeling.prototype.replaceShape = function(oldShape, newShape, hints) {
  this._throwIfReadOnly();

  var context = {
    oldShape: oldShape,
    newData: newShape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.replace', context);

  return context.newShape;
};

Modeling.prototype.pasteElements = function(tree, topParent, position) {
  this._throwIfReadOnly();

  var context = {
    tree: tree,
    topParent: topParent,
    position: position
  };

  this._commandStack.execute('elements.paste', context);
};

Modeling.prototype.alignElements = function(elements, alignment) {
  this._throwIfReadOnly();

  var context = {
    elements: elements,
    alignment: alignment
  };

  this._commandStack.execute('elements.align', context);
};

Modeling.prototype.resizeShape = function(shape, newBounds) {
  this._throwIfReadOnly();

  var context = {
    shape: shape,
    newBounds: newBounds
  };

  this._commandStack.execute('shape.resize', context);
};

Modeling.prototype.createSpace = function(movingShapes, resizingShapes, delta, direction) {
  this._throwIfReadOnly();

  var context = {
    movingShapes: movingShapes,
    resizingShapes: resizingShapes,
    delta: delta,
    direction: direction
  };

  this._commandStack.execute('spaceTool', context);
};

Modeling.prototype.updateWaypoints = function(connection, newWaypoints, hints) {
  this._throwIfReadOnly();

  var context = {
    connection: connection,
    newWaypoints: newWaypoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.updateWaypoints', context);
};

Modeling.prototype.reconnectStart = function(connection, newSource, dockingOrPoints) {
  this._throwIfReadOnly();

  var context = {
    connection: connection,
    newSource: newSource,
    dockingOrPoints: dockingOrPoints
  };

  this._commandStack.execute('connection.reconnectStart', context);
};

Modeling.prototype.reconnectEnd = function(connection, newTarget, dockingOrPoints) {
  this._throwIfReadOnly();

  var context = {
    connection: connection,
    newTarget: newTarget,
    dockingOrPoints: dockingOrPoints
  };

  this._commandStack.execute('connection.reconnectEnd', context);
};

Modeling.prototype.connect = function(source, target, attrs, hints) {
  return this.createConnection(source, target, attrs || {}, source.parent, hints);
};

Modeling.prototype.readOnly = function (readOnly) {
  var newValue = !!readOnly,
      oldValue = !!this._readOnly;

  if (readOnly === undefined || newValue === oldValue) {
    return oldValue;
  }

  this._readOnly = newValue;
  this._eventBus.fire('readOnly.changed', { readOnly: newValue });
  return newValue;
};

Modeling.prototype._throwIfReadOnly = function () {
  if (this._readOnly) {
    throw new Error('model is read-only');
  }
};

Modeling.prototype._create = function(type, attrs) {
  if (attrs instanceof model.Base) {
    return attrs;
  } else {
    return this._elementFactory.create(type, attrs);
  }
};
