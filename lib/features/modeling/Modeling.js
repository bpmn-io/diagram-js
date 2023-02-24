import {
  assign,
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
 * @typedef {import('../../model').Base} Base
 * @typedef {import('../../model').Connection} Connection
 * @typedef {import('../../model').Parent} Parent
 * @typedef {import('../../model').Shape} Shape
 * @typedef {import('../../model').ModelAttrsConnection} ModelAttrsConnection
 * @typedef {import('../../model').ModelAttrsLabel} ModelAttrsLabel
 * @typedef {import('../../model').ModelAttrsShape} ModelAttrsShape
 *
 * @typedef {import('../../command/CommandStack').default} CommandStack
 * @typedef {import('../../core/ElementFactory').default} ElementFactory
 * @typedef {import('../../core/EventBus').default} EventBus
 *
 * @typedef {import('../../command/CommandStack').CommandHandlerConstructor} CommandHandlerConstructor
 *
 * @typedef {import('../../util/Types').Dimensions} Dimensions
 * @typedef {import('../../util/Types').Direction} Direction
 * @typedef {import('../../util/Types').Point} Point
 * @typedef {import('../../util/Types').Rect} Rect
 *
 * @typedef {import('./Modeling').ModelingAlignAlignment} ModelingAlignAlignment
 * @typedef {import('./Modeling').ModelingCreateShapeHints} ModelingCreateShapeHints
 * @typedef {import('./Modeling').ModelingDistributeAxis} ModelingDistributeAxis
 * @typedef {import('./Modeling').ModelingDistributeDimension} ModelingDistributeDimension
 * @typedef {import('./Modeling').ModelingDistributeGroup} ModelingDistributeGroup
 * @typedef {import('./Modeling').ModelingHints} ModelingHints
 * @typedef {import('./Modeling').ModelingMoveElementsHints} ModelingMoveElementsHints
 */

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

/**
 * Get a map of all command handlers.
 *
 * @returns {Map<string, CommandHandlerConstructor>} Map of all command handlers.
 */
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

    'connection.reconnect': ReconnectConnectionHandler,

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


/**
 * Move a shape by the given delta and optionally to a new parent.
 *
 * @param {Shape} shape The shape to be moved.
 * @param {Point} delta The delta by which to move the shape.
 * @param {Parent} [newParent] The optional new parent.
 * @param {number} [newParentIndex] The optional index at which to add the shape
 * to the new parent's children.
 * @param {ModelingHints} [hints] The optional hints.
 */
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
 * Update the attachment of a shape.
 *
 * @param {Shape} shape The shape.
 * @param {Shape} [newHost=undefined] The new host.
 */
Modeling.prototype.updateAttachment = function(shape, newHost) {
  var context = {
    shape: shape,
    newHost: newHost
  };

  this._commandStack.execute('element.updateAttachment', context);
};


/**
 * Move elements by a given delta and optionally to a new parent.
 *
 * @param {Base[]} shapes
 * @param {Point} delta
 * @param {Parent} [target]
 * @param {ModelingMoveElementsHints} [hints]
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

/**
 * Move a shape by the given delta and optionally to a new parent.
 *
 * @param {Connection} shape The connection to be moved.
 * @param {Point} delta The delta by which to move the connection.
 * @param {Parent} [newParent] The optional new parent.
 * @param {number} [newParentIndex] The optional index at which to add the
 * connection to the new parent's children.
 * @param {ModelingHints} [hints] The optional hints.
 */
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

/**
 * Lay out a connection.
 *
 * @param {Connection} connection The connection to be laid out.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.layoutConnection = function(connection, hints) {
  var context = {
    connection: connection,
    hints: hints || {}
  };

  this._commandStack.execute('connection.layout', context);
};


/**
 * Create a connection.
 *
 * @param {Base} source The source of the connection.
 * @param {Base} target The target of the connection.
 * @param {number} [parentIndex] The optional index at which to add the
 * connection to its parent's children.
 * @param {Connection|ModelAttrsConnection} connection The connection to be
 * created or its attributes.
 * @param {Parent} parent The parent of the connection.
 * @param {ModelingHints} [hints] The optional hints.
 *
 * @return {Connection} The created connection.
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
 * Create a shape.
 *
 * @param {Shape|ModelAttrsShape} shape The shape to be created or its
 * attributes.
 * @param {Point} position The position at which to create the shape.
 * @param {Parent} target The parent of the shape.
 * @param {number} [parentIndex] The optional index at which to add the shape to
 * its parent's children.
 * @param {ModelingCreateShapeHints} [hints] The optional hints.
 *
 * @return {Shape} The created shape.
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

/**
 * Create elements.
 *
 * @param {(Base|ModelAttrs)[]} elements The elements to be created or their
 * attributes.
 * @param {Point} position The position at which to create the elements.
 * @param {Parent} parent The parent of the elements.
 * @param {number} [parentIndex] The optional index at which to add the elements
 * to their parent's children.
 * @param {ModelingHints} [hints] The optional hints.
 *
 * @return {Base[]} The created elements.
 */
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

/**
 * Create a label.
 *
 * @param {Base} labelTarget The labels target.
 * @param {Point} position The position at which to create the label.
 * @param {Label|ModelAttrsLabel} label The label to be created or its
 * attributes.
 * @param {Parent} [parent] The parent of the label.
 *
 * @return {Label} The created label.
 */
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
 * Create and append a shape to a source by connecting it.
 *
 * @param {Base} source The source to append the shape to.
 * @param {Shape|ModelAttrsShape} shape The shape to be created or its
 * attributes.
 * @param {Point} position The position at which to create the shape.
 * @param {Parent} target The parent of the shape.
 * @param {ModelingHints} [hints] The optional hints.
 *
 * @return {Shape} The created and appended shape.
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
    hints: hints
  };

  this._commandStack.execute('shape.append', context);

  return context.shape;
};

