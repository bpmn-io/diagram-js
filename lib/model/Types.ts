import { Point } from '../util/Types';

export interface ModelBaseAttrs {
  businessObject?: any;
  id?: string;
  label?: Label;
  parent?: Base;
  incoming?: Connection[];
  outgoing?: Connection[];
}

export interface ModelAttrsShape extends ModelBaseAttrs {
  isFrame?: boolean;
  children?: Base[];
  host?: Shape;
  attachers?: Shape[];
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export interface ModelAttrsRoot extends ModelAttrsShape {}

export interface ModelAttrsLabel extends ModelAttrsShape {
  labelTarget?: Base;
}

export interface ModelAttrsConnection extends ModelBaseAttrs {
  source?: Base;
  target?: Base;
  waypoints?: Point[];
}

export type ModelAttrs = ModelAttrsConnection | ModelAttrsLabel | ModelAttrsRoot | ModelAttrsShape;

export interface Base {
  businessObject: any;
  id: string;
  label?: Label;
  labels: Label[];
  parent?: Base;
  incoming: Connection[];
  outgoing: Connection[];
}

export interface Shape extends Base {
  isFrame: boolean;
  children: Base[];
  host?: Shape;
  attachers: Shape[];
  x: number;
  y: number;
  width: number;
  height: number;
}

export interface Root extends Shape {}

export interface Label extends Shape {
  labelTarget?: Base;
}

export interface Connection extends Base {
  source?: Base;
  target?: Base;
  waypoints: Point[];
}

export type Parent = Shape | Root;