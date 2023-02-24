import ElementRegistry from './ElementRegistry';
import EventBus from './EventBus';
import GraphicsFactory from './GraphicsFactory';

import {
  ConnectionLike,
  RootLike,
  ShapeLike
} from '.';

import {
  Dimensions,
  Point,
  Rect,
  RectTRBL
} from '../util/Types';

export type CanvasConfig = {
  container?: HTMLElement;
  deferUpdate?: boolean;
  width?: number;
  height?: number;
};

export interface CanvasLayer {
  group: SVGElement;
  index: number;
  visible: boolean;
}

export type CanvasLayers = {
  [key: string]: CanvasLayer;
};

export type CanvasPlane = {
  rootElement: ShapeLike;
  layer: CanvasLayer;
};

export interface CanvasViewbox extends Rect {
  scale: number;
  inner: Rect;
  outer: Dimensions;
}

/**
 * The main drawing canvas.
 *
 * @class
 * @constructor
 *
 * @emits Canvas#canvas.init
 *
 * @param config
 * @param eventBus
 * @param graphicsFactory
 * @param elementRegistry
 */
export default class Canvas {
  constructor(config: CanvasConfig, eventBus: EventBus, graphicsFactory: GraphicsFactory, elementRegistry: ElementRegistry);

  /**
   * Returns the default layer on which
   * all elements are drawn.
   *
   * @return The SVG element of the layer.
   */
  getDefaultLayer(): SVGElement;

  /**
   * Returns a layer that is used to draw elements
   * or annotations on it.
   *
   * Non-existing layers retrieved through this method
   * will be created. During creation, the optional index
   * may be used to create layers below or above existing layers.
   * A layer with a certain index is always created above all
   * existing layers with the same index.
   *
   * @param name The name of the layer.
   * @param index The index of the layer.
   *
   * @return {SVGElement} The SVG element of the layer.
   */
  getLayer(name: string, index?: number): SVGElement;

  /**
   * Shows a given layer.
   *
   * @param layer The name of the layer.
   *
   * @return The SVG element of the layer.
   */
  showLayer(name: string): SVGElement;

  /**
   * Hides a given layer.
   *
   * @param {string} layer The name of the layer.
   *
   * @return {SVGElement} The SVG element of the layer.
   */
  hideLayer(name: string): SVGElement;

  /**
   * Returns the currently active layer. Can be null.
   *
   * @return The active layer of `null`.
   */
  getActiveLayer(): CanvasLayer | null;

  /**
   * Returns the plane which contains the given element.
   *
   * @param element The element or its ID.
   *
   * @return The root of the element.
   */
  findRoot(element: ShapeLike | ConnectionLike | string): RootLike | undefined;

  /**
   * Return a list of all root elements on the diagram.
   *
   * @return The list of root elements.
   */
  getRootElements(): (RootLike)[];

  /**
   * Returns the html element that encloses the
   * drawing canvas.
   *
   * @return The HTML element of the container.
   */
  getContainer(): HTMLElement;

  /**
   * Adds a marker to an element (basically a css class).
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @example
   *
   * canvas.addMarker('foo', 'some-marker');
   *
   * const fooGfx = canvas.getGraphics('foo');
   *
   * fooGfx; // <g class="... some-marker"> ... </g>
   *
   * @param element The element or its ID.
   * @param marker The marker.
   */
  addMarker(element: ShapeLike | ConnectionLike | string, marker: string): void;

  /**
   * Remove a marker from an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param element The element or its ID.
   * @param marker The marker.
   */
  removeMarker(element: ShapeLike | ConnectionLike | string, marker: string): void;

  /**
   * Check whether an element has a given marker.
   *
   * @param element The element or its ID.
   * @param marker The marker.
   */
  hasMarker(element: ShapeLike | ConnectionLike | string, marker: string): boolean;

  /**
   * Toggles a marker on an element.
   *
   * Fires the element.marker.update event, making it possible to
   * integrate extension into the marker life-cycle, too.
   *
   * @param element The element or its ID.
   * @param marker The marker.
   */
  toggleMarker(element: ShapeLike | ConnectionLike | string, marker: string): void;

  /**
   * Returns the current root element.
   *
   * Supports two different modes for handling root elements:
   *
   * 1. if no root element has been added before, an implicit root will be added
   * and returned. This is used in applications that don't require explicit
   * root elements.
   *
   * 2. when root elements have been added before calling `getRootElement`,
   * root elements can be null. This is used for applications that want to manage
   * root elements themselves.
   *
   * @return The current root element.
   */
  getRootElement(): RootLike;

  /**
   * Adds a given root element and returns it.
   *
   * @param rootElement The root element to be added.
   *
   * @return The added root element or an implicit root element.
   */
  addRootElement(rootElement?: ShapeLike): RootLike;