/**
 * Remove elements.
 *
 * @param {Base[]} elements The elements to be removed.
 */
Modeling.prototype.removeElements = function(elements) {
  var context = {
    elements: elements
  };

  this._commandStack.execute('elements.delete', context);
};

/**
 * Distribute elements along a given axis.
 *
 * @param {ModelingDistributeGroup[]} groups The groups of elements to be
 * distributed.
 * @param {ModelingDistributeAxis} axis The axis to distribute the elements
 * along.
 * @param {ModelingDistributeDimension} dimension The dimension to be used
 * according to the axis.
 */
Modeling.prototype.distributeElements = function(groups, axis, dimension) {
  var context = {
    groups: groups,
    axis: axis,
    dimension: dimension
  };

  this._commandStack.execute('elements.distribute', context);
};

/**
 * Remove a shape.
 *
 * @param {Shape} shape The shape to be removed.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.removeShape = function(shape, hints) {
  var context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.delete', context);
};

/**
 * Remove a connection.
 *
 * @param {Connection} connection The connection to be removed.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.removeConnection = function(connection, hints) {
  var context = {
    connection: connection,
    hints: hints || {}
  };

  this._commandStack.execute('connection.delete', context);
};

/**
 * Replace a shape.
 *
 * @param {Shape} oldShape The shape to be replaced.
 * @param {Shape|ModelAttrsShape} newShape The shape to replace with or its
 * attributes.
 * @param {ModelingHints} [hints] The optional hints.
 *
 * @return {Shape} The replaced shape.
 */
