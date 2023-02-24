export type Point = {
  x: number;
  y: number;
};

export type Dimensions = {
  width: number;
  height: number;
};

export type Rect = Point & Dimensions;

export type RectTRBL = {
  top: number;
  right: number;
  bottom: number;
  left: number;
};

export type Direction = 'n' | 'w' | 's' | 'e';