  /**
   * Removes a given root element and returns it.
   *
   * @param rootElement The root element or its ID.
   *
   * @return The removed root element.
   */
  removeRootElement(rootElement: ShapeLike | string): ShapeLike | undefined;

  /**
   * Sets a given element as the new root element for the canvas
   * and returns the new root element.
   *
   * @param rootElement The root element to be set.
   *
   * @return The set root element.
   */
  setRootElement(rootElement: RootLike): RootLike;

  /**
   * Adds a shape to the canvas.
   *
   * @param shape The shape to be added.
   * @param parent The shape's parent.
   * @param parentIndex The index at which to add the shape to the parent's children.
   *
   * @return The added shape.
   */
  addShape(shape: ShapeLike, parent?: ShapeLike, parentIndex?: number): ShapeLike;

  /**
   * Adds a connection to the canvas.
   *
   * @param connection The connection to be added.
   * @param parent The connection's parent.
   * @param parentIndex The index at which to add the connection to the parent's children.
   *
   * @return The added connection.
   */
  addConnection(connection: ConnectionLike, parent?: ShapeLike, parentIndex?: number): ConnectionLike;

  /**
   * Removes a shape from the canvas.
   *
   * @param shape The shape or its ID.
   *
   * @return The removed shape.
   */
  removeShape(shape: ShapeLike | string): ShapeLike;

  /**
   * Removes a connection from the canvas.
   *
   * @param connection The connection or its ID.
   *
   * @return The removed connection.
   */
  removeConnection(connection: ConnectionLike | string): ConnectionLike;

  /**
   * Returns the graphical element of an element.
   *
   * @param element The element or its ID.
   * @param secondary Whether to return the secondary graphical element.
   *
   * @return The graphical element.
   */
  getGraphics(element: ShapeLike | ConnectionLike | string, secondary?: boolean): SVGElement;

  /**
   * Gets or sets the view box of the canvas, i.e. the
   * area that is currently displayed.
   *
   * The getter may return a cached viewbox (if it is currently
   * changing). To force a recomputation, pass `false` as the first argument.
   *
   * @example
   *
   * canvas.viewbox({ x: 100, y: 100, width: 500, height: 500 })
   *
   * // sets the visible area of the diagram to (100|100) -> (600|100)
   * // and and scales it according to the diagram width
   *
   * const viewbox = canvas.viewbox(); // pass `false` to force recomputing the box.
   *
   * console.log(viewbox);
   * // {
   * //   inner: Dimensions,
   * //   outer: Dimensions,
   * //   scale,
   * //   x, y,
   * //   width, height
   * // }
   *
   * // if the current diagram is zoomed and scrolled, you may reset it to the
   * // default zoom via this method, too:
   *
   * const zoomedAndScrolledViewbox = canvas.viewbox();
   *
   * canvas.viewbox({
   *   x: 0,
   *   y: 0,
   *   width: zoomedAndScrolledViewbox.outer.width,
   *   height: zoomedAndScrolledViewbox.outer.height
   * });
   *
   * @param box The viewbox to be set.
   *
   * @return The set viewbox.
   */
  viewbox(box?: Rect): CanvasViewbox;

  /**
   * Gets or sets the scroll of the canvas.
   *
   * @param delta The scroll to be set.
   */
  scroll(delta: Point): Point;

  /**
   * Scrolls the viewbox to contain the given element.
   * Optionally specify a padding to be applied to the edges.
   *
   * @param element The element to scroll to or its ID.
   * @param padding The padding to be applied. Can also specify top, bottom, left and right.
   */
  scrollToElement(element: ShapeLike | ConnectionLike | string, padding?: RectTRBL | number): void;

  /**
   * Gets or sets the current zoom of the canvas, optionally zooming to the
   * specified position.
   *
   * The getter may return a cached zoom level. Call it with `false` as the first
   * argument to force recomputation of the current level.
   *
   * @param newScale The new zoom level, either a number,
   * i.e. 0.9, or `fit-viewport` to adjust the size to fit the current viewport.
   * @param center The reference point { x: ..., y: ...} to zoom to.
   *
   * @return The set zoom level.
   */
  zoom(newScale?: number | 'fit-viewport', center?: Point): number;

  /**
   * Returns the size of the canvas.
   *
   * @return The size of the canvas.
   */
  getSize(): Dimensions;

  /**
   * Returns the absolute bounding box of an element.
   *
   * The absolute bounding box may be used to display overlays in the callers
   * (browser) coordinate system rather than the zoomed in/out canvas coordinates.
   *
   * @param element The element.
   *
   * @return The element's absolute bounding box.
   */
  getAbsoluteBBox(element: ShapeLike | ConnectionLike): Rect;

  /**
   * Fires an event in order other modules can react to the
   * canvas resizing
   */
  resized(): void;
}