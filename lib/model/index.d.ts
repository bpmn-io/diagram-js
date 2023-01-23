import { Point } from '../util/Types';

export type ModelTypeBase = 'base';
export type ModelTypeConnection = 'connection';
export type ModelTypeLabel = 'label';
export type ModelTypeRoot = 'root';
export type ModelTypeShape = 'shape';

export type ModelType = ModelTypeConnection | ModelTypeLabel | ModelTypeRoot | ModelTypeShape;

export type ModelBaseAttrs = {
  businessObject?: any;
  id?: string;
  label?: Label;
  parent?: Base;
  incoming?: Connection[];
  outgoing?: Connection[];
};

export type ModelAttrsShape = {
  isFrame?: boolean;
  children?: Base[];
  host?: Shape;
  attachers?: Shape[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
} & ModelBaseAttrs;

export type ModelAttrsRoot = {} & ModelAttrsShape;

export type ModelAttrsLabel = {
  labelTarget?: Base;
} & ModelAttrsShape;

export type ModelAttrsConnection = {
  source?: Base;
  target?: Base;
  waypoints?: Point[];
} & ModelBaseAttrs;

export type ModelAttrs = ModelAttrsConnection | ModelAttrsLabel | ModelAttrsRoot | ModelAttrsShape;

export type GetModelType<T> = T extends Connection ? ModelTypeConnection
  : T extends Label ? ModelTypeLabel
  : T extends Root ? ModelTypeRoot
  : T extends Shape ? ModelTypeShape
  : never;

export type GetModelAttrs<T> = T extends Connection ? ModelAttrsConnection
  : T extends Label ? ModelAttrsLabel
  : T extends Root ? ModelAttrsRoot
  : T extends Shape ? ModelAttrsShape
  : never;

export class Base {
  constructor(attrs: ModelBaseAttrs);
  businessObject: any;
  id: string;
  label: Label;
  parent: Base;
  incoming: Connection[];
  outgoing: Connection[];
  private _base: true;
}

export class Shape extends Base {
  constructor(attrs: ModelAttrsShape);

  isFrame: boolean;
  children: Base[];
  host: Shape;
  attachers: Shape[];
  x: number;
  y: number;
  width: number;
  height: number;
  private _shape: true;
}

export class Root extends Shape {
  constructor(attrs: ModelAttrsRoot);

  private _root: true;
}

export class Label extends Shape {
  constructor(attrs: ModelAttrsLabel);

  labelTarget: Base;
  private _label: true;
}

export class Connection extends Base {
  constructor(attrs: ModelAttrsConnection);

  source: Base;
  target: Base;
  waypoints: Point[];
  private _connection: true;
}

export function create(type: ModelType, attrs: ModelAttrs): Connection | Label | Root | Shape;
export function create<T extends Connection | Label | Root | Shape>(type: GetModelType<T>, attrs: GetModelAttrs<T>): T;