import { Point } from '../util/Types';

export type ElementLike = {
  id: string;
} & Record<string, any>;

export type ConnectionLike = {
  waypoints: Point[];
} & ElementLike;

export type RootLike = {
  isImplicit?: boolean;
} & ElementLike;

export type ShapeLike = {
  x: number;
  y: number;
  width: number;
  height: number;
} & ElementLike;