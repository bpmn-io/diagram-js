import ElementRegistry from './ElementRegistry';
import EventBus from './EventBus';
import GraphicsFactory from './GraphicsFactory';

import {
  Base,
  Connection,
  Root,
  Shape
} from '../model';

import {
  Dimensions,
  Point,
  Rect
} from '../util/Types';

export type CanvasConfig = {
  deferUpdate?: boolean;
};

export interface CanvasLayer {
  group: SVGElement;
  index: number;
  visible: boolean;
}

export type CanvasLayers = {
  [key: string]: CanvasLayer;
};

export type CanvasPlane = {};

export type CanvasImplicitRoot = {
  id: string;
};

export type CanvasRoot = CanvasImplicitRoot | Root;

export interface CanvasViewbox extends Rect {
  scale: number;
  inner: Rect;
  outer: Dimensions;
}

export default class Canvas {
  constructor(config: CanvasConfig, eventBus: EventBus, graphicsFactory: GraphicsFactory, elementRegistry: ElementRegistry);
  getDefaultLayer(): SVGElement;
  getLayer(name: string, index?: number): SVGElement;
  showLayer(name: string): SVGElement;
  hideLayer(name: string): SVGElement;
  getActiveLayer(): CanvasLayer | null;
  findRoot(element: Base | string): CanvasRoot | undefined;
  getRootElements(): CanvasRoot[];
  addMarker(element: Base, marker: string): void;
  removeMarker(element: Base, marker: string): void;
  hasMarker(element: Base | string, marker: string): boolean;
  toggleMarker(element: Base | string, marker: string): void;
  getRootElement(): CanvasRoot | null;
  addRootElement(rootElement?: CanvasRoot): CanvasRoot;
  removeRootElement(rootElement: Root | string): CanvasRoot | null;
  setRootElement(rootElement: CanvasRoot): CanvasRoot;
  addShape(shape: Shape, parent: Shape, parentIndex?: number): Shape;
  addShape(connection: Connection, parent: Shape, parentIndex?: number): Shape;
  removeShape(shape: Shape): Shape;
  removeShape(connection: Connection): Connection;
  getGraphics(element: Base, secondary?: boolean): SVGElement;
  viewbox(box?: Rect): CanvasViewbox;
  scroll(delta: Point): Point;
  scrollToElement(element: Base | string, padding?: number): void;
  zoom(newScale?: number, center?: boolean): number;
  getSize(): Dimensions;
  getAbsoluteBBox(element: Base): Rect;
  resized(): void;
}