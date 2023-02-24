import {
  ModuleDeclaration
} from 'didi';

import { Point } from '../util/Types';

declare const m : ModuleDeclaration;

export type ElementLike = {
  id: string;
  [key: string]: any;
};

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

export default m;
