import {
  assign,
  forEach,
  isArray
} from 'min-dash';

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

import { isModelElement } from '../../model';

/**
 * @typedef {import('../../model/Types').Element} Element
 * @typedef {import('../../model/Types').Connection} Connection
 * @typedef {import('../../model/Types').Parent} Parent
 * @typedef {import('../../model/Types').Shape} Shape
 * @typedef {import('../../model/Types').Label} Label
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
 * @typedef { 'x' | 'y' } ModelingDistributeAxis
 *
 * @typedef { 'width' | 'height' } ModelingDistributeDimension
 *
 * @typedef { {
 *   bottom?: number;
 *   center?: number;
 *   left?: number;
 *   middle?: number;
 *   right?: number;
 *   top?: number;
 * } } ModelingAlignAlignment
 *
 * @typedef { {
 *   [key: string]: any;
 * } } ModelingHints
 *
 * @typedef { {
 *   attach?: boolean;
 * } & ModelingHints } ModelingMoveElementsHints
 *
 * @typedef { {
 *   attach?: boolean;
 * } & ModelingHints } ModelingCreateShapeHints
 */

/**
 * @template {Element} U
 *
 * @typedef { {
 *   elements: U[],
 *   range: {
 *     min: number;
 *     max: number;
 *   } }
 * } ModelingDistributeGroup
 */

/**
 * The basic modeling entry point.
 *
 * @template {Connection} [T=Connection]
 * @template {Element} [U=Element]
 * @template {Label} [V=Label]
 * @template {Parent} [W=Parent]
 * @template {Shape} [X=Shape]
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
 * @return {Map<string, CommandHandlerConstructor>}
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
 * @param {X} shape
 * @param {Point} delta
 * @param {W} [newParent]
 * @param {number} [newParentIndex]
 * @param {ModelingHints} [hints]
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
 * @param {X} shape
 * @param {X} [newHost=undefined]
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
 * @param {U[]} shapes
 * @param {Point} delta
 * @param {W} [target]
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
 * @param {T} connection
 * @param {Point} delta
 * @param {W} [newParent]
 * @param {number} [newParentIndex]
 * @param {ModelingHints} [hints]
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
 * Layout a connection.
 *
 * @param {T} connection
 * @param {ModelingHints} [hints]
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
 * @overlord
 *
 * @param {U} source
 * @param {U} target
 * @param {Partial<T>} connection
 * @param {W} parent
 * @param {ModelingHints} [hints]
 *
 * @return {T}
 */

/**
 * Create a connection.
 *
 * @param {U} source
 * @param {U} target
 * @param {number} parentIndex
 * @param {Partial<T>} connection
 * @param {W} parent
 * @param {ModelingHints} [hints]
 *
 * @return {T}
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
 * @overlord
 *
 * @param {Partial<X>} shape
 * @param {Point} position
 * @param {W} target
 * @param {ModelingCreateShapeHints} [hints]
 *
 * @return {X}
 */

/**
 * Create a shape.
 *
 * @param {Partial<X>} shape
 * @param {Point} position
 * @param {W} target
 * @param {number} parentIndex
 * @param {ModelingCreateShapeHints} [hints]
 *
 * @return {X}
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
 * @param {Partial<U>[]} elements
 * @param {Point} position
 * @param {W} parent
 * @param {number} [parentIndex]
 * @param {ModelingHints} [hints]
 *
 * @return {U[]}
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
 * @param {U} labelTarget
 * @param {Point} position
 * @param {Partial<V>} label
 * @param {W} [parent]
 *
 * @return {V}
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
 * Create and connect a shape to a source.
 *
 * @param {U} source
 * @param {Partial<X>} shape
 * @param {Point} position
 * @param {W} target
 * @param {ModelingHints} [hints]
 *
 * @return {X}
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
 * @param {U[]} elements
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
 * @param {ModelingDistributeGroup<U>[]} groups
 * @param {ModelingDistributeAxis} axis
 * @param {ModelingDistributeDimension} dimension
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
 * @param {X} shape
 * @param {ModelingHints} [hints]
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
 * @param {T} connection
 * @param {ModelingHints} [hints]
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
 * @param {X} oldShape
 * @param {Partial<X>} newShape
 * @param {ModelingHints} [hints]
 *
 * @return {X}
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
 * @param {U[]} elements
 * @param {ModelingAlignAlignment} alignment
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
 * @param {X} shape
 * @param {Rect} newBounds
 * @param {Dimensions} [minBounds]
 * @param {ModelingHints} [hints]
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
 * @param {X[]} movingShapes
 * @param {X[]} resizingShapes
 * @param {Point} delta
 * @param {Direction} direction
 * @param {number} start
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
 * @param {T} connection
 * @param {Point[]} newWaypoints
 * @param {ModelingHints} [hints]
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
 * @param {T} connection
 * @param {U} source
 * @param {U} target
 * @param {Point|Point[]} dockingOrPoints
 * @param {ModelingHints} [hints]
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
 * @param {T} connection
 * @param {U} newSource
 * @param {Point|Point[]} dockingOrPoints
 * @param {ModelingHints} [hints]
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
 * @param {T} connection
 * @param {U} newTarget
 * @param {Point|Point[]} dockingOrPoints
 * @param {ModelingHints} [hints]
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
 * @param {U} source
 * @param {U} target
 * @param {Partial<T>} [attrs]
 * @param {ModelingHints} [hints]
 *
 * @return {T}
 */
Modeling.prototype.connect = function(source, target, attrs, hints) {
  return this.createConnection(source, target, attrs || {}, source.parent, hints);
};

Modeling.prototype._create = function(type, attrs) {
  if (isModelElement(attrs)) {
    return attrs;
  } else {
    return this._elementFactory.create(type, attrs);
  }
};

/**
 * Collapse or expand a shape.
 *
 * @param {X} shape
 * @param {ModelingHints} [hints]
 */
Modeling.prototype.toggleCollapse = function(shape, hints) {
  var context = {
    shape: shape,
    hints: hints || {}
  };

  this._commandStack.execute('shape.toggleCollapse', context);
};
