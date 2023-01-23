import Canvas, { CanvasViewbox } from '../../core/Canvas';
import ElementRegistry from '../../core/ElementRegistry';
import EventBus from '../../core/EventBus';

import { Base } from '../../model';

import Ids from '../../util/IdGenerator';

export type OverlaysConfigShow = {
  minZoom?: number,
  maxZoom?: number
};

export type OverlaysConfigScale = {
  min?: number,
  max?: number
};

export type OverlaysConfigDefault = {
  show?: OverlaysConfigShow,
  scale?: OverlaysConfigScale | boolean
};

export type OverlaysPosition = {
  top?: number,
  right?: number,
  bottom?: number,
  left?: number
};

export type OverlaysConfig = {
  defaults?: OverlaysConfigDefault
};

export type OverlayAttrs = {
  html: HTMLElement | string,
  position: OverlaysPosition
} & OverlaysConfigDefault;

export type Overlay = {
  id: string,
  type: string | null,
  element: Base | string
} & OverlayAttrs;

export type OverlayContainer = {
  html: HTMLElement,
  element: Base,
  overlays: Overlay[]
};

export type OverlaysFilter = {
  id?: string;
  element?: Base | string;
  type?: string;
} | string;

export default class Overlays {
  constructor(config: OverlaysConfig, eventBus: EventBus, canvas: Canvas, elementRegistry: ElementRegistry)
  get(search: OverlaysFilter): Overlay | Overlay[];
  add(element: Base | string, overlay: OverlayAttrs): string;
  add(element: Base | string, type: string, overlay: OverlayAttrs): string;
  remove(filter: OverlaysFilter): void;
  isShown(): boolean;
  show(): void;
  hide(): void;
  private _updateOverlayContainer(container: OverlayContainer): void;
  private _updateOverlay(overlay: Overlay): void;
  private _createOverlaycontainer(element: Base): HTMLElement;
  private _updateRoot(viewbox: CanvasViewbox): void;
  private _getOverlayContainer(element: Base, raw?: boolean): HTMLElement;
  private _addOverlay(overlay: Overlay): void;
  private _updateOverlayVisibility(overlay: Overlay, viewbox: CanvasViewbox): void;
  private _updateOverlayScale(overlay: Overlay, viewbox: CanvasViewbox): void;
  private _updateOverlayVisibility(viewbox: CanvasViewbox): void;
  private _init(): void;

  private _eventBus: EventBus;
  private _canvas: Canvas;
  private _elementRegistry: ElementRegistry;
  private _ids: Ids;
  private _overlayDefaults: OverlaysConfigDefault;
  private _overlays: Map<string, Overlay>;
  private _overlayContainers: OverlayContainer[];
  private _overlayRoot: HTMLElement;
}