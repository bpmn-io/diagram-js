import type { Point } from '../util/Types';

export type ElementLike = {
  id: string;
  businessObject?: any;
} & Record<string, any>;

export type Element = ElementLike & {
  label?: Label;
  labels: Label[];
  parent?: Element;
  incoming: Connection[];
  outgoing: Connection[];
}

export type ShapeLike = ElementLike & {
  x: number;
  y: number;
  width: number;
  height: number;
};

export type Shape = ShapeLike & Element & {
  isFrame?: boolean;
  children: Element[];
  host?: Shape;
  attachers: Shape[];
}

export type RootLike = ElementLike & {
  isImplicit?: boolean;
};

export type Root = RootLike & Element;

export type LabelLike = ShapeLike;

export type Label = LabelLike & Shape & {
  labelTarget?: Element;
}

export type ConnectionLike = {
  waypoints: Point[];
} & ElementLike;

export type Connection = ConnectionLike & Element & {
  source?: Element;
  target?: Element;
};

export type ParentLike = ShapeLike | RootLike;

export type Parent = Shape | Root;
