import ElementRegistry from "./ElementRegistry";
import EventBus from "./EventBus";
import GraphicsFactory from "./GraphicsFactory";

import {
  Base,
  Connection,
  Root,
  Shape
} from "../model";

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
  private _init(config: CanvasConfig): void;
  private _destroy(emit?: boolean): void;
  private _clear(): void;
  getDefaultLayer(): SVGElement;
  getLayer(name: string, index?: number): SVGElement;
  private _getChildIndex(index: number): number;
  private _createLayer(name: string, index: number): CanvasLayer;
  showLayer(name: string): SVGElement;
  hideLayer(name: string): SVGElement;
  private _removeLayer(name: string): void;
  getActiveLayer(): CanvasLayer | null;
  findRoot(element: Base | string): CanvasRoot | undefined;
  getRootElements(): CanvasRoot[];
  private _findPlaneForRoot(rootElement: Root): CanvasPlane;
  private _updateMarker(element: Base | string, marker: string, add?: boolean): void;
  addMarker(element: Base, marker: string): void;
  removeMarker(element: Base, marker: string): void;
  hasMarker(element: Base | string, marker: string): boolean;
  toggleMarker(element: Base | string, marker: string): void;
  getRootElement(): CanvasRoot | null;
  addRootElement(rootElement?: CanvasRoot): CanvasRoot;
  removeRootElement(rootElement: Root | string): CanvasRoot | null;
  setRootElement(rootElement: CanvasRoot): CanvasRoot;
  private _removeRoot(element: Base): void;
  private _addRoot(element: Base, gfx: SVGElement): void;
  private _setRoot(rootElement: CanvasRoot | null, layer?: CanvasLayer): void;
  private _ensureValid(type: string, element: Base | string): boolean;
  private _setParent(element: Base, parent: Shape, parentIndex?: number): void;
  private _addElement<T>(type: string, element: T, parent: Shape, parentIndex?: number): T;
  addShape(shape: Shape, parent: Shape, parentIndex?: number): Shape;
  addShape(connection: Connection, parent: Shape, parentIndex?: number): Shape;
  private _removeElement<T>(element: T, type: string): T;
  removeShape(shape: Shape): Shape;
  removeShape(connection: Connection): Connection;
  getGraphics(element: Base, secondary?: boolean): SVGElement;
  private _changeViewbox(changeFn: Function): void;
  private _viewboxChanged(): void;
  viewbox(box?: Rect): CanvasViewbox;
  scroll(delta: Point): Point;
  scrollToElement(element: Base | string, padding?: number): void;
  zoom(newScale?: number, center?: boolean): number;
  private _fitViewport(center?: boolean): number;
  private _setZoom(scale: number, center?: boolean): DOMMatrix;
  getSize(): Dimensions;
  getAbsoluteBBox(element: Base): Rect;
  resized(): void;

  private _eventBus: EventBus;
  private _elementRegistry: ElementRegistry;
  private _graphicsFactory: GraphicsFactory;
  private _rootsIdx: number;
  public _layers: CanvasLayers;
  private _planes: CanvasPlane[];
  private _rootElement: Root | null;
  private static $inject: string[];
}