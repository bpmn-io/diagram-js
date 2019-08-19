import {
  forEach,
  isArray
} from 'min-dash';

import {
  Base
} from '../../model';

import AlignElementsHandler from './cmd/AlignElementsHandler';
import AppendShapeHandler from './cmd/AppendShapeHandler';
import CreateConnectionHandler from './cmd/CreateConnectionHandler';
import CreateElementsHandler from './cmd/CreateElementsHandler';
import CreateLabelHandler from './cmd/CreateLabelHandler';
import CreateShapeHandler from './cmd/CreateShapeHandler';
import DeleteConnectionHandler from './cmd/DeleteConnectionHandler';
import DeleteElementsHandler from './cmd/DeleteElementsHandler';
import DeleteShapeHandler from './cmd/DeleteShapeHandler';
import DistributeElementsHandler from './cmd/DistributeElementsHandler';
import LayoutConnectionHandler from './cmd/LayoutConnectionHandler';
import MoveConnectionHandler from './cmd/MoveConnectionHandler';
import MoveElementsHandler from './cmd/MoveElementsHandler';
import MoveShapeHandler from './cmd/MoveShapeHandler';
import ReconnectConnectionHandler from './cmd/ReconnectConnectionHandler';
import ReplaceShapeHandler from './cmd/ReplaceShapeHandler';
import ResizeShapeHandler from './cmd/ResizeShapeHandler';
import SpaceToolHandler from './cmd/SpaceToolHandler';
import ToggleShapeCollapseHandler from './cmd/ToggleShapeCollapseHandler';
import UpdateAttachmentHandler from './cmd/UpdateAttachmentHandler';
import UpdateWaypointsHandler from './cmd/UpdateWaypointsHandler';


/**
 * The basic modeling entry point.
 *
 * @param {EventBus} eventBus
 * @param {ElementFactory} elementFactory
 * @param {CommandStack} commandStack
 */