Modeling.prototype.replaceShape = function(oldShape, newShape, hints) {
  var context = {
    oldShape: oldShape,
    newData: newShape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.replace', context);

  return context.newShape;
};

/**
 * Align elements.
 *
 * @param {Base[]} elements The elements to be aligned.
 * @param {ModelingAlignAlignment} alignment The alignment.
 */
Modeling.prototype.alignElements = function(elements, alignment) {
  var context = {
    elements: elements,
    alignment: alignment
  };

  this._commandStack.execute('elements.align', context);
};

/**
 * Resize a shape.
 *
 * @param {Shape} shape The shape to be resized.
 * @param {Rect} newBounds The bounds to resize the shape to.
 * @param {Dimensions} minBounds The minimum bounds to resize the shape to.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.resizeShape = function(shape, newBounds, minBounds, hints) {
  var context = {
    shape: shape,
    newBounds: newBounds,
    minBounds: minBounds,
    hints: hints
  };

  this._commandStack.execute('shape.resize', context);
};

/**
 * Create space along an horizontally or vertically.
 *
 * @param {Shape[]} movingShapes The shapes to be moved.
 * @param {Shape[]} resizingShapes The shapes to be resized.
 * @param {Point} delta The delta.
 * @param {Direction} direction The direction in which to create space.
 * @param {number} start Where to start creating space in the given direction.
 */
Modeling.prototype.createSpace = function(movingShapes, resizingShapes, delta, direction, start) {
  var context = {
    delta: delta,
    direction: direction,
    movingShapes: movingShapes,
    resizingShapes: resizingShapes,
    start: start
  };

  this._commandStack.execute('spaceTool', context);
};

/**
 * Update a connetions waypoints.
 *
 * @param {Connection} connection The connection of which to update the
 * waypoints.
 * @param {Point[]} newWaypoints The updated waypoints.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.updateWaypoints = function(connection, newWaypoints, hints) {
  var context = {
    connection: connection,
    newWaypoints: newWaypoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.updateWaypoints', context);
};

/**
 * Reconnect a connections source and/or target.
 *
 * @param {Connection} connection The connection to be reconnected.
 * @param {Base} source The source to connect to.
 * @param {Base} target The target to connect to.
 * @param {Point|Point[]} dockingOrPoints The point to connect to or the
 * waypoints.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.reconnect = function(connection, source, target, dockingOrPoints, hints) {
  var context = {
    connection: connection,
    newSource: source,
    newTarget: target,
    dockingOrPoints: dockingOrPoints,
    hints: hints || {}
  };

  this._commandStack.execute('connection.reconnect', context);
};

/**
 * Reconnect a connections source.
 *
 * @param {Connection} connection The connection to be reconnected.
 * @param {Base} newSource The source to connect to.
 * @param {Point|Point[]} dockingOrPoints The point to connect to or the
 * waypoints.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.reconnectStart = function(connection, newSource, dockingOrPoints, hints) {
  if (!hints) {
    hints = {};
  }

  this.reconnect(connection, newSource, connection.target, dockingOrPoints, assign(hints, {
    docking: 'source'
  }));
};

/**
 * Reconnect a connections target.
 *
 * @param {Connection} connection The connection to be reconnected.
 * @param {Base} newTarget The target to connect to.
 * @param {Point|Point[]} dockingOrPoints The point to connect to or the
 * waypoints.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.reconnectEnd = function(connection, newTarget, dockingOrPoints, hints) {
  if (!hints) {
    hints = {};
  }

  this.reconnect(connection, connection.source, newTarget, dockingOrPoints, assign(hints, {
    docking: 'target'
  }));
};

/**
 * Connect two elements.
 *
 * @param {Base} source The source of the connection.
 * @param {Base} target The target of the connection.
 * @param {Connection|ModelAttrsConnection} attrs The connection to be
 * created or its attributes.
 * @param {ModelingHints} [hints] The optional hints.
 *
 * @return {Connection} The created connection.
 */
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

/**
 * Collapse or expand a shape.
 *
 * @param {Shape} shape The shape to be expanded or collapsed.
 * @param {ModelingHints} [hints] The optional hints.
 */
Modeling.prototype.toggleCollapse = function(shape, hints) {
  var context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.toggleCollapse', context);
};
