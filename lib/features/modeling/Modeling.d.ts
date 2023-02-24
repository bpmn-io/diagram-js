import CommandStack, { CommandHandlerConstructor } from '../../command/CommandStack';
import ElementFactory from '../../core/ElementFactory';
import EventBus from '../../core/EventBus';

import {
  Base,
  Connection,
  Label,
  ModelAttrs,
  ModelAttrsConnection,
  ModelAttrsLabel,
  ModelAttrsShape,
  Parent,
  Shape
} from '../../model';

import {
  Dimensions,
  Direction,
  Point,
  Rect
} from '../../util/Types';

export type ModelingDistributeRange = {
  min: number;
  max: number;
};

export type ModelingDistributeGroup = {
  elements: Base[],
  range: ModelingDistributeRange | null
};

export type ModelingDistributeAxis = 'x' | 'y';

export type ModelingDistributeDimension = 'width' | 'height';

export type ModelingAlignAlignment = {
  bottom?: number;
  center?: number;
  left?: number;
  middle?: number;
  right?: number;
  top?: number;
};

export type ModelingHints = {
  [key: string]: any;
};

export type ModelingMoveElementsHints = {

  /**
   * Wether to attach the elements to the parent instead of making them children.
   */
  attach?: boolean;
} & ModelingHints;

export type ModelingCreateShapeHints = {

  /**
   * Whether to attach the shape to its parent instead of making it a child.
   */
  attach?: boolean;
} & ModelingHints;

/**
 * The basic modeling entry point.
 *
 * @param eventBus
 * @param elementFactory
 * @param commandStack
 */
