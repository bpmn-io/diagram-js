export type Point = {
  x: number;
  y: number;
};

export type ScrollDelta = {
  dx?: number;
  dy?: number;
}

export type Vector = Point;

export type Dimension = 'width' | 'height';

export type Dimensions = {
  width: number;
  height: number;
};

export type Rect = Dimensions & Point;

export type TRBL = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type RectTRBL = TRBL

export type ConnectionTRBL = TRBL;

export type Axis = 'x' | 'y';

export type Direction = 'n' | 'w' | 's' | 'e' | 'nw' | 'ne' | 'sw' | 'se';

export type DirectionTRBL = 'top' | 'right' | 'bottom' | 'left' | 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left';

export type Intersection = 'intersect';