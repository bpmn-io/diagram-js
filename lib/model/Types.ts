import { Point } from '../util/Types';

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