export default function Modeling(eventBus, elementFactory, commandStack) {
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


Modeling.prototype.getHandlers = function() {
  return {
    'shape.append': AppendShapeHandler,
    'shape.create': CreateShapeHandler,
    'shape.delete': DeleteShapeHandler,
    'shape.move': MoveShapeHandler,
    'shape.resize': ResizeShapeHandler,
    'shape.replace': ReplaceShapeHandler,
    'shape.toggleCollapse': ToggleShapeCollapseHandler,

    'spaceTool': SpaceToolHandler,

    'label.create': CreateLabelHandler,

    'connection.create': CreateConnectionHandler,
    'connection.delete': DeleteConnectionHandler,
    'connection.move': MoveConnectionHandler,
    'connection.layout': LayoutConnectionHandler,

    'connection.updateWaypoints': UpdateWaypointsHandler,

    'connection.reconnectStart': ReconnectConnectionHandler,
    'connection.reconnectEnd': ReconnectConnectionHandler,

    'elements.create': CreateElementsHandler,
    'elements.move': MoveElementsHandler,
    'elements.delete': DeleteElementsHandler,

    'elements.distribute': DistributeElementsHandler,
    'elements.align': AlignElementsHandler,

    'element.updateAttachment': UpdateAttachmentHandler
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


// modeling helpers //////////////////////

Modeling.prototype.moveShape = function(shape, delta, newParent, newParentIndex, hints) {

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
 * @param {djs.mode.Base} shape
 * @param {djs.model.Base} [newHost]
 */
Modeling.prototype.updateAttachment = function(shape, newHost) {
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
 * @param {Object} [hints]
 * @param {Boolean} [hints.attach=false]
 */
Modeling.prototype.moveElements = function(shapes, delta, target, hints) {

  hints = hints || {};

  var attach = hints.attach;

  var newParent = target,
      newHost;

  if (attach === true) {
    newHost = target;
    newParent = target.parent;
  } else

  if (attach === false) {
    newHost = null;
  }

  var context = {
    shapes: shapes,
    delta: delta,
    newParent: newParent,
    newHost: newHost,
    hints: hints
  };

  this._commandStack.execute('elements.move', context);
};


Modeling.prototype.moveConnection = function(connection, delta, newParent, newParentIndex, hints) {

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
 * @param {Number} [parentIndex]
 * @param {Object|djs.model.Connection} connection
 * @param {djs.model.Base} parent
 * @param {Object} hints
 *
 * @return {djs.model.Connection} the created connection.
 */
Modeling.prototype.createConnection = function(source, target, parentIndex, connection, parent, hints) {

  if (typeof parentIndex === 'object') {
    hints = parent;
    parent = connection;
    connection = parentIndex;
    parentIndex = undefined;
  }

  connection = this._create('connection', connection);

  var context = {
    source: source,
    target: target,
    parent: parent,
    parentIndex: parentIndex,
    connection: connection,
    hints: hints
  };

  this._commandStack.execute('connection.create', context);

  return context.connection;
};


/**
 * Create a shape at the specified position.
 *
 * @param {djs.model.Shape|Object} shape
 * @param {Point} position
 * @param {djs.model.Shape|djs.model.Root} target
 * @param {Number} [parentIndex] position in parents children list
 * @param {Object} [hints]
 * @param {Boolean} [hints.attach] whether to attach to target or become a child
 *
 * @return {djs.model.Shape} the created shape
 */
Modeling.prototype.createShape = function(shape, position, target, parentIndex, hints) {

  if (typeof parentIndex !== 'number') {
    hints = parentIndex;
    parentIndex = undefined;
  }

  hints = hints || {};

  var attach = hints.attach,
      parent,
      host;

  shape = this._create('shape', shape);

  if (attach) {
    parent = target.parent;
    host = target;
  } else {
    parent = target;
  }

  var context = {
    position: position,
    shape: shape,
    parent: parent,
    parentIndex: parentIndex,
    host: host,
    hints: hints
  };

  this._commandStack.execute('shape.create', context);

  return context.shape;
};


Modeling.prototype.createElements = function(elements, position, parent, parentIndex, hints) {
  if (!isArray(elements)) {
    elements = [ elements ];
  }

  if (typeof parentIndex !== 'number') {
    hints = parentIndex;
    parentIndex = undefined;
  }

  hints = hints || {};

  var context = {
    position: position,
    elements: elements,
    parent: parent,
    parentIndex: parentIndex,
    hints: hints
  };

  this._commandStack.execute('elements.create', context);

  return context.elements;
};


Modeling.prototype.createLabel = function(labelTarget, position, label, parent) {

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


/**
 * Append shape to given source, drawing a connection
 * between source and the newly created shape.
 *
 * @param {djs.model.Shape} source
 * @param {djs.model.Shape|Object} shape
 * @param {Point} position
 * @param {djs.model.Shape} target
 * @param {Object} [hints]
 * @param {Boolean} [hints.attach]
 * @param {djs.model.Connection|Object} [hints.connection]
 * @param {djs.model.Base} [hints.connectionParent]
 *
 * @return {djs.model.Shape} the newly created shape
 */
Modeling.prototype.appendShape = function(source, shape, position, target, hints) {

  hints = hints || {};

  shape = this._create('shape', shape);

  var context = {
    source: source,
    position: position,
    target: target,
    shape: shape,
    connection: hints.connection,
    connectionParent: hints.connectionParent,
    attach: hints.attach
  };

  this._commandStack.execute('shape.append', context);

  return context.shape;
};


Modeling.prototype.removeElements = function(elements) {
  var context = {
    elements: elements
  };

  this._commandStack.execute('elements.delete', context);
};


Modeling.prototype.distributeElements = function(groups, axis, dimension) {
  var context = {
    groups: groups,
    axis: axis,
    dimension: dimension
  };

  this._commandStack.execute('elements.distribute', context);
};


Modeling.prototype.removeShape = function(shape, hints) {
  var context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.delete', context);
};


Modeling.prototype.removeConnection = function(connection, hints) {
  var context = {
    connection: connection,
    hints: hints || {}
  };

  this._commandStack.execute('connection.delete', context);
};

Modeling.prototype.replaceShape = function(oldShape, newShape, hints) {
  var context = {
    oldShape: oldShape,
    newData: newShape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.replace', context);

  return context.newShape;
};

Modeling.prototype.alignElements = function(elements, alignment) {
  var context = {
    elements: elements,
    alignment: alignment
  };

  this._commandStack.execute('elements.align', context);
};

Modeling.prototype.resizeShape = function(shape, newBounds, minBounds, hints) {
  var context = {
    shape: shape,
    newBounds: newBounds,
    minBounds: minBounds,
    hints: hints
  };

  this._commandStack.execute('shape.resize', context);
};

Modeling.prototype.createSpace = function(movingShapes, resizingShapes, delta, direction) {
  var context = {
    movingShapes: movingShapes,
    resizingShapes: resizingShapes,
    delta: delta,
    direction: direction
  };

  this._commandStack.execute('spaceTool', context);
};

Modeling.prototype.updateWaypoints = function(connection, newWaypoints, hints) {
  var context = {
    connection: connection,
    newWaypoints: newWaypoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.updateWaypoints', context);
};

Modeling.prototype.reconnectStart = function(connection, newSource, dockingOrPoints, hints) {
  var context = {
    connection: connection,
    newSource: newSource,
    dockingOrPoints: dockingOrPoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.reconnectStart', context);
};

Modeling.prototype.reconnectEnd = function(connection, newTarget, dockingOrPoints, hints) {
  var context = {
    connection: connection,
    newTarget: newTarget,
    dockingOrPoints: dockingOrPoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.reconnectEnd', context);
};

Modeling.prototype.connect = function(source, target, attrs, hints) {
  return this.createConnection(source, target, attrs || {}, source.parent, hints);
};

Modeling.prototype._create = function(type, attrs) {
  if (attrs instanceof Base) {
    return attrs;
  } else {
    return this._elementFactory.create(type, attrs);
  }
};

Modeling.prototype.toggleCollapse = function(shape, hints) {
  var context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.toggleCollapse', context);
};