export default class Modeling {
  constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack);

  /**
   * Get a map of all command handlers.
   *
   * @returns Map of all command handlers.
   */
  getHandlers(): Map<string, CommandHandlerConstructor>;

  /**
   * Register handlers with the command stack
   */
  registerHandlers(commandStack: CommandStack): void;

  /**
   * Move a shape by the given delta and optionally to a new parent.
   *
   * @param shape The shape to be moved.
   * @param delta The delta by which to move the shape.
   * @param newParent The optional new parent.
   * @param hints The optional hints.
   */
  moveShape(shape: Shape, delta: Point, newParent?: Parent, hints?: ModelingHints): void;

  
  /**
   * Move a shape by the given delta and optionally to a new parent.
   *
   * @param shape The shape to be moved.
   * @param delta The delta by which to move the shape.
   * @param newParent The optional new parent.
   * @param newParentIndex The optional index at which to add the shape
   * to the new parent's children.
   * @param hints The optional hints.
   */
  moveShape(shape: Shape, delta: Point, newParent?: Parent, newParentIndex?: number, hints?: Object): void;

  /**
   * Update the attachment of a shape.
   *
   * @param shape The shape.
   * @param newHost The new host.
   */
  updateAttachment(shape: Shape, newHost?: Shape): void;

  /**
   * Move elements by a given delta and optionally to a new parent.
   *
   * @param {Base[]} shapes
   * @param {Point} delta
   * @param {Parent} [target]
   * @param {ModelingMoveElementsHints} [hints]
   */
  moveElements(shapes: Base[], delta: Point, target?: Parent, hints?: ModelingMoveElementsHints): void;

  /**
   * Move a shape by the given delta and optionally to a new parent.
   *
   * @param shape The connection to be moved.
   * @param delta The delta by which to move the connection.
   * @param newParent The optional new parent.
   * @param hints The optional hints.
   */
  moveConnection(connection: Connection, delta: Point, newParent?: Parent, hints?: ModelingHints): void;

  /**
   * Move a shape by the given delta and optionally to a new parent.
   *
   * @param shape The connection to be moved.
   * @param delta The delta by which to move the connection.
   * @param newParent The optional new parent.
   * @param newParentIndex The optional index at which to add the
   * connection to the new parent's children.
   * @param hints The optional hints.
   */
  moveConnection(connection: Connection, delta: Point, newParent?: Parent, newParentIndex?: number, hints?: ModelingHints): void;

  /**
   * Lay out a connection.
   *
   * @param connection The connection to be laid out.
   * @param hints The optional hints.
   */
  layoutConnection(connection: Connection, hints?: ModelingHints): void;

  /**
   * Create a connection.
   *
   * @param source The source of the connection.
   * @param target The target of the connection.
   * @param connection The connection to be
   * created or its attributes.
   * @param parent The parent of the connection.
   * @param hints The optional hints.
   *
   * @return {Connection} The created connection.
   */
  createConnection(source: Base, target: Base, connection: Connection | ModelAttrsConnection, parent: Parent, hints?: ModelingHints): Connection;

  /**
   * Create a connection.
   *
   * @param source The source of the connection.
   * @param target The target of the connection.
   * @param parentIndex The optional index at which to add the
   * connection to its parent's children.
   * @param connection The connection to be
   * created or its attributes.
   * @param parent The parent of the connection.
   * @param hints The optional hints.
   *
   * @return {Connection} The created connection.
   */
  createConnection(source: Base, target: Base, parentIndex: number, connection: Connection | ModelAttrsConnection, parent: Parent, hints?: ModelingHints): Connection;

  /**
   * Create a shape.
   *
   * @param shape The shape to be created or its
   * attributes.
   * @param position The position at which to create the shape.
   * @param target The parent of the shape.
   * @param hints The optional hints.
   *
   * @return The created shape.
   */
  createShape(shape: Shape | ModelAttrsShape, position: Point, target: Parent, hints?: ModelingCreateShapeHints): Shape;

  /**
   * Create a shape.
   *
   * @param shape The shape to be created or its
   * attributes.
   * @param position The position at which to create the shape.
   * @param target The parent of the shape.
   * @param parentIndex The optional index at which to add the shape to
   * its parent's children.
   * @param hints The optional hints.
   *
   * @return The created shape.
   */
  createShape(shape: Shape | ModelAttrsShape, position: Point, target: Parent, parentIndex?: number, hints?: ModelingCreateShapeHints): Shape;

  /**
   * Create elements.
   *
   * @param elements The elements to be created or their
   * attributes.
   * @param position The position at which to create the elements.
   * @param parent The parent of the elements.
   * @param hints The optional hints.
   *
   * @return The created elements.
   */
  createElements(elements: (Base | ModelAttrs)[], position: Point, parent: Parent, hints?: ModelingHints): Base[];

  /**
   * Create elements.
   *
   * @param elements The elements to be created or their
   * attributes.
   * @param position The position at which to create the elements.
   * @param parent The parent of the elements.
   * @param parentIndex The optional index at which to add the elements
   * to their parent's children.
   * @param hints The optional hints.
   *
   * @return The created elements.
   */
  createElements(elements: (Base | ModelAttrs)[], position: Point, parent: Parent, parentIndex?: number, hints?: ModelingHints): Base[];

  /**
   * Create a label.
   *
   * @param labelTarget The labels target.
   * @param position The position at which to create the label.
   * @param label The label to be created or its
   * attributes.
   * @param parent The parent of the label.
   *
   * @return The created label.
   */
  createLabel(labelTarget: Base, position: Point, label: Label | ModelAttrsLabel, parent?: Parent): Label;

  /**
   * Create and append a shape to a source by connecting it.
   *
   * @param source The source to append the shape to.
   * @param shape The shape to be created or its
   * attributes.
   * @param position The position at which to create the shape.
   * @param target The parent of the shape.
   * @param hints The optional hints.
   *
   * @return The created and appended shape.
   */
  appendShape(source: Base, shape: Shape | ModelAttrsShape, position: Point, target: Parent, hints?: ModelingHints): Shape;

  /**
   * Remove elements.
   *
   * @param elements The elements to be removed.
   */
  removeElements(elements: Base[]): void;

  /**
   * Distribute elements along a given axis.
   *
   * @param groups The groups of elements to be
   * distributed.
   * @param axis The axis to distribute the elements
   * along.
   * @param dimension The dimension to be used
   * according to the axis.
   */
  distributeElements(groups: ModelingDistributeGroup[], axis: ModelingDistributeAxis, dimension: ModelingDistributeDimension): void;

  /**
   * Remove a shape.
   *
   * @param shape The shape to be removed.
   * @param hints The optional hints.
   */
  removeShape(shape: Shape, hints?: ModelingHints): void;

  /**
   * Remove a connection.
   *
   * @param connection The connection to be removed.
   * @param hints The optional hints.
   */
  removeConnection(connection: Connection, hints?: ModelingHints): void;

  /**
   * Replace a shape.
   *
   * @param oldShape The shape to be replaced.
   * @param newShape The shape to replace with or its
   * attributes.
   * @param hints The optional hints.
   *
   * @return The replaced shape.
   */
  replaceShape(oldShape: Shape, newShape: Shape | ModelAttrsShape, hints?: ModelingHints): Shape;

  /**
   * Align elements.
   *
   * @param elements The elements to be aligned.
   * @param alignment The alignment.
   */
  alignElements(elements: Base[], alignment: ModelingAlignAlignment): void;

  /**
   * Resize a shape.
   *
   * @param shape The shape to be resized.
   * @param newBounds The bounds to resize the shape to.
   * @param minBounds The minimum bounds to resize the shape to.
   * @param hints The optional hints.
   */
  resizeShape(shape: Shape, newBounds: Rect, minBounds?: Dimensions, hints?: ModelingHints): void;

  /**
   * Create space along an horizontally or vertically.
   *
   * @param movingShapes The shapes to be moved.
   * @param resizingShapes The shapes to be resized.
   * @param delta The delta.
   * @param direction The direction in which to create space.
   * @param start Where to start creating space in the given direction.
   */
  createSpace(movingShapes: Shape[], resizingShapes: Shape[], delta: Point, direction: Direction, start: number): void;

  /**
   * Update a connetions waypoints.
   *
   * @param connection The connection of which to update the
   * waypoints.
   * @param newWaypoints The updated waypoints.
   * @param hints The optional hints.
   */
  updateWaypoints(connection: Connection, newWaypoints: Point[], hints?: ModelingHints): void;

  /**
   * Reconnect a connections source and/or target.
   *
   * @param connection The connection to be reconnected.
   * @param source The source to connect to.
   * @param target The target to connect to.
   * @param dockingOrPoints The point to connect to or the
   * waypoints.
   * @param hints The optional hints.
   */
  reconnect(connection: Connection, source: Base, target: Base, dockingOrPoints: Point | Point[], hints?: ModelingHints): void;

  /**
   * Reconnect a connections source.
   *
   * @param connection The connection to be reconnected.
   * @param newSource The source to connect to.
   * @param dockingOrPoints The point to connect to or the
   * waypoints.
   * @param hints The optional hints.
   */
  reconnectStart(connection: Connection, newSource: Base, dockingOrPoints: Point | Point[], hints?: ModelingHints): void;

  /**
   * Reconnect a connections target.
   *
   * @param connection The connection to be reconnected.
   * @param newTarget The target to connect to.
   * @param dockingOrPoints The point to connect to or the
   * waypoints.
   * @param hints The optional hints.
   */
  reconnectEnd(connection: Connection, newTarget: Base, dockingOrPoints: Point | Point[], hints?: ModelingHints): void;

  /**
   * Connect two elements.
   *
   * @param source The source of the connection.
   * @param target The target of the connection.
   * @param attrs The connection to be
   * created or its attributes.
   * @param hints The optional hints.
   *
   * @return The created connection.
   */
  connect(source: Base, target: Base, attrs?: ModelAttrsConnection, hints?: ModelingHints): Connection;

  /**
   * Collapse or expand a shape.
   *
   * @param shape The shape to be expanded or collapsed.
   * @param hints The optional hints.
   */
  toggleCollapse(shape: Shape, hints?: ModelingHints): void;
}