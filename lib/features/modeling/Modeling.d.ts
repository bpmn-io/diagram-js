/**
 * The basic modeling entry point.
 *
 *
 */
export default class Modeling<T extends import("../../model/Types").Connection = import("../../model/Types").Connection, U extends import("../../model/Types").Element = import("../../model/Types").Element, V extends import("../../model/Types").Label = import("../../model/Types").Label, W extends import("../../model/Types").Parent = import("../../model/Types").Parent, X extends import("../../model/Types").Shape = import("../../model/Types").Shape> {
  static $inject: string[];

  /**
   * @param eventBus
   * @param elementFactory
   * @param commandStack
   */
  constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack);

  /**
   * Get a map of all command handlers.
   *
   * @return
   */
  getHandlers(): Map<string, CommandHandlerConstructor>;

  /**
   * Register handlers with the command stack
   *
   * @param commandStack
   */
  registerHandlers(commandStack: CommandStack): void;

  /**
   * Move a shape by the given delta and optionally to a new parent.
   *
   * @param shape
   * @param delta
   * @param newParent
   * @param newParentIndex
   * @param hints
   */
  moveShape(shape: X, delta: Point, newParent?: W, newParentIndex?: number, hints?: ModelingHints): void;

  /**
   * Update the attachment of a shape.
   *
   * @param shape
   * @param newHost
   */
  updateAttachment(shape: X, newHost?: X): void;

  /**
   * Move elements by a given delta and optionally to a new parent.
   *
   * @param shapes
   * @param delta
   * @param target
   * @param hints
   */
  moveElements(shapes: U[], delta: Point, target?: W, hints?: ModelingMoveElementsHints): void;

  /**
   * Move a shape by the given delta and optionally to a new parent.
   *
   * @param connection
   * @param delta
   * @param newParent
   * @param newParentIndex
   * @param hints
   */
  moveConnection(connection: T, delta: Point, newParent?: W, newParentIndex?: number, hints?: ModelingHints): void;

  /**
   * Layout a connection.
   *
   * @param connection
   * @param hints
   */
  layoutConnection(connection: T, hints?: ModelingHints): void;

  /**
   * Create a connection.
   *
   * @param source
   * @param target
   * @param parentIndex
   * @param connection
   * @param parent
   * @param hints
   *
   * @return
   */
  createConnection(
    source: U,
    target: U,
    parentIndex: number,
    connection: Partial<T>,
    parent: W,
    hints?: ModelingHints
  ): T;

  /**
   * Create a connection.
   *
   *
   * @param source
   * @param target
   * @param connection
   * @param parent
   * @param hints
   *
   * @return
   */
  createConnection(
    source: U,
    target: U,
    connection: Partial<T>,
    parent: W,
    hints?: ModelingHints
  ): T;

  /**
   * Create a shape.
   *
   * @param shape
   * @param position
   * @param target
   * @param parentIndex
   * @param hints
   *
   * @return
   */
  createShape(
    shape: Partial<X>,
    position: Point,
    target: W,
    parentIndex: number,
    hints?: ModelingCreateShapeHints
  ): X;

  /**
   * Create a shape.
   *
   *
   * @param shape
   * @param position
   * @param target
   * @param hints
   *
   * @return
   */
  createShape(
    shape: Partial<X>,
    position: Point,
    target: W,
    hints?: ModelingCreateShapeHints
  ): X;

  /**
   * Create elements.
   *
   * @param elements
   * @param position
   * @param parent
   * @param parentIndex
   * @param hints
   *
   * @return
   */
  createElements(elements: Partial<U>[], position: Point, parent: W, parentIndex?: number, hints?: ModelingHints): U[];

  /**
   * Create a label.
   *
   * @param labelTarget
   * @param position
   * @param label
   * @param parent
   *
   * @return
   */
  createLabel(labelTarget: U, position: Point, label: Partial<V>, parent?: W): V;

  /**
   * Create and connect a shape to a source.
   *
   * @param source
   * @param shape
   * @param position
   * @param target
   * @param hints
   *
   * @return
   */
  appendShape(source: U, shape: Partial<X>, position: Point, target: W, hints?: ModelingHints): X;

  /**
   * Remove elements.
   *
   * @param elements
   */
  removeElements(elements: U[]): void;

  /**
   * Distribute elements along a given axis.
   *
   * @param groups
   * @param axis
   * @param dimension
   */
  distributeElements(groups: ModelingDistributeGroup<U>[], axis: ModelingDistributeAxis, dimension: ModelingDistributeDimension): void;

  /**
   * Remove a shape.
   *
   * @param shape
   * @param hints
   */
  removeShape(shape: X, hints?: ModelingHints): void;

  /**
   * Remove a connection.
   *
   * @param connection
   * @param hints
   */
  removeConnection(connection: T, hints?: ModelingHints): void;

  /**
   * Replace a shape.
   *
   * @param oldShape
   * @param newShape
   * @param hints
   *
   * @return
   */
  replaceShape(oldShape: X, newShape: Partial<X>, hints?: ModelingHints): X;

  /**
   * Align elements.
   *
   * @param elements
   * @param alignment
   */
  alignElements(elements: U[], alignment: ModelingAlignAlignment): void;

  /**
   * Resize a shape.
   *
   * @param shape
   * @param newBounds
   * @param minBounds
   * @param hints
   */
  resizeShape(shape: X, newBounds: Rect, minBounds?: Dimensions, hints?: ModelingHints): void;

  /**
   * Create space along an horizontally or vertically.
   *
   * @param movingShapes
   * @param resizingShapes
   * @param delta
   * @param direction
   * @param start
   */
  createSpace(movingShapes: X[], resizingShapes: X[], delta: Point, direction: Direction, start: number): void;

  /**
   * Update a connetions waypoints.
   *
   * @param connection
   * @param newWaypoints
   * @param hints
   */
  updateWaypoints(connection: T, newWaypoints: Point[], hints?: ModelingHints): void;

  /**
   * Reconnect a connections source and/or target.
   *
   * @param connection
   * @param source
   * @param target
   * @param dockingOrPoints
   * @param hints
   */
  reconnect(connection: T, source: U, target: U, dockingOrPoints: Point | Point[], hints?: ModelingHints): void;

  /**
   * Reconnect a connections source.
   *
   * @param connection
   * @param newSource
   * @param dockingOrPoints
   * @param hints
   */
  reconnectStart(connection: T, newSource: U, dockingOrPoints: Point | Point[], hints?: ModelingHints): void;

  /**
   * Reconnect a connections target.
   *
   * @param connection
   * @param newTarget
   * @param dockingOrPoints
   * @param hints
   */
  reconnectEnd(connection: T, newTarget: U, dockingOrPoints: Point | Point[], hints?: ModelingHints): void;

  /**
   * Connect two elements.
   *
   * @param source
   * @param target
   * @param attrs
   * @param hints
   *
   * @return
   */
  connect(source: U, target: U, attrs?: Partial<T>, hints?: ModelingHints): T;

  /**
   * Collapse or expand a shape.
   *
   * @param shape
   * @param hints
   */
  toggleCollapse(shape: X, hints?: ModelingHints): void;
}

type Element = import('../../model/Types').Element;
type Connection = import('../../model/Types').Connection;
type Parent = import('../../model/Types').Parent;
type Shape = import('../../model/Types').Shape;
type Label = import('../../model/Types').Label;
type CommandStack = import('../../command/CommandStack').default;
type ElementFactory = import('../../core/ElementFactory').default;
type EventBus = import('../../core/EventBus').default;
type CommandHandlerConstructor = import('../../command/CommandStack').CommandHandlerConstructor;
type Dimensions = import('../../util/Types').Dimensions;
type Direction = import('../../util/Types').Direction;
type Point = import('../../util/Types').Point;
type Rect = import('../../util/Types').Rect;
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
    attach?: boolean;
} & ModelingHints;

export type ModelingCreateShapeHints = {
    attach?: boolean;
} & ModelingHints;

export type ModelingDistributeGroup<U extends import("../../model/Types").Element> = {
    elements: U[];
    range: {
        min: number;
        max: number;
    };
};
