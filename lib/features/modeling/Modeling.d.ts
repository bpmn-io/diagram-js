import CommandStack, { CommandHandlerInstance } from '../../command/CommandStack';
import ElementFactory from '../../core/ElementFactory';
import EventBus from '../../core/EventBus';

import {
  Base,
  Connection,
  Label,
  ModelAttrs,
  ModelAttrsConnection,
  ModelAttrsShape,
  Root,
  Shape
} from '../../model';

import {
  Directions,
  Point,
  Rect
} from '../../util/Types';

export type ModelingParent = Root | Shape;

export type ModelingDistributeRange = {
  min: number;
  max: number;
};

export type ModelingDistributeGroup = {
  elements: Base[],
  range: ModelingDistributeRange | null
};

export type ModelingAlignAlignment = {
  bottom?: number;
  center?: number;
  left?: number;
  middle?: number;
  right?: number;
  top?: number;
};

export default class Modeling {
  constructor(eventBus: EventBus, elementFactory: ElementFactory, commandStack: CommandStack);
  getHandlers(): Map<string, CommandHandlerInstance>;
  registerHandlers(commandStack: CommandStack): void;
  moveShape(shape: Shape, delta: Point, newParent?: ModelingParent, hints?: Object): void;
  moveShape(shape: Shape, delta: Point, newParent?: ModelingParent, newParentIndex?: number, hints?: Object): void;
  updateAttachment(shape: Shape, newHost: Shape): void;
  moveElements(shapes: Base[], delta: Point, target?: ModelingParent, hints?: Object): void;
  moveConnection(connection: Connection, delta: Point, newParent?: ModelingParent, hints?: Object): void;
  moveConnection(connection: Connection, delta: Point, newParent?: ModelingParent, newParentIndex?: number, hints?: Object): void;
  layoutConnection(connection: Connection, hints?: Object): void;
  createConnection(source: Base, target: Base, connection: Connection | ModelAttrsConnection, parent: ModelingParent, hints?: Object): Connection;
  createConnection(source: Base, target: Base, parentIndex: number, connection: Connection | ModelAttrsConnection, parent: ModelingParent, hints?: Object): Connection;
  createShape(shape: Shape | ModelAttrsShape, position: Point, target: ModelingParent, hints?: Object): Shape;
  createShape(shape: Shape | ModelAttrsShape, position: Point, target: ModelingParent, parentIndex?: number, hints?: Object): Shape;
  createElements(elements: (Base | ModelAttrs)[], position: Point, parent: ModelingParent, hints?: Object): Base[];
  createElements(elements: (Base | ModelAttrs)[], position: Point, parent: ModelingParent, parentIndex?: number, hints?: Object): Base[];
  createLabel(labelTarget: Base, position: Point, label: Label | ModelAttrs, parent?: ModelingParent): Label;
  appendShape(source: Base, shape: Shape | ModelAttrsShape, position: Point, target: ModelingParent, hints?: Object): Shape;
  removeElements(elements: Base[]): void;
  distributeElements(groups: ModelingDistributeGroup[]): void;
  removeShape(shape: Shape, hints?: Object): void;
  removeConnection(connection: Connection, hints?: Object): void;
  replaceShape(oldShape: Shape, newShape: Shape | ModelAttrsShape, hints?: Object): Shape;
  alignElements(elements: Base[], alignment: ModelingAlignAlignment): void;
  resizeShape(shape: Shape, newBounds: Rect, minBounds: Rect, hints?: Object): void;
  createSpace(movingShapes: Shape[], resizingShapes: Shape[], delta: Point, direction: Directions, start: number): void;
  updateWaypoints(connection: Connection, newWaypoints: Point[], hints?: Object): void;
  reconnect(connection: Connection, source: Base, target: Base, dockingOrPoints: Point | Point[], hints?: Object): void;
  reconnectStart(connection: Connection, newSource: Base, dockingOrPoints: Point | Point[], hints?: Object): void;
  reconnectEnd(connection: Connection, newTarget: Base, dockingOrPoints: Point | Point[], hints?: Object): void;
  connect(source: Base, target: Base, attrs?: ModelAttrsConnection, hints?: Object): void;
  toggleCollapse(shape: Shape, hints?: Object): void;

  private _eventBus: EventBus;
  private _elementFactory: ElementFactory;
  private _commandStack: CommandStack;
  private static $inject: string[];